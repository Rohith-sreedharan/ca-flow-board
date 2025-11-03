#!/bin/bash

# CA Flow Board - Production CORS Setup Script
# Run this on your Ubuntu production server

set -e

echo "🚀 CA Flow Board - Production CORS Configuration"
echo "================================================="
echo ""

# Get server IP
SERVER_IP=$(hostname -I | awk '{print $1}')
echo "📍 Detected Server IP: $SERVER_IP"
echo ""

# Ask for confirmation or custom IP
read -p "Is this the correct IP address? (y/n): " confirm
if [ "$confirm" != "y" ]; then
    read -p "Enter your server IP or domain: " SERVER_IP
fi

echo ""
echo "🔧 Configuring for: $SERVER_IP"
echo ""

# Update .env file
ENV_FILE=".env"

if [ -f "$ENV_FILE" ]; then
    echo "📝 Backing up existing .env to .env.backup..."
    cp $ENV_FILE "${ENV_FILE}.backup"
    
    # Update or add CORS configuration
    echo ""
    echo "✏️  Updating environment variables..."
    
    # Function to update or add env variable
    update_env() {
        local key=$1
        local value=$2
        if grep -q "^${key}=" "$ENV_FILE"; then
            sed -i "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
            echo "   ✓ Updated $key"
        else
            echo "${key}=${value}" >> "$ENV_FILE"
            echo "   ✓ Added $key"
        fi
    }
    
    # Update production URLs
    update_env "NODE_ENV" "production"
    update_env "FRONTEND_URL" "http://${SERVER_IP}:5173"
    update_env "BACKEND_URL" "http://${SERVER_IP}:3001"
    update_env "CORS_ORIGIN" "http://${SERVER_IP}:5173"
    update_env "VITE_API_URL" "http://${SERVER_IP}:3001/api"
    update_env "VITE_API_BASE_URL" "http://${SERVER_IP}:3001/api"
    
    echo ""
    echo "✅ Environment variables updated!"
else
    echo "❌ Error: .env file not found!"
    exit 1
fi

echo ""
echo "🔥 Configuring firewall..."

# Configure firewall
if command -v ufw &> /dev/null; then
    echo "   Opening port 3001 (Backend)..."
    sudo ufw allow 3001/tcp
    
    echo "   Opening port 5173 (Frontend)..."
    sudo ufw allow 5173/tcp
    
    echo "   Opening port 27017 (MongoDB - local only)..."
    sudo ufw allow from 127.0.0.1 to any port 27017
    
    echo "✅ Firewall configured!"
else
    echo "⚠️  UFW not found, skipping firewall configuration"
fi

echo ""
echo "📦 Installing dependencies..."

# Install backend dependencies
if [ ! -d "backend/node_modules" ]; then
    echo "   Installing backend dependencies..."
    cd backend
    npm install
    cd ..
fi

# Install frontend dependencies
if [ ! -d "node_modules" ]; then
    echo "   Installing frontend dependencies..."
    npm install
fi

echo ""
echo "🧪 Testing MongoDB connection..."

if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.version()" &> /dev/null; then
        echo "✅ MongoDB is running"
    else
        echo "⚠️  MongoDB is not running. Start it with: sudo systemctl start mongod"
    fi
else
    echo "⚠️  mongosh not found. Install MongoDB first."
fi

echo ""
echo "================================================="
echo "✅ CORS Configuration Complete!"
echo "================================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Start MongoDB (if not running):"
echo "   sudo systemctl start mongod"
echo ""
echo "2. Initialize database:"
echo "   cd backend && node init-database.js"
echo ""
echo "3. Start the application:"
echo "   npm run dev"
echo ""
echo "4. Access from browser:"
echo "   http://${SERVER_IP}:5173"
echo ""
echo "5. Test CORS:"
echo "   curl http://${SERVER_IP}:3001/api/health"
echo ""
echo "📚 For more details, see: CORS_CONFIGURATION_GUIDE.md"
echo ""
