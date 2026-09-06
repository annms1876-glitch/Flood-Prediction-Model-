#!/usr/bin/env node

/**
 * Flood Prediction System - Integration Test Runner
 * 
 * This script:
 * 1. Starts the Express server
 * 2. Runs the data simulator to generate test data
 * 3. Monitors console output for alerts
 * 4. Runs system tests to verify all components
 * 
 * Usage:
 *   node scripts/run-tests.js           # Run all tests
 *   node scripts/run-tests.js --demo    # Run demo without actual tests
 *   node scripts/run-tests.js --simulate # Just run simulator
 */

const { spawn } = require('child_process');
const readline = require('readline');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const mode = args.includes('--demo') ? 'demo' : args.includes('--simulate') ? 'simulate' : 'test';

console.log(`
╔══════════════════════════════════════════════════════════════════════════╗
║           FLOOD PREDICTION SYSTEM - INTEGRATION TEST                    ║
╠══════════════════════════════════════════════════════════════════════════╣
║  Mode: ${mode.toUpperCase().padEnd(55)}║
║  API URL: ${process.env.API_BASE_URL || 'http://localhost:3000'.padEnd(53)}║
╚══════════════════════════════════════════════════════════════════════════╝
`);

// Colors for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Alert patterns to watch for
const alertPatterns = [
  { pattern: /🚨 CRITICAL/i, color: colors.red, type: 'CRITICAL' },
  { pattern: /🚨 HIGH/i, color: colors.red, type: 'HIGH' },
  { pattern: /⚠️ WARNING/i, color: colors.yellow, type: 'WARNING' },
  { pattern: /📊 New sensor reading/i, color: colors.blue, type: 'SENSOR_READING' },
  { pattern: /✅ Real-time subscription/i, color: colors.green, type: 'SUBSCRIPTION' },
  { pattern: /✅ Reading inserted/i, color: colors.green, type: 'INSERT_SUCCESS' },
  { pattern: /❌ Failed to insert/i, color: colors.red, type: 'INSERT_ERROR' },
  { pattern: /⛈️  STORM CONDITIONS/i, color: colors.magenta, type: 'STORM' },
  { pattern: /📡 Sensor Reading/i, color: colors.cyan, type: 'SIMULATOR_READING' }
];

// Track alerts for summary
const alertStats = {
  critical: 0,
  high: 0,
  warning: 0,
  sensor_readings: 0,
  storms: 0,
  insertions: 0,
  errors: 0
};

// Create readline interface to monitor server output
function monitorOutput(stream, label) {
  const rl = readline.createInterface({
    input: stream,
    terminal: false
  });

  rl.on('line', (line) => {
    // Check for alert patterns
    for (const alert of alertPatterns) {
      if (alert.pattern.test(line)) {
        console.log(`${alert.color}[${alert.type}]${colors.reset} ${line.trim()}`);
        
        // Update stats
        if (alert.type === 'CRITICAL') alertStats.critical++;
        if (alert.type === 'HIGH') alertStats.high++;
        if (alert.type === 'WARNING') alertStats.warning++;
        if (alert.type === 'SENSOR_READING') alertStats.sensor_readings++;
        if (alert.type === 'STORM') alertStats.storms++;
        if (alert.type === 'INSERT_SUCCESS') alertStats.insertions++;
        if (alert.type === 'INSERT_ERROR') alertStats.errors++;
      }
    }
  });

  return rl;
}

// Start the server
function startServer() {
  console.log('🌐 Starting Express server...');
  
  const serverProcess = spawn('node', ['src/app.js'], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, NODE_ENV: 'development' },
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Monitor stdout
  monitorOutput(serverProcess.stdout, 'Server');

  // Monitor stderr for errors
  serverProcess.stderr.on('data', (data) => {
    console.log(`${colors.red}[SERVER ERROR]${colors.reset} ${data.toString().trim()}`);
  });

  serverProcess.on('close', (code) => {
    console.log(`\n${colors.red}Server stopped with code: ${code}${colors.reset}`);
  });

  serverProcess.on('error', (error) => {
    console.error(`${colors.red}Failed to start server: ${error.message}${colors.reset}`);
  });

  return serverProcess;
}

