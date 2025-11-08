# Deploy Parse Resume Edge Function

## Step 1: Set Secrets

Before deploying, set the required secrets in Supabase:

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
supabase secrets set OPENAI_API_KEY=your_openai_api_key_here
```

### Getting the Service Role Key

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the **service_role** key (NOT the anon key)
4. Use this in the command above

### Getting OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create a new API key or use an existing one
3. Use this in the command above

## Step 2: Deploy Function

Deploy the parse-resume edge function:

```bash
supabase functions deploy parse-resume
```

## Step 3: Verify Deployment

After deployment, you can test the function by:

1. Going to the Admin Dashboard
2. Navigate to the Applications tab
3. Click "Parse Resume" on any application with a resume
4. The parsed data should appear below the application

## Function Details

The `parse-resume` function:
- Downloads the PDF resume from Supabase Storage
- Sends it to OpenAI GPT-4o for parsing
- Extracts structured data (name, email, skills, experience, education, etc.)
- Calculates a fit score if job_id is provided
- Returns the parsed JSON data and score

## Error Handling

If you encounter errors:
- Check that secrets are set correctly
- Verify the resume file exists in storage
- Ensure OpenAI API key is valid and has credits
- Check function logs in Supabase dashboard

