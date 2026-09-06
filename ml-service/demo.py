#!/usr/bin/env python3
"""
Flood Prediction Demo Script
Run: python demo.py
"""

import json
import time
import sys
from demo_data import SCENARIOS, get_scenario, get_all_scenarios, get_demo_prediction


def print_header():
    print("\n" + "=" * 70)
    print("  FLOOD PREDICTION SYSTEM - AI/ML ENSEMBLE DEMO")
    print("  Smart India Hackathon 2026")
    print("=" * 70)


def print_model_architecture():
    print("\n📊 MODEL ARCHITECTURE")
    print("-" * 70)
    print("  ┌─────────────────────────────────────────────────────────┐")
    print("  │           4-Model Ensemble Architecture                │")
    print("  ├─────────────────────────────────────────────────────────┤")
    print("  │  LSTM (40%)  │ Temporal patterns, time-series          │")
    print("  │  XGBoost(30%)│ Residual error correction               │")
    print("  │  GNN (20%)   │ Spatial sensor relationships            │")
    print("  │  PINN (10%)  │ Physics-informed constraints            │")
    print("  └─────────────────────────────────────────────────────────┘")
    print("  Formula: Risk = LSTM*0.4 + XGBoost*0.3 + GNN*0.2 + PINN*0.1")


def print_sensor_data(readings: list):
    print("\n📡 SENSOR DATA INPUT")
    print("-" * 70)
    print(f"  {'Location':<20} {'Water(m)':<10} {'Rain(mm)':<10} {'Soil(%)':<10} {'Tilt(°)':<10}")
    print("  " + "-" * 60)
    for r in readings:
        print(f"  {r['location']:<20} {r['water_level_m']:<10} {r['rainfall_mm']:<10} {r['soil_moisture_percent']:<10} {r['tilt_degrees']:<10}")


def print_prediction(pred: dict):
    risk = pred["risk_score"]
    
    if risk < 25:
        bar_color = "🟢"
        bar_char = "█"
    elif risk < 50:
        bar_color = "🟡"
        bar_char = "█"
    elif risk < 75:
        bar_color = "🟠"
        bar_char = "█"
    else:
        bar_color = "🔴"
        bar_char = "█"
    
    bar_length = risk // 2
    bar = bar_char * bar_length + "░" * (50 - bar_length)
    
    print("\n🎯 PREDICTION RESULT")
    print("-" * 70)
    print(f"  {bar_color} Risk Score: {risk}/100  [{bar}]")
    print(f"  Risk Level: {pred['risk_level'].upper()}")
    print(f"  Flood Probability: {pred['flood_probability']*100:.1f}%")
    print(f"  Predicted Water Level: {pred['predicted_water_level']}m")
    print(f"  Lead Time: {pred['lead_time_hours']} hours")


def print_model_breakdown(models: dict):
    print("\n🔬 MODEL BREAKDOWN")
    print("-" * 70)
    print(f"  {'Model':<12} {'Prediction':<12} {'Weight':<10} {'Contribution':<15}")
    print("  " + "-" * 50)
    
    total = 0
    for name, data in models.items():
        contrib = data["prediction"] * data["weight"]
        total += contrib
        print(f"  {name.upper():<12} {data['prediction']:<12.1f} {data['weight']:<10} {contrib:<15.1f}")
    print("  " + "-" * 50)
    print(f"  {'TOTAL':<12} {'':<12} {'1.0':<10} {total:<15.1f}")


def print_recommendations(recs: list):
    print("\n📋 RECOMMENDATIONS")
    print("-" * 70)
    for i, rec in enumerate(recs, 1):
        print(f"  {i}. {rec}")


def run_scenario(scenario_key: str):
    scenario = get_scenario(scenario_key)
    pred = get_demo_prediction(scenario_key)
    
    print(f"\n{scenario['icon']} SCENARIO: {scenario['name']}")
    print(f"  {scenario['description']}")
    
    print_sensor_data(scenario["readings"])
    print_prediction(pred)
    print_model_breakdown(pred["models"])
    print_recommendations(pred["recommendations"])


def interactive_mode():
    scenarios = get_all_scenarios()
    
    while True:
        print("\n" + "=" * 70)
        print("  SELECT SCENARIO")
        print("-" * 70)
        
        for i, s in enumerate(scenarios, 1):
            print(f"  {i}. {s['icon']} {s['name']} - {s['description']}")
        
        print(f"  7. 🔄 Run All Scenarios")
        print(f"  0. 🚪 Exit")
        print("-" * 70)
        
        try:
            choice = input("  Enter choice (0-7): ").strip()
            
            if choice == "0":
                print("\n  Thank you for the demo!")
                break
            elif choice == "7":
                for s in scenarios:
                    run_scenario(s["key"])
                    time.sleep(1)
            elif 1 <= int(choice) <= len(scenarios):
                run_scenario(scenarios[int(choice) - 1]["key"])
            else:
                print("  Invalid choice. Try again.")
        except (ValueError, KeyboardInterrupt):
            print("\n  Exiting...")
            break


def auto_demo():
    print_header()
    print_model_architecture()
    
    print("\n  Running automated demo of all scenarios...")
    print("=" * 70)
    
    for scenario in get_all_scenarios():
        run_scenario(scenario["key"])
        print("\n" + "=" * 70)
        time.sleep(2)
    
    print("\n✅ Demo complete!")
    print("  All 4 models (LSTM, XGBoost, GNN, PINN) demonstrated.")
    print("  Architecture matches SIH 2026 system design.")


def main():
    print_header()
    print_model_architecture()
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "--auto":
            auto_demo()
        elif sys.argv[1] in SCENARIOS:
            run_scenario(sys.argv[1])
        else:
            print(f"\n  Unknown scenario: {sys.argv[1]}")
            print(f"  Available: {', '.join(SCENARIOS.keys())}")
    else:
        interactive_mode()


if __name__ == "__main__":
    main()
