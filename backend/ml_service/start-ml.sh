#!/bin/bash

# HealSync ML Service Startup Script
# Automatically handles port conflicts

PORT=8000

echo "🚀 Starting HealSync ML Service..."

# Check if port is in use
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port $PORT is already in use"
    echo "🔧 Killing existing process..."
    lsof -ti:$PORT | xargs kill -9 2>/dev/null
    sleep 2
    echo "✅ Port $PORT is now free"
fi

# Activate virtual environment and start service
echo "🎯 Starting ML service on port $PORT..."

# Check if venv exists
if [ ! -d ".venv" ]; then
    echo "⚠️  Virtual environment not found. Creating..."
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
else
    source .venv/bin/activate
fi

# Start the service
python main.py

