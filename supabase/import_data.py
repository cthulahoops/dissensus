#!/usr/bin/env python3

import os
import json
import argparse
import secrets
import string
from datetime import datetime, timezone
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

# Validate environment variables
if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print('Missing required environment variables:')
    print('- SUPABASE_URL')
    print('- SUPABASE_SERVICE_KEY')
    print('Please check your .env file or set these environment variables.')
    exit(1)

# Create Supabase client with service role (bypasses RLS for import)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Helper functions to parse date and time

def parse_time_string(time_str):
    if not time_str or time_str.lower() == 'null':
        return None
    hours, minutes = time_str.split(':')
    return f"{hours.zfill(2)}:{minutes.zfill(2)}:00"

def parse_date_string(date_str):
    if not date_str:
        return None
    current_year = datetime.now().year
    try:
        date = datetime.strptime(f"{date_str} {current_year}", "%b %d %Y")
        if date > datetime.now():
            date = datetime.strptime(f"{date_str} {current_year - 1}", "%b %d %Y")
        return date.strftime("%Y-%m-%d")
    except ValueError:
        return None

# Function to transform records

def transform_record(record, user_id):
    return {
        "user_id": user_id,
        "date": parse_date_string(record['date']),
        "date_unix": record['date_unix'],
        "uid": record['uid'],
        "comments": record.get('comments'),
        "time_got_into_bed": parse_time_string(record.get('time_got_into_bed')),
        "time_tried_to_sleep": parse_time_string(record.get('time_tried_to_sleep')),
        "time_to_fall_asleep_mins": int(record['time_to_fall_asleep_mins']) if record.get('time_to_fall_asleep_mins') else None,
        "times_woke_up_count": int(record['times_woke_up_count']) if record.get('times_woke_up_count') else None,
        "total_awake_time_mins": int(record['total_awake_time_mins']) if record.get('total_awake_time_mins') else None,
        "final_awakening_time": parse_time_string(record.get('final_awakening_time')),
        "time_in_bed_after_final_awakening_mins": int(record['time_in_bed_after_final_awakening_mins']) if record.get('time_in_bed_after_final_awakening_mins') else None,
        "time_got_out_of_bed": parse_time_string(record.get('time_got_out_of_bed')),
        "sleep_quality_rating": record.get('sleep_quality_rating'),
    }

# Main import function

def generate_random_password(length=16):
    """Generate a random password with letters, digits, and special characters."""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def import_data(json_file_path, user_email, batch_size=50):
    print('🚀 Starting data import...')
    
    # Read the JSON data
    with open(json_file_path, 'r') as f:
        sleep_data = json.load(f)
    print(f"📖 Found {len(sleep_data)} records to import")
    
    print(f'👤 Creating/finding user: {user_email}...')
    
    # Try to create the user
    try:
        password = generate_random_password()
        auth_response = supabase.auth.admin.create_user({
            'email': user_email,
            'password': password,
            'email_confirm': True
        })
        user_id = auth_response.user.id
        print(f"✅ Created new user: {user_id}")
        print(f"🔑 Generated password: {password}")
    except ValueError as e:
        if "already registered" in str(e) or "User already registered" in str(e):
            # User already exists, get their ID
            users_response = supabase.auth.admin.list_users()
            existing_user = next((u for u in users_response if u.email == user_email), None)
            if existing_user:
                user_id = existing_user.id
                print(f"✅ Using existing user: {user_id}")
            else:
                raise ValueError(f"User {user_email} should exist but couldn't be found")
        else:
            raise
    
    # Filter for completed entries only and transform data
    print('🔄 Filtering and transforming data...')
    completed_records = [
        record for record in sleep_data 
        if record.get('complete') is True and parse_date_string(record['date']) is not None
    ]
    
    print(f"📋 Found {len(completed_records)} completed records out of {len(sleep_data)} total")
    
    transformed_records = [
        transform_record(record, user_id) 
        for record in completed_records
    ]
    
    print(f"📝 Importing {len(transformed_records)} valid records...")

    # Import in batches
    for i in range(0, len(transformed_records), batch_size):
        batch = transformed_records[i:i + batch_size]
        response = supabase.table('sleep_records').upsert(batch, on_conflict=["user_id", "date"]).execute()
        if response.error:
            print(f"❌ Error importing batch {i // batch_size + 1}: {response.error}")
            raise RuntimeError(f"Database import failed: {response.error}")
        print(f"✅ Imported batch {i // batch_size + 1} ({len(batch)} records)")

    # Verify the import
    response = supabase.table('sleep_records').select('*', count='exact').eq('user_id', user_id).execute()
    if response.error:
        raise RuntimeError(f"Database verification failed: {response.error}")
    
    print(f"🎉 Import completed successfully!")
    print(f"📊 Total records in database: {len(response.data)}")
    print(f"👤 User ID: {user_id}")
    print('')
    print('Next steps:')
    print('1. Note down the User ID above')
    print('2. You can use this User ID for testing your frontend')
    print('3. Later, replace with real user authentication')

def main():
    parser = argparse.ArgumentParser(
        description='Import sleep data from JSON file to Supabase database'
    )
    parser.add_argument(
        'json_file', 
        help='Path to the JSON file containing sleep data'
    )
    parser.add_argument(
        '--email',
        default='test@sleeptracker.local',
        help='Email address for the user to import data as (default: test@sleeptracker.local)'
    )
    parser.add_argument(
        '--batch-size',
        type=int,
        default=50,
        help='Number of records to import per batch (default: 50)'
    )
    
    args = parser.parse_args()
    
    # Check if file exists
    if not os.path.exists(args.json_file):
        print(f"❌ Error: File '{args.json_file}' not found")
        exit(1)
    
    import_data(args.json_file, args.email, args.batch_size)

if __name__ == '__main__':
    main()
