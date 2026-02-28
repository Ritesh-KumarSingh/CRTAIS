from typing import List
from pydantic import BaseModel, Field

class ThermalSimulationRequest(BaseModel):
    r_val: float = Field(..., description="Thermal resistance (K*m^2/W)")
    c_val: float = Field(..., description="Thermal capacitance (J/K*m^2)")
    t_in_initial: float = Field(20.0, description="Initial indoor temperature (C)")
    t_out_series: List[float] = Field(..., description="24-hour sequence of outdoor temperatures")
    internal_gain: float = Field(0.0, description="Constant internal heat gain (W/m^2)")
    solar_gain_series: List[float] = Field(default_factory=list, description="Optional 24-hr solar gain (W/m^2)")
    time_step: float = Field(3600.0, description="Time step in seconds (default 1 hr)")

class ThermalSimulationResponse(BaseModel):
    t_in_series: List[float] = Field(..., description="24-hour sequence of indoor temperatures")
    heat_flow_series: List[float] = Field(..., description="24-hour sequence of heat flow rates (W/m^2)")
