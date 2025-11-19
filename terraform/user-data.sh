#!/bin/bash
set -e

# Update system
apt-get update
apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker ubuntu

# Install Docker Compose plugin
apt-get install -y docker-compose-plugin

# Clone repository
mkdir -p /home/ubuntu/app
cd /home/ubuntu/app
git clone ${repo_url} .

# Set ownership
chown -R ubuntu:ubuntu /home/ubuntu/app

# Start the application
cd /home/ubuntu/app
docker compose up -d

# Setup auto-start on reboot
cat > /etc/systemd/system/multitenant-app.service <<'EOF'
[Unit]
Description=Multitenant App
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ubuntu/app
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
User=ubuntu

[Install]
WantedBy=multi-user.target
EOF

systemctl enable multitenant-app.service

echo "✅ Setup complete!"