// Start the data simulator
function startSimulator(serverProcess) {
  console.log('\n📡 Starting Data Simulator (generating readings every 5 seconds)...');
  console.log('   Press Ctrl+C to stop\n');

  const simulatorProcess = spawn('node', [
    '-e', `
      const simulator = require('./src/utils/dataSimulator').default;
      console.log('Simulator started');
      simulator.start();
    `
  ], {
    cwd: path.join(__dirname, '..'),
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Monitor simulator output
  const rl = readline.createInterface({
    input: simulatorProcess.stdout,
    terminal: false
  });

  rl.on('line', (line) => {
    // Highlight simulator output
    if (line.includes('Sensor Reading')) {
      console.log(`${colors.cyan}[SIMULATOR]${colors.reset} ${line.trim()}`);
    } else if (line.includes('STORM')) {
      console.log(`${colors.magenta}[STORM]${colors.reset} ${line.trim()}`);
    } else {
      console.log(`${colors.blue}[SIMULATOR]${colors.reset} ${line.trim()}`);
    }
  });

  simulatorProcess.stderr.on('data', (data) => {
    console.log(`${colors.red}[SIMULATOR ERROR]${colors.reset} ${data.toString().trim()}`);
  });

  return simulatorProcess;
}

// Run system tests
async function runTests() {
  console.log('\n🧪 Running System Tests...');
  console.log('─'.repeat(50));

  try {
    const { runAllTests } = require('../tests/system-test');
    const results = await runAllTests();
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${results.total}`);
    console.log(`Passed: ${results.passed} ${colors.green}✅${colors.reset}`);
    console.log(`Failed: ${results.failed} ${colors.red}❌${colors.reset}`);
    
    if (results.failed === 0) {
      console.log(`\n${colors.green}🎉 All system tests passed!${colors.reset}`);
    } else {
      console.log(`\n${colors.yellow}⚠️  Some tests failed. Check logs above.${colors.reset}`);
    }
    
    return results;
  } catch (error) {
    console.error(`${colors.red}Test error: ${error.message}${colors.reset}`);
    return { total: 0, passed: 0, failed: 1 };
  }
}

// Print alerts summary
function printAlertSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('🚨 ALERT SUMMARY');
  console.log('='.repeat(60));
  console.log(`Critical Alerts: ${alertStats.critical} ${colors.red}🚨${colors.reset}`);
  console.log(`High Alerts: ${alertStats.high} ${colors.red}🚨${colors.reset}`);
  console.log(`Warning Alerts: ${alertStats.warning} ${colors.yellow}⚠️${colors.reset}`);
  console.log(`Sensor Readings: ${alertStats.sensor_readings}`);
  console.log(`Storms Detected: ${alertStats.storms} ${colors.magenta}⛈️${colors.reset}`);
  console.log(`Successful Insertions: ${alertStats.insertions} ${colors.green}✅${colors.reset}`);
  console.log(`Insert Errors: ${alertStats.errors} ${colors.red}❌${colors.reset}`);
  console.log('='.repeat(60));
}

// Main function
async function main() {
  const serverProcess = startServer();
  
  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  if (mode === 'demo' || mode === 'test') {
    const simulatorProcess = startSimulator(serverProcess);
    
    // Wait for some data to be generated
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    if (mode === 'test') {
      const testResults = await runTests();
      printAlertSummary();
      
      // Give user time to see results
      await new Promise(resolve => setTimeout(resolve, 5000));
    } else {
      printAlertSummary();
      console.log('\n📝 Demo complete. Check the alerts above.');
      console.log('   Press Ctrl+C to stop the simulator and server.\n');
      
      // Keep running until user stops
      process.stdin.resume();
    }
    
    // Handle cleanup
    const cleanup = () => {
      console.log('\n🛑 Shutting down...');
      simulatorProcess?.kill();
      serverProcess?.kill();
      process.exit(0);
    };
    
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
  } else if (mode === 'simulate') {
    startSimulator(serverProcess);
    
    process.on('SIGINT', () => {
      simulatorProcess?.kill();
      serverProcess?.kill();
      process.exit(0);
    });
  }
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
