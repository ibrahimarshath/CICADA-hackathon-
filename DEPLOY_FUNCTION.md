# Quick Deploy Guide - Send Application Confirmation Function

## Step-by-Step Commands

### 1. Initialize Supabase (if not already done)
```bash
supabase init
```

### 2. Login to Supabase (if not already logged in)
```bash
supabase login
```

### 3. Link Your Project
```bash
supabase link --project-ref jqxaufurcholgqwskybi
```

### 4. Create the Function
```bash
supabase functions new send-application-confirmation
```
*(Note: The function code is already in `supabase/functions/send-application-confirmation/index.ts`)*

### 5. Set Secrets
```bash
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx FROM_EMAIL=careers@mastersolis.com
```
**Replace `re_xxxxxxxxxxxxx` with your actual Resend API key**

### 6. Deploy the Function
```bash
supabase functions deploy send-application-confirmation
```

## Verify Deployment

Check function logs:
```bash
supabase functions logs send-application-confirmation
```

## Function Endpoint

After deployment, your function will be available at:
```
https://jqxaufurcholgqwskybi.supabase.co/functions/v1/send-application-confirmation
```

## Test the Function

```bash
curl -X POST \
  'https://jqxaufurcholgqwskybi.supabase.co/functions/v1/send-application-confirmation' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "applicationData": {
      "name": "John Doe",
      "email": "john@example.com",
      "position": "Senior Full-Stack Developer",
      "phone": "+1234567890"
    }
  }'
```

## Get Your Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Go to API Keys section
3. Create a new API key
4. Copy the key (starts with `re_`)

## Important Notes

- Make sure your FROM_EMAIL domain is verified in Resend
- The function uses your Supabase project's anon key for authentication
- Check function logs if emails aren't sending

