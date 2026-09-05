import hashlib

import jwt
from app.db.database import get_db
from app.models.user import User
from app.schemas.auth import UserResponse
from app.services.core.conversation.conversation_service import ConversationService
from app.utils.jwt import (
    create_access_token,
    create_refresh_token,
    oauth2_scheme,
    oauth2_scheme_optional,
    verify_access_token,
)
from app.utils.password import hash_password, verify_password
from fastapi import Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


class AuthService:
    def __init__(self, db: AsyncSession | None = None):

        self.db = db

    async def signup(self, request, guest_id: str | None):

        # 2. Check if the email already exists.

        existsing_user = await self.db.execute(
            select(User).where(User.email == request.email)
        )
        user = existsing_user.scalar_one_or_none()

        if user:
            raise HTTPException(status_code=409, detail="Email already registered")

        # 3. Hash the password using bcrypt.

        hashed_password = hash_password(request.password)

        # 4. Create and save the user (password_hash, not the plain password).

        create_user = User(
            name=request.name,
            email=request.email,
            password_hash=hashed_password,
        )
        self.db.add(create_user)

        await self.db.commit()
        await self.db.refresh(create_user)

        if guest_id is not None:
            conversation_service = ConversationService(self.db, None, None, None)

            await conversation_service.migrate_guest_conversations(
                guest_id=guest_id,
                user_id=create_user.id,
            )

        # 5. Generate an Access Token (JWT with user_id, email).

        access_token = create_access_token(
            {"user_id": create_user.id, "email": create_user.email}
        )
        await self.db.commit()
        # 6. Generate a Refresh Token.
        refresh_token = create_refresh_token({"user_id": create_user.id})

        # Return the access token, set/return the refresh token
        user_response = UserResponse(
            id=create_user.id,
            name=create_user.name,
            email=create_user.email,
            avatar_url=create_user.avatar_url,
        )

        return {
            "message": "User created successfully",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": user_response,
        }

    async def login(self, request, guest_id: str | None):

        # 1. Find the user by email.

        existing_user = await self.db.execute(
            select(User).where(User.email == request.email)
        )

        user = existing_user.scalar_one_or_none()

        # 2. User not found.

        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        # 3. Verify the password.

        is_valid = verify_password(request.password, user.password_hash)

        if not is_valid:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        if guest_id is not None:
            conversation_service = ConversationService(self.db, None, None, None)

            await conversation_service.migrate_guest_conversations(
                guest_id=guest_id,
                user_id=user.id,
            )

        # 4. Generate tokens.

        access_token = create_access_token({"user_id": user.id, "email": user.email})

        refresh_token = create_refresh_token({"user_id": user.id})

        # 5. Hash and save the refresh token.

        user.refresh_token_hash = hashlib.sha256(
            refresh_token.encode("utf-8")
        ).hexdigest()

        await self.db.commit()

        await self.db.refresh(user)

        # 6. Return the response.

        return {
            "message": "Login successful",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": UserResponse.model_validate(user),
        }

    async def logout(
        self,
        response: Response,
        current_user: User,
    ):

        current_user.refresh_token_hash = None

        await self.db.commit()

        response.delete_cookie(
            key="refresh_token",
            httponly=True,
            secure=True,
            samesite="lax",
        )

        return {"message": "Logged out successfully"}

    async def refresh(self, response: Response):
        # This would need to be implemented to handle refresh token logic
        # For now, raise an exception to indicate it's not implemented
        raise HTTPException(
            status_code=501, detail="Refresh token endpoint not implemented"
        )

    async def me(self):

        pass


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):

    payload = verify_access_token(token)

    result = await db.execute(select(User).where(User.id == payload["user_id"]))

    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user


async def get_optional_current_user(
    token: str | None = Depends(oauth2_scheme_optional),
    db: AsyncSession = Depends(get_db),
) -> User | None:

    if token is None:
        return None

    try:
        payload = verify_access_token(token)
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, HTTPException):
        # Return None for expired or invalid tokens instead of raising 401
        # This allows guest users to continue even with expired tokens
        return None

    result = await db.execute(select(User).where(User.id == payload["user_id"]))

    return result.scalar_one_or_none()
