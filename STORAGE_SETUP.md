# Supabase Storage Setup for Resumes

## Create Storage Bucket

You need to create a storage bucket named `resumes` in your Supabase project to store uploaded resume files.

### Option 1: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Name: `resumes`
5. **Public bucket**: ✅ Yes (or No if you want private)
6. **File size limit**: 5 MB (recommended)
7. **Allowed MIME types**: 
   - `application/pdf`
   - `application/msword`
   - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
8. Click **Create bucket**

### Option 2: Using SQL

Run this SQL in your Supabase SQL Editor:

```sql
-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes',
  true,
  5242880, -- 5MB in bytes
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies (if bucket is public, this may not be needed)
-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resumes');

-- Allow public read access (if bucket is public)
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'resumes');

-- Allow authenticated users to upload (anonymous users can also upload)
CREATE POLICY "Allow anonymous uploads"
ON storage.objects"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'resumes');
```

### Option 3: Using Supabase CLI

```bash
# Create bucket via CLI (if you have Supabase CLI set up)
supabase storage create resumes --public
```

## Storage Path Structure

Resumes will be stored in the following structure:
```
resumes/
  └── {userId}/
      └── {jobId}/
          └── {timestamp}.{ext}
```

Example:
```
resumes/
  └── anonymous-1234567890/
      └── abc-123-def-456/
          └── 1704123456789.pdf
```

## Security Notes

- If you make the bucket public, anyone with the URL can access resumes
- Consider making it private and using signed URLs for access
- Set appropriate file size limits
- Validate file types on both client and server side
- Consider adding virus scanning for uploaded files in production

## Testing

After creating the bucket, test the upload functionality:

1. Go to `job.html?id=<job-id>`
2. Fill out the application form
3. Upload a test resume file
4. Check Supabase Storage dashboard to verify the file was uploaded

