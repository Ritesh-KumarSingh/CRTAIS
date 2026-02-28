"""Rule engine service — evaluates vernacular rules against site conditions."""

from typing import Any, Dict, List

from app.db.mongo import get_mongo_db
from app.schemas.rule_schema import RuleResponse


async def evaluate_rules_for_site(
    climate_zone: str,
    latitude: float,
    longitude: float,
    extra_conditions: Dict[str, Any] | None = None,
) -> List[RuleResponse]:
    """
    Fetch and filter rules that match the site's climate zone.

    In the MVP, this does a simple zone-based match. Future versions will
    evaluate condition fields (temperature, humidity, wind) against actual
    climate data for the site's coordinates.
    """
    db = get_mongo_db()
    collection = db["rules"]

    # Query rules matching the climate zone or 'Composite' (universal)
    query = {
        "$or": [
            {"climate_zone": climate_zone},
            {"climate_zone": "Composite"},
        ]
    }

    cursor = collection.find(query).sort("confidence", -1)
    docs = await cursor.to_list(length=100)

    results = []
    for doc in docs:
        doc.pop("_id", None)
        results.append(RuleResponse(**doc))

    return results
