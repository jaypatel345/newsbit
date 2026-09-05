from app.db.database import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, LoginResponse, SignupRequest, UserResponse
from app.services.infrastructure.auth.auth_service import AuthService, get_current_user
from fastapi import APIRouter, Depends, Header, Response
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


@router.post("/signup")
async def signup(
    request: SignupRequest,
    response: Response,
    guest_id: str | None = Header(default=None, alias="X-Guest-ID"),
    db: AsyncSession = Depends(get_db),
):

    result = await AuthService(db).signup(request, guest_id)
    response.set_cookie(
        key="refresh_token",
        value=result["refresh_token"],
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=60 * 60 * 24 * 7,
    )

    del result["refresh_token"]

    return result


@router.post("/login", response_model=LoginResponse)
async def login(
    request: LoginRequest,
    response: Response,
    guest_id: str | None = Header(default=None, alias="X-Guest-ID"),
    db: AsyncSession = Depends(get_db),
):

    result = await AuthService(db).login(request, guest_id)

    response.set_cookie(
        key="refresh_token",
        value=result["refresh_token"],
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=60 * 60 * 24 * 7,
    )

    del result["refresh_token"]

    return result


@router.post("/logout")
async def logout(
    response: Response,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):

    return await AuthService(db).logout(response, current_user)


@router.post("/refresh")
async def refresh(response: Response):
    return await AuthService().refresh(response)


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user=Depends(get_current_user),
):
    return current_user
