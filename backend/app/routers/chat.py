import json
from datetime import date
from typing import Optional

from fastapi import APIRouter, Cookie, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..auth import decode_token
from ..database import get_db
from ..models import ChatMessage, NdaDocument, User
from ..services.ai import AIChatResponse, call_ai, get_greeting, merge_values

router = APIRouter(prefix="/api/chat", tags=["chat"])

# ── Default NDA field values (mirrors frontend/lib/nda-types.ts) ──────────────

def _default_values() -> dict:
    today = date.today().isoformat()
    return {
        "purpose": "Evaluating whether to enter into a business relationship with the other party.",
        "effectiveDate": today,
        "mndaTermType": "fixed",
        "mndaTermYears": "1",
        "confidentialityTermType": "fixed",
        "confidentialityTermYears": "1",
        "governingLaw": "",
        "jurisdiction": "",
        "party1Name": "",
        "party1Title": "",
        "party1Company": "",
        "party1Address": "",
        "party2Name": "",
        "party2Title": "",
        "party2Company": "",
        "party2Address": "",
    }


# ── Auth helper ───────────────────────────────────────────────────────────────

def _current_user(
    prelegal_session: Optional[str] = Cookie(default=None),
    db: Session = Depends(get_db),
) -> User:
    if not prelegal_session:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user_id = decode_token(prelegal_session)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid session")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# ── DB helpers ────────────────────────────────────────────────────────────────

def _get_or_create_document(user_id: int, db: Session) -> NdaDocument:
    doc = db.query(NdaDocument).filter(NdaDocument.user_id == user_id).first()
    if not doc:
        doc = NdaDocument(user_id=user_id, values_json=json.dumps(_default_values()))
        db.add(doc)
        db.commit()
        db.refresh(doc)
    return doc


def _history_messages(user_id: int, db: Session) -> list[dict]:
    rows = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == user_id)
        .order_by(ChatMessage.created_at)
        .all()
    )
    return [{"role": r.role, "content": r.content} for r in rows]


def _save_message(user_id: int, role: str, content: str, db: Session) -> ChatMessage:
    msg = ChatMessage(user_id=user_id, role=role, content=content)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


# ── Schemas ───────────────────────────────────────────────────────────────────

class MessageOut(BaseModel):
    id: int
    role: str
    content: str
    model_config = {"from_attributes": True}


class HistoryOut(BaseModel):
    messages: list[MessageOut]
    values: dict


class SendMessageIn(BaseModel):
    content: str


class SendMessageOut(BaseModel):
    reply: str
    values: dict


class ValuesIn(BaseModel):
    values: dict


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/history", response_model=HistoryOut)
def get_history(user: User = Depends(_current_user), db: Session = Depends(get_db)):
    doc = _get_or_create_document(user.id, db)
    current_values = json.loads(doc.values_json)

    rows = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == user.id)
        .order_by(ChatMessage.created_at)
        .all()
    )

    # Generate greeting if this is a fresh session
    if not rows:
        try:
            ai_response = get_greeting(current_values)
            msg = _save_message(user.id, "assistant", ai_response.reply, db)
            updated = merge_values(current_values, ai_response.updates)
            if updated != current_values:
                doc.values_json = json.dumps(updated)
                current_values = updated
            db.commit()
            rows = [msg]
        except Exception:
            # Another concurrent request already saved a greeting — fetch it
            db.rollback()
            rows = (
                db.query(ChatMessage)
                .filter(ChatMessage.user_id == user.id)
                .order_by(ChatMessage.created_at)
                .all()
            )
            if not rows:
                raise HTTPException(status_code=502, detail="AI service unavailable")

    messages = [MessageOut(id=r.id, role=r.role, content=r.content) for r in rows]
    return HistoryOut(messages=messages, values=current_values)


@router.post("/message", response_model=SendMessageOut)
def send_message(
    body: SendMessageIn,
    user: User = Depends(_current_user),
    db: Session = Depends(get_db),
):
    if not body.content.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    doc = _get_or_create_document(user.id, db)
    current_values = json.loads(doc.values_json)

    # Build history with the new user message appended in memory (not yet persisted)
    history = _history_messages(user.id, db)
    history.append({"role": "user", "content": body.content})

    # Call AI before persisting anything — if it fails, the DB stays clean
    try:
        ai_response: AIChatResponse = call_ai(history, current_values)
    except Exception as exc:
        raise HTTPException(status_code=502, detail="AI service unavailable") from exc

    # Persist user message + AI reply atomically after a successful AI response
    _save_message(user.id, "user", body.content, db)
    _save_message(user.id, "assistant", ai_response.reply, db)

    updated_values = merge_values(current_values, ai_response.updates)
    doc.values_json = json.dumps(updated_values)
    db.commit()

    return SendMessageOut(reply=ai_response.reply, values=updated_values)


@router.post("/reset")
def reset(user: User = Depends(_current_user), db: Session = Depends(get_db)):
    db.query(ChatMessage).filter(ChatMessage.user_id == user.id).delete()
    doc = db.query(NdaDocument).filter(NdaDocument.user_id == user.id).first()
    if doc:
        doc.values_json = json.dumps(_default_values())
    db.commit()
    return {"message": "reset"}


@router.patch("/values", response_model=dict)
def update_values(
    body: ValuesIn,
    user: User = Depends(_current_user),
    db: Session = Depends(get_db),
):
    doc = _get_or_create_document(user.id, db)
    # Merge incoming values over current (only known keys accepted)
    current = json.loads(doc.values_json)
    allowed_keys = set(current.keys())
    patch = {k: v for k, v in body.values.items() if k in allowed_keys}
    doc.values_json = json.dumps({**current, **patch})
    db.commit()
    return json.loads(doc.values_json)
