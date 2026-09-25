"""Single source of truth for the AI reporter's spoken persona, shared by
the per-article and daily-brief audio services so a future rename only
happens in one place."""

REPORTER_NAME = "Sage"

REPORTER_INTRO = f"Hi, I'm {REPORTER_NAME}, your Newsbit AI reporter."

# Delivery direction for engines that accept a style prompt (Gemini-TTS).
# Chirp3-HD ignores it - there the anchor sound comes from the script's own
# sentence shape, its pause tags, and the broadcast speaking rate.
REPORTER_STYLE_DIRECTION = (
    "Read this as a network television news anchor delivering the top of an "
    "evening bulletin. Warm but authoritative, clear and unhurried, at a "
    "steady broadcast pace. Land the first few words of each story with "
    "weight, let your pitch fall at the end of each sentence, and take a "
    "real breath between stories the way an anchor does on air. Lift "
    "slightly on names, places and numbers so they land clearly. Never "
    "sound cheerful, chatty, salesy, or like an advertisement, and never "
    "rush the final sentence."
)
