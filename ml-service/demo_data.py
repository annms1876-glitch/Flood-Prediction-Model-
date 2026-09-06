"""
Pre-computed realistic flood scenarios for demo.
These are based on real flood patterns from Indian river basins.
"""

SCENARIOS = {
    "normal_day": {
        "name": "Normal Day",
        "description": "Clear weather, stable river levels",
        "icon": "☀️",
        "readings": [
            {"location": "village_a", "water_level_m": 1.2, "rainfall_mm": 0.0, "soil_moisture_percent": 35, "tilt_degrees": 0.2, "temperature_c": 28.5, "humidity_percent": 55},
            {"location": "village_a", "water_level_m": 1.2, "rainfall_mm": 0.0, "soil_moisture_percent": 34, "tilt_degrees": 0.1, "temperature_c": 29.0, "humidity_percent": 52},
            {"location": "village_a", "water_level_m": 1.18, "rainfall_mm": 0.0, "soil_moisture_percent": 33, "tilt_degrees": 0.2, "temperature_c": 29.5, "humidity_percent": 50},
        ],
        "prediction": {
            "risk_score": 12,
            "risk_level": "normal",
            "flood_probability": 0.08,
            "predicted_water_level": 1.25,
            "lead_time_hours": 48,
            "models": {
                "lstm": {"prediction": 10.5, "weight": 0.4},
                "xgboost": {"correction": 1.2, "weight": 0.3},
                "gnn": {"prediction": 15.0, "weight": 0.2},
                "pinn": {"prediction": 11.0, "weight": 0.1}
            },
            "recommendations": ["No action required", "Conditions are normal"]
        }
    },
    
    "light_rain": {
        "name": "Light Rainfall",
        "description": "Moderate rain, water levels rising slowly",
        "icon": "🌦️",
        "readings": [
            {"location": "village_a", "water_level_m": 1.5, "rainfall_mm": 8.2, "soil_moisture_percent": 52, "tilt_degrees": 0.3, "temperature_c": 24.0, "humidity_percent": 72},
            {"location": "village_a", "water_level_m": 1.7, "rainfall_mm": 12.5, "soil_moisture_percent": 58, "tilt_degrees": 0.4, "temperature_c": 23.5, "humidity_percent": 75},
            {"location": "village_a", "water_level_m": 1.9, "rainfall_mm": 15.0, "soil_moisture_percent": 63, "tilt_degrees": 0.5, "temperature_c": 23.0, "humidity_percent": 78},
        ],
        "prediction": {
            "risk_score": 35,
            "risk_level": "watch",
            "flood_probability": 0.28,
            "predicted_water_level": 2.2,
            "lead_time_hours": 24,
            "models": {
                "lstm": {"prediction": 32.0, "weight": 0.4},
                "xgboost": {"correction": 3.5, "weight": 0.3},
                "gnn": {"prediction": 38.0, "weight": 0.2},
                "pinn": {"prediction": 30.0, "weight": 0.1}
            },
            "recommendations": ["Continue monitoring", "Check sensor readings regularly"]
        }
    },
    
    "heavy_rain": {
        "name": "Heavy Rainfall Warning",
        "description": "Intense rain, river levels rising fast",
        "icon": "🌧️",
        "readings": [
            {"location": "village_a", "water_level_m": 2.8, "rainfall_mm": 35.0, "soil_moisture_percent": 78, "tilt_degrees": 0.8, "temperature_c": 21.0, "humidity_percent": 88},
            {"location": "village_a", "water_level_m": 3.4, "rainfall_mm": 45.0, "soil_moisture_percent": 84, "tilt_degrees": 1.2, "temperature_c": 20.5, "humidity_percent": 90},
            {"location": "village_a", "water_level_m": 4.1, "rainfall_mm": 52.0, "soil_moisture_percent": 89, "tilt_degrees": 1.8, "temperature_c": 20.0, "humidity_percent": 92},
        ],
        "prediction": {
            "risk_score": 68,
            "risk_level": "high",
            "flood_probability": 0.72,
            "predicted_water_level": 5.2,
            "lead_time_hours": 6,
            "models": {
                "lstm": {"prediction": 65.0, "weight": 0.4},
                "xgboost": {"correction": 4.2, "weight": 0.3},
                "gnn": {"prediction": 72.0, "weight": 0.2},
                "pinn": {"prediction": 62.0, "weight": 0.1}
            },
            "recommendations": [
                "Alert authorities immediately",
                "Prepare evacuation plans",
                "Notify residents about potential flooding"
            ]
        }
    },
    
    "flood_critical": {
        "name": "Critical Flood Alert",
        "description": "Dangerous levels, immediate evacuation needed",
        "icon": "🚨",
        "readings": [
            {"location": "village_a", "water_level_m": 5.5, "rainfall_mm": 85.0, "soil_moisture_percent": 95, "tilt_degrees": 2.5, "temperature_c": 18.0, "humidity_percent": 96},
            {"location": "village_a", "water_level_m": 7.2, "rainfall_mm": 120.0, "soil_moisture_percent": 98, "tilt_degrees": 3.8, "temperature_c": 17.5, "humidity_percent": 97},
            {"location": "village_a", "water_level_m": 8.8, "rainfall_mm": 145.0, "soil_moisture_percent": 99, "tilt_degrees": 5.2, "temperature_c": 17.0, "humidity_percent": 98},
        ],
        "prediction": {
            "risk_score": 92,
            "risk_level": "critical",
            "flood_probability": 0.95,
            "predicted_water_level": 12.5,
            "lead_time_hours": 2,
            "models": {
                "lstm": {"prediction": 88.0, "weight": 0.4},
                "xgboost": {"correction": 5.5, "weight": 0.3},
                "gnn": {"prediction": 95.0, "weight": 0.2},
                "pinn": {"prediction": 85.0, "weight": 0.1}
            },
            "recommendations": [
                "IMMEDIATE EVACUATION RECOMMENDED",
                "CRITICAL FLOOD RISK - Send emergency alerts",
                "Deploy emergency response team",
                "Send urgent notifications to all residents"
            ]
        }
    },
    
    "hilly_region": {
        "name": "Hilly Region Landslide Risk",
        "description": "Steep terrain, high tilt sensor readings",
        "icon": "⛰️",
        "readings": [
            {"location": "hill_station_1", "water_level_m": 2.1, "rainfall_mm": 42.0, "soil_moisture_percent": 82, "tilt_degrees": 3.5, "temperature_c": 19.0, "humidity_percent": 85},
            {"location": "hill_station_1", "water_level_m": 2.8, "rainfall_mm": 58.0, "soil_moisture_percent": 88, "tilt_degrees": 5.2, "temperature_c": 18.5, "humidity_percent": 88},
            {"location": "hill_station_1", "water_level_m": 3.5, "rainfall_mm": 72.0, "soil_moisture_percent": 92, "tilt_degrees": 7.8, "temperature_c": 18.0, "humidity_percent": 90},
        ],
        "prediction": {
            "risk_score": 78,
            "risk_level": "high",
            "flood_probability": 0.82,
            "predicted_water_level": 4.8,
            "lead_time_hours": 4,
            "models": {
                "lstm": {"prediction": 72.0, "weight": 0.4},
                "xgboost": {"correction": 6.5, "weight": 0.3},
                "gnn": {"prediction": 85.0, "weight": 0.2},
                "pinn": {"prediction": 70.0, "weight": 0.1}
            },
            "recommendations": [
                "HIGH landslide risk detected",
                "Evacuate downhill villages",
                "Block access to steep terrain areas",
                "Deploy emergency response to hilly areas"
            ]
        }
    },
    
    "multi_village": {
        "name": "Multi-Village Flood Scenario",
        "description": "Flood affecting multiple downstream villages",
        "icon": "🏘️",
        "readings": [
            {"location": "village_upstream", "water_level_m": 4.5, "rainfall_mm": 65.0, "soil_moisture_percent": 85, "tilt_degrees": 1.5, "temperature_c": 20.0, "humidity_percent": 88},
            {"location": "village_midstream", "water_level_m": 3.8, "rainfall_mm": 45.0, "soil_moisture_percent": 78, "tilt_degrees": 1.2, "temperature_c": 20.5, "humidity_percent": 85},
            {"location": "village_downstream", "water_level_m": 2.9, "rainfall_mm": 30.0, "soil_moisture_percent": 72, "tilt_degrees": 0.8, "temperature_c": 21.0, "humidity_percent": 82},
        ],
        "prediction": {
            "risk_score": 71,
            "risk_level": "high",
            "flood_probability": 0.75,
            "predicted_water_level": 5.5,
            "lead_time_hours": 8,
            "models": {
                "lstm": {"prediction": 68.0, "weight": 0.4},
                "xgboost": {"correction": 4.8, "weight": 0.3},
                "gnn": {"prediction": 78.0, "weight": 0.2},
                "pinn": {"prediction": 65.0, "weight": 0.1}
            },
            "recommendations": [
                "Flood wave detected moving downstream",
                "Alert village_downstream immediately",
                "Prepare evacuation for midstream areas",
                "Coordinate emergency response across all villages"
            ]
        }
    }
}


def get_scenario(scenario_name: str) -> dict:
    return SCENARIOS.get(scenario_name, SCENARIOS["normal_day"])


def get_all_scenarios() -> list:
    return [
        {"key": k, "name": v["name"], "description": v["description"], "icon": v["icon"]}
        for k, v in SCENARIOS.items()
    ]


def get_demo_prediction(scenario_name: str) -> dict:
    scenario = get_scenario(scenario_name)
    return {
        "location": scenario["readings"][-1]["location"],
        "scenario": scenario["name"],
        "description": scenario["description"],
        "icon": scenario["icon"],
        **scenario["prediction"],
        "model_version": "demo_v1.0"
    }
