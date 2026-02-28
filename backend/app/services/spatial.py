"""Spatial query utilities — simple distance calculation (no PostGIS)."""

import math
from typing import Any, Dict, List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.site import Site


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great-circle distance between two points (km)."""
    R = 6371.0  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


async def get_nearby_sites(
    db: AsyncSession,
    latitude: float,
    longitude: float,
    radius_km: float = 50,
) -> List[Dict[str, Any]]:
    """Find sites within a given radius using Haversine formula."""
    result = await db.execute(select(Site))
    all_sites = result.scalars().all()

    nearby = []
    for site in all_sites:
        dist = _haversine_km(latitude, longitude, site.latitude, site.longitude)
        if dist <= radius_km:
            nearby.append({
                "id": site.id,
                "name": site.name,
                "climate_zone": site.climate_zone,
                "distance_km": round(dist, 2),
            })

    nearby.sort(key=lambda x: x["distance_km"])
    return nearby
