# EventCraft Database Setup

This directory contains the SQL setup script for EventCraft.

## Setup Instructions

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the entire contents of `setup.sql`
4. Paste and run it in the SQL Editor
5. Click **Run**

## What setup.sql does:

- Creates all necessary tables (users, providers, events, etc.)
- Sets up proper enums for user types and statuses
- Configures Row Level Security (RLS) policies
- Creates indexes for performance
- Sets up triggers for updated_at timestamps
- Grants necessary permissions

## Important Notes

- **NO AUTH TRIGGERS**: The database does NOT use auth triggers for user creation
- The frontend handles user profile creation directly during sign-up
- This gives better control and error handling
- Make sure to run the entire script at once

## Storage Setup (Optional)

If you want to enable image uploads for provider profiles:

1. Go to Storage in your Supabase dashboard
2. Create two buckets:
   - `provider-logos` (public)
   - `provider-images` (public)
3. Uncomment and run the storage policies section at the bottom of setup.sql

## Tables Created

- `users` - User profiles (linked to auth.users)
- `providers` - Provider business information
- `events` - User event planning sessions
- `tasks` - Event checklist items
- `leads` - Provider inquiries
- `provider_views` - Analytics tracking

## After Setup

Your database will be ready to:
- Handle user sign-ups (both regular users and providers)
- Store provider business profiles
- Track events and tasks
- Manage leads between users and providers
- Provide analytics for providers