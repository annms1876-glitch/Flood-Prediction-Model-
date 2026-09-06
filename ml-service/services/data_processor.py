from typing import Dict, List, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class SensorDataProcessor:
    """
    Process raw sensor data for ML model input.
    
    Handles:
    - Data validation and cleaning
    - Feature engineering (deltas, rolling stats)
    - Time window management
    """
    
    SENSOR_FIELDS = [
        "water_level_m",
        "rainfall_mm",
        "soil_moisture_percent",
        "tilt_degrees",
        "temperature_c",
        "humidity_percent"
    ]
    
    def __init__(self):
        self.reading_buffer: Dict[str, List[Dict]] = {}
        self.max_buffer_size = 50
    
    def add_reading(self, reading: Dict) -> None:
        """
        Add a sensor reading to the buffer.
        
        Args:
            reading: Dictionary with sensor data
        """
        location = reading.get("location", "default")
        
        if location not in self.reading_buffer:
            self.reading_buffer[location] = []
        
        processed = self._validate_and_clean(reading)
        self.reading_buffer[location].append(processed)
        
        if len(self.reading_buffer[location]) > self.max_buffer_size:
            self.reading_buffer[location] = self.reading_buffer[location][-self.max_buffer_size:]
    
    def get readings_for_location(self, location: str, count: int = 15) -> List[Dict]:
        """Get recent readings for a location."""
        readings = self.reading_buffer.get(location, [])
        return readings[-count:] if readings else []
    
    def get_location_buffer(self, location: str) -> List[Dict]:
        """Get full buffer for a location."""
        return self.reading_buffer.get(location, [])
    
    def _validate_and_clean(self, reading: Dict) -> Dict:
        """Validate and clean a sensor reading."""
        cleaned = {}
        
        cleaned["location"] = reading.get("location", "unknown")
        cleaned["timestamp"] = reading.get("timestamp", datetime.utcnow().isoformat())
        
        for field in self.SENSOR_FIELDS:
            value = reading.get(field) or reading.get("readings", {}).get(field)
            
            if value is None:
                cleaned[field] = self._get_default_value(field)
            else:
                try:
                    cleaned[field] = float(value)
                except (ValueError, TypeError):
                    cleaned[field] = self._get_default_value(field)
        
        cleaned["water_level_delta"] = 0.0
        cleaned["rainfall_delta"] = 0.0
        
        return cleaned
    
    def _get_default_value(self, field: str) -> float:
        """Get default value for a sensor field."""
        defaults = {
            "water_level_m": 0.5,
            "rainfall_mm": 0.0,
            "soil_moisture_percent": 30.0,
            "tilt_degrees": 0.0,
            "temperature_c": 25.0,
            "humidity_percent": 50.0
        }
        return defaults.get(field, 0.0)
    
    def compute_deltas(self, location: str) -> None:
        """Compute deltas between consecutive readings."""
        readings = self.reading_buffer.get(location, [])
        
        if len(readings) < 2:
            return
        
        for i in range(1, len(readings)):
            readings[i]["water_level_delta"] = (
                readings[i]["water_level_m"] - readings[i-1]["water_level_m"]
            )
            readings[i]["rainfall_delta"] = (
                readings[i]["rainfall_mm"] - readings[i-1]["rainfall_mm"]
            )
    
    def get_summary(self, location: str) -> Dict:
        """Get summary statistics for a location."""
        readings = self.reading_buffer.get(location, [])
        
        if not readings:
            return {"location": location, "count": 0}
        
        latest = readings[-1]
        
        water_levels = [r["water_level_m"] for r in readings]
        rainfalls = [r["rainfall_mm"] for r in readings]
        
        return {
            "location": location,
            "count": len(readings),
            "latest_timestamp": latest["timestamp"],
            "water_level": {
                "current": latest["water_level_m"],
                "min": min(water_levels),
                "max": max(water_levels),
                "avg": sum(water_levels) / len(water_levels)
            },
            "rainfall": {
                "current": latest["rainfall_mm"],
                "total": sum(rainfalls),
                "max": max(rainfalls)
            },
            "soil_moisture": latest["soil_moisture_percent"],
            "temperature": latest["temperature_c"]
        }
    
    def clear_location(self, location: str) -> None:
        """Clear buffer for a location."""
        self.reading_buffer.pop(location, None)
    
    def clear_all(self) -> None:
        """Clear all buffers."""
        self.reading_buffer.clear()
