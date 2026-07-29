from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.schemas.auth import SignupRequest
from app.services.auth_service import AuthService
from fastapi import Response

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup")
async def signup(
    request: SignupRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):

    result = await AuthService(db).signup(request)
    response.set_cookie(
        key="refresh_token",
        value=result["refresh_token"],
        httponly=True,
        secure=True,  # False for local HTTP development if needed
        samesite="lax",
        max_age=60 * 60 * 24 * 7,  # 7 days
    )

    del result["refresh_token"]

    return result


@router.post("/login")
async def login():

    return await AuthService().login()


@router.post("/logout")
async def logout():

    return await AuthService().logout()


@router.post("/refresh")
async def refresh():

    return await AuthService().refresh()


@router.get("/me")
async def me():

    return await AuthService().me()
