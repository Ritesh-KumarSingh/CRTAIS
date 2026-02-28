"""JSON-file-based rule store (replaces MongoDB for local dev without Docker).

Provides a thin async-compatible interface that mimics the subset of
MongoDB operations used by the rules router and rule engine, so the
rest of the codebase doesn't need to change.
"""

import json
import re
from pathlib import Path
from typing import Any, Dict, List, Optional


_DATA_DIR = Path(__file__).resolve().parent.parent.parent.parent / "data"
_RULES_FILE = _DATA_DIR / "sample_rules.json"

# In-memory cache loaded on first access
_rules_cache: List[Dict[str, Any]] | None = None


def _load_rules() -> List[Dict[str, Any]]:
    global _rules_cache
    if _rules_cache is None:
        if _RULES_FILE.exists():
            with open(_RULES_FILE, "r", encoding="utf-8") as f:
                _rules_cache = json.load(f)
        else:
            _rules_cache = []
    return _rules_cache


def _matches(doc: Dict[str, Any], query: Dict[str, Any]) -> bool:
    """Simple query matcher supporting exact match, $regex, and $or/$in."""
    for key, val in query.items():
        if key == "$or":
            if not any(_matches(doc, sub_q) for sub_q in val):
                return False
            continue

        doc_val = doc.get(key)
        if isinstance(val, dict):
            if "$regex" in val:
                pattern = val["$regex"]
                flags = re.IGNORECASE if "i" in val.get("$options", "") else 0
                if doc_val is None or not re.search(pattern, str(doc_val), flags):
                    return False
            elif "$in" in val:
                if isinstance(doc_val, list):
                    if not any(v in doc_val for v in val["$in"]):
                        return False
                elif doc_val not in val["$in"]:
                    return False
        else:
            if doc_val != val:
                return False
    return True


class _FakeCursor:
    """Mimics Motor cursor with skip / limit / sort / to_list."""

    def __init__(self, docs: List[Dict[str, Any]]):
        self._docs = docs
        self._skip = 0
        self._limit: Optional[int] = None
        self._sort_key: Optional[str] = None
        self._sort_dir: int = 1  # 1 = asc, -1 = desc

    def skip(self, n: int) -> "_FakeCursor":
        self._skip = n
        return self

    def limit(self, n: int) -> "_FakeCursor":
        self._limit = n
        return self

    def sort(self, key: str, direction: int = 1) -> "_FakeCursor":
        self._sort_key = key
        self._sort_dir = direction
        return self

    async def to_list(self, length: int | None = None) -> List[Dict[str, Any]]:
        result = list(self._docs)
        if self._sort_key:
            result.sort(
                key=lambda d: d.get(self._sort_key, 0) or 0,  # type: ignore
                reverse=(self._sort_dir == -1),
            )
        result = result[self._skip:]
        limit = self._limit or length
        if limit:
            result = result[:limit]
        return result


class _FakeCollection:
    """Mimics a MongoDB collection backed by the JSON file."""

    def __init__(self, name: str):
        self.name = name

    async def count_documents(self, query: Dict[str, Any]) -> int:
        docs = _load_rules()
        return sum(1 for d in docs if _matches(d, query))

    def find(self, query: Dict[str, Any] | None = None) -> _FakeCursor:
        docs = _load_rules()
        if query:
            docs = [d for d in docs if _matches(d, query)]
        return _FakeCursor(docs)

    async def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        docs = _load_rules()
        for d in docs:
            if _matches(d, query):
                return dict(d)
        return None

    async def insert_many(self, docs: List[Dict[str, Any]]) -> None:
        rules = _load_rules()
        rules.extend(docs)
        # persist back
        with open(_RULES_FILE, "w", encoding="utf-8") as f:
            json.dump(rules, f, indent=2, ensure_ascii=False)


class _FakeDB:
    """Mimics a MongoDB database with collection access via __getitem__."""

    def __getitem__(self, name: str) -> _FakeCollection:
        return _FakeCollection(name)


_db = _FakeDB()


def get_mongo_client():
    return None


def get_mongo_db() -> _FakeDB:
    return _db


async def close_mongo() -> None:
    pass
