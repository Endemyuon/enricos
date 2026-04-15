#!/bin/bash

# Enrico's Restaurant - One Command Deployment Script
# Usage: ./deploy.sh

echo "🚀 Starting Enrico's Restaurant Deployment..."

# Stop any running processes
echo "⏹️  Stopping previous instances..."
pkill -f "next dev" || true
pkill -f "node" || true
sleep 2

# Pull latest code
echo "📥 Pulling latest code from GitHub..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Start the application
echo "✅ Starting application..."
npm start &

echo "🎉 Deployment complete!"
echo "📍 Application running at: https://enricos.shop"
