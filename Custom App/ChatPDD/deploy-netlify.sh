#!/bin/bash

# ChatPDD Netlify Deployment Script

echo "🚀 Starting ChatPDD deployment to Netlify..."

# Check if netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Build the application
echo "📦 Building application..."
pnpm install
pnpm run db:generate
pnpm run build

# Deploy to Netlify
echo "🌐 Deploying to Netlify..."
netlify deploy --build --prod

echo "✅ Deployment complete!"
echo ""
echo "🔧 Don't forget to add these environment variables in your Netlify dashboard:"
echo "   - DATABASE_URL"
echo "   - NEXTAUTH_SECRET=jKj4DEypxen86WSdsZMxW62qRx6YmxjfxyVoD8Tsbjo="
echo "   - NEXTAUTH_URL=https://your-netlify-site.netlify.app"
echo "   - NODE_ENV=production"
echo "   - NODE_VERSION=18"
echo ""
echo "🧮 Your Carbon Verification Calculator will be available at:"
echo "   https://your-netlify-site.netlify.app/carbon-verification"
