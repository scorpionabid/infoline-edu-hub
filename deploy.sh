#!/bin/bash
# İnfoLine Production Deployment Script

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

PROJECT_NAME="infoline-edu-hub"

print_status "Starting İnfoLine deployment..."

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    print_error "Docker is not running"
    exit 1
fi

# Create necessary directories
mkdir -p logs ssl

# Copy production environment if exists
if [ -f ".env.production.template" ] && [ ! -f ".env.production" ]; then
    cp .env.production.template .env.production
    print_warning "Please update .env.production with actual values"
fi

# Stop existing containers
if docker ps | grep -q "$PROJECT_NAME"; then
    print_status "Stopping existing containers..."
    docker compose -f docker-compose.prod.yml down
fi

# Build and start
print_status "Building and starting containers..."
docker compose -f docker-compose.prod.yml up --build -d

# Wait for health check
print_status "Waiting for application to start..."
sleep 30

# Verify deployment
if curl -f http://localhost:3000/health >/dev/null 2>&1; then
    print_status "Deployment successful!"
    print_status "Application URL: http://$(hostname -I | awk '{print $1}'):3000"
else
    print_error "Deployment failed - health check failed"
    docker compose -f docker-compose.prod.yml logs
    exit 1
fi