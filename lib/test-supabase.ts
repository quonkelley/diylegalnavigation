// Simple test file to verify Supabase connection
// Run this with: node -e "require('./lib/test-supabase.ts').testConnection()"

import { supabase } from './supabase';

export async function testConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('conversations')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful!');
    console.log('📊 Database is accessible');
    return true;
    
  } catch (err) {
    console.error('❌ Connection test failed:', err);
    return false;
  }
}

// Check if environment variables are set
export function checkEnvironment() {
  console.log('Checking environment variables...');
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set');
    return false;
  }
  
  if (!key) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
    return false;
  }
  
  console.log('✅ Environment variables are set');
  console.log(`📍 URL: ${url.substring(0, 30)}...`);
  console.log(`🔑 Key: ${key.substring(0, 20)}...`);
  
  return true;
} 