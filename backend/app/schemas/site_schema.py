"""Pydantic schemas for Site API requests and responses."""

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class GeoJSONPolygon(BaseModel):
    """GeoJSON Polygon geometry."""
    type: str = "Polygon"
    coordinates: List[List[List[float]]]


class SiteCreate(BaseModel):
    """Request schema for creating a new site."""
    name: str = Field(..., max_length=255, examples=["Jaipur Old City Pilot"])
    description: Optional[str] = None
    latitude: float = Field(..., ge=-90, le=90, examples=[26.9239])
    longitude: float = Field(..., ge=-180, le=180, examples=[75.8267])
    climate_zone: str = Field(
        ...,
        max_length=50,
        examples=["Hot-Dry"],
        description="Climate classification: Hot-Dry, Warm-Humid, Cold-Dry, Cold-Cloudy, Composite, Temperate, Moderate",
    )
    typology: Optional[str] = Field(None, max_length=100, examples=["Courtyard house"])
    vernacular_tradition: Optional[str] = Field(
        None, max_length=255, examples=["Haveli architecture of Rajasthan"]
    )
    plot_area_sqm: Optional[float] = Field(None, ge=0, examples=[320.0])
    polygon: Optional[GeoJSONPolygon] = None


class SiteResponse(BaseModel):
    """Response schema for a site."""
    id: str
    name: str
    description: Optional[str]
    latitude: float
    longitude: float
    climate_zone: str
    typology: Optional[str]
    vernacular_tradition: Optional[str]
    plot_area_sqm: Optional[float]
    polygon: Optional[GeoJSONPolygon] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class SiteListResponse(BaseModel):
    """Paginated list of sites."""
    total: int
    sites: List[SiteResponse]
