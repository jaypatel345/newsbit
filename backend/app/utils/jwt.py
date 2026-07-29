from datetime import datetime, timedelta, timezone

import jwt

SECRET_KEY = "hELGYMQMxlcgT7JrLQE37E8QuYmoYvG2fX38gcUDbnR"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7


def create_access_token(data: dict) -> str:

    payload = data.copy()

    payload["exp"] = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(data: dict) -> str:

    payload = data.copy()

    payload["exp"] = datetime.now(timezone.utc) + timedelta(
        days=REFRESH_TOKEN_EXPIRE_DAYS
    )

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
