import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// Backend usa SUPABASE_URL (sem VITE_), frontend usa VITE_SUPABASE_URL
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://cbdonvzifbkayrvnlskp.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseServiceKey) {
  console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY not found in environment variables');
}

// Create Supabase client with service role key (for backend use only)
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper function to check connection
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('users_profile')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection error:', error);
    return false;
  }
}
