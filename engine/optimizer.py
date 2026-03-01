"""
Formwork Optimization Engine
Core algorithmic logic:
1. Parse project demand data
2. 2D Bin Packing: find optimal panel combinations per element
3. Repetition Matcher: reuse panels from completed pours
4. BoQ Generator: baseline vs optimized comparison
5. Kitting List Generator: daily picking lists
"""

import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict
from collections import defaultdict
import copy

from models import ProjectInput, TaskItem, OptimizationResult, BoQEntry, DailyKit, KitItem, PanelUsage

# ─────────────────────────────────────────────
# FORMWORK PANEL CATALOG (Standard Industry Types)
# ─────────────────────────────────────────────
PANEL_CATALOG = [
    {"panel_type": "P-2x1",   "width_m": 1.0, "height_m": 2.0, "area_sqm": 2.0,  "cost_per_unit_inr": 2500, "max_reuses": 50},
    {"panel_type": "P-1x1",   "width_m": 1.0, "height_m": 1.0, "area_sqm": 1.0,  "cost_per_unit_inr": 1300, "max_reuses": 50},
    {"panel_type": "P-0.5x1", "width_m": 0.5, "height_m": 1.0, "area_sqm": 0.5,  "cost_per_unit_inr": 750,  "max_reuses": 50},
    {"panel_type": "P-0.3x1", "width_m": 0.3, "height_m": 1.0, "area_sqm": 0.3,  "cost_per_unit_inr": 500,  "max_reuses": 50},
]

CLEAN_MOVE_DAYS = 1  # Days needed to clean + move panels after deshuttering


def calculate_required_area(task: TaskItem) -> float:
    """
    For a rectangular column/wall, calculate the total formwork surface area needed.
    Column: 2 * (width + depth) * height  → simplified: 4 * width * height (square column)
    Wall: 2 * length * height
    """
    w = task.dimensions.width
    h = task.dimensions.height
    if task.element_type.lower() in ["column"]:
        # 4 sides of a square column
        return round(4 * w * h, 2)
    elif task.element_type.lower() in ["wall"]:
        # 2 faces of a wall (depth assumed = 0.2m, negligible for panel calc)
        return round(2 * w * h, 2)
    else:
        # Slab: just width * height (plan area)
        return round(w * h, 2)


