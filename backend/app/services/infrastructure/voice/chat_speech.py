"""Turn a chat answer into something worth hearing.

Answers on the chat page are written for the eye: markdown emphasis, bullet
lists, inline links, bracketed citation markers, the occasional code fence.
Read literally that becomes "star star Reuters star star, bracket one,
h-t-t-p-s colon slash slash..." - so strip the page furniture here, before
the text ever reaches `sanitize_script`, which only knows about the pause
vocabulary and a few stray markdown characters.
"""

import re

# Fenced blocks are never worth reading aloud - drop them wholesale rather
# than spelling out somebody's JSON.
_CODE_FENCE_RE = re.compile(r"```.*?```", re.DOTALL)
# [label](https://...) -> label. Must run before the bracket pass in
# sanitize_script, which would otherwise leave the bare "(https://...)"
# behind for the voice to spell out.
_MD_LINK_RE = re.compile(r"\[([^\]]*)\]\(([^)]*)\)")
_BARE_URL_RE = re.compile(r"https?://\S+|\bwww\.\S+")
# A markdown table reads as a wall of pipes; skip those lines entirely.
_TABLE_ROW_RE = re.compile(r"^\s*\|.*\|\s*$", re.MULTILINE)
_LIST_MARKER_RE = re.compile(r"^\s*(?:[-*+]|\d+[.)])\s+", re.MULTILINE)
_BLOCKQUOTE_RE = re.compile(r"^\s*>+\s?", re.MULTILINE)
_HEADING_RE = re.compile(r"^\s*#{1,6}\s*", re.MULTILINE)
# Citation markers the answer carries for the eye: "[1]", "[2, 3]".
_CITATION_RE = re.compile(r"\[\s*\d+(?:\s*[,-]\s*\d+)*\s*\]")
# A removed link or URL can leave the sentence hanging on its conjunction
# ("See the filing or."). Trim that dangling word rather than say it.
_DANGLING_RE = re.compile(
    r"\s+(?:or|and|at|in|via|from|see|per)\s*(?=[.,;:!?]|$)",
    re.IGNORECASE,
)
# Pictographs, dingbats and arrows: some voices name them out loud.
_SYMBOL_RE = re.compile(
    "[\U0001f000-\U0001faff\u2190-\u21ff\u2600-\u27bf\ufe0f]"
)


def to_speech_text(answer: str) -> str:
    """Return `answer` reduced to the words a voice should actually say."""
    text = _CODE_FENCE_RE.sub(" ", answer or "")
    text = _TABLE_ROW_RE.sub(" ", text)
    text = _MD_LINK_RE.sub(r"\1", text)
    text = _BARE_URL_RE.sub(" ", text)
    text = _BLOCKQUOTE_RE.sub("", text)
    text = _HEADING_RE.sub("", text)
    text = _CITATION_RE.sub("", text)
    # Bullets become sentences: without the terminator the voice runs every
    # item together into one breathless line.
    text = _LIST_MARKER_RE.sub("", text)
    text = _SYMBOL_RE.sub(" ", text)
    # Leftover emphasis/underscore runs that sanitize_script does not cover.
    text = re.sub(r"(?<=\w)_(?=\w)", " ", text)
    text = re.sub(r"[_~]{1,3}", "", text)
    text = re.sub(r"[*`#]+", "", text)
    text = _DANGLING_RE.sub("", text)
    # Collapse the blank lines the substitutions leave behind, and give each
    # remaining line a full stop so the voice breathes between points.
    lines = [line.strip() for line in text.splitlines()]
    spoken = [
        line if line.endswith((".", "!", "?", ":", ";", ",")) else f"{line}."
        for line in lines
        if line
    ]
    joined = re.sub(r"\s{2,}", " ", " ".join(spoken))
    # The per-line full stops can double up behind text that already ended
    # in one, or behind a line the substitutions emptied out.
    return re.sub(r"\s*\.(?:\s*\.)+", ".", joined).strip()
