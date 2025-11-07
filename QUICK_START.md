# Quick Start Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Start the Server

**Option A - Using npm:**
```bash
npm start
```

**Option B - Using helper script (Windows):**
Double-click `start-server.bat`

**Option C - Using helper script (Mac/Linux):**
```bash
chmod +x start-server.sh
./start-server.sh
```

## Step 3: Verify Server is Running

You should see in the console:
```
🚀 Server running on http://localhost:3000
✅ Server is ready to accept connections
```

## Step 4: Open the Website

Open your browser and go to:
```
http://localhost:3000
```

**Important:** Always access the site through `http://localhost:3000`, not by opening the HTML file directly!

## Step 5: Test Admin Login

1. Click "Login / Sign Up" button
2. Click "Admin" link
3. Enter credentials:
   - Email: `admin@mastersolis-backend`
   - Password: `admin123`
4. Click "Login"

## Troubleshooting

If you see "Failed to connect to server":

1. ✅ Make sure the server is running (see Step 2)
2. ✅ Check that you're accessing via `http://localhost:3000` (not `file://`)
3. ✅ Verify `/api/health` endpoint works: http://localhost:3000/api/health
4. ✅ Check browser console (F12) for detailed errors
5. ✅ Check server console for request logs

See `TROUBLESHOOTING.md` for more help.

