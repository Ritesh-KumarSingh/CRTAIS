from typing import List, Optional
from pydantic import BaseModel, Field

class MaterialProperties(BaseModel):
    thermal_conductivity: float = Field(..., description="W/mK")
    density: float = Field(..., description="kg/m³")
    specific_heat: float = Field(..., description="J/kgK")

class MaterialSustainability(BaseModel):
    embodied_carbon: float = Field(..., description="kgCO2e/kg")
    local_availability: str = Field(..., description="high, medium, low")
    recyclability: str = Field(..., description="high, medium, low")

class Material(BaseModel):
    material_id: str
    name: str
    category: str
    description: str
    region: str
    properties: MaterialProperties
    sustainability: MaterialSustainability
    tags: List[str]

class MaterialListResponse(BaseModel):
    total: int
    materials: List[Material]
