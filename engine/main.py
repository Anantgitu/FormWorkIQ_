"""
FastAPI Entry Point — Formwork Optimization Engine
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import ProjectInput, OptimizationResult
from optimizer import optimize

app = FastAPI(
    title="Formwork Optimization Engine",
    description="Algorithmic engine for formwork kitting, BoQ optimization, and repetition planning",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok", "engine": "Formwork Optimizer v1.0"}


@app.post("/optimize", response_model=OptimizationResult)
def run_optimization(project: ProjectInput):
    """
    Main optimization endpoint.
    Accepts project demand data and returns:
    - Optimized BoQ with cost savings
    - Daily kitting instructions
    - Reuse links showing which panels were recycled
    """
    try:
        result = optimize(project)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")


@app.get("/catalog")
def get_panel_catalog():
    """Returns the standard formwork panel catalog"""
    from optimizer import PANEL_CATALOG
    return {"panels": PANEL_CATALOG}
