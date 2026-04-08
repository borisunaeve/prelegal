"""
Documents router: document type catalog, selection, and template rendering.
"""
import json
from typing import Optional

from fastapi import APIRouter, Cookie, Depends, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..auth import decode_token
from ..database import get_db
from ..models import ChatMessage, UserDocument, User
from ..services.doc_types import DOC_TYPES, default_values_for
from ..services.renderer import render_template

router = APIRouter(prefix="/api/documents", tags=["documents"])


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


# ── Schemas ───────────────────────────────────────────────────────────────────

class DocTypeOut(BaseModel):
    key: str
    name: str
    description: str
    filename: str


class SelectDocIn(BaseModel):
    document_type: str


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/types", response_model=list[DocTypeOut])
def list_types():
    """Return the full document type catalog."""
    return [
        DocTypeOut(
            key=key,
            name=cfg["name"],
            description=cfg["description"],
            filename=cfg["filename"],
        )
        for key, cfg in DOC_TYPES.items()
    ]


@router.post("/select")
def select_document(
    body: SelectDocIn,
    user: User = Depends(_current_user),
    db: Session = Depends(get_db),
):
    """Switch the user's active document type. Resets chat and field values."""
    if body.document_type not in DOC_TYPES:
        raise HTTPException(status_code=400, detail=f"Unknown document type: {body.document_type!r}")

    doc = db.query(UserDocument).filter(UserDocument.user_id == user.id).first()

    if doc:
        # Clear chat history for both the old and incoming types so the user
        # always gets a fresh greeting — no stale messages from a prior session.
        db.query(ChatMessage).filter(
            ChatMessage.user_id == user.id,
            ChatMessage.document_type.in_([doc.document_type, body.document_type]),
        ).delete()
        doc.document_type = body.document_type
        doc.values_json = json.dumps(default_values_for(body.document_type))
    else:
        doc = UserDocument(
            user_id=user.id,
            document_type=body.document_type,
            values_json=json.dumps(default_values_for(body.document_type)),
        )
        db.add(doc)

    db.commit()
    return {"document_type": body.document_type}


@router.get("/render")
def render_document(
    user: User = Depends(_current_user),
    db: Session = Depends(get_db),
):
    """Render the current document template with the user's field values."""
    doc = db.query(UserDocument).filter(UserDocument.user_id == user.id).first()
    if not doc:
        raise HTTPException(status_code=400, detail="No document selected")

    cfg = DOC_TYPES.get(doc.document_type)
    if not cfg:
        raise HTTPException(status_code=400, detail="Unknown document type")

    values = json.loads(doc.values_json)
    html = render_template(cfg["filename"], values)
    return JSONResponse({"html": html, "document_type": doc.document_type, "name": cfg["name"]})
