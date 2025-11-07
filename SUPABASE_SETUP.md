# Supabase Setup Guide

## Table Schemas

Two SQL schema files are provided:

1. **`supabase-schema.sql`** - Complete schema with RLS policies, triggers, and sample data
2. **`supabase-schema-simple.sql`** - Simplified version without RLS (recommended if using service key)

## Quick Setup

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase-schema-simple.sql`
4. Click **Run** to execute

## Tables Created

### 1. `homepage`
Stores homepage content:
- `title` - Main heading
- `subtitle` - Subheading
- `description` - Main description text
- `hero_image` - URL to hero image
- `stats` - JSON object with statistics (e.g., `{"projects": 500, "clients": 200}`)

### 2. `about`
Stores about page content:
- `mission` - Mission statement
- `vision` - Vision statement
- `values` - Core values
- `journey` - JSON array of timeline items
- `team` - JSON array of team members

### 3. `services`
Stores service offerings:
- `title` - Service name
- `description` - Service description
- `icon` - Font Awesome icon class
- `category` - Service category (e.g., "ai", "cloud")
- `features` - JSON array of features
- `benefits` - JSON array of benefits

### 4. `contact_messages`
Stores contact form submissions:
- `name` - Sender name
- `email` - Sender email
- `phone` - Sender phone (optional)
- `subject` - Message subject
- `message` - Message content

## Using the Service Key

The backend uses a **service key** which bypasses Row Level Security (RLS). This means:
- ✅ You can read/write all tables without RLS policies
- ✅ No need to set up complex RLS rules
- ⚠️ Keep your service key secure (never expose it in frontend code)

## Sample Data

The schema includes sample data inserts. You can modify or remove them as needed.

## Indexes

All tables have indexes on `created_at` for faster queries. The `services` table also has an index on `category`.

## Auto-update Timestamps

The `updated_at` column is automatically updated when a row is modified using database triggers.

