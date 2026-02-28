import json
import os
from typing import List

from fastapi import APIRouter, HTTPException, Query

from app.schemas.material_schema import Material, MaterialListResponse

router = APIRouter(prefix="/api/materials", tags=["materials"])

_materials_cache: List[Material] = []


def load_materials():
    global _materials_cache
    if _materials_cache:
        return

    filepath = os.path.join(os.path.dirname(__file__), "../../data/sample_materials.json")
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            _materials_cache = [Material(**m) for m in data]
    except Exception as e:
        print(f"Error loading materials from {filepath}: {e}")
        _materials_cache = []


@router.get("/", response_model=MaterialListResponse)
async def list_materials(
    category: str = Query(None, description="Filter by category (e.g., masonry, roofing)"),
    q: str = Query(None, description="Text search on name, description, tags"),
):
    load_materials()
    query_materials = _materials_cache

    if category:
        category = category.lower()
        query_materials = [m for m in query_materials if m.category.lower() == category]

    if q:
        q = q.lower()
        filtered = []
        for m in query_materials:
            searchable_text = f"{m.name} {m.description} {m.region} {' '.join(m.tags)}".lower()
            if q in searchable_text:
                filtered.append(m)
        query_materials = filtered

    return MaterialListResponse(
        total=len(query_materials),
        materials=query_materials,
    )
