#!/bin/bash

# Script to build frontend and copy to backend/front-end-build/
# Run this locally before committing

set -e

echo "🏗️  Building frontend..."
cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm ci
fi

# Build frontend
echo "🔨 Building frontend..."
npm run build:rendor

# Go back to root
cd ..

# Remove old frontend build in backend
echo "🗑️  Removing old frontend build..."
rm -rf backend/front-end-build

# Copy new frontend build to backend
echo "📋 Copying frontend build to backend/front-end-build/..."
cp -r frontend/dist backend/front-end-build

echo ""
echo "✅ Frontend built and copied to backend/front-end-build/"
echo ""
echo "📝 Next steps:"
echo "   1. git add backend/front-end-build"
echo "   2. git commit -m 'Update frontend build'"
echo "   3. git push origin main"
echo ""
echo "🚀 Render will deploy the pre-built frontend!"
