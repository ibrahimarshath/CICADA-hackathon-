# Mastersolis Infotech Backend API

Node.js + Express backend with JWT authentication, Supabase integration, and CRUD APIs.

## Features

- ✅ JWT Authentication for admin login
- ✅ Supabase integration with service key
- ✅ CRUD APIs for homepage, about, and services
- ✅ Contact messages API (fetch from Supabase)

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your configuration (already pre-filled with provided values).

3. **Start the Server**
   ```bash
   npm start
   ```
   For development with auto-reload:
   ```bash
   npm run dev
   ```

   Server will run on `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /api/auth/admin/login` - Admin login
  ```json
  {
    "email": "admin@mastersolis.com",
    "password": "admin123"
  }
  ```
  Response:
  ```json
  {
    "success": true,
    "token": "jwt-token-here",
    "user": {
      "email": "admin@mastersolis.com",
      "role": "admin"
    }
  }
  ```

- `GET /api/auth/verify` - Verify JWT token (requires Authorization header)
  Headers: `Authorization: Bearer <token>`

### Homepage

- `GET /api/homepage` - Get homepage content
- `POST /api/homepage` - Create/Update homepage (requires auth)
- `PUT /api/homepage/:id` - Update homepage (requires auth)
- `DELETE /api/homepage/:id` - Delete homepage (requires auth)

### About

- `GET /api/about` - Get about content
- `POST /api/about` - Create/Update about (requires auth)
- `PUT /api/about/:id` - Update about (requires auth)
- `DELETE /api/about/:id` - Delete about (requires auth)

### Services

- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get single service
- `POST /api/services` - Create service (requires auth)
- `PUT /api/services/:id` - Update service (requires auth)
- `DELETE /api/services/:id` - Delete service (requires auth)

### Contact Messages

- `GET /api/contact-messages` - Get all contact submissions (requires auth)
  Query params: `?page=1&limit=50`
- `GET /api/contact-messages/:id` - Get single message (requires auth)
- `DELETE /api/contact-messages/:id` - Delete message (requires auth)

### Health Check

- `GET /api/health` - Server health check

## Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Supabase Tables

The backend expects the following Supabase tables:

1. **homepage** - Homepage content
2. **about** - About page content
3. **services** - Services data
4. **contact_messages** - Contact form submissions

Make sure these tables exist in your Supabase project with appropriate columns.

## Default Admin Credentials

- Email: `admin@mastersolis.com`
- Password: `admin123`

Change these in production by updating the `.env` file.

## Notes

- The service key provided has full access to Supabase (bypasses RLS)
- JWT tokens expire after 24 hours
- All timestamps are in ISO format
- CORS is enabled for all origins (configure in production)

