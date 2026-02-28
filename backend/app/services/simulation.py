from typing import List, Tuple
from app.schemas.simulation import ThermalSimulationRequest, ThermalSimulationResponse
from app.schemas.airflow import AirflowSimulationRequest, AirflowSimulationResponse

def run_rc_thermal_model(request: ThermalSimulationRequest) -> ThermalSimulationResponse:
    """
    Runs a simplified 1R1C explicit Euler thermal network model.
    1R1C treats the entire building envelope as a single resistance (R) and the internal mass as a single capacitance (C).
    
    dT_in / dt = (1 / C) * ( (T_out - T_in) / R + Q_internal + Q_solar )
    """
    dt = request.time_step
    R = request.r_val
    C = request.c_val
    
    t_in = request.t_in_initial
    t_out_series = request.t_out_series
    q_int = request.internal_gain
    
    # If solar gains not provided, treat as 0
    solar_gains = request.solar_gain_series if request.solar_gain_series else [0.0] * len(t_out_series)
    
    if len(solar_gains) != len(t_out_series):
        solar_gains = [0.0] * len(t_out_series) # Fallback mapping 

    t_in_series: List[float] = []
    heat_flow_series: List[float] = []
    
    # Explicit Euler integration
    for i, t_out in enumerate(t_out_series):
        t_in_series.append(t_in)
        
        # Heat transfer rate through envelope (W/m^2)
        q_env = (t_out - t_in) / R
        
        # Total heat rate into air node
        q_total = q_env + q_int + solar_gains[i]
        heat_flow_series.append(q_env) # Tracking just envelope heat flow for visualization
        
        # Update Temperature
        dt_in = (q_total / C) * dt
        t_in += dt_in

    return ThermalSimulationResponse(
        t_in_series=[round(t, 4) for t in t_in_series],
        heat_flow_series=[round(q, 4) for q in heat_flow_series]
    )

def run_steady_airflow_model(request: AirflowSimulationRequest) -> AirflowSimulationResponse:
    """
    Calculates steady state volumetric airflow rate and ACH based on window/inlet area and wind speed.
    Formula: Q = C_d * A * v * mod
    where C_d is discharge coefficient, A is area, v is wind speed, mod is angle modifier.
    """
    q_m3s = request.discharge_coef * request.inlet_area_sqm * request.wind_speed_ms * request.wind_angle_modifier
    
    # Air changes per hour (ACH) = (Volumetric Flow Rate (m^3/h)) / Volume (m^3)
    q_m3h = q_m3s * 3600
    ach = q_m3h / request.room_volume_m3
    
    return AirflowSimulationResponse(
        flow_rate_m3s=round(q_m3s, 4),
        ach=round(ach, 2)
    )

