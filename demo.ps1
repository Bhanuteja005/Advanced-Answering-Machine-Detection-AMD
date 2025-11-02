# AMD Demo Setup Script for Windows PowerShell
# This script sets up the environment, starts services, and opens the browser

Write-Host "🚀 AMD Demo Setup" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "   Please copy .env.example to .env and fill in your credentials:" -ForegroundColor Yellow
    Write-Host "   Copy-Item .env.example .env" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ .env file found" -ForegroundColor Green

# Start Docker Compose for Postgres
Write-Host ""
Write-Host "📦 Starting PostgreSQL with Docker Compose..." -ForegroundColor Cyan
docker-compose up -d

# Wait for Postgres to be ready
Write-Host "⏳ Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Generate Prisma Client
Write-Host ""
Write-Host "🔧 Generating Prisma Client..." -ForegroundColor Cyan
npm run db:generate

# Run migrations
Write-Host ""
Write-Host "🗄️  Running database migrations..." -ForegroundColor Cyan
npm run db:push

# Seed database
Write-Host ""
Write-Host "🌱 Seeding database with test data..." -ForegroundColor Cyan
npm run db:seed

# Install dependencies if node_modules doesn't exist
if (-not (Test-Path node_modules)) {
    Write-Host ""
    Write-Host "📥 Installing dependencies..." -ForegroundColor Cyan
    npm install
}

# Start Next.js dev server in background
Write-Host ""
Write-Host "🌐 Starting Next.js development server..." -ForegroundColor Cyan
$job = Start-Job -ScriptBlock { npm run dev }

# Wait for server to start
Write-Host "⏳ Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Open browser
Write-Host ""
Write-Host "🌍 Opening browser..." -ForegroundColor Cyan
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "✅ Demo setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Sign up with email: test@example.com (or any email)"
Write-Host "   2. Navigate to the Dial page"
Write-Host "   3. Enter a phone number and select a strategy"
Write-Host "   4. View call history and results"
Write-Host ""
Write-Host "🛠️  Useful commands:" -ForegroundColor Cyan
Write-Host "   - Stop Next.js: Stop-Job $($job.Id); Remove-Job $($job.Id)"
Write-Host "   - Stop Postgres: docker-compose down"
Write-Host "   - View logs: docker-compose logs -f"
Write-Host ""
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow

# Keep the script running
try {
    Wait-Job $job
} finally {
    Stop-Job $job -ErrorAction SilentlyContinue
    Remove-Job $job -ErrorAction SilentlyContinue
}
