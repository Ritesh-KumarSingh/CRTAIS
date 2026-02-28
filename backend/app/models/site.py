"""Site model — SQLite compatible (no PostGIS dependency)."""

import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Float, String, Text
from sqlalchemy.dialects.sqlite import JSON

from app.db.postgres import Base


def _gen_uuid() -> str:
    return str(uuid.uuid4())


class Site(Base):
    __tablename__ = "sites"

    id = Column(String(36), primary_key=True, default=_gen_uuid)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    climate_zone = Column(String(50), nullable=False, index=True)
    typology = Column(String(100), nullable=True)
    vernacular_tradition = Column(String(255), nullable=True)
    plot_area_sqm = Column(Float, nullable=True)

    # Store GeoJSON polygon as JSON text (SQLite doesn't have geometry columns)
    polygon_geojson = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
