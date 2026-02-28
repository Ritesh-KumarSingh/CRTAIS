"""Endpoints for evaluating vernacular rules against a specific site."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.postgres import get_db
from app.models.site import Site
from app.schemas.rule_schema import RuleListResponse
from app.services.rule_engine import evaluate_rules_for_site

router = APIRouter(prefix="/api/evaluate", tags=["evaluate"])


@router.get("/{site_id}", response_model=RuleListResponse)
async def evaluate_rules_for(
    site_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Evaluate all matching vernacular rules for a given site."""
    result = await db.execute(select(Site).where(Site.id == site_id))
    site = result.scalar_one_or_none()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    rules = await evaluate_rules_for_site(
        climate_zone=site.climate_zone,
        latitude=site.latitude,
        longitude=site.longitude,
    )

    return RuleListResponse(total=len(rules), rules=rules)
