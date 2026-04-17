#!/bin/bash

# Enrico's Restaurant - One Command Deployment Script
# Usage: ./deploy.sh

echo "🚀 Starting Enrico's Restaurant Deployment..."

# Stop any running processes
echo "⏹️  Stopping previous instances..."
pkill -f "next dev" || true
pkill -f "npm start" || true
pkill -f "npm run dev" || true
pkill -9 "node" || true

# Force kill anything on port 3000
echo "🔒 Force killing port 3000..."
fuser -k 3000/tcp || true

sleep 3

# Pull latest code
echo "📥 Pulling latest code from GitHub..."
git pull origin main
if [ $? -ne 0 ]; then
    echo "❌ Git pull failed! Check your GitHub connection."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ npm install failed!"
    exit 1
fi

# Build the project
echo "🔨 Building project..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ npm run build failed!"
    exit 1
fi

# Start the application
echo "✅ Starting application..."
npm start &
sleep 2

# Check if process started successfully
if lsof -i :3000 > /dev/null 2>&1; then
    echo "🎉 Deployment complete!"
    echo "📍 Application running at: https://enricos.shop"
else
    echo "❌ Application failed to start on port 3000"
    exit 1
fi
