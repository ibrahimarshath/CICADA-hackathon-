# Jobs and Applications Setup Guide

## Database Setup

### 1. Run the Jobs Schema

Execute the SQL in `supabase-jobs-schema.sql` in your Supabase SQL Editor:

```sql
-- This creates:
-- - jobs table (for job listings)
-- - applications table (for job applications)
-- - Sample job data
```

### 2. Create Storage Bucket

Follow the instructions in `STORAGE_SETUP.md` to create the `resumes` storage bucket.

## Pages Created

### 1. `jobs.html`
- Lists all open job positions
- Fetches jobs from Supabase `jobs` table
- Displays jobs in cards matching your website design
- Each job has an "Apply Now" button linking to `job.html?id={jobId}`

### 2. `job.html`
- Shows detailed job information
- Displays job description, requirements, responsibilities, and skills
- Includes application form with:
  - Name (required)
  - Email (required)
  - Phone (optional)
  - Resume upload (required, PDF/DOC/DOCX, max 5MB)
  - Cover letter (optional)

## Application Flow

When a user submits an application:

1. **File Upload**: Resume is uploaded to Supabase Storage at `resumes/{userId}/{jobId}/{timestamp}.{ext}`
2. **Database Insert**: Application record is created in `applications` table
3. **Email Confirmation**: Edge function `send-application-confirmation` is called to send email
4. **Success Message**: Toast notification confirms submission

## File Structure

```
resumes/
  └── {userId}/          # User ID or "anonymous-{timestamp}"
      └── {jobId}/       # Job ID
          └── {timestamp}.{ext}  # Resume file
```

## Testing

1. **Create Jobs**: Add jobs via Supabase dashboard or SQL
2. **View Jobs**: Navigate to `jobs.html`
3. **View Job Details**: Click "Apply Now" on any job
4. **Submit Application**: Fill form and upload resume
5. **Check Storage**: Verify resume in Supabase Storage
6. **Check Database**: Verify application in `applications` table
7. **Check Email**: Verify confirmation email was sent

## API Endpoints Used

- **Supabase Storage**: `supabase.storage.from('resumes').upload()`
- **Supabase Database**: `supabase.from('applications').insert()`
- **Edge Function**: `https://jqxaufurcholgqwskybi.supabase.co/functions/v1/send-application-confirmation`

## Troubleshooting

### Jobs Not Showing
- Check `jobs` table exists and has data
- Verify `status = 'open'` for jobs you want to display
- Check browser console for errors

### Resume Upload Fails
- Verify `resumes` storage bucket exists (see STORAGE_SETUP.md)
- Check file size (max 5MB)
- Verify file type (PDF, DOC, DOCX only)
- Check storage bucket permissions

### Email Not Sending
- Verify edge function is deployed
- Check Resend API key is set
- Check function logs: `supabase functions logs send-application-confirmation`
- Email failure won't block application submission

### Application Not Saving
- Check `applications` table exists
- Verify foreign key relationship with `jobs` table
- Check browser console for database errors

