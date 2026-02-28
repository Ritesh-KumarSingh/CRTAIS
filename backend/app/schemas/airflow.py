from pydantic import BaseModel, Field

class AirflowSimulationRequest(BaseModel):
    inlet_area_sqm: float = Field(..., description="Total effective inlet window area in square meters")
    wind_speed_ms: float = Field(..., description="Average wind speed in m/s")
    discharge_coef: float = Field(0.6, description="Discharge coefficient (typically 0.6 for standard windows)")
    wind_angle_modifier: float = Field(1.0, description="Wind incidence angle modifier (1.0 = direct perpendicular wind)")
    room_volume_m3: float = Field(..., description="Total volume of the room/space in cubic meters")

class AirflowSimulationResponse(BaseModel):
    flow_rate_m3s: float = Field(..., description="Volumetric flow rate in m^3/s")
    ach: float = Field(..., description="Air Changes Per Hour (ACH)")
