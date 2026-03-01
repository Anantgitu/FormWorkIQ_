from pydantic import BaseModel
from typing import List, Optional

class Dimensions(BaseModel):
    width: float   # meters (perimeter side for a column)
    height: float  # meters (wall/column height)

class TaskItem(BaseModel):
    element_id: str
    element_type: str = "Column"  # Column | Wall | Slab
    location: str = "Unknown"
    shape: str = "Rectangle"
    dimensions: Dimensions
    pour_date: str      # ISO date string YYYY-MM-DD
    cure_days: int = 3  # days until panels are free

class ProjectInput(BaseModel):
    project_id: str
    project_name: Optional[str] = "Unnamed Project"
    tasks: List[TaskItem]

# --- Output models ---

class PanelUsage(BaseModel):
    panel_type: str
    count: int
    area_sqm: float

class KitItem(BaseModel):
    element_id: str
    location: str
    panels: List[PanelUsage]
    source: str  # "REUSE" | "NEW_ORDER"

class DailyKit(BaseModel):
    date: str
    kits: List[KitItem]

class BoQEntry(BaseModel):
    panel_type: str
    baseline_count: int
    optimized_count: int
    unit_cost_inr: float
    savings_inr: float

class OptimizationResult(BaseModel):
    project_id: str
    total_elements: int
    baseline_panels_ordered: int
    optimized_panels_ordered: int
    panels_saved: int
    savings_percentage: float
    total_cost_savings_inr: float
    utilization_rate: float
    boq: List[BoQEntry]
    daily_kits: List[DailyKit]
    reuse_links: List[dict]
