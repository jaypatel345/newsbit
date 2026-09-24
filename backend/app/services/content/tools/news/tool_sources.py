"""Recover the articles a tool returned, so replies can cite real links.

The tools hand the model plain text blocks of ``Title / Summary / Source /
Published / URL``. The model then writes prose and drops the URLs. Parsing
them back out here means a citation always points at an article the agent
actually read — the model never writes a URL, so it can never invent one.
"""

from urllib.parse import urlparse

_FIELDS = ("title", "summary", "source", "published", "url")


def _domain(url: str) -> str:
    host = urlparse(url).netloc.lower()
    return host[4:] if host.startswith("www.") else host


def parse_tool_sources(text: str) -> list[dict]:
    """Pull ``{title, source, url, published}`` records out of tool output."""
    if not text or "URL:" not in text:
        return []

    sources = []

    for block in text.split("\n\n"):
        record: dict[str, str] = {}

        for line in block.split("\n"):
            key, separator, value = line.partition(":")
            key = key.strip().lower()

            if separator and key in _FIELDS:
                record[key] = value.strip()

        url = record.get("url", "")

        # Tools write "N/A" when a field is missing; that isn't a link.
        if not url.startswith("http"):
            continue

        sources.append(
            {
                "title": record.get("title", ""),
                # The internet-search tool has no Source line, so fall back to
                # the publisher's domain.
                "source": record.get("source") or _domain(url),
                "url": url,
                "published": record.get("published", ""),
            }
        )

    return sources


def merge_sources(existing: list[dict], incoming: list[dict]) -> list[dict]:
    """Add new records, keeping the first occurrence of each URL."""
    seen = {source["url"] for source in existing}

    for source in incoming:
        if source["url"] in seen:
            continue
        seen.add(source["url"])
        existing.append(source)

    return existing
