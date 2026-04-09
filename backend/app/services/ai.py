import json
from typing import Literal, Optional

from litellm import completion
from pydantic import BaseModel

MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}

SYSTEM_PROMPT = """You are a friendly legal assistant helping a user draft a Mutual Non-Disclosure Agreement (NDA).

Your job is to guide the user through the NDA ONE STEP AT A TIME — ask only ONE question per message, wait for the answer, then move to the next.

Order to follow (skip any that are already filled in):
1. Party 1: name and company (one question)
2. Party 1: job title and mailing address (one question)
3. Party 2: name and company (one question)
4. Party 2: job title and mailing address (one question)
5. Purpose of the NDA
6. Effective date (YYYY-MM-DD)
7. How long the agreement lasts (MNDA Term: fixed N years, or perpetual)
8. How long information stays confidential (Confidentiality Term: fixed N years, or perpetual)
9. Governing law (US state, e.g. "Delaware")
10. Jurisdiction for disputes (city/county and state, e.g. "New Castle, Delaware")

Rules:
- Ask ONLY ONE question at a time — never ask multiple questions in one message
- Acknowledge the user's previous answer briefly before moving on
- Keep each message short and conversational
- Don't re-ask about fields already filled in — skip them
- When all fields are complete, congratulate the user and tell them they can download the PDF
- For the updates object, only set fields you can extract from the CURRENT user message — leave others null

Current document state:
{current_state}
"""


class NdaFieldUpdates(BaseModel):
    purpose: Optional[str] = None
    effectiveDate: Optional[str] = None
    mndaTermType: Optional[Literal["fixed", "perpetual"]] = None
    mndaTermYears: Optional[str] = None
    confidentialityTermType: Optional[Literal["fixed", "perpetual"]] = None
    confidentialityTermYears: Optional[str] = None
    governingLaw: Optional[str] = None
    jurisdiction: Optional[str] = None
    party1Name: Optional[str] = None
    party1Title: Optional[str] = None
    party1Company: Optional[str] = None
    party1Address: Optional[str] = None
    party2Name: Optional[str] = None
    party2Title: Optional[str] = None
    party2Company: Optional[str] = None
    party2Address: Optional[str] = None


class AIChatResponse(BaseModel):
    reply: str
    updates: NdaFieldUpdates


def build_current_state_summary(values: dict) -> str:
    filled = {k: v for k, v in values.items() if v not in (None, "")}
    empty = [k for k, v in values.items() if not v or v == ""]
    lines = []
    if filled:
        lines.append("Already filled:")
        for k, v in filled.items():
            lines.append(f"  {k}: {v}")
    if empty:
        lines.append("Still needed: " + ", ".join(empty))
    return "\n".join(lines) if lines else "Nothing filled in yet."


def call_ai(history: list[dict], current_values: dict) -> AIChatResponse:
    """
    Call the LLM with the conversation history and current document values.
    Returns the AI reply and any field updates it extracted.
    """
    system = SYSTEM_PROMPT.format(current_state=build_current_state_summary(current_values))
    messages = [{"role": "system", "content": system}] + history

    response = completion(
        model=MODEL,
        messages=messages,
        response_format=AIChatResponse,
        reasoning_effort="low",
        extra_body=EXTRA_BODY,
    )
    raw = response.choices[0].message.content
    return AIChatResponse.model_validate_json(raw)


def get_greeting(current_values: dict) -> AIChatResponse:
    """Generate the AI's opening message with no prior user input."""
    system = SYSTEM_PROMPT.format(current_state=build_current_state_summary(current_values))
    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": "[conversation started]"},
    ]
    response = completion(
        model=MODEL,
        messages=messages,
        response_format=AIChatResponse,
        reasoning_effort="low",
        extra_body=EXTRA_BODY,
    )
    raw = response.choices[0].message.content
    return AIChatResponse.model_validate_json(raw)


def merge_values(current: dict, updates: NdaFieldUpdates) -> dict:
    """Apply non-null updates on top of current values."""
    patch = {k: v for k, v in updates.model_dump().items() if v is not None}
    return {**current, **patch}
