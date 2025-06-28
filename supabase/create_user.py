#!/usr/bin/env python3

import os
import argparse
import secrets
import string
from supabase import create_client, Client
from gotrue.errors import AuthApiError
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

# Validate environment variables
if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("Missing required environment variables:")
    print("- SUPABASE_URL")
    print("- SUPABASE_SERVICE_KEY")
    print("Please check your .env file or set these environment variables.")
    exit(1)

# Create Supabase client with service role (bypasses RLS for user creation)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


def generate_random_password(length=16):
    """Generate a random password with letters, digits, and special characters."""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return "".join(secrets.choice(alphabet) for _ in range(length))


def create_user(user_email, custom_password=None):
    """Create a new user or find existing user in Supabase."""
    print(f"👤 Creating/finding user: {user_email}...")

    # Try to create the user
    try:
        password = custom_password or generate_random_password()
        auth_response = supabase.auth.admin.create_user(
            {"email": user_email, "password": password, "email_confirm": True}
        )
        user_id = auth_response.user.id
        print(f"✅ Created new user: {user_id}")
        if not custom_password:
            print(f"🔑 Generated password: {password}")
        else:
            print("🔑 Using provided password")
        return user_id, password
    except AuthApiError as e:
        if "already been registered" in str(e) or "already registered" in str(e):
            # User already exists, get their ID
            users_response = supabase.auth.admin.list_users()
            existing_user = next(
                (u for u in users_response if u.email == user_email), None
            )
            if existing_user:
                user_id = existing_user.id
                print(f"✅ Using existing user: {user_id}")
                print("ℹ️  Password unchanged for existing user")
                return user_id, None
            else:
                raise ValueError(
                    f"User {user_email} should exist but couldn't be found"
                )
        else:
            raise


def main():
    parser = argparse.ArgumentParser(description="Create a user in Supabase database")
    parser.add_argument("email", help="Email address for the user to create")
    parser.add_argument(
        "--password",
        help="Custom password for the user (if not provided, a random one will be generated)",
    )

    args = parser.parse_args()

    print("🚀 Starting user creation...")

    try:
        user_id, password = create_user(args.email, args.password)
        print(f"🎉 User creation completed successfully!")
        print(f"📧 Email: {args.email}")
        print(f"🆔 User ID: {user_id}")
        if password:
            print(f"🔑 Password: {password}")
    except Exception as e:
        print(f"❌ Error creating user: {e}")
        exit(1)


if __name__ == "__main__":
    main()
