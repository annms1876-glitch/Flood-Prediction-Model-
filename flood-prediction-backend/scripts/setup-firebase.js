#!/usr/bin/env node

/**
 * Firebase Setup Helper Script
 * Guides users through Firebase Admin SDK configuration
 * 
 * Usage:
 *   node scripts/setup-firebase.js
 *   node scripts/setup-firebase.js --check    # Check current configuration
 *   node scripts/setup-firebase.js --download # Open Firebase Console URL
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const SERVICE_ACCOUNT_PATH = path.join(__dirname, '../config/service-account.json');
const ENV_PATH = path.join(__dirname, '../.env');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer));
  });
}

function checkFirebaseConfig() {
  console.log('\n🔍 Checking Firebase Configuration...\n');
  
  let hasIssues = false;
  
  // Check service-account.json
  if (fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    const content = fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8');
    try {
      const parsed = JSON.parse(content);
      if (parsed.project_id && parsed.project_id !== 'YOUR_FIREBASE_PROJECT_ID') {
        console.log('✅ service-account.json exists and appears configured');
        console.log(`   Project ID: ${parsed.project_id}`);
      } else {
        console.log('⚠️  service-account.json exists but contains placeholder values');
        hasIssues = true;
      }
    } catch (e) {
      console.log('❌ service-account.json contains invalid JSON');
      hasIssues = true;
    }
  } else {
    console.log('❌ config/service-account.json not found');
    hasIssues = true;
  }
  
  // Check .env
  if (fs.existsSync(ENV_PATH)) {
    const envContent = fs.readFileSync(ENV_PATH, 'utf8');
    
    if (envContent.includes('FIREBASE_PROJECT_ID=')) {
      const match = envContent.match(/FIREBASE_PROJECT_ID=(.+)/);
      if (match && match[1] && match[1] !== 'your-firebase-project-id') {
        console.log(`✅ FIREBASE_PROJECT_ID set in .env: ${match[1]}`);
      } else {
        console.log('⚠️  FIREBASE_PROJECT_ID in .env is placeholder value');
        hasIssues = true;
      }
    } else {
      console.log('⚠️  FIREBASE_PROJECT_ID not found in .env');
      hasIssues = true;
    }
    
    if (envContent.includes('FIREBASE_CREDENTIAL_PATH=')) {
      console.log('✅ FIREBASE_CREDENTIAL_PATH configured in .env');
    }
  } else {
    console.log('❌ .env file not found');
    hasIssues = true;
  }
  
  console.log('');
  return !hasIssues;
}

async function guideSetup() {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║           Firebase Admin SDK Setup Guide                     ║
╚══════════════════════════════════════════════════════════════╝

This script will help you configure Firebase for push notifications
and Firestore access.

Steps:
1. Create a Firebase project (if you don't have one)
2. Generate a service account key
3. Save it to config/service-account.json
4. Update .env with your project ID

─────────────────────────────────────────────────────────────────
`);
  
  const hasConfig = await askQuestion('Do you already have a Firebase project? (y/n): ');
  
  if (hasConfig.toLowerCase() !== 'y') {
    console.log(`
📋 To create a Firebase project:

1. Go to: https://console.firebase.google.com/
2. Click "Add project"
3. Follow the wizard to create your project
4. Note your Project ID

Press Enter when ready to continue...
`);
    await askQuestion('');
  }
  
  console.log(`
📋 To generate a service account key:

1. Go to Firebase Console > Your Project
2. Click the gear icon (Project Settings)
3. Go to "Service Accounts" tab
4. Click "Generate New Private Key"
5. Save the JSON file

Press Enter to open Firebase Console...
`);
  await askQuestion('');
  
  // Open browser
  const { exec } = require('child_process');
  const openUrl = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  exec(`${openUrl} https://console.firebase.google.com/`);
  
  console.log('\n⏳ Opening Firebase Console in your browser...\n');
  console.log('Once you have downloaded the service account JSON:');
  console.log('1. Move it to: config/service-account.json');
  console.log('2. Update .env with FIREBASE_PROJECT_ID');
  console.log('3. Run this script again with --check to verify\n');
  
  rl.close();
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: node scripts/setup-firebase.js [options]

Options:
  --check    Check current Firebase configuration
  --download Open Firebase Console in browser
  --help     Show this help message

Examples:
  node scripts/setup-firebase.js --check
  node scripts/setup-firebase.js --download
`);
    rl.close();
    return;
  }
  
  if (args.includes('--check')) {
    const isValid = checkFirebaseConfig();
    if (isValid) {
      console.log('✅ Firebase configuration looks good!');
    } else {
      console.log('❌ Firebase configuration needs attention.');
      console.log('Run without --check to get setup guidance.');
    }
    rl.close();
    return;
  }
  
  if (args.includes('--download')) {
    const { exec } = require('child_process');
    const openUrl = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
    exec(`${openUrl} https://console.firebase.google.com/`);
    console.log('📂 Opening Firebase Console...');
    rl.close();
    return;
  }
  
  await guideSetup();
}

main().catch(console.error);
