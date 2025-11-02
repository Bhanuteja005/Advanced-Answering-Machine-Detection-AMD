#!/bin/bash

# AMD Demo Setup Script
# This script sets up the environment, starts services, and opens the browser

set -e

echo "🚀 AMD Demo Setup"
echo "=================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "   Please copy .env.example to .env and fill in your credentials:"
    echo "   cp .env.example .env"
    exit 1
fi

echo "✓ .env file found"

# Start Docker Compose for Postgres
echo ""
echo "📦 Starting PostgreSQL with Docker Compose..."
docker-compose up -d

# Wait for Postgres to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Generate Prisma Client
echo ""
echo "🔧 Generating Prisma Client..."
npm run db:generate

# Run migrations
echo ""
echo "🗄️  Running database migrations..."
npm run db:push

# Seed database
echo ""
echo "🌱 Seeding database with test data..."
npm run db:seed

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📥 Installing dependencies..."
    npm install
fi

# Start Next.js dev server in background
echo ""
echo "🌐 Starting Next.js development server..."
npm run dev &
NEXTJS_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 5

# Open browser
echo ""
echo "🌍 Opening browser..."
if command -v xdg-open > /dev/null; then
    xdg-open http://localhost:3000
elif command -v open > /dev/null; then
    open http://localhost:3000
elif command -v start > /dev/null; then
    start http://localhost:3000
else
    echo "   Please open http://localhost:3000 in your browser"
fi

echo ""
echo "✅ Demo setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Sign up with email: test@example.com (or any email)"
echo "   2. Navigate to the Dial page"
echo "   3. Enter a phone number and select a strategy"
echo "   4. View call history and results"
echo ""
echo "🛠️  Useful commands:"
echo "   - Stop Next.js: kill $NEXTJS_PID"
echo "   - Stop Postgres: docker-compose down"
echo "   - View logs: docker-compose logs -f"
echo ""
echo "Press Ctrl+C to stop the dev server"

# Wait for user to stop
wait $NEXTJS_PID
