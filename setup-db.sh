#!/bin/bash

# Enrico's Restaurant - Database Migration to PostgreSQL
# This script helps you set up PostgreSQL locally for development

echo "🚀 Setting up PostgreSQL locally..."
echo ""
echo "Option 1: Using Docker (Recommended)"
echo "docker run --name enricos-db -e POSTGRES_DB=enricos_db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:latest"
echo ""
echo "Option 2: Using Homebrew (macOS)"
echo "brew install postgresql"
echo "brew services start postgresql"
echo ""
echo "Option 3: Using Windows installer"
echo "Download from: https://www.postgresql.org/download/windows/"
echo ""
echo "After PostgreSQL is running:"
echo "1. Update DATABASE_URL in .env.local with your credentials"
echo "2. Run: npm run db:push"
echo "3. Run: npm run dev"
echo ""
echo "✅ Database setup complete!"
