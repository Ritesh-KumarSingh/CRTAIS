from fastapi import APIRouter
from app.schemas.simulation import ThermalSimulationRequest, ThermalSimulationResponse
from app.schemas.airflow import AirflowSimulationRequest, AirflowSimulationResponse
from app.services.simulation import run_rc_thermal_model, run_steady_airflow_model

router = APIRouter(prefix="/api/simulate", tags=["simulation"])

@router.post("/thermal/", response_model=ThermalSimulationResponse)
async def simulate_thermal(request: ThermalSimulationRequest):
    """
    Run the hourly thermal simulation based on envelope R-value, C-value, and weather parameters.
    """
    return run_rc_thermal_model(request)

@router.post("/airflow/", response_model=AirflowSimulationResponse)
async def simulate_airflow(request: AirflowSimulationRequest):
    """
    Run the steady airflow and ACH calculation based on inlet area and wind speed.
    """
    return run_steady_airflow_model(request)

