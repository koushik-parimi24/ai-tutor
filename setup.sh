#!/bin/bash

# AI Tutor Frontend Setup Script
echo "🚀 Setting up AI Tutor Frontend..."

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

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📄 Creating .env file..."
    cp env.example .env
    echo "⚠️  Please update the .env file with your Supabase credentials"
else
    echo "✅ .env file already exists"
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p public/images
mkdir -p src/assets

echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update your .env file with Supabase credentials:"
echo "   - VITE_SUPABASE_URL=your-supabase-project-url"
echo "   - VITE_SUPABASE_KEY=your-supabase-anon-key"
echo "   - VITE_API_BASE_URL=your-backend-api-url (optional)"
echo ""
echo "2. Start the development server:"
echo "   npm run dev"
echo ""
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "🎉 Happy coding!"
