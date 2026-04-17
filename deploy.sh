#!/bin/bash

echo "🚀 Starting Deployment..."

# Kill everything on port 3000
echo "⏹️  Clearing port 3000..."
sudo killall -9 node 2>/dev/null || true
sleep 2

# Navigate to project directory
cd "$(dirname "$0")"

# Force discard local database changes
echo "📦 Discarding local database file changes..."
git checkout -- data/enricos.sqlite-shm 2>/dev/null || true
git checkout -- data/enricos.sqlite-wal 2>/dev/null || true
git reset --hard HEAD

# Pull latest code
echo "📥 Pulling from GitHub..."
git pull origin main --force

# Install dependencies
echo "📦 Installing packages..."
npm install --legacy-peer-deps

# Build
echo "🔨 Building..."
npm run build

# Start the app
echo "✅ Starting application on port 3000..."
nohup npm start > deployment.log 2>&1 &

# Wait for startup
sleep 5

# Check if it's running
if sudo lsof -i :3000 > /dev/null 2>&1; then
    echo "✅ SUCCESS! App is running at https://enricos.shop"
    ps aux | grep "npm start"
else
    echo "❌ FAILED! Check the log:"
    cat deployment.log
    exit 1
fi
