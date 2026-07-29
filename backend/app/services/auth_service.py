from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from fastapi import HTTPException
from app.utils.password import hash_password
from app.utils.jwt import create_access_token, create_refresh_token
from app.schemas.auth import UserResponse


class AuthService:

    def __init__(self, db: AsyncSession | None = None):

        self.db = db

    async def signup(self, request):

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

    async def login(self):

        pass

    async def logout(self):

        pass

    async def refresh(self):

        pass

    async def me(self):

        pass
