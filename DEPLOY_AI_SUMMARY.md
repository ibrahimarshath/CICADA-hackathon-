# Deploy AI Summary Edge Function

## Prerequisites

Make sure you have the Supabase CLI installed:

```bash
npm install -g supabase
```

Or install via other methods: https://supabase.com/docs/guides/cli

## Step 1: Set OPENAI_API_KEY Secret

Set the OpenAI API key secret:

```bash
supabase secrets set OPENAI_API_KEY=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
```

## Step 2: Deploy Function

Deploy the ai-summary edge function:

```bash
supabase functions deploy ai-summary
```

## Step 3: Verify Deployment

After deployment, you can test the function by calling it:

```bash
curl -X POST https://jqxaufurcholgqwskybi.supabase.co/functions/v1/ai-summary \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"resume_path": "user/123/job-456/1234567890-resume.pdf", "application_id": "app-id-here"}'
```

## Function Details

The `ai-summary` function:
- **Downloads PDF from storage** (if `resume_path` is provided)
- **Extracts text from PDF** using OpenAI
- **Generates AI summary** using OpenAI GPT-4o
- **Updates application/resume** with the summary (if `application_id` is provided)
- **Returns summary** as JSON

### Request Body Options

```json
{
  "resume_path": "user/123/job-456/1234567890-resume.pdf",  // Optional: Path to resume in storage
  "application_id": "uuid-here",                            // Optional: Application ID to update
  "text": "Resume text content..."                          // Optional: Direct text to summarize
}
```

### Response Format

```json
{
  "success": true,
  "summary": "Concise professional summary highlighting key qualifications, experience, and skills...",
  "generated_at": "2025-01-08T10:00:00Z"
}
```

## Usage Examples

### Generate Summary from Resume Path

```javascript
const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-summary`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    resume_path: 'user/123/job-456/1234567890-resume.pdf',
    application_id: 'application-uuid'
  })
});

const result = await response.json();
console.log(result.summary);
```

### Generate Summary from Text

```javascript
const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-summary`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: 'Resume text content here...',
    application_id: 'application-uuid'
  })
});

const result = await response.json();
console.log(result.summary);
```

## Error Handling

If you encounter errors:
- Check that OPENAI_API_KEY secret is set correctly
- Verify the resume file exists in storage (if using resume_path)
- Ensure OpenAI API key is valid and has credits
- Check function logs in Supabase dashboard

