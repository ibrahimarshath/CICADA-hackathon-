# Supabase Edge Function Setup Guide

## Send Application Confirmation Email Function

This guide will help you set up and deploy the `send-application-confirmation` Edge Function that sends confirmation emails to job applicants using Resend API.

## Prerequisites

1. **Supabase CLI** installed
   ```bash
   npm install -g supabase
   ```

2. **Resend API Key**
   - Sign up at [resend.com](https://resend.com)
   - Get your API key from the dashboard
   - Verify your domain (or use Resend's test domain)

3. **Supabase Project**
   - Make sure you're logged in: `supabase login`
   - Link your project: `supabase link --project-ref your-project-ref`

## Setup Steps

### 1. Initialize Supabase (if not already done)

```bash
supabase init
```

### 2. Create the Function

The function is already created in `supabase/functions/send-application-confirmation/index.ts`

### 3. Set Secrets

Set your Resend API key and from email address:

```bash
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx FROM_EMAIL=careers@mastersolis.com
```

**Note:** Replace `re_xxxxxxxxxxxxx` with your actual Resend API key.

### 4. Deploy the Function

```bash
supabase functions deploy send-application-confirmation
```

### 5. Test the Function

You can test the function using curl or from your application:

```bash
curl -X POST \
  'https://your-project-ref.supabase.co/functions/v1/send-application-confirmation' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "applicationData": {
      "name": "John Doe",
      "email": "john@example.com",
      "position": "Senior Full-Stack Developer",
      "phone": "+1234567890",
      "experience": "5+ years",
      "skills": "React, Node.js, AWS"
    }
  }'
```

## Function Usage

### From Your Application

```javascript
// Example: Call the function after submitting a job application
async function submitApplication(applicationData) {
  const response = await fetch(
    'https://your-project-ref.supabase.co/functions/v1/send-application-confirmation',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ applicationData }),
    }
  );

  const result = await response.json();
  
  if (result.success) {
    console.log('Confirmation email sent!');
  } else {
    console.error('Failed to send email:', result.error);
  }
}
```

### Required Fields

- `name` (string) - Applicant's full name
- `email` (string) - Applicant's email address
- `position` (string) - Job position applied for

### Optional Fields

- `phone` (string) - Applicant's phone number
- `resume_url` (string) - URL to uploaded resume
- `cover_letter` (string) - Cover letter text
- `experience` (string) - Years of experience
- `skills` (string) - Relevant skills

## Email Template

The function sends a beautifully formatted HTML email that includes:
- Company branding with gradient header
- Application confirmation message
- Application details summary
- Next steps information
- Professional footer

## Troubleshooting

### Function Not Deploying

1. Check that you're in the project root directory
2. Verify Supabase CLI is installed: `supabase --version`
3. Ensure you're logged in: `supabase login`
4. Check project link: `supabase projects list`

### Email Not Sending

1. Verify Resend API key is correct: `supabase secrets list`
2. Check Resend dashboard for API usage and errors
3. Verify FROM_EMAIL is a verified domain in Resend
4. Check function logs: `supabase functions logs send-application-confirmation`

### CORS Issues

The function includes CORS headers. If you still encounter issues:
- Verify the function URL is correct
- Check that Authorization header is included
- Ensure Content-Type is set to application/json

## Security Notes

- Never commit your Resend API key to version control
- Use Supabase secrets for sensitive data
- The function uses `verify_jwt = false` for public access - consider adding authentication if needed
- Rate limiting should be implemented in production

## Updating the Function

After making changes to `supabase/functions/send-application-confirmation/index.ts`:

```bash
supabase functions deploy send-application-confirmation
```

## Monitoring

View function logs:
```bash
supabase functions logs send-application-confirmation
```

View in real-time:
```bash
supabase functions logs send-application-confirmation --follow
```

