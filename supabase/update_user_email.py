#!/usr/bin/env python3

import os
import argparse
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

# Validate environment variables
if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("Missing required environment variables:")
    print("- SUPABASE_URL")
    print("- SUPABASE_SERVICE_KEY")
    print("Please check your .env file or set these environment variables.")
    exit(1)

# Create Supabase client with service role
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


def update_user_email(old_email: str, new_email: str):
    """Update a user's email address"""

    print(f"🔍 Looking for user with email: {old_email}")

    # Find the user by old email
    try:
        users_response = supabase.auth.admin.list_users()
        target_user = None

        for user in users_response:
            if user.email == old_email:
                target_user = user
                break

        if not target_user:
            print(f"❌ User with email {old_email} not found")
            return False

        print(f"✅ Found user: {target_user.id}")

        # Update the user's email
        print(f"📧 Updating email to: {new_email}")

        update_response = supabase.auth.admin.update_user_by_id(
            target_user.id, {"email": new_email, "email_confirm": True}
        )

        if update_response.user:
            print(f"✅ Successfully updated email!")
            print(f"   User ID: {update_response.user.id}")
            print(f"   New Email: {update_response.user.email}")
            return True
        else:
            print("❌ Failed to update user email")
            return False

    except Exception as e:
        print(f"❌ Error updating user email: {str(e)}")
        return False


def main():
    parser = argparse.ArgumentParser(
        description="Update a user's email address in Supabase"
    )
    parser.add_argument(
        "--old-email", help="Current email address (default: test@sleeptracker.local)"
    )
    parser.add_argument("--new-email", required=True, help="New email address to set")

    args = parser.parse_args()

    print("🚀 Starting email update...")
    print(f"   Old email: {args.old_email}")
    print(f"   New email: {args.new_email}")
    print()

    success = update_user_email(args.old_email, args.new_email)

    if success:
        print()
        print("🎉 Email update completed successfully!")
        print()
        print("Next steps:")
        print(f"1. You can now sign in with: {args.new_email}")
        print("2. Update your .env file if needed:")
        print(f"   VITE_TEST_USER_EMAIL={args.new_email}")
    else:
        print()
        print("❌ Email update failed")
        exit(1)


if __name__ == "__main__":
    main()
