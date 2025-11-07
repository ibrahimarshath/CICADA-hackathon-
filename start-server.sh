#!/bin/bash

echo "Starting Mastersolis Backend Server..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo ""
fi

echo "Starting server on http://localhost:3000"
echo "Press Ctrl+C to stop the server"
echo ""

node server.js

