# Phase 2: Hourly Thermal Model (RC Network)

This phase aims to introduce a simplified building thermal simulation based on a Resistor-Capacitor (1R1C / 3R1C) network logic, allowing architects to visualize indoor temperature variations based on design choices.

## Proposed Changes

### Backend (Python/FastAPI)
- **[NEW] [app/schemas/simulation.py](file:///e:/CRTAIS/backend/app/schemas/simulation.py)**:
  - Define [ThermalSimulationRequest](file:///e:/CRTAIS/frontend/src/lib/api.ts#107-116) containing parameters like thermal resistance ($R$), capacitance ($C$), initial temperature, internal heat gains, sequence of outdoor temperatures ($T_{out}$), and solar gains.
  - Define [ThermalSimulationResponse](file:///e:/CRTAIS/frontend/src/lib/api.ts#117-121) containing the resulting sequence of indoor temperatures.
- **[NEW] [app/services/simulation.py](file:///e:/CRTAIS/backend/app/services/simulation.py)**:
  - Implement the [run_rc_thermal_model(request: ThermalSimulationRequest)](file:///e:/CRTAIS/backend/app/services/simulation.py#5-48) function.
  - This function will use a standard finite-difference solver (explicit Euler) over a 24-hour (or custom length) series.
- **[NEW] [app/routers/simulate.py](file:///e:/CRTAIS/backend/app/routers/simulate.py)**:
  - Create the `POST /api/simulate` endpoint.
- **[MODIFY] [app/main.py](file:///e:/CRTAIS/backend/app/main.py)**:
  - Include the new [simulate](file:///e:/CRTAIS/frontend/src/lib/api.ts#228-240) router in the FastAPI app.

### Frontend (Next.js)
- **[NEW] `src/app/sites/[id]/simulation/page.tsx`**:
  - Create a new sub-page or tab for the site dedicated to Thermal Simulation.
  - A form to adjust Envelope R-value and Thermal Mass C-value.
  - A chart utilizing `recharts` (already installed) to graph $T_{in}$ vs $T_{out}$ over a 24-hour period.
- **[MODIFY] [src/lib/api.ts](file:///e:/CRTAIS/frontend/src/lib/api.ts)**:
  - Add API client wrappers for the thermal simulation endpoint (`simulationApi.simulateThermal`).
- **[MODIFY] `src/app/sites/[id]/page.tsx`**:
  - Add a button/link to seamlessly access the simulation page.

## Verification Plan

### Automated Tests
- Test the new `POST /api/simulate` endpoint via `curl` or FastAPI's auto-generated `/docs` to ensure valid temperature arrays are returned.

### Manual Verification
- Navigate to the Simulation page for a site on `localhost:3000`.
- Manipulate the R and C values using sliders and verify the Recharts visualization updates and renders logically (e.g., higher C should dampen the temperature swing; higher R should increase isolation from $T_{out}$).

---

# Phase 2: Steady Airflow Approximation

This section introduces a steady airflow approximation model to help architects estimate generalized cross-ventilation potentials based on window opening areas and assumed wind speeds.

## Proposed Changes

### Backend (Python/FastAPI)
- **[NEW] [app/schemas/airflow.py](file:///e:/CRTAIS/backend/app/schemas/airflow.py)**:
  - Define [AirflowSimulationRequest](file:///e:/CRTAIS/frontend/src/lib/api.ts#122-129) containing parameters like total inlet area ($A$), wind speed ($v$), discharge coefficient ($C_d$, usually 0.6), and wind incidence angle modifier.
  - Define [AirflowSimulationResponse](file:///e:/CRTAIS/backend/app/schemas/airflow.py#10-13) containing the estimated volumetric airflow rate ($Q$) in $m^3/s$ or Air Changes Per Hour (ACH).
- **[MODIFY] [app/services/simulation.py](file:///e:/CRTAIS/backend/app/services/simulation.py)**:
  - Add [run_steady_airflow_model(request: AirflowSimulationRequest)](file:///e:/CRTAIS/backend/app/services/simulation.py#49-65) calculating $Q = C_d * A * v$.
- **[MODIFY] [app/routers/simulate.py](file:///e:/CRTAIS/backend/app/routers/simulate.py)**:
  - Expose a `POST /api/simulate/airflow` endpoint to interface with the new airflow service.

### Frontend (Next.js)
- **[MODIFY] `src/app/sites/[id]/simulation/page.tsx`**:
  - Extend the Thermal Simulation page by adding a new tab or a second section dedicated to **Airflow & Ventilation**.
  - Add inputs for Inlet Area, Wind Speed (can pull average from site's wind rose data conceptually, or allow manual override).
  - Visualize the resulting Air Changes per Hour (ACH) dynamically based on room volume input.
- **[MODIFY] [src/lib/api.ts](file:///e:/CRTAIS/frontend/src/lib/api.ts)**:
  - Add `simulateAirflow: async (data: AirflowSimulationRequest) => Promise<AirflowSimulationResponse>` in the `simulationApi` object.

## Verification Plan
### Automated Tests
- Test the new `POST /api/simulate/airflow` endpoint to confirm correctly calculated volumetric flows.

### Manual Verification
- Visit the simulation dashboard.
- Adjust the inlet area and observe changes in the resulting Air Changes per Hour metric.

---

# Phase 2: 2D Plan Overlay (SVG)

This feature introduces a visual 2D floor plan overlay to the architecture report using an interactive SVG map, demonstrating spatial layout strategies based on the generated design rules.

## Proposed Changes

### Frontend (Next.js)
- **[NEW] [src/components/visualizations/PlanOverlay.tsx](file:///e:/CRTAIS/frontend/src/components/visualizations/PlanOverlay.tsx)**:
  - Implement a React component that renders an SVG floorplan. 
  - The SVG should graphically depict key elements like the building envelope, primary openings (windows), and internal thermal mass positioning.
  - Adding minimal interactivity, e.g., hover states on walls showing R-value assumptions or arrows indicating cross-ventilation paths.
- **[MODIFY] `src/app/sites/[id]/report/page.tsx`**:
  - Introduce the [PlanOverlay](file:///e:/CRTAIS/frontend/src/components/visualizations/PlanOverlay.tsx#8-102) component in the printable architectural report.
  - Position it prominently to connect the numerical rule recommendations (e.g., orientation, massing) to a visual spatial diagram.

## Verification Plan

### Manual Verification
- Navigate to the Architectural Report page for a site (`/sites/[id]/report`).
- Verify the SVG Plan Overlay renders clearly and fits within the printable area without breaking page breaks or layout constraints.
- Test hover interactions (if applicable) and ensure correct visual scaling on different screen sizes before printing.

---

# Phase 2: Three.js 3D Massing Viewer

This feature introduces a 3D visualization of the proposed building massing to the site dashboard, providing a tangible sense of the architectural volume, orientation, and context. We'll use `@react-three/fiber` and `@react-three/drei` for simple React-based 3D rendering.

## Proposed Changes

### Configuration
- **[NPM Install]**: `npm install three @react-three/fiber @react-three/drei @types/three` in the frontend.

### Frontend (Next.js)
- **[NEW] `src/components/visualizations/MassingViewer.tsx`**:
  - Implement a React-Three-Fiber `Canvas`.
  - Add basic lighting setup (ambient + directional sun based on climate).
  - Create a simplified 3D building mass (e.g., a BoxGeometry for the main volume).
  - Add basic ground plane and axes helper for orientation.
  - Implement basic `OrbitControls` to allow the user to rotate and zoom around the mass.
- **[MODIFY] `src/app/sites/[id]/page.tsx`**:
  - Import and mount the `MassingViewer` component on the site dashboard.
  - Provide it with parameters like `climate_zone` or plot area to conceptually scale or style the massing block.

## Verification Plan

### Manual Verification
- Navigate to a site dashboard (`/sites/[id]`).
- Verify the 3D massing viewer loads correctly.
- Test interaction by dragging to rotate the camera.
- Ensure the viewer responsive unmounts/resizes properly without causing WebGL context leaks.
