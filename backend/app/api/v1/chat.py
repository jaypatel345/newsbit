from app.db.database import get_db
from app.models.user import User
from app.schemas.message import MessageResponse, SendMessageRequest
from app.services.content.news.article_service import ArticleService
from app.services.core.conversation.conversation_service import ConversationService
from app.services.infrastructure.ai.embedding_service import EmbeddingService
from app.services.infrastructure.ai.llm_service import LLMService
from app.services.infrastructure.auth.auth_service import get_optional_current_user
from app.services.infrastructure.search.search_service import SearchService
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


def get_embedding_service() -> EmbeddingService:
    return EmbeddingService()


def get_conversation_service(
    db: AsyncSession = Depends(get_db),
    article_service: ArticleService = Depends(get_article_service),
    llm_service: LLMService = Depends(get_llm_service),
    search_service: SearchService = Depends(get_search_service),
    embedding_service: EmbeddingService = Depends(get_embedding_service),
) -> ConversationService:
    semantic_search_service = None
    return ConversationService(
        db,
        article_service,
        llm_service,
        search_service,
        semantic_search_service,
        embedding_service,
    )


@router.websocket("/conversations/{conversation_id}/ws")
async def chat_websocket(
    websocket: WebSocket,
    conversation_id: int,
    db: AsyncSession = Depends(get_db),
    token: str | None = Query(default=None),
    service: ConversationService = Depends(get_conversation_service),
):
    print(f"WebSocket connection attempt: conversation {conversation_id}")

    # Get guest_id from WebSocket query params or headers
    guest_id = None
    if "guest_id" in websocket.query_params:
        guest_id = websocket.query_params["guest_id"]
    elif "X-Guest-ID" in websocket.headers:
        guest_id = websocket.headers["X-Guest-ID"]

    print(f"Guest ID: {guest_id}")

    if token:
        # TODO: Validate token and get user info
        current_user = await get_optional_current_user(token, db)
    else:
        current_user = None

    try:
        await websocket.accept()
        print(f"WebSocket connected: conversation {conversation_id}")
    except Exception as e:
        print(f"Error accepting WebSocket: {e}")
        return

    try:
        while True:
            data = await websocket.receive_json()
            print("Received:", data)

            user_message = data.get("content")
            article_ids = data.get("article_ids", [])
            message_id = data.get("message_id")

            # Validate message
            if not user_message or not user_message.strip():
                await websocket.send_json(
                    {
                        "type": "error",
                        "content": "Message content is required",
                        "message_id": message_id,
                    }
                )
                continue

            # Convert WebSocket data into your existing request schema
            request = SendMessageRequest(
                content=user_message,
                article_ids=article_ids,
            )

            # Reuse existing chat/retrieval pipeline with timeout
            import asyncio

            try:
                response = await asyncio.wait_for(
                    service.send_message(
                        request,
                        conversation_id,
                        current_user,
                        guest_id,
                    ),
                    timeout=30.0,  # 30 second timeout
                )

                print(
                    f"Generated response for message_id {message_id}: {response.role}"
                )

                # Send existing MessageResponse back through WebSocket
                try:
                    response_data = {
                        "type": "message",
                        "message_id": message_id,
                        **jsonable_encoder(response),
                    }
                    # print(
                    #     f"Sending WebSocket response data: {list(response_data.keys())}"
                    # )
                    await websocket.send_json(response_data)
                    # print(
                    #     f"Successfully sent response via WebSocket for message_id {message_id}"
                    # )
                except Exception:
                    # print(f"Error sending WebSocket response: {ws_error}")
                    # import traceback

                    # traceback.print_exc()
                    raise
            except TimeoutError:
                await websocket.send_json(
                    {
                        "type": "error",
                        "content": "Request timed out. Please try again.",
                        "message_id": message_id,
                    }
                )
            except Exception as e:
                # print(f"Error processing message: {e}")
                await websocket.send_json(
                    {
                        "type": "error",
                        "content": str(e),
                        "message_id": message_id,
                    }
                )

    except WebSocketDisconnect:
        # print(f"Client disconnected: conversation {conversation_id}")
        pass
    except Exception:
        # print(f"WebSocket error: {e}")
        import traceback

        traceback.print_exc()


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
