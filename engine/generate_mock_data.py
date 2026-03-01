import json
import random
from datetime import datetime, timedelta

def generate_lnt_mock_data(total_elements=550):
    start_date = datetime(2026, 4, 1)
    
    data = {
        "project_id": "LNT-TOWER-OMEGA",
        "project_name": "Omega Mega-Structure - 10 Floors",
        "formwork_catalog": [
            {"panel_id": "P-2x1", "width_m": 1.0, "height_m": 2.0, "cost_per_use_inr": 500, "max_reuses": 100},
            {"panel_id": "P-1x1", "width_m": 1.0, "height_m": 1.0, "cost_per_use_inr": 300, "max_reuses": 100},
            {"panel_id": "P-0.5x1", "width_m": 0.5, "height_m": 1.0, "cost_per_use_inr": 180, "max_reuses": 100},
            {"panel_id": "P-0.3x1", "width_m": 0.3, "height_m": 1.0, "cost_per_use_inr": 120, "max_reuses": 100}
        ],
        "project_demand": []
    }

    elements_per_floor = total_elements // 10
    
    for i in range(1, total_elements + 1):
        # Calculate which floor we are on (1 to 10)
        current_floor = ((i - 1) // elements_per_floor) + 1
        
        # Advance the date based on the floor (each floor takes approx 15 days to build)
        days_offset = (current_floor - 1) * 15 + random.randint(0, 5)
        pour_date = start_date + timedelta(days=days_offset)
        
        # Randomize element types (Columns, Walls, Slabs)
        element_types = ["Column", "Wall", "Core-Wall"]
        e_type = random.choices(element_types, weights=[60, 30, 10])[0]
        
        # Randomize dimensions based on type, mimicking real-world shrinking as floors go up
        width_reduction = (current_floor * 0.05) # Columns get slightly smaller on higher floors
        
        if e_type == "Column":
            width = round(random.uniform(0.8, 1.5) - width_reduction, 2)
            height = 3.0
            cure_days = random.choice([2, 3])
        elif e_type == "Wall":
            width = round(random.uniform(3.0, 8.0), 2)
            height = 3.0
            cure_days = random.choice([3, 4])
        else: # Core-Wall
            width = round(random.uniform(5.0, 12.0), 2)
            height = 3.0
            cure_days = 5
            
        # Ensure dimensions don't drop below a physical minimum
        width = max(0.5, width)
        
        area = round(width * height, 2)
        
        # Create the element record matching the optimizer's expected schema
        element = {
            "element_id": f"{e_type[:3].upper()}-F{current_floor}-Z{random.randint(1,4)}-{str(i).zfill(3)}",
            "element_type": e_type.replace("Core-Wall", "Wall"),  # map to known types
            "location": f"Floor_{current_floor}_Zone_{random.randint(1,4)}",
            "shape": "Rectangle",
            "dimensions": {"width": width, "height": height},
            "pour_date": pour_date.strftime("%Y-%m-%d"),
            "cure_days": cure_days
        }
        
        data["project_demand"].append(element)

    # Build the tasks list in the format the FastAPI engine expects
    output = {
        "project_id": data["project_id"],
        "project_name": data["project_name"],
        "tasks": data["project_demand"]
    }

    output_path = "mock_data.json"
    with open(output_path, "w") as outfile:
        json.dump(output, outfile, indent=2)
        
    print(f"✅ Successfully generated {output_path} with {total_elements} structural elements!")
    print(f"   Floors: 10  |  Elements per floor: {elements_per_floor}")

# Run the generator
if __name__ == "__main__":
    generate_lnt_mock_data(550)
