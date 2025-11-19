#!/bin/bash
set -e

# Get server IP from terraform
cd terraform
SERVER_IP=$(terraform output -raw public_ip 2>/dev/null)
SSH_KEY="~/.ssh/restgen.pem"

if [ -z "$SERVER_IP" ]; then
  echo "❌ Could not get server IP from terraform"
  echo "Run 'cd terraform && terraform output' to check"
  exit 1
fi

echo "🚀 Deploying to $SERVER_IP..."

# Deploy to server
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no ubuntu@"$SERVER_IP" << 'ENDSSH'
cd ~/app
echo "📥 Pulling latest changes..."
git pull

echo "🐳 Building and starting containers..."
docker compose up -d --build

echo "🧹 Cleaning up old images..."
docker image prune -f

echo "✅ Deployment complete!"
docker compose ps
ENDSSH

echo "🎉 Done! App is live at http://$SERVER_IP:3000"
