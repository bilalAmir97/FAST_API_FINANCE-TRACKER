"""AI service layer for transaction analysis using Gemini via AsyncOpenAI.

This module exposes high-level async helpers used by the FastAPI routes:
- categorize_transaction(note): classify a free-text note into a spending category.
- analyze_category(category, note): generate a short savings tip for that category.
- analyze_transaction(note): orchestrate Categorizer -> Analyzer and return both.

Environment configuration:
- Expects a GEMINI_API (or GEMINI_API_KEY) environment variable containing the API key.
- Optionally loads .env via python-dotenv if present.
"""

import logging
import os
from typing import Dict

from dotenv import load_dotenv
from openai import AsyncOpenAI

logger = logging.getLogger(__name__)

# Load .env if present (no-op if missing)
load_dotenv()

_GEMINI_API_KEY = os.getenv("GEMINI_API") or os.getenv("GEMINI_API_KEY")

if not _GEMINI_API_KEY:
    logger.warning("GEMINI_API / GEMINI_API_KEY environment variable not set; AI analysis endpoint will fail until configured.")

# AsyncOpenAI client configured to call Gemini's OpenAI-compatible endpoint
_client = AsyncOpenAI(
    api_key=_GEMINI_API_KEY or "",
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
)

_MODEL_NAME = "gemini-2.0-flash"

_ALLOWED_CATEGORIES = ["Food", "Shopping", "Transport", "Bills","Education","Entertainment","Health", "Others"]


async def _chat(system_prompt: str, user_content: str) -> str:
    """Low-level helper to call the chat.completions API and return the text content.

    Raises RuntimeError if the API key is missing.
    """

    if not _GEMINI_API_KEY:
        raise RuntimeError("Gemini API key not configured. Set GEMINI_API or GEMINI_API_KEY in the environment.")

    response = await _client.chat.completions.create(
        model=_MODEL_NAME,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content},
        ],
    )

    content = response.choices[0].message.content
    # content may be a list of content parts or a plain string depending on client version
    if isinstance(content, str):
        return content

    # fall back: join any content parts that have "text"
    try:
        return "".join(part.get("text", "") for part in content)
    except Exception:
        # last resort, just repr it
        return str(content)


async def categorize_transaction(note: str) -> str:
    """Classify a transaction note into one of the allowed categories.

    Returns the raw category string from the model (trimmed), but also normalizes
    to one of the known categories when possible.
    """

    system_prompt = (
        "You are a brilliant Transaction Classifier. "
        "Your task is to Analyze the input text and return ONLY one category name from: "
        f"{_ALLOWED_CATEGORIES}. Do not add any extra text."
    )

    raw = (await _chat(system_prompt, note)).strip()

    # Try to map loosely to one of the known categories
    for cat in _ALLOWED_CATEGORIES:
        if raw.lower() == cat.lower():
            return cat

    # If model returned something else, fall back to Others
    logger.info("Unexpected category from model '%s', falling back to 'Others'", raw)
    return "Others"


async def analyze_category(category: str, note: str) -> str:
    """Generate a single friendly, actionable savings tip for the category.

    The original note is passed for extra context but the advice should focus
    on the category.
    """

    system_prompt = (
        "You are a concise Financial Advisor. "
        "You will receive a spending category and sometimes a user note. "
        "Provide ONE short, actionable money-saving tip for that category. "
        "Keep tone friendly and under 2 sentences."
    )

    user_content = (
        f"Category: {category}\n"
        f"Note: {note}\n\n"
        "Respond with just the tip text."
    )

    tip = (await _chat(system_prompt, user_content)).strip()
    return tip


async def analyze_transaction(note: str) -> Dict[str, str]:
    """High-level orchestration: Categorizer -> Analyzer.

    Returns a dict with keys: note, category, tip.
    """

    category = await categorize_transaction(note)
    tip = await analyze_category(category, note)

    result: Dict[str, str] = {
        "note": note,
        "category": category,
        "tip": tip,
    }

    logger.info("AI analysis complete for note '%s' -> %s", note, result)
    return result


async def analyze_spending_overview(category: str, total_amount: float) -> str:
    """Generate a one-line tip based on the dominant spending category.

    Designed for aggregated spending summaries, not single transactions.
    """

    system_prompt = (
        "You are a concise financial coach. "
        "You will receive the user's highest spending category and total amount. "
        "Provide ONE short, single-sentence money-saving tip focused on that category. "
        "Do not mention other categories; keep it friendly and practical."
    )

    user_content = (
        f"Highest spending category: {category}. "
        f"Total recent spending in this category: ${total_amount:.2f}.\n"
        "Respond with just the tip text."
    )

    tip = (await _chat(system_prompt, user_content)).strip()
    return tip
