# Deploy Analytics Edge Function

## Prerequisites

Make sure you have the Supabase CLI installed:

```bash
npm install -g supabase
```

Or install via other methods: https://supabase.com/docs/guides/cli

## Step 1: Set Secrets

Set the required secrets (replace with your actual values if different):

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxeGF1ZnVyY2hvbGdxd3NreWJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjUxNDI4NSwiZXhwIjoyMDc4MDkwMjg1fQ.j7liEK4JaMu74tQOBOu9ExkR87kz9NpZWsPppTP-o SUPABASE_URL=https://jqxaufurcholgqwskybi.supabase.co
```

**Note:** The values above are from your codebase. If you need to get the actual service role key:
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the **service_role** key (NOT the anon key)

## Step 2: Deploy Function

Deploy the analytics edge function:

```bash
supabase functions deploy analytics
```

## Step 3: Verify Deployment

After deployment, you can test the function by calling it:

```bash
curl -X POST https://jqxaufurcholgqwskybi.supabase.co/functions/v1/analytics \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"type": "summary"}'
```

## Function Details

The `analytics` function provides:
- **Visitors data**: Total visitors, visitor list, and statistics
- **Service clicks data**: Total clicks, clicks by service name, and click list
- **Summary**: Combined statistics with top services

### Request Body Options

```json
{
  "type": "visitors" | "service_clicks" | "summary",
  "start_date": "2025-01-01T00:00:00Z",  // Optional
  "end_date": "2025-01-31T23:59:59Z"     // Optional
}
```

### Response Format

```json
{
  "success": true,
  "visitors": {
    "total": 100,
    "data": [...]
  },
  "service_clicks": {
    "total": 50,
    "by_service": {
      "AI & Machine Learning": 20,
      "Custom Software Development": 15,
      ...
    },
    "data": [...]
  },
  "summary": {
    "total_visitors": 100,
    "total_service_clicks": 50,
    "last_visitor": "2025-01-08T10:00:00Z",
    "last_click": "2025-01-08T09:30:00Z",
    "top_services": [
      { "name": "AI & Machine Learning", "count": 20 },
      ...
    ]
  }
}
```

## Error Handling

If you encounter errors:
- Check that secrets are set correctly
- Verify the Supabase CLI is installed and logged in
- Ensure you're in the project directory
- Check function logs in Supabase dashboard

