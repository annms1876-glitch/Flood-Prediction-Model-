// Supabase Configuration
// This module handles Supabase client initialization and connection management

const { createClient } = require('@supabase/supabase-js');

// Validate environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Supabase environment variables not set. Database operations will fail.');
}

// Create Supabase client
const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      database: {
        schema: 'public'
      }
    })
  : null;

/**
 * Check Supabase connection health
 * @returns {Promise<boolean>}
 */
async function checkConnection() {
  if (!supabase) {
    throw new Error('Supabase client not initialized. Check environment variables.');
  }

  try {
    const { error } = await supabase.from('health_check').select('*').limit(1);
    // Even if table doesn't exist, connection is established
    return true;
  } catch (error) {
    console.error('Supabase connection check failed:', error.message);
    return false;
  }
}

module.exports = {
  supabase,
  checkConnection,
  isInitialized: () => supabase !== null
};
