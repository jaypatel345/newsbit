"""Drop repeats of the same story before they reach the model.

Feeds carry the same item under several URLs, and a press release often lands
twice. The model faithfully writes one entry per article it's given, so
duplicates surface as near-identical stories in the answer unless they're
removed here.
"""


def _field(article, name: str) -> str:
    """Read a field from either an Article row or a plain dict."""
    value = (
        article.get(name) if isinstance(article, dict) else getattr(article, name, None)
    )
    return (value or "").strip()


def dedupe_articles(articles):
    seen_urls = set()
    seen_titles = set()
    unique = []

    for article in articles:
        url = _field(article, "url").lower().rstrip("/")
        # Compare titles on letters and digits alone, so punctuation and
        # casing differences don't hide a repeat.
        title_key = "".join(
            char for char in _field(article, "title").lower() if char.isalnum()
        )

        if url and url in seen_urls:
            continue
        if title_key and title_key in seen_titles:
            continue

        if url:
            seen_urls.add(url)
        if title_key:
            seen_titles.add(title_key)

        unique.append(article)

    return unique
