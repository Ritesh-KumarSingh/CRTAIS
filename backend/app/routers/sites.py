"""Site CRUD endpoints — SQLite compatible (no PostGIS)."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.postgres import get_db
from app.models.site import Site
from app.schemas.site_schema import (
    GeoJSONPolygon,
    SiteCreate,
    SiteListResponse,
    SiteResponse,
)

router = APIRouter(prefix="/api/sites", tags=["sites"])


def _site_to_response(site: Site) -> SiteResponse:
    """Convert a SQLAlchemy Site to a Pydantic response."""
    polygon = None
    if site.polygon_geojson:
        try:
            polygon = GeoJSONPolygon(**site.polygon_geojson)
        except Exception:
            pass

    return SiteResponse(
        id=site.id,
        name=site.name,
        description=site.description,
        latitude=site.latitude,
        longitude=site.longitude,
        climate_zone=site.climate_zone,
        typology=site.typology,
        vernacular_tradition=site.vernacular_tradition,
        plot_area_sqm=site.plot_area_sqm,
        polygon=polygon,
        created_at=site.created_at,
        updated_at=site.updated_at,
    )


@router.post("/", response_model=SiteResponse, status_code=201)
async def create_site(data: SiteCreate, db: AsyncSession = Depends(get_db)):
    """Create a new site with optional plot polygon."""
    polygon_json = None
    if data.polygon:
        polygon_json = {"type": data.polygon.type, "coordinates": data.polygon.coordinates}

    site = Site(
        name=data.name,
        description=data.description,
        latitude=data.latitude,
        longitude=data.longitude,
        climate_zone=data.climate_zone,
        typology=data.typology,
        vernacular_tradition=data.vernacular_tradition,
        plot_area_sqm=data.plot_area_sqm,
        polygon_geojson=polygon_json,
    )
    db.add(site)
    await db.flush()
    await db.refresh(site)
    return _site_to_response(site)


@router.get("/", response_model=SiteListResponse)
async def list_sites(
    climate_zone: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """List sites with optional climate zone filter."""
    query = select(Site)
    count_query = select(func.count()).select_from(Site)

    if climate_zone:
        query = query.where(Site.climate_zone == climate_zone)
        count_query = count_query.where(Site.climate_zone == climate_zone)

    query = query.order_by(Site.created_at.desc()).offset(skip).limit(limit)

    result = await db.execute(query)
    sites = result.scalars().all()

    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    return SiteListResponse(
        total=total,
        sites=[_site_to_response(s) for s in sites],
    )


@router.get("/{site_id}", response_model=SiteResponse)
async def get_site(site_id: str, db: AsyncSession = Depends(get_db)):
    """Get a single site by ID."""
    result = await db.execute(select(Site).where(Site.id == site_id))
    site = result.scalar_one_or_none()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    return _site_to_response(site)


@router.delete("/{site_id}", status_code=204)
async def delete_site(site_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a site by ID."""
    result = await db.execute(select(Site).where(Site.id == site_id))
    site = result.scalar_one_or_none()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    await db.delete(site)
