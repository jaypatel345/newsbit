import logging
import re

logger = logging.getLogger(__name__)

ALLOWED_CATEGORIES = {
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


def normalize_and_validate_category(category: str | None) -> str:
    """
    Normalize and validate a category string.

    This function handles various malformed LLM responses:
    - "Category: Technology" -> "Technology"
    - "Technology is the closest category." -> "Technology"
    - "Technology is not the best match... So: Other" -> "Other"
    - Empty strings -> "Other"
    - None -> "Other"
    - Invalid categories -> "Other"

    Args:
        category: The raw category string from LLM or other source

    Returns:
        A valid category name from ALLOWED_CATEGORIES, defaults to "Other"
    """
    if not category:
        logger.debug("Category is None or empty, defaulting to 'Other'")
        return "Other"

    # Strip whitespace
    category = category.strip()

    if not category:
        logger.debug("Category is empty after stripping, defaulting to 'Other'")
        return "Other"

    # If it's already a valid category, return it
    if category in ALLOWED_CATEGORIES:
        return category

    # Try to extract a valid category from the string
    # Look for patterns like "Category: Technology" or "The category is Technology"
    # We want to find the last occurrence as it's likely the final decision
    found_categories = []
    for allowed_category in ALLOWED_CATEGORIES:
        # Check if the allowed category appears as a standalone word
        pattern = r'\b' + re.escape(allowed_category) + r'\b'
        match = re.search(pattern, category, re.IGNORECASE)
        if match:
            found_categories.append((match.start(), allowed_category))

    if found_categories:
        # Sort by position and return the last found category (likely the final decision)
        found_categories.sort(key=lambda x: x[0])
        selected_category = found_categories[-1][1]
        logger.debug(
            f"Extracted valid category '{selected_category}' from malformed input: '{category}'"
        )
        return selected_category

    # If no valid category found, log and default to Other
    logger.warning(
        f"Could not extract valid category from input: '{category}', defaulting to 'Other'"
    )
    return "Other"
