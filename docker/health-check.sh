#!/bin/bash
# Health check script for Docker container

# Check if nginx is running
if ! pgrep nginx > /dev/null; then
    echo "Nginx is not running"
    exit 1
fi

# Check if the application responds
if ! curl -f http://localhost:8080/health >/dev/null 2>&1; then
    echo "Application is not responding"
    exit 1
fi

echo "Application is healthy"
exit 0