"""Helpers for making sure the same article is never stored twice.

Two articles are treated as "the same" when either

1. their URLs point at the same page once tracking noise is stripped
   (``canonicalize_url``), or
2. they come from the same source and have the same title once
   punctuation / casing is ignored (``normalize_title``).

The canonical URL is also persisted on ``Article.url_canonical`` (unique)
so the database itself rejects duplicates as a last line of defence.
"""

import re
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

# Query params that only carry campaign / click tracking and never change
# which article a URL refers to.
_TRACKING_PARAM_PREFIXES = ("utm_",)
_TRACKING_PARAMS = {
    "amp",
    "cmpid",
    "cmp",
    "dclid",
    "ei",
    "fbclid",
    "gclid",
    "gclsrc",
    "guccounter",
    "igshid",
    "mc_cid",
    "mc_eid",
    "msclkid",
    "partner",
    "ref",
    "ref_src",
    "s",
    "smid",
    "spm",
    "src",
    "srnd",
    "taid",
    "unlocked_article_code",
    "__twitter_impression",
}

_MULTISLASH_RE = re.compile(r"/{2,}")
_AMP_SUFFIX_RE = re.compile(r"/amp/?$")
_NON_ALNUM_RE = re.compile(r"[^a-z0-9]+")


def canonicalize_url(url: str | None) -> str:
    """Return a stable, comparable form of ``url``.

    Normalises scheme to https, lower-cases the host, drops a leading
    ``www.``, removes tracking query params, and trims trailing slashes /
    ``/amp`` suffixes / URL fragments. Returns ``""`` for falsy or
    unparseable input so callers can fall back to a title-based check.
    """
    if not url or not url.strip():
        return ""

    try:
        parsed = urlparse(url.strip())
    except ValueError:
        return ""

    if not parsed.netloc:
        return ""

    netloc = parsed.netloc.lower()
    if netloc.startswith("www."):
        netloc = netloc[4:]
    if netloc.endswith((":80", ":443")):
        netloc = netloc.rsplit(":", 1)[0]

    path = _MULTISLASH_RE.sub("/", parsed.path)
    path = _AMP_SUFFIX_RE.sub("", path)
    path = path.rstrip("/")

    kept_params = [
        (key, value)
        for key, value in parse_qsl(parsed.query, keep_blank_values=False)
        if key.lower() not in _TRACKING_PARAMS
        and not key.lower().startswith(_TRACKING_PARAM_PREFIXES)
    ]
    query = urlencode(sorted(kept_params))

    return urlunparse(("https", netloc, path, "", query, ""))


def normalize_title(title: str | None) -> str:
    """Collapse a headline to a comparison key (lower-case, alnum + single
    spaces). Used to catch the same story re-published by one source under a
    slightly different URL."""
    if not title:
        return ""
    return " ".join(_NON_ALNUM_RE.sub(" ", title.lower()).split())
