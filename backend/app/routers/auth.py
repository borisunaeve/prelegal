from typing import Optional

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from ..auth import create_access_token, decode_token, hash_password, verify_password
from ..database import get_db
from ..models import User
from ..schemas import UserLogin, UserResponse, UserSignup

router = APIRouter(prefix="/api/auth", tags=["auth"])

COOKIE_NAME = "prelegal_session"
COOKIE_MAX_AGE = 7 * 24 * 60 * 60  # 7 days in seconds


def _set_auth_cookie(response: Response, user_id: int) -> None:
    token = create_access_token(user_id)
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        max_age=COOKIE_MAX_AGE,
        httponly=True,
        samesite="lax",
        secure=False,  # Set True in production with HTTPS
    )


@router.post("/signup", response_model=UserResponse)
def signup(user_data: UserSignup, response: Response, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    _set_auth_cookie(response, user.id)
    return user


@router.post("/login", response_model=UserResponse)
def login(credentials: UserLogin, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    _set_auth_cookie(response, user.id)
    return user


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key=COOKIE_NAME, httponly=True, samesite="lax", secure=False)
    return {"message": "Logged out"}


@router.get("/me", response_model=UserResponse)
def me(
    prelegal_session: Optional[str] = Cookie(default=None),
    db: Session = Depends(get_db),
):
    if not prelegal_session:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user_id = decode_token(prelegal_session)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid session")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user
