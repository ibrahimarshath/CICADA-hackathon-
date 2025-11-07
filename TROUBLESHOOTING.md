# Troubleshooting Guide

## "Failed to connect to server" Error

If you're seeing this error, follow these steps:

### 1. Check if the server is running

Open a terminal/command prompt and run:
```bash
npm start
```

You should see:
```
🚀 Server running on http://localhost:3000
✅ Server is ready to accept connections
```

### 2. Verify the server is accessible

Open your browser and go to:
```
http://localhost:3000/api/health
```

You should see:
```json
{
  "status": "ok",
  "message": "Mastersolis Backend API is running",
  "timestamp": "..."
}
```

### 3. Check if port 3000 is already in use

If you get an error like "EADDRINUSE", another process is using port 3000.

**Windows:**
```bash
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

**Mac/Linux:**
```bash
lsof -ti:3000 | xargs kill -9
```

Or change the port in `server.js`:
```javascript
const PORT = process.env.PORT || 3001; // Change to 3001
```

### 4. Install dependencies

If you haven't installed dependencies yet:
```bash
npm install
```

### 5. Check firewall settings

Make sure your firewall isn't blocking port 3000.

### 6. Use the helper scripts

**Windows:** Double-click `start-server.bat`

**Mac/Linux:** 
```bash
chmod +x start-server.sh
./start-server.sh
```

### 7. Common Issues

#### Issue: "Cannot find module"
**Solution:** Run `npm install` to install all dependencies

#### Issue: "EADDRINUSE: address already in use"
**Solution:** Kill the process using port 3000 (see step 3) or change the port

#### Issue: CORS errors in browser console
**Solution:** The server is already configured with CORS. Make sure you're accessing the page through `http://localhost:3000` not `file://`

#### Issue: Still can't connect
**Solution:** 
1. Make sure you're opening `index.html` through the server (http://localhost:3000/index.html), not directly from the file system
2. Check browser console for detailed error messages
3. Verify the server logs show incoming requests

### 8. Test the connection manually

Open browser console (F12) and run:
```javascript
fetch('/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

If this works, the server is running correctly.

## Quick Start Checklist

- [ ] Run `npm install`
- [ ] Run `npm start` (or use helper script)
- [ ] Verify server is running (check console output)
- [ ] Open http://localhost:3000 in browser
- [ ] Test /api/health endpoint
- [ ] Try admin login

