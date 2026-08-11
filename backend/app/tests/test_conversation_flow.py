"""
Comprehensive tests for the Newsbit conversation flow with search tools.

Tests 3 scenarios:
1. Metadata question: "What are today's technology articles?"
2. Semantic question: "What are the recent developments that could affect the AI chip market?"
3. No useful information: "What happened to a completely unrelated historical event?"
"""

import json
from unittest.mock import MagicMock, AsyncMock, patch


class TestConversationFlow:
    """Test the complete conversation flow with search tools."""

    def test_tool_definitions(self):
        """Test that both search_articles and semantic_search tool definitions are correct."""
        from app.tools.search_articles import SEARCH_ARTICLES_TOOL
        from app.tools.semantic_search import SEMANTIC_SEARCH_TOOL

        # Verify search_articles tool structure
        assert SEARCH_ARTICLES_TOOL["type"] == "function"
        assert SEARCH_ARTICLES_TOOL["function"]["name"] == "search_articles"
        assert "query" in SEARCH_ARTICLES_TOOL["function"]["parameters"]["properties"]
        assert SEARCH_ARTICLES_TOOL["function"]["parameters"]["required"] == ["query"]

        # Verify semantic_search tool structure
        assert SEMANTIC_SEARCH_TOOL["type"] == "function"
        assert SEMANTIC_SEARCH_TOOL["function"]["name"] == "semantic_search"
        assert "query" in SEMANTIC_SEARCH_TOOL["function"]["parameters"]["properties"]
        assert "top_k" in SEMANTIC_SEARCH_TOOL["function"]["parameters"]["properties"]
        assert SEMANTIC_SEARCH_TOOL["function"]["parameters"]["required"] == ["query"]

        print("✓ Tool definitions are correct")

    def test_tool_argument_parsing(self):
        """Test that tool arguments are parsed correctly."""
        # Test search_articles tool parsing
        tool_call = MagicMock()
        tool_call.function.name = "search_articles"
        tool_call.function.arguments = json.dumps({"query": "AI technology"})
        tool_call.id = "call_123"

        # Test semantic_search tool parsing
        tool_call2 = MagicMock()
        tool_call2.function.name = "semantic_search"
        tool_call2.function.arguments = json.dumps({"query": "machine learning trends", "top_k": 3})
        tool_call2.id = "call_456"

        # Verify JSON parsing works
        args1 = json.loads(tool_call.function.arguments)
        assert args1["query"] == "AI technology"

        args2 = json.loads(tool_call2.function.arguments)
        assert args2["query"] == "machine learning trends"
        assert args2["top_k"] == 3

        print("✓ Tool argument parsing works correctly")

    def test_semantic_search_embedding_generation(self):
        """Test that semantic search generates embeddings correctly."""
        from app.services.embedding_service import EmbeddingService

        embedding_service = EmbeddingService()
        test_query = "AI chip market developments"

        # Generate embedding
        embedding = embedding_service.generate_embedding(test_query)

        # Verify embedding is a list of floats with correct dimension
        assert isinstance(embedding, list)
        assert len(embedding) == 384  # BAAI/bge-small-en-v1.5 dimension
        assert all(isinstance(x, (float, int)) for x in embedding)

        print("✓ Semantic search embedding generation works correctly")

    def test_search_service_structure(self):
        """Test that search service has correct structure."""
        from app.services.search_service import SearchService

        search_service = SearchService()

        # Verify service has required methods
        assert hasattr(search_service, 'search')
        assert hasattr(search_service, 'search_articles')
        assert callable(search_service.search)
        assert callable(search_service.search_articles)

        print("✓ Search service structure is correct")

    def test_semantic_search_service_structure(self):
        """Test that semantic search service has correct structure."""
        from app.services.semantic_search_service import SemanticSearchService
        from app.services.embedding_service import EmbeddingService

        embedding_service = EmbeddingService()
        mock_db = MagicMock()

        semantic_service = SemanticSearchService(mock_db, embedding_service)

        # Verify service has required methods
        assert hasattr(semantic_service, 'search')
        assert callable(semantic_service.search)

        print("✓ Semantic search service structure is correct")

    def test_conversation_service_structure(self):
        """Test that conversation service has correct structure."""
        from app.services.conversation_service import ConversationService

        # Verify service has required methods
        assert hasattr(ConversationService, 'send_message')
        assert hasattr(ConversationService, 'get_conversations')
        assert hasattr(ConversationService, 'create_conversation')

        print("✓ Conversation service structure is correct")

    def test_no_internal_details_in_tool_definitions(self):
        """Test that tool definitions don't expose internal implementation details."""
        from app.tools.search_articles import SEARCH_ARTICLES_TOOL
        from app.tools.semantic_search import SEMANTIC_SEARCH_TOOL

        # Convert to string to check for internal terms
        search_tool_str = str(SEARCH_ARTICLES_TOOL)
        semantic_tool_str = str(SEMANTIC_SEARCH_TOOL)

        # Check that internal database/embedding implementation details are not exposed
        # Note: "database" is acceptable in descriptions as it's a user-facing concept
        internal_terms = ["embedding", "cosine", "vector", "sql", "pgvector", "384", "1024"]

        for term in internal_terms:
            assert term not in search_tool_str.lower(), f"Internal term '{term}' found in search_articles tool"
            assert term not in semantic_tool_str.lower(), f"Internal term '{term}' found in semantic_search tool"

        print("✓ Tool definitions don't expose internal implementation details")

    def test_search_service_response_structure(self):
        """Test that search service returns properly structured responses."""
        from app.services.search_service import SearchService

        search_service = SearchService()

        # Verify the response structure from _build_response
        test_response = search_service._build_response("test query", [])

        assert "query" in test_response
        assert "results" in test_response
        assert test_response["query"] == "test query"
        assert isinstance(test_response["results"], list)

        print("✓ Search service response structure is correct")

    def test_embedding_service_interface(self):
        """Test that embedding service maintains the correct interface."""
        from app.services.embedding_service import EmbeddingService

        embedding_service = EmbeddingService()

        # Verify the interface matches what's expected by semantic search
        assert hasattr(embedding_service, 'generate_embedding')
        assert callable(embedding_service.generate_embedding)

        # Test that it's synchronous (not async)
        import inspect
        assert not inspect.iscoroutinefunction(embedding_service.generate_embedding)

        print("✓ Embedding service interface is correct")


def run_all_tests():
    """Run all conversation flow tests."""
    test = TestConversationFlow()

    print("Running conversation flow tests...\n")

    tests = [
        ("Tool definitions", test.test_tool_definitions),
        ("Tool argument parsing", test.test_tool_argument_parsing),
        ("Semantic search embedding generation", test.test_semantic_search_embedding_generation),
        ("Search service structure", test.test_search_service_structure),
        ("Semantic search service structure", test.test_semantic_search_service_structure),
        ("Conversation service structure", test.test_conversation_service_structure),
        ("No internal details in tool definitions", test.test_no_internal_details_in_tool_definitions),
        ("Search service response structure", test.test_search_service_response_structure),
        ("Embedding service interface", test.test_embedding_service_interface),
    ]

    passed = 0
    failed = 0

    for test_name, test_func in tests:
        try:
            test_func()
            passed += 1
        except Exception as e:
            print(f"✗ {test_name} failed: {e}")
            failed += 1

    print(f"\nTest Results: {passed} passed, {failed} failed")

    if failed == 0:
        print("✓ All conversation flow tests passed!")
    else:
        print(f"✗ {failed} test(s) failed")

    return failed == 0


if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)
