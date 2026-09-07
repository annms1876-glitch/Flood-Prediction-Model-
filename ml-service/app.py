import os
import sys
import time
import logging
from typing import List, Optional, Dict
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

predictor = None
data_processor = None
ensemble = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global predictor, data_processor, ensemble

    logger.info("Initializing ML service...")
    pretrained_dir = str(Path(__file__).parent / "pretrained")

    try:
        from services.predictor import FloodPredictor
        predictor = FloodPredictor(pretrained_dir)
        logger.info("Predictor loaded: LSTM, XGBoost, GNN, PINN")
    except Exception as e:
        logger.warning(f"Predictor init failed: {e}")

    try:
        from services.data_processor import SensorDataProcessor
        data_processor = SensorDataProcessor()
    except Exception as e:
        logger.warning(f"DataProcessor init failed: {e}")

    try:
        from models.ensemble import EnsembleAggregator
        ensemble = EnsembleAggregator()
    except Exception as e:
        logger.warning(f"Ensemble init failed: {e}")

    logger.info("ML service ready")
    yield
    logger.info("ML service shutting down")


app = FastAPI(
    title="Umeed AI ML Service",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SensorReading(BaseModel):
    location: str
    timestamp: Optional[str] = None
    water_level_m: Optional[float] = None
    rainfall_mm: Optional[float] = None
    soil_moisture_percent: Optional[float] = None
    tilt_degrees: Optional[float] = None
    temperature_c: Optional[float] = None
    humidity_percent: Optional[float] = None


class PredictionRequest(BaseModel):
    location: str
    readings: List[SensorReading]
    prev_water_level: Optional[float] = 0.0


@app.get("/")
async def root():
    return {"service": "Umeed AI ML", "status": "running", "version": "2.0.0"}


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "predictor_loaded": predictor is not None,
        "version": "2.0.0",
        "timestamp": time.time()
    }


@app.get("/model/info")
async def model_info():
    return {
        "model_version": "ensemble_v2.0",
        "models": ["lstm", "xgboost", "gnn", "pinn"],
        "formula": "LSTM*0.4 + XGBoost*0.3 + GNN*0.2 + PINN*0.1"
    }


@app.post("/predict")
async def predict(request: PredictionRequest):
    if predictor is None:
        raise HTTPException(status_code=503, detail="ML model not loaded")

    try:
        readings_dicts = [r.model_dump() for r in request.readings]

        if data_processor:
            for reading in readings_dicts:
                data_processor.add_reading(reading)
            data_processor.compute_deltas(request.location)
            enriched = data_processor.get_location_buffer(request.location)
            if enriched:
                readings_dicts = enriched

        result = predictor.predict(
            readings_dicts,
            prev_water_level=request.prev_water_level
        )
        return {"location": request.location, **result}

    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/rule-based")
async def predict_rule_based(request: PredictionRequest):
    if not request.readings:
        raise HTTPException(status_code=400, detail="No readings provided")

    latest = request.readings[-1]
    water_score = min((latest.water_level_m or 0) / 5.0 * 40, 40)
    rain_score = min((latest.rainfall_mm or 0) / 50.0 * 30, 30)
    soil_score = min((latest.soil_moisture_percent or 0) / 100.0 * 20, 20)
    tilt_score = min((latest.tilt_degrees or 0) / 15.0 * 10, 10)
    total_score = min(max(water_score + rain_score + soil_score + tilt_score, 0), 100)

    risk_level = "normal"
    if total_score >= 80: risk_level = "critical"
    elif total_score >= 60: risk_level = "high"
    elif total_score >= 40: risk_level = "warning"
    elif total_score >= 20: risk_level = "watch"

    return {
        "location": request.location,
        "risk_score": round(total_score, 2),
        "risk_level": risk_level,
        "flood_probability": round(total_score / 100.0, 3),
        "model_version": "rule_based_v1.0"
    }


@app.get("/demo/scenarios")
async def demo_scenarios():
    try:
        from demo_data import get_all_scenarios
        return {"scenarios": get_all_scenarios()}
    except Exception as e:
        return {"scenarios": [], "error": str(e)}


@app.get("/demo/predict/{scenario_name}")
async def demo_predict(scenario_name: str):
    try:
        from demo_data import SCENARIOS, get_scenario, get_demo_prediction
    except Exception as e:
        return {"error": str(e)}

    if scenario_name not in SCENARIOS:
        raise HTTPException(status_code=404, detail=f"Scenario '{scenario_name}' not found")

    scenario = get_scenario(scenario_name)
    demo_pred = get_demo_prediction(scenario_name)

    ml_result = None
    if predictor and data_processor:
        try:
            readings_dicts = scenario["readings"]
            for reading in readings_dicts:
                data_processor.add_reading(reading)
            data_processor.compute_deltas(readings_dicts[-1]["location"])
            enriched = data_processor.get_location_buffer(readings_dicts[-1]["location"])
            ml_result = predictor.predict(enriched if enriched else readings_dicts)
        except Exception as e:
            logger.warning(f"ML prediction failed: {e}")

    return {
        "scenario": scenario["name"],
        "description": scenario["description"],
        "ml_prediction": ml_result,
        "demo_prediction": demo_pred,
        "model_version": "demo_v1.0"
    }


@app.post("/demo/run-all")
async def demo_run_all():
    try:
        from demo_data import SCENARIOS, get_demo_prediction
    except Exception as e:
        return {"error": str(e)}

    results = []
    for key in SCENARIOS.keys():
        results.append({"key": key, **get_demo_prediction(key)})
    return {"scenarios": results}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
