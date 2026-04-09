import json
from typing import Optional

from fastapi import APIRouter, Cookie, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..auth import decode_token
from ..database import get_db
from ..models import ChatMessage, UserDocument, User
from ..services.ai import AIChatResponse, call_ai, get_greeting, merge_values
from ..services.doc_types import DOC_TYPES, default_values_for

router = APIRouter(prefix="/api/chat", tags=["chat"])


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

def _get_document(user_id: int, db: Session) -> UserDocument | None:
    return db.query(UserDocument).filter(UserDocument.user_id == user_id).first()


def _history_messages(user_id: int, document_type: str, db: Session) -> list[dict]:
    rows = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == user_id, ChatMessage.document_type == document_type)
        .order_by(ChatMessage.created_at)
        .all()
    )
    return [{"role": r.role, "content": r.content} for r in rows]


def _save_message(user_id: int, document_type: str, role: str, content: str, db: Session) -> ChatMessage:
    msg = ChatMessage(user_id=user_id, document_type=document_type, role=role, content=content)
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
    document_type: str
    document_name: str = ""


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
    doc = _get_document(user.id, db)
    if not doc:
        return HistoryOut(messages=[], values={}, document_type="", document_name="")

    current_values = json.loads(doc.values_json)
    document_type = doc.document_type

    rows = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == user.id, ChatMessage.document_type == document_type)
        .order_by(ChatMessage.created_at)
        .all()
    )

    if not rows:
        try:
            ai_response = get_greeting(current_values, document_type)
            msg = _save_message(user.id, document_type, "assistant", ai_response.reply, db)
            updated = merge_values(current_values, ai_response.updates)
            if updated != current_values:
                doc.values_json = json.dumps(updated)
                current_values = updated
            db.commit()
            rows = [msg]
        except Exception:
            db.rollback()
            rows = (
                db.query(ChatMessage)
                .filter(ChatMessage.user_id == user.id, ChatMessage.document_type == document_type)
                .order_by(ChatMessage.created_at)
                .all()
            )
            if not rows:
                raise HTTPException(status_code=502, detail="AI service unavailable")

    doc_name = DOC_TYPES.get(document_type, {}).get("name", "")
    messages = [MessageOut(id=r.id, role=r.role, content=r.content) for r in rows]
    return HistoryOut(messages=messages, values=current_values, document_type=document_type, document_name=doc_name)


@router.post("/message", response_model=SendMessageOut)
def send_message(
    body: SendMessageIn,
    user: User = Depends(_current_user),
    db: Session = Depends(get_db),
):
    if not body.content.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    doc = _get_document(user.id, db)
    if not doc:
        raise HTTPException(status_code=400, detail="No document selected")

    current_values = json.loads(doc.values_json)
    document_type = doc.document_type

    history = _history_messages(user.id, document_type, db)
    history.append({"role": "user", "content": body.content})

    try:
        ai_response: AIChatResponse = call_ai(history, current_values, document_type)
    except Exception as exc:
        raise HTTPException(status_code=502, detail="AI service unavailable") from exc

    _save_message(user.id, document_type, "user", body.content, db)
    _save_message(user.id, document_type, "assistant", ai_response.reply, db)

    updated_values = merge_values(current_values, ai_response.updates)
    doc.values_json = json.dumps(updated_values)
    db.commit()

    return SendMessageOut(reply=ai_response.reply, values=updated_values)


@router.post("/reset")
def reset(user: User = Depends(_current_user), db: Session = Depends(get_db)):
    doc = _get_document(user.id, db)
    if doc:
        db.query(ChatMessage).filter(
            ChatMessage.user_id == user.id,
            ChatMessage.document_type == doc.document_type,
        ).delete()
        doc.values_json = json.dumps(default_values_for(doc.document_type))
        db.commit()
    return {"message": "reset"}


@router.patch("/values", response_model=dict)
def update_values(
    body: ValuesIn,
    user: User = Depends(_current_user),
    db: Session = Depends(get_db),
):
    doc = _get_document(user.id, db)
    if not doc:
        raise HTTPException(status_code=400, detail="No document selected")
    current = json.loads(doc.values_json)
    allowed_keys = set(current.keys())
    patch = {k: v for k, v in body.values.items() if k in allowed_keys}
    doc.values_json = json.dumps({**current, **patch})
    db.commit()
    return json.loads(doc.values_json)
