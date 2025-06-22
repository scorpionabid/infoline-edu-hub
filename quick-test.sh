#!/bin/bash

# Quick test script to check if changes work
echo "🔧 Quick testing InfoLine changes..."

# Start development server
echo "🚀 Starting development server..."
npm run dev

echo "✅ Development server should be running on http://localhost:8080"
echo "🧪 Please test the following:"
echo "   1. Desktop sidebar stays visible on large screens"
echo "   2. Header icons are smaller (h-4 w-4)"
echo "   3. Language switcher works in header"
echo "   4. Navigation between pages works"
echo "   5. Mobile sidebar opens/closes properly"
