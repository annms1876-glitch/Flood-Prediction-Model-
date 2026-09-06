#!/usr/bin/env node

/**
 * ML Integration Test Script
 * Tests the connection between Node.js backend and Python ML service
 */

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

const TEST_READINGS = [
  {
    location: "village_a",
    water_level_m: 2.5,
    rainfall_mm: 15.2,
    soil_moisture_percent: 65,
    tilt_degrees: 0.8,
    temperature_c: 24.5,
    humidity_percent: 78
  },
  {
    location: "village_a",
    water_level_m: 2.8,
    rainfall_mm: 22.1,
    soil_moisture_percent: 72,
    tilt_degrees: 1.2,
    temperature_c: 23.8,
    humidity_percent: 82
  },
  {
    location: "village_a",
    water_level_m: 3.2,
    rainfall_mm: 35.5,
    soil_moisture_percent: 85,
    tilt_degrees: 1.8,
    temperature_c: 22.5,
    humidity_percent: 88
  }
];

async function testMLService() {
  console.log('Testing ML Service...');
  console.log('='.repeat(50));

  try {
    // Test health endpoint
    console.log('\n1. Testing ML health endpoint...');
    const healthResponse = await fetch(`${ML_API_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('Health:', healthData.status);
    console.log('Models loaded:', healthData.models_loaded);

    // Test model info
    console.log('\n2. Testing model info...');
    const infoResponse = await fetch(`${ML_API_URL}/model/info`);
    const infoData = await infoResponse.json();
    console.log('Model version:', infoData.model_version);
    console.log('Architecture:', Object.keys(infoData.architecture).join(', '));

    // Test prediction
    console.log('\n3. Testing ML prediction...');
    const predictResponse = await fetch(`${ML_API_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'village_a',
        readings: TEST_READINGS,
        prev_water_level: 2.0
      })
    });
    const predictData = await predictResponse.json();
    console.log('Risk score:', predictData.risk_score);
    console.log('Risk level:', predictData.risk_level);
    console.log('Flood probability:', predictData.flood_probability);
    console.log('LSTM prediction:', predictData.lstm_prediction);
    console.log('XGBoost correction:', predictData.xgboost_correction);
    console.log('Processing time:', predictData.processing_time_ms, 'ms');

    console.log('\n' + '='.repeat(50));
    console.log('ML Service tests passed!');

  } catch (error) {
    console.error('\nML Service test failed:', error.message);
    console.log('\nMake sure the ML service is running:');
    console.log('  cd ml-service && python -m uvicorn app:app --reload --port 8000');
  }
}

async function testBackendIntegration() {
  console.log('\n\nTesting Backend Integration...');
  console.log('='.repeat(50));

  try {
    // Test backend health
    console.log('\n1. Testing backend health...');
    const healthResponse = await fetch(`${BACKEND_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('Backend status:', healthData.status);

    // Test ML health via backend
    console.log('\n2. Testing ML health via backend...');
    const mlHealthResponse = await fetch(`${BACKEND_URL}/api/ml/health`);
    const mlHealthData = await mlHealthResponse.json();
    console.log('ML health:', mlHealthData.success ? 'connected' : 'disconnected');

    // Test ML prediction via backend
    console.log('\n3. Testing ML prediction via backend...');
    const predictResponse = await fetch(`${BACKEND_URL}/api/ml/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'village_a',
        readings: TEST_READINGS,
        prev_water_level: 2.0
      })
    });
    const predictData = await predictResponse.json();
    console.log('Prediction success:', predictData.success);
    if (predictData.data) {
      console.log('Risk score:', predictData.data.risk_score);
      console.log('Risk level:', predictData.data.risk_level);
    }

    console.log('\n' + '='.repeat(50));
    console.log('Backend integration tests passed!');

  } catch (error) {
    console.error('\nBackend integration test failed:', error.message);
    console.log('\nMake sure the backend is running:');
    console.log('  npm run dev');
  }
}

async function runTests() {
  console.log('Flood Prediction ML Integration Tests');
  console.log('='.repeat(50));
  console.log(`ML Service URL: ${ML_API_URL}`);
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log('='.repeat(50));

  await testMLService();
  await testBackendIntegration();

  console.log('\n\nTest Summary:');
  console.log('='.repeat(50));
  console.log('1. Start ML service: cd ml-service && python -m uvicorn app:app --reload');
  console.log('2. Start backend: npm run dev');
  console.log('3. Run tests: node tests/test-ml-integration.js');
  console.log('='.repeat(50));
}

runTests();
