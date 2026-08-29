from datetime import UTC, datetime

from app.models.article import Article
from app.utils.category_validator import normalize_and_validate_category


class TestArticleCategoryIntegration:
    """Test suite for Article model category integration."""

    def test_article_creation_with_valid_category(self):
        """Test that an Article can be created with a valid category."""
        article = Article(
            title="Test Article",
            url="https://example.com/test-article",
            image_url="https://example.com/image.jpg",
            published_at=datetime.now(UTC),
            feed_types=["top_headlines"],
            category="Technology"
        )

        assert article.category == "Technology"
        assert len(article.category) <= 100  # Ensure it fits in VARCHAR(100)

    def test_article_creation_with_normalized_category(self):
        """Test that normalized categories work with Article creation."""
        # Simulate what happens in news_processor.py
        raw_category = "Category: Technology"
        normalized_category = normalize_and_validate_category(raw_category)

        article = Article(
            title="Test Article",
            url="https://example.com/test-article",
            image_url="https://example.com/image.jpg",
            published_at=datetime.now(UTC),
            feed_types=["top_headlines"],
            category=normalized_category
        )

        assert article.category == "Technology"
        assert len(article.category) <= 100

    def test_article_creation_with_malformed_category(self):
        """Test that malformed LLM output gets normalized to valid category."""
        # Simulate the problematic Guardian article output
        raw_category = (
            "Technology is not the best match but the closest category available. "
            "However, a more appropriate category would be none of the above. So: Other"
        )
        normalized_category = normalize_and_validate_category(raw_category)

        article = Article(
            title="Test Article",
            url="https://example.com/test-article",
            image_url="https://example.com/image.jpg",
            published_at=datetime.now(UTC),
            feed_types=["top_headlines"],
            category=normalized_category
        )

        assert article.category == "Other"
        assert len(article.category) <= 100

    def test_article_category_fits_in_database_column(self):
        """Test that all allowed categories fit within VARCHAR(100)."""
        from app.utils.category_validator import ALLOWED_CATEGORIES

        for category in ALLOWED_CATEGORIES:
            assert len(category) <= 100, f"Category '{category}' exceeds VARCHAR(100) limit"

    def test_new_categories_work(self):
        """Test that newly added categories (AI, Education, Space) work correctly."""
        new_categories = ["AI", "Education", "Space"]

        for category in new_categories:
            result = normalize_and_validate_category(category)
            assert result == category, f"New category '{category}' should pass through unchanged"

            article = Article(
                title="Test Article",
                url="https://example.com/test-article",
                image_url="https://example.com/image.jpg",
                published_at=datetime.now(UTC),
                feed_types=["top_headlines"],
                category=category
            )

            assert article.category == category
            assert len(article.category) <= 100

    def test_article_with_none_category(self):
        """Test that Article can be created with None category (nullable field)."""
        article = Article(
            title="Test Article",
            url="https://example.com/test-article",
            image_url="https://example.com/image.jpg",
            published_at=datetime.now(UTC),
            feed_types=["top_headlines"],
            category=None
        )

        assert article.category is None

    def test_article_category_update_to_valid(self):
        """Test updating an article's category to a valid value."""
        article = Article(
            title="Test Article",
            url="https://example.com/test-article",
            image_url="https://example.com/image.jpg",
            published_at=datetime.now(UTC),
            feed_types=["top_headlines"],
            category="Business"
        )

        # Update category
        article.category = normalize_and_validate_category("Politics")

        assert article.category == "Politics"
        assert len(article.category) <= 100
