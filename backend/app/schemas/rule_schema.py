"""Pydantic schemas for Vernacular Rule API."""

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class RuleSource(BaseModel):
    type: str
    reference: str
    year: Optional[int] = None
    url: Optional[str] = None


class RuleRecommendation(BaseModel):
    summary: str
    detail: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None


class RuleCondition(BaseModel):
    min_temperature_c: Optional[float] = None
    max_temperature_c: Optional[float] = None
    wind_direction: Optional[str] = None
    min_wind_speed_ms: Optional[float] = None
    slope_degrees_max: Optional[float] = None
    rainfall_mm_annual_min: Optional[float] = None
    rainfall_mm_annual_max: Optional[float] = None
    humidity_pct_min: Optional[float] = None
    humidity_pct_max: Optional[float] = None
    solar_radiation_kwh_m2_day_min: Optional[float] = None


class RuleResponse(BaseModel):
    rule_id: str
    name: str
    description: str
    region: str
    climate_zone: str
    tradition: str
    category: Optional[str] = None
    condition: Optional[Dict[str, Any]] = None
    recommendation: RuleRecommendation
    confidence: Optional[float] = None
    sources: List[RuleSource] = []
    tags: List[str] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class RuleListResponse(BaseModel):
    total: int
    rules: List[RuleResponse]
