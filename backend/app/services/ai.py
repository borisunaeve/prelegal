from typing import Optional

from litellm import completion
from pydantic import BaseModel

from .doc_types import get_doc_type

MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}

SYSTEM_PROMPT = """You are a friendly legal assistant helping a user draft a {doc_name}.

Your job is to guide the user through the document ONE STEP AT A TIME — ask only ONE question per message, wait for the answer, then move to the next.

Order to follow (skip any that are already filled in):
{questions_list}

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


class FieldUpdates(BaseModel):
    # NDA fields
    purpose: Optional[str] = None
    mndaTermType: Optional[str] = None
    mndaTermYears: Optional[str] = None
    confidentialityTermType: Optional[str] = None
    confidentialityTermYears: Optional[str] = None
    party1Name: Optional[str] = None
    party1Title: Optional[str] = None
    party1Company: Optional[str] = None
    party1Address: Optional[str] = None
    party2Name: Optional[str] = None
    party2Title: Optional[str] = None
    party2Company: Optional[str] = None
    party2Address: Optional[str] = None

    # Common
    effectiveDate: Optional[str] = None
    governingLaw: Optional[str] = None
    jurisdiction: Optional[str] = None

    # Provider
    providerName: Optional[str] = None
    providerTitle: Optional[str] = None
    providerCompany: Optional[str] = None
    providerAddress: Optional[str] = None

    # Customer
    customerName: Optional[str] = None
    customerTitle: Optional[str] = None
    customerCompany: Optional[str] = None
    customerAddress: Optional[str] = None

    # Partner (Design Partner, Partnership)
    partnerName: Optional[str] = None
    partnerTitle: Optional[str] = None
    partnerCompany: Optional[str] = None
    partnerAddress: Optional[str] = None

    # Company (BAA covered entity)
    companyName: Optional[str] = None
    companyTitle: Optional[str] = None
    companyCompany: Optional[str] = None
    companyAddress: Optional[str] = None

    # CSA
    subscriptionPeriod: Optional[str] = None
    technicalSupport: Optional[str] = None

    # Design Partner
    term: Optional[str] = None
    fees: Optional[str] = None

    # SLA
    targetUptime: Optional[str] = None
    targetResponseTime: Optional[str] = None
    supportChannel: Optional[str] = None
    uptimeCredit: Optional[str] = None

    # PSA
    servicesDescription: Optional[str] = None
    deliverables: Optional[str] = None
    rejectionPeriod: Optional[str] = None

    # DPA
    categoriesOfPersonalData: Optional[str] = None
    categoriesOfDataSubjects: Optional[str] = None
    specialCategoryData: Optional[str] = None

    # Partnership
    obligations: Optional[str] = None
    territory: Optional[str] = None
    paymentProcess: Optional[str] = None
    paymentSchedule: Optional[str] = None
    endDate: Optional[str] = None

    # Software License
    permittedUses: Optional[str] = None

    # Pilot
    pilotPeriod: Optional[str] = None

    # BAA
    limitations: Optional[str] = None

    # AI Addendum
    trainingRestrictions: Optional[str] = None
    improvementRestrictions: Optional[str] = None


class AIChatResponse(BaseModel):
    reply: str
    updates: FieldUpdates


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


def _build_system(doc_type_key: str, current_values: dict) -> str:
    doc = get_doc_type(doc_type_key)
    questions = "\n".join(
        f"{i + 1}. {q}" for i, q in enumerate(doc["questions_order"])
    )
    return SYSTEM_PROMPT.format(
        doc_name=doc["name"],
        questions_list=questions,
        current_state=build_current_state_summary(current_values),
    )


def call_ai(history: list[dict], current_values: dict, doc_type_key: str) -> AIChatResponse:
    """Call the LLM with the conversation history and current document values."""
    system = _build_system(doc_type_key, current_values)
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


def get_greeting(current_values: dict, doc_type_key: str) -> AIChatResponse:
    """Generate the AI's opening message with no prior user input."""
    system = _build_system(doc_type_key, current_values)
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


def merge_values(current: dict, updates: FieldUpdates) -> dict:
    """Apply non-null updates onto current values (only known keys)."""
    patch = {
        k: v
        for k, v in updates.model_dump().items()
        if v is not None and k in current
    }
    return {**current, **patch}
