from pydantic import BaseModel, EmailStr


class SignupRequest(BaseModel):

    name: str
    email: EmailStr
    password: str


class UserResponse(BaseModel):

    id: int
    name: str
    email: EmailStr
    avatar_url: str | None


class SignupResponse(BaseModel):

    message: str
    access_token: str
    token_type: str
    user: UserResponse
