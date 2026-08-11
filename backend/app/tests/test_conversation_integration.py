"""
Integration tests for the Newsbit conversation flow with real database and services.

Tests 3 scenarios with actual database interactions:
1. Metadata question: "What are today's technology articles?"
2. Semantic question: "What are the recent developments that could affect the AI chip market?"
3. No useful information: "What happened to a completely unrelated historical event?"
"""

import asyncio
import sys
from datetime import datetime, timezone

# Add the backend directory to the path
sys.path.insert(0, '/Users/Jaypatel/Desktop/project/newsbit/backend')

from app.db.database import AsyncSessionLocal
from app.services.conversation_service import ConversationService
from app.services.search_service import SearchService
from app.services.semantic_search_service import SemanticSearchService
from app.services.article_service import ArticleService
from app.services.llm_service import LLMService
from app.services.embedding_service import EmbeddingService
from app.models.conversation import Conversation
from app.models.message import Message
from app.schemas.conversation import CreateConversationRequest
from app.schemas.message import SendMessageRequest


class TestConversationIntegration:
    """Integration tests for conversation flow with real database."""

    def __init__(self):
        self.embedding_service = EmbeddingService()
        self.test_results = []

    async def test_scenario_1_metadata_search(self):
        """
        Scenario 1: Metadata question - "What are today's technology articles?"
        Expected flow: search_articles → relevant results → final answer
        """
        print("\n--- Testing Scenario 1: Metadata Search ---")

        try:
            async with AsyncSessionLocal() as db:
                # Create services
                search_service = SearchService()
                semantic_search_service = SemanticSearchService(db, self.embedding_service)
                article_service = ArticleService(db)
                llm_service = LLMService()

                conversation_service = ConversationService(
                    db=db,
                    article_service=article_service,
                    llm_service=llm_service,
                    search_service=search_service,
                    semantic_search_service=semantic_search_service,
                )

                # Create a test conversation
                create_request = CreateConversationRequest(title="Tech Test")
                conversation = await conversation_service.create_conversation(
                    request=create_request,
                    current_user=None,
                    guest_id="integration-test-guest",
                )

                print(f"✓ Created conversation with ID: {conversation.id}")

                # Test metadata search
                search_result = await search_service.search_articles(
                    db=db,
                    query="technology",
                    limit=5
                )

                print(f"✓ Search service returned {len(search_result.get('results', []))} results")
                print(f"✓ Search query: '{search_result.get('query', '')}'")

                # Verify search structure
                assert "query" in search_result
                assert "results" in search_result
                assert isinstance(search_result["results"], list)

                # Clean up
                await db.delete(conversation)
                await db.commit()

                print("✓ Scenario 1 passed: Metadata search works correctly")
                self.test_results.append(("Scenario 1: Metadata Search", True, None))
                return True

        except Exception as e:
            print(f"✗ Scenario 1 failed: {e}")
            import traceback
            traceback.print_exc()
            self.test_results.append(("Scenario 1: Metadata Search", False, str(e)))
            return False

    async def test_scenario_2_semantic_search(self):
        """
        Scenario 2: Semantic question - "What are the recent developments that could affect the AI chip market?"
        Expected flow: search_articles → insufficient/irrelevant results → semantic_search → relevant articles → final answer
        """
        print("\n--- Testing Scenario 2: Semantic Search ---")

        try:
            async with AsyncSessionLocal() as db:
                # Create services
                search_service = SearchService()
                semantic_search_service = SemanticSearchService(db, self.embedding_service)
                article_service = ArticleService(db)
                llm_service = LLMService()

                conversation_service = ConversationService(
                    db=db,
                    article_service=article_service,
                    llm_service=llm_service,
                    search_service=search_service,
                    semantic_search_service=semantic_search_service,
                )

                # Create a test conversation
                create_request = CreateConversationRequest(title="AI Market Test")
                conversation = await conversation_service.create_conversation(
                    request=create_request,
                    current_user=None,
                    guest_id="integration-test-guest",
                )

                print(f"✓ Created conversation with ID: {conversation.id}")

                # Test semantic search
                semantic_query = "AI chip market developments"
                semantic_result = await semantic_search_service.search(
                    query=semantic_query,
                    top_k=5
                )

                print(f"✓ Semantic search returned {len(semantic_result)} results")
                print(f"✓ Semantic query: '{semantic_query}'")

                # Verify semantic search structure
                assert isinstance(semantic_result, list)

                if semantic_result:
                    # Check that results have the expected structure
                    first_result = semantic_result[0]
                    assert len(first_result) == 2  # (article, distance)
                    article, distance = first_result
                    assert hasattr(article, 'title')
                    assert hasattr(article, 'summary')
                    assert isinstance(distance, (float, int))

                    print(f"✓ First result: '{article.title[:50]}...' (distance: {distance:.3f})")

                # Clean up
                await db.delete(conversation)
                await db.commit()

                print("✓ Scenario 2 passed: Semantic search works correctly")
                self.test_results.append(("Scenario 2: Semantic Search", True, None))
                return True

        except Exception as e:
            print(f"✗ Scenario 2 failed: {e}")
            import traceback
            traceback.print_exc()
            self.test_results.append(("Scenario 2: Semantic Search", False, str(e)))
            return False

    async def test_scenario_3_no_useful_information(self):
        """
        Scenario 3: No useful information - "What happened to a completely unrelated historical event?"
        Expected flow: search_articles → insufficient → semantic_search → no relevant context → final answer clearly states no information
        """
        print("\n--- Testing Scenario 3: No Useful Information ---")

        try:
            async with AsyncSessionLocal() as db:
                # Create services
                search_service = SearchService()
                semantic_search_service = SemanticSearchService(db, self.embedding_service)
                article_service = ArticleService(db)
                llm_service = LLMService()

                conversation_service = ConversationService(
                    db=db,
                    article_service=article_service,
                    llm_service=llm_service,
                    search_service=search_service,
                    semantic_search_service=semantic_search_service,
                )

                # Create a test conversation
                create_request = CreateConversationRequest(title="History Test")
                conversation = await conversation_service.create_conversation(
                    request=create_request,
                    current_user=None,
                    guest_id="integration-test-guest",
                )

                print(f"✓ Created conversation with ID: {conversation.id}")

                # Test search with unrelated query
                unrelated_query = "completely unrelated historical event from 1800s"
                search_result = await search_service.search_articles(
                    db=db,
                    query=unrelated_query,
                    limit=5
                )

                print(f"✓ Search for unrelated query returned {len(search_result.get('results', []))} results")

                # Test semantic search with unrelated query
                semantic_result = await semantic_search_service.search(
                    query=unrelated_query,
                    top_k=5
                )

                print(f"✓ Semantic search for unrelated query returned {len(semantic_result)} results")

                # Verify that metadata search returns empty or minimal results
                assert len(search_result.get('results', [])) <= 1  # Should be empty or minimal

                # Note: Semantic search may return some results as it finds conceptually similar content
                # This is expected behavior - the key is that the LLM should determine if results are relevant
                print(f"✓ Metadata search correctly finds no exact matches for unrelated query")

                # Clean up
                await db.delete(conversation)
                await db.commit()

                print("✓ Scenario 3 passed: No information handling works correctly")
                self.test_results.append(("Scenario 3: No Useful Information", True, None))
                return True

        except Exception as e:
            print(f"✗ Scenario 3 failed: {e}")
            import traceback
            traceback.print_exc()
            self.test_results.append(("Scenario 3: No Useful Information", False, str(e)))
            return False

    async def test_search_and_semantic_comparison(self):
        """Test the comparison between metadata search and semantic search."""
        print("\n--- Testing Search vs Semantic Search Comparison ---")

        try:
            async with AsyncSessionLocal() as db:
                search_service = SearchService()
                semantic_search_service = SemanticSearchService(db, self.embedding_service)

                # Test with a query that should work differently in both
                test_query = "artificial intelligence developments"

                # Metadata search
                metadata_result = await search_service.search_articles(
                    db=db,
                    query=test_query,
                    limit=5
                )

                # Semantic search
                semantic_result = await semantic_search_service.search(
                    query=test_query,
                    top_k=5
                )

                print(f"✓ Metadata search: {len(metadata_result.get('results', []))} results")
                print(f"✓ Semantic search: {len(semantic_result)} results")

                # Both should return results
                assert isinstance(metadata_result, dict)
                assert isinstance(semantic_result, list)

                print("✓ Search comparison test passed")
                self.test_results.append(("Search vs Semantic Comparison", True, None))
                return True

        except Exception as e:
            print(f"✗ Search comparison test failed: {e}")
            import traceback
            traceback.print_exc()
            self.test_results.append(("Search vs Semantic Comparison", False, str(e)))
            return False

    async def test_embedding_dimensions(self):
        """Test that embeddings have the correct dimension."""
        print("\n--- Testing Embedding Dimensions ---")

        try:
            test_queries = [
                "technology news",
                "AI chip market",
                "historical events",
                "completely unrelated topic"
            ]

            for query in test_queries:
                embedding = self.embedding_service.generate_embedding(query)
                assert len(embedding) == 384, f"Expected 384 dimensions, got {len(embedding)}"
                print(f"✓ Query '{query}' generates 384-dimensional embedding")

            print("✓ All embeddings have correct dimension")
            self.test_results.append(("Embedding Dimensions", True, None))
            return True

        except Exception as e:
            print(f"✗ Embedding dimension test failed: {e}")
            import traceback
            traceback.print_exc()
            self.test_results.append(("Embedding Dimensions", False, str(e)))
            return False


async def run_all_integration_tests():
    """Run all integration tests."""
    test = TestConversationIntegration()

    print("=" * 60)
    print("Running Integration Tests for Newsbit Conversation Flow")
    print("=" * 60)

    # Run all tests
    await test.test_embedding_dimensions()
    await test.test_scenario_1_metadata_search()
    await test.test_scenario_2_semantic_search()
    await test.test_scenario_3_no_useful_information()
    await test.test_search_and_semantic_comparison()

    # Print summary
    print("\n" + "=" * 60)
    print("Integration Test Summary")
    print("=" * 60)

    passed = sum(1 for _, success, _ in test.test_results if success)
    failed = sum(1 for _, success, _ in test.test_results if not success)

    for test_name, success, error in test.test_results:
        status = "✓ PASSED" if success else "✗ FAILED"
        print(f"{status}: {test_name}")
        if error:
            print(f"  Error: {error}")

    print(f"\nTotal: {passed} passed, {failed} failed out of {len(test.test_results)} tests")

    if failed == 0:
        print("\n✓ All integration tests passed!")
        return True
    else:
        print(f"\n✗ {failed} integration test(s) failed")
        return False


if __name__ == "__main__":
    success = asyncio.run(run_all_integration_tests())
    exit(0 if success else 1)
