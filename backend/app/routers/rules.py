"""Vernacular rule endpoints — reads from MongoDB."""

from typing import Optional

from fastapi import APIRouter, Query

from app.db.mongo import get_mongo_db
from app.schemas.rule_schema import RuleListResponse, RuleResponse

router = APIRouter(prefix="/api/rules", tags=["rules"])


@router.get("/", response_model=RuleListResponse)
async def list_rules(
    climate_zone: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    q: Optional[str] = Query(None, description="Full-text search in name and description"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
):
    """List vernacular rules with optional filters and text search."""
    db = get_mongo_db()
    collection = db["rules"]

    query: dict = {}
    if climate_zone:
        query["climate_zone"] = climate_zone
    if category:
        query["category"] = category
    if region:
        query["region"] = {"$regex": region, "$options": "i"}
    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
            {"tags": {"$in": [q.lower()]}},
        ]

    total = await collection.count_documents(query)
    cursor = collection.find(query).skip(skip).limit(limit)
    docs = await cursor.to_list(length=limit)

    rules = []
    for doc in docs:
        doc.pop("_id", None)
        rules.append(RuleResponse(**doc))

    return RuleListResponse(total=total, rules=rules)


@router.get("/{rule_id}", response_model=RuleResponse)
async def get_rule(rule_id: str):
    """Get a single rule by rule_id."""
    db = get_mongo_db()
    doc = await db["rules"].find_one({"rule_id": rule_id})
    if not doc:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Rule not found")
    doc.pop("_id", None)
    return RuleResponse(**doc)
