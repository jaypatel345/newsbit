from app.utils.dedup import canonicalize_url, normalize_title


class TestCanonicalizeUrl:
    """Two URLs that point at the same article must canonicalize equal."""

    def test_strips_tracking_params(self):
        assert canonicalize_url(
            "https://example.com/story?utm_source=twitter&utm_medium=social"
        ) == "https://example.com/story"

    def test_keeps_meaningful_params_sorted(self):
        assert canonicalize_url(
            "https://example.com/story?b=2&a=1&fbclid=xyz"
        ) == "https://example.com/story?a=1&b=2"

    def test_normalizes_scheme_host_and_trailing_slash(self):
        variants = [
            "http://www.example.com/news/story-1/",
            "https://example.com/news/story-1",
            "https://EXAMPLE.com//news//story-1",
            "https://example.com/news/story-1/amp",
            "https://example.com/news/story-1#comments",
        ]
        canon = {canonicalize_url(v) for v in variants}
        assert canon == {"https://example.com/news/story-1"}

    def test_empty_and_invalid_return_empty_string(self):
        assert canonicalize_url("") == ""
        assert canonicalize_url(None) == ""
        assert canonicalize_url("not a url") == ""


class TestNormalizeTitle:
    def test_ignores_case_and_punctuation(self):
        assert normalize_title("Apple Unveils: the NEW iPhone!!") == (
            "apple unveils the new iphone"
        )

    def test_collapses_whitespace(self):
        assert normalize_title("  spaced   out  ") == "spaced out"

    def test_empty(self):
        assert normalize_title(None) == ""
        assert normalize_title("") == ""