def bin_pack_panels(required_area: float) -> List[dict]:
    """
    2D Bin Packing: Greedily fill required area using largest panels first.
    Returns list of {panel_type, count, area_sqm} used.
    """
    remaining = required_area
    usage = []
    # Sort panels largest to smallest for greedy approach
    sorted_panels = sorted(PANEL_CATALOG, key=lambda p: p["area_sqm"], reverse=True)

    for panel in sorted_panels:
        if remaining <= 0:
            break
        count = int(remaining // panel["area_sqm"])
        if count > 0:
            usage.append({
                "panel_type": panel["panel_type"],
                "count": count,
                "area_sqm": round(count * panel["area_sqm"], 2),
                "cost_per_unit_inr": panel["cost_per_unit_inr"]
            })
            remaining -= count * panel["area_sqm"]

    # Handle small filler remainder (< 0.3 sqm = cheap plywood filler)
    if remaining > 0.01:
        usage.append({
            "panel_type": "FILLER",
            "count": 1,
            "area_sqm": round(remaining, 2),
            "cost_per_unit_inr": 200
        })

    return usage


def parse_date(date_str: str) -> datetime:
    return datetime.strptime(date_str, "%Y-%m-%d")


def optimize(project: ProjectInput) -> OptimizationResult:
    """
    Main optimization engine:
    1. Chronologically sort all pours
    2. For each pour, check if panels from earlier (now freed) pours can be reused
    3. Use bin packing to calculate exact panel needs
    4. Compute BoQ savings
    5. Generate daily kitting lists
    """
    tasks = project.tasks

    # STEP 1: Build timeline DataFrame
    records = []
    for t in tasks:
        pour_dt = parse_date(t.pour_date)
        deshutter_dt = pour_dt + timedelta(days=t.cure_days)
        available_dt = deshutter_dt + timedelta(days=CLEAN_MOVE_DAYS)
        required_area = calculate_required_area(t)
        panels_needed = bin_pack_panels(required_area)

        records.append({
            "element_id": t.element_id,
            "element_type": t.element_type,
            "location": t.location,
            "pour_date": pour_dt,
            "deshutter_date": deshutter_dt,
            "available_date": available_dt,
            "required_area": required_area,
            "panels_needed": panels_needed,
            "panels_source": "NEW_ORDER",  # default
            "reused_from": None
        })

    # Sort by pour date
    records.sort(key=lambda r: r["pour_date"])

    # STEP 2: Repetition Matcher
    # Track "freed panel pools" — panels available for reuse at a given date
    # Pool format: [{available_date, panel_type, count, source_element_id}]
    freed_pool: List[dict] = []
    reuse_links = []

    for i, rec in enumerate(records):
        # Collect all panels freed before this pour date
        available_now = [p for p in freed_pool if p["available_date"] <= rec["pour_date"]]

        # Build a reuse pool: {panel_type -> total_available_count}
        reuse_pool = defaultdict(int)
        reuse_sources = defaultdict(list)
        for fp in available_now:
            reuse_pool[fp["panel_type"]] += fp["count"]
            reuse_sources[fp["panel_type"]].append(fp["source_element_id"])

        # Try to satisfy panels_needed from reuse_pool first
        new_panels = []
        reused_panels = []
        fully_reused = True

        for pn in rec["panels_needed"]:
            pt = pn["panel_type"]
            need = pn["count"]

            if pt == "FILLER":
                new_panels.append(pn)
                continue

            reuse_avail = reuse_pool.get(pt, 0)
            if reuse_avail >= need:
                # Fully reuse
                reuse_pool[pt] -= need
                reused_panels.append({
                    "panel_type": pt,
                    "count": need,
                    "area_sqm": pn["area_sqm"],
                    "cost_per_unit_inr": 0  # No cost! Reuse
                })
                reuse_links.append({
                    "from_elements": reuse_sources[pt][:3],
                    "to_element": rec["element_id"],
                    "panel_type": pt,
                    "count": need,
                    "pour_date": rec["pour_date"].strftime("%Y-%m-%d")
                })
                # Remove used from pool tracking
                for fp in freed_pool:
                    if fp["panel_type"] == pt and fp["available_date"] <= rec["pour_date"]:
                        consume = min(fp["count"], need)
                        fp["count"] -= consume
                        need -= consume
                        if need == 0:
                            break
            elif reuse_avail > 0:
                # Partial reuse
                reused_panels.append({
                    "panel_type": pt,
                    "count": reuse_avail,
                    "area_sqm": round(reuse_avail * (pn["area_sqm"] / pn["count"]), 2),
                    "cost_per_unit_inr": 0
                })
                shortfall = need - reuse_avail
                new_panels.append({
                    "panel_type": pt,
                    "count": shortfall,
                    "area_sqm": round(shortfall * (pn["area_sqm"] / pn["count"]), 2),
                    "cost_per_unit_inr": pn["cost_per_unit_inr"]
                })
                reuse_pool[pt] = 0
                fully_reused = False
            else:
                fully_reused = False
                new_panels.append(pn)

        # Update record source
        if len(reused_panels) > 0 and len(new_panels) == 0:
            rec["panels_source"] = "REUSE"
        elif len(reused_panels) > 0:
            rec["panels_source"] = "PARTIAL_REUSE"

        # After this element is poured, its panels become free at available_date
        for pn in rec["panels_needed"]:
            if pn["panel_type"] != "FILLER":
                freed_pool.append({
                    "panel_type": pn["panel_type"],
                    "count": pn["count"],
                    "available_date": rec["available_date"],
                    "source_element_id": rec["element_id"]
                })

        rec["new_panels"] = new_panels
        rec["reused_panels"] = reused_panels

    # ─────────────────────────────────────────
    # STEP 3: BoQ Calculation
    # ─────────────────────────────────────────
    # Baseline: sum ALL panel needs without reuse
    baseline_by_type: Dict[str, int] = defaultdict(int)
    optimized_by_type: Dict[str, int] = defaultdict(int)

    for rec in records:
        for pn in rec["panels_needed"]:
            baseline_by_type[pn["panel_type"]] += pn["count"]
        for pn in rec.get("new_panels", rec["panels_needed"]):
            optimized_by_type[pn["panel_type"]] += pn["count"]

    boq_entries = []
    total_baseline = 0
    total_optimized = 0
    total_savings_inr = 0

    for panel in PANEL_CATALOG:
        pt = panel["panel_type"]
        base_count = baseline_by_type.get(pt, 0)
        opt_count = optimized_by_type.get(pt, 0)
        savings = (base_count - opt_count) * panel["cost_per_unit_inr"]
        boq_entries.append(BoQEntry(
            panel_type=pt,
            baseline_count=base_count,
            optimized_count=opt_count,
            unit_cost_inr=panel["cost_per_unit_inr"],
            savings_inr=max(0, savings)
        ))
        total_baseline += base_count
        total_optimized += opt_count
        total_savings_inr += max(0, savings)

    panels_saved = total_baseline - total_optimized
    savings_pct = round((panels_saved / total_baseline * 100) if total_baseline > 0 else 0, 1)
    utilization = round((total_baseline / (total_optimized + 1)) * 100, 1) if total_optimized > 0 else 100.0
    utilization = min(utilization, 100.0)

    # ─────────────────────────────────────────
    # STEP 4: Daily Kitting Lists
    # ─────────────────────────────────────────
    daily_kits_dict: Dict[str, List[KitItem]] = defaultdict(list)

    for rec in records:
        date_str = rec["pour_date"].strftime("%Y-%m-%d")
        all_panels = rec.get("new_panels", []) + rec.get("reused_panels", [])
        kit_panels = [
            PanelUsage(panel_type=p["panel_type"], count=p["count"], area_sqm=p["area_sqm"])
            for p in all_panels if p["count"] > 0
        ]
        kit = KitItem(
            element_id=rec["element_id"],
            location=rec["location"],
            panels=kit_panels,
            source=rec["panels_source"]
        )
        daily_kits_dict[date_str].append(kit)

    daily_kits = [
        DailyKit(date=date_str, kits=kits)
        for date_str, kits in sorted(daily_kits_dict.items())
    ]

    return OptimizationResult(
        project_id=project.project_id,
        total_elements=len(tasks),
        baseline_panels_ordered=total_baseline,
        optimized_panels_ordered=total_optimized,
        panels_saved=panels_saved,
        savings_percentage=savings_pct,
        total_cost_savings_inr=round(total_savings_inr, 2),
        utilization_rate=utilization,
        boq=boq_entries,
        daily_kits=daily_kits,
        reuse_links=reuse_links
    )
