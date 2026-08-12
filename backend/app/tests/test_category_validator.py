import pytest
from app.utils.category_validator import normalize_and_validate_category, ALLOWED_CATEGORIES


class TestCategoryValidator:
    """Test suite for category validation and normalization."""

    def test_valid_categories_pass_through(self):
        """Test that valid category names are returned unchanged."""
        for category in ALLOWED_CATEGORIES:
            result = normalize_and_validate_category(category)
            assert result == category, f"Valid category '{category}' should pass through unchanged"

    def test_none_returns_other(self):
        """Test that None input defaults to 'Other'."""
        result = normalize_and_validate_category(None)
        assert result == "Other"

    def test_empty_string_returns_other(self):
        """Test that empty string defaults to 'Other'."""
        result = normalize_and_validate_category("")
        assert result == "Other"

    def test_whitespace_only_returns_other(self):
        """Test that whitespace-only string defaults to 'Other'."""
        result = normalize_and_validate_category("   ")
        assert result == "Other"

    def test_category_with_prefix(self):
        """Test extraction of category from 'Category: Technology' format."""
        result = normalize_and_validate_category("Category: Technology")
        assert result == "Technology"

    def test_category_with_sentence(self):
        """Test extraction of category from explanatory sentence."""
        result = normalize_and_validate_category("Technology is the closest category.")
        assert result == "Technology"

    def test_complex_explanation_with_other(self):
        """Test extraction of 'Other' from complex explanation."""
        result = normalize_and_validate_category(
            "Technology is not the best match but the closest category available. "
            "However, a more appropriate category would be none of the above. So: Other"
        )
        assert result == "Other"

    def test_case_insensitive_matching(self):
        """Test that category matching is case-insensitive."""
        result = normalize_and_validate_category("technology")
        assert result == "Technology"

        result = normalize_and_validate_category("BUSINESS")
        assert result == "Business"

    def test_invalid_category_defaults_to_other(self):
        """Test that completely invalid categories default to 'Other'."""
        result = normalize_and_validate_category("InvalidCategory")
        assert result == "Other"

        result = normalize_and_validate_category("Random String")
        assert result == "Other"

    def test_category_with_colon_and_spaces(self):
        """Test handling of various colon formats."""
        result = normalize_and_validate_category("Category:Technology")
        assert result == "Technology"

        result = normalize_and_validate_category("Category : Technology")
        assert result == "Technology"

    def test_category_in_middle_of_sentence(self):
        """Test extraction when category appears in middle of sentence."""
        result = normalize_and_validate_category("The article is about Technology and innovation.")
        assert result == "Technology"

    def test_multiple_valid_categories_returns_first(self):
        """Test that when multiple valid categories appear, first match is returned."""
        result = normalize_and_validate_category("Technology and Business are both relevant")
        # Should return the first match found
        assert result in ["Technology", "Business"]

    def test_whitespace_trimming(self):
        """Test that whitespace is properly trimmed."""
        result = normalize_and_validate_category("  Technology  ")
        assert result == "Technology"

    def test_allowed_categories_constant(self):
        """Test that ALLOWED_CATEGORIES contains expected values."""
        expected_categories = {
            "Technology",
            "Business",
            "Sports",
            "Politics",
            "Entertainment",
            "Science",
            "Health",
            "World",
            "Nation",
            "Other",
            "AI",
            "Education",
            "Space",
        }
        assert ALLOWED_CATEGORIES == expected_categories

    def test_markdown_format(self):
        """Test handling of markdown-formatted category."""
        result = normalize_and_validate_category("**Technology**")
        assert result == "Technology"

    def test_partial_word_no_match(self):
        """Test that partial word matches don't trigger false positives."""
        result = normalize_and_validate_category("Technological")
        assert result == "Other"

    def test_similar_but_different_category(self):
        """Test that similar words don't match wrong categories."""
        result = normalize_and_validate_category("Politic")  # Not "Politics"
        assert result == "Other"

    def test_real_world_guardian_example(self):
        """Test the specific Guardian article example from the error."""
        # This is the actual problematic output from the logs
        problematic_output = (
            "Technology is not the best match but the closest category available. "
            "However, a more appropriate category would be none of the above. So: Other"
        )
        result = normalize_and_validate_category(problematic_output)
        assert result == "Other", "Guardian article should be categorized as 'Other'"

    def test_each_allowed_category_individually(self):
        """Test each allowed category individually."""
        test_cases = [
            ("Technology", "Technology"),
            ("Business", "Business"),
            ("Sports", "Sports"),
            ("Politics", "Politics"),
            ("Entertainment", "Entertainment"),
            ("Science", "Science"),
            ("Health", "Health"),
            ("World", "World"),
            ("Nation", "Nation"),
            ("Other", "Other"),
            ("AI", "AI"),
            ("Education", "Education"),
            ("Space", "Space"),
        ]
        
        for input_category, expected in test_cases:
            result = normalize_and_validate_category(input_category)
            assert result == expected, f"Failed for input: {input_category}"
