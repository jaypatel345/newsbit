from pydantic import BaseModel, EmailStr


class UserResponse(BaseModel):

    id: int

    name: str

    email: EmailStr

    avatar_url: str | None = None

    model_config = {"from_attributes": True}


class SignupRequest(BaseModel):

    name: str
    email: EmailStr
    password: str


class SignupResponse(BaseModel):

    message: str
    access_token: str
    token_type: str
    user: UserResponse


class LoginRequest(BaseModel):

    email: EmailStr
    password: str


class LoginResponse(BaseModel):

    message: str
    access_token: str
    token_type: str
    user: UserResponse
