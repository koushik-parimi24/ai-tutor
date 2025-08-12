#!/bin/bash

# AI Tutor Backend Startup Script
echo "🚀 Starting AI Tutor Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📄 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please update the .env file with your API keys and credentials"
    echo ""
    echo "Required environment variables:"
    echo "  - OPENAI_API_KEY (for AI features)"
    echo "  - SUPABASE_URL (for storage and vector search)"
    echo "  - SUPABASE_SERVICE_ROLE_KEY (for storage and vector search)"
    echo ""
else
    echo "✅ .env file exists"
fi

# Create uploads directory
mkdir -p uploads

echo "🌟 Setup complete!"
echo ""
echo "To start the server:"
echo "  Development: npm run dev"
echo "  Production:  npm start"
echo ""
echo "API will be available at: http://localhost:5000"
echo "Health check: http://localhost:5000/health"
echo ""

# Ask if user wants to start the server
read -p "Start the development server now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Starting development server..."
    npm run dev
fi
