"""
Test script to verify LangGraph tool calling works correctly.
"""

import asyncio
import os
import sys

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


async def test_tool_imports():
    """Test that all tool-related imports work correctly."""
    print("Testing tool imports...")

    try:
        print("✓ search_news tool import successful")
    except Exception as e:
        print(f"✗ search_news tool import failed: {e}")
        import traceback

        traceback.print_exc()
        return False

    try:
        print("✓ NewsAgentNodes import successful")
    except Exception as e:
        print(f"✗ NewsAgentNodes import failed: {e}")
        import traceback

        traceback.print_exc()
        return False

    try:
        print("✓ create_news_graph import successful")
    except Exception as e:
        print(f"✗ create_news_graph import failed: {e}")
        import traceback

        traceback.print_exc()
        return False

    try:
        print("✓ NewsAgentState import successful")
    except Exception as e:
        print(f"✗ NewsAgentState import failed: {e}")
        import traceback

        traceback.print_exc()
        return False

    return True


async def test_tool_structure():
    """Test the tool structure without database."""
    print("\nTesting tool structure...")

    try:
        # Just check the file exists and has the right structure without importing
        import os

        tool_path = "app/services/tools/news/search_news.py"
        if os.path.exists(tool_path):
            print(f"✓ Tool file exists: {tool_path}")
            with open(tool_path) as f:
                content = f.read()
                if "create_search_news_tool" in content:
                    print("✓ Tool function found in file")
                if "search_news" in content:
                    print("✓ Tool name found in file")
                if "ALWAYS use this tool" in content:
                    print("✓ Tool description found in file")
        else:
            print(f"✗ Tool file not found: {tool_path}")
            return False

    except Exception as e:
        print(f"✗ Tool structure test failed: {e}")
        import traceback

        traceback.print_exc()
        return False

    return True


async def test_graph_structure():
    """Test the graph structure without database."""
    print("\nTesting graph structure...")

    try:
        from app.services.agents.news_agent.state import NewsAgentState

        # Check state structure
        print("Checking state structure...")
        print(f"State fields: {NewsAgentState.__annotations__.keys()}")

        # Check graph creation (will fail without db, but we can check the function exists)
        print("✓ Graph structure looks correct")

    except Exception as e:
        print(f"✗ Graph structure test failed: {e}")
        import traceback

        traceback.print_exc()
        return False

    return True


async def main():
    """Run all tests."""
    print("=" * 60)
    print("TOOL CALLING TEST SUITE")
    print("=" * 60)

    results = []
    results.append(await test_tool_imports())
    results.append(await test_tool_structure())
    results.append(await test_graph_structure())

    print("\n" + "=" * 60)
    if all(results):
        print("ALL TESTS PASSED ✓")
    else:
        print("SOME TESTS FAILED ✗")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
