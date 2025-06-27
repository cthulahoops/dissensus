#!/usr/bin/env node

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing required environment variables:');
  console.error('- SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_KEY');
  console.error('Please check your .env file or set these environment variables.');
  process.exit(1);
}

if (!SUPABASE_SERVICE_KEY) {
  console.error('Please set SUPABASE_SERVICE_KEY environment variable');
  console.error('Get this from: Supabase Dashboard > Settings > API > service_role key');
  process.exit(1);
}

// Create Supabase client with service role (bypasses RLS for import)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Function to parse time string to TIME format
function parseTimeString(timeStr) {
  if (!timeStr || timeStr === 'null') return null;
  // Ensure format is HH:MM
  const [hours, minutes] = timeStr.split(':');
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
}

// Function to parse date string to proper date
function parseDateString(dateStr) {
  if (!dateStr) return null;
  
  // Handle formats like "May 18", "June 1", etc.
  const currentYear = new Date().getFullYear();
  const date = new Date(`${dateStr} ${currentYear}`);
  
  // If the date is invalid or in the future, try previous year
  if (isNaN(date.getTime()) || date > new Date()) {
    const prevYear = currentYear - 1;
    const prevYearDate = new Date(`${dateStr} ${prevYear}`);
    return prevYearDate.toISOString().split('T')[0];
  }
  
  return date.toISOString().split('T')[0];
}

// Function to transform JSON record to database format
function transformRecord(record, userId) {
  return {
    user_id: userId,
    date: parseDateString(record.date),
    date_unix: record.date_unix,
    uid: record.uid,
    comments: record.comments || null,
    
    // Sleep timing fields
    time_got_into_bed: parseTimeString(record.time_got_into_bed),
    time_tried_to_sleep: parseTimeString(record.time_tried_to_sleep),
    time_to_fall_asleep_mins: record.time_to_fall_asleep_mins ? parseInt(record.time_to_fall_asleep_mins) : null,
    times_woke_up_count: record.times_woke_up_count ? parseInt(record.times_woke_up_count) : null,
    total_awake_time_mins: record.total_awake_time_mins ? parseInt(record.total_awake_time_mins) : null,
    final_awakening_time: parseTimeString(record.final_awakening_time),
    time_in_bed_after_final_awakening_mins: record.time_in_bed_after_final_awakening_mins ? 
      parseInt(record.time_in_bed_after_final_awakening_mins) : null,
    time_got_out_of_bed: parseTimeString(record.time_got_out_of_bed),
    
    // Sleep quality
    sleep_quality_rating: record.sleep_quality_rating || null
  };
}

async function importData() {
  try {
    console.log('🚀 Starting data import...');
    
    // Read the JSON data
    const jsonPath = path.join(__dirname, '..', 'static', 'sleep_data.json');
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const sleepData = JSON.parse(rawData);
    
    console.log(`📖 Found ${sleepData.length} records to import`);
    
    // For this import, we'll create a temporary user or use an existing one
    // In a real app, you'd import data for actual authenticated users
    
    // Option 1: Create a test user (you can replace this with your actual user ID later)
    const testUserEmail = 'test@sleeptracker.local';
    
    console.log('👤 Creating/finding test user...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testUserEmail,
      password: 'temporary-password-123',
      email_confirm: true
    });
    
    let userId;
    if (authError && authError.message.includes('already registered')) {
      // User already exists, get their ID
      const { data: users, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) throw listError;
      
      const existingUser = users.users.find(u => u.email === testUserEmail);
      userId = existingUser.id;
      console.log(`✅ Using existing user: ${userId}`);
    } else if (authError) {
      throw authError;
    } else {
      userId = authData.user.id;
      console.log(`✅ Created new user: ${userId}`);
    }
    
    // Transform and import the data
    console.log('🔄 Transforming data...');
    const transformedRecords = sleepData
      .map(record => transformRecord(record, userId))
      .filter(record => record.date !== null); // Filter out records with invalid dates
    
    console.log(`📝 Importing ${transformedRecords.length} valid records...`);
    
    // Import in batches to avoid timeouts
    const batchSize = 50;
    for (let i = 0; i < transformedRecords.length; i += batchSize) {
      const batch = transformedRecords.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('sleep_records')
        .upsert(batch, { onConflict: 'user_id,date' });
      
      if (error) {
        console.error(`❌ Error importing batch ${Math.floor(i/batchSize) + 1}:`, error);
        throw error;
      }
      
      console.log(`✅ Imported batch ${Math.floor(i/batchSize) + 1} (${batch.length} records)`);
    }
    
    // Verify the import
    const { data: verifyData, error: verifyError } = await supabase
      .from('sleep_records')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);
    
    if (verifyError) throw verifyError;
    
    console.log(`🎉 Import completed successfully!`);
    console.log(`📊 Total records in database: ${verifyData.length}`);
    console.log(`👤 User ID: ${userId}`);
    console.log('');
    console.log('Next steps:');
    console.log('1. Note down the User ID above');
    console.log('2. You can use this User ID for testing your frontend');
    console.log('3. Later, replace with real user authentication');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

// Run the import
importData();
