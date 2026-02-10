from typing import Literal, TypedDict, List


class PromptContent(TypedDict):
    """Unified structure for prompt text and images."""

    text: str
    images: List[str]


HistoryRole = Literal["assistant", "user"]


class HistoryItem(TypedDict):
    """A normalized conversation turn with explicit role metadata."""

    role: HistoryRole
    text: str
    images: List[str]


Stack = Literal[
    "html_css",
    "html_tailwind",
    "react_tailwind",
    "bootstrap",
    "ionic_tailwind",
    "vue_tailwind",
]
