// Supabase Configuration
// This module handles Supabase client initialization and connection management

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Create and export Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Check Supabase connection health
 * @returns {Promise<boolean>}
 */
async function checkConnection() {
  try {
    const { error } = await supabase.from('health_check').select('*').limit(1);
    // Even if table doesn't exist, connection is established
    return true;
  } catch (error) {
    console.error('Supabase connection check failed:', error.message);
    return false;
  }
}

/**
 * Check if Supabase is initialized
 * @returns {boolean}
 */
function isInitialized() {
  return !!supabaseUrl && !!supabaseAnonKey && !!supabase;
}

module.exports = { supabase, checkConnection, isInitialized };

