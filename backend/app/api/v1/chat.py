import contextlib

from app.db.database import get_db
from app.models.user import User
from app.schemas.message import MessageResponse, SendMessageRequest
from app.services.ai.llm_service import LLMService
from app.services.auth.auth_service import get_optional_current_user
from app.services.conversation.conversation_service import ConversationService
from app.services.news.article_service import ArticleService
from app.services.search.search_service import SearchService
from fastapi import (
    APIRouter,
    Depends,
    Header,
    Query,
    WebSocket,
    WebSocketDisconnect,
)
from fastapi.encoders import jsonable_encoder
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/api/v1")


def get_article_service(
    db: AsyncSession = Depends(get_db),
) -> ArticleService:
    return ArticleService(db)


def get_llm_service() -> LLMService:
    return LLMService()


def get_search_service() -> SearchService:
    return SearchService()


def get_conversation_service(
    db: AsyncSession = Depends(get_db),
    article_service: ArticleService = Depends(get_article_service),
    llm_service: LLMService = Depends(get_llm_service),
    search_service: SearchService = Depends(get_search_service),
) -> ConversationService:
    semantic_search_service = None
    return ConversationService(
        db, article_service, llm_service, search_service, semantic_search_service
    )


@router.websocket("/conversations/{conversation_id}/ws")
async def chat_websocket(
    websocket: WebSocket,
    conversation_id: int,
    db: AsyncSession = Depends(get_db),
    token: str | None = Query(default=None),
    service: ConversationService = Depends(get_conversation_service),
):
    # Get guest_id from WebSocket query params or headers
    guest_id = None
    if "guest_id" in websocket.query_params:
        guest_id = websocket.query_params["guest_id"]
    elif "X-Guest-ID" in websocket.headers:
        guest_id = websocket.headers["X-Guest-ID"]

    if token:
        # TODO: Validate token and get user info
        current_user = await get_optional_current_user(token, db)
    else:
        current_user = None

    await websocket.accept()

    print(f"WebSocket connected: conversation {conversation_id}")

    try:
        while True:
            data = await websocket.receive_json()

            print("Received:", data)

            user_message = data.get("content")
            article_ids = data.get("article_ids", [])

            # Validate message
            if not user_message or not user_message.strip():
                await websocket.send_json(
                    {
                        "type": "error",
                        "content": "Message content is required",
                    }
                )
                continue

            # Convert WebSocket data into your existing request schema
            request = SendMessageRequest(
                content=user_message,
                article_ids=article_ids,
            )

            # Reuse existing chat/retrieval pipeline
            response = await service.send_message(
                request,
                conversation_id,
                current_user,  # current_user - WebSocket doesn't support auth headers easily
                guest_id,  # guest_id from WebSocket
            )

            # Send existing MessageResponse back through WebSocket
            await websocket.send_json(
                {
                    "type": "message",
                    **jsonable_encoder(response),
                }
            )

    except WebSocketDisconnect:
        print(f"Client disconnected: conversation {conversation_id}")

    except Exception as e:
        import traceback

        traceback.print_exc()

        with contextlib.suppress(Exception):
            await websocket.send_json(
                {
                    "type": "error",
                    "content": str(e),
                }
            )


# Keep your existing HTTP endpoint
@router.post("/conversations/{conversation_id}/messages")
async def send_message(
    request: SendMessageRequest,
    conversation_id: int,
    guest_id: str | None = Header(
        default=None,
        alias="X-Guest-ID",
    ),
    current_user: User | None = Depends(get_optional_current_user),
    service: ConversationService = Depends(get_conversation_service),
) -> MessageResponse:

    return await service.send_message(
        request,
        conversation_id,
        current_user,
        guest_id,
    )
