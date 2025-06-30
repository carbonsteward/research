#!/bin/bash

# ChatPDD Clean Repository Netlify Deployment Script

echo "🚀 Deploying ChatPDD Carbon Verification Calculator to Netlify..."
echo "📂 Repository: carbonsteward/ChatPDD-Clean"

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production file not found. Please create it first."
    exit 1
fi

# Deploy to Netlify and create site if needed
echo "📦 Creating Netlify site and deploying..."
netlify deploy --build --prod --dir=.next

# Get the site URL from deployment
SITE_URL=$(netlify status --json | grep -o '"url":"[^"]*"' | head -1 | cut -d'"' -f4)

echo "🔧 Setting environment variables..."

# Read .env.production and set each variable
while IFS='=' read -r key value; do
    # Skip comments and empty lines
    if [[ ! $key =~ ^#.*$ ]] && [[ -n $key ]]; then
        # Remove any quotes from value
        value=$(echo "$value" | sed 's/^"//;s/"$//')

        # Replace placeholder URLs with actual site URL
        if [[ $value == *"your-netlify-site.netlify.app"* ]]; then
            value=${value//your-netlify-site.netlify.app/${SITE_URL#https://}}
        fi

        echo "Setting $key..."
        netlify env:set "$key" "$value"
    fi
done < .env.production

echo "✅ Deployment complete!"
echo "🌐 Your site is available at: $SITE_URL"
echo "🧮 Carbon Verification Calculator: $SITE_URL/carbon-verification"
echo "📂 Repository: https://github.com/carbonsteward/ChatPDD-Clean"
