#!/bin/bash

# Enrico's Restaurant - Ubuntu VPS Deployment Script
# Run this script on your Ubuntu server to deploy the app

set -e

echo "================================"
echo "Enrico's Restaurant - Ubuntu Deploy"
echo "================================"

# Update system
echo "[1/8] Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js (LTS)
echo "[2/8] Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (process manager)
echo "[3/8] Installing PM2..."
sudo npm install -g pm2

# Create app directory
echo "[4/8] Setting up application directory..."
APP_DIR=/var/www/enricos
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# Clone/copy repository
echo "[5/8] Cloning repository..."
if [ -d "$APP_DIR/.git" ]; then
  cd $APP_DIR
  git pull origin main
else
  git clone https://github.com/Endemyuon/enricos.git $APP_DIR
fi

cd $APP_DIR

# Install dependencies
echo "[6/8] Installing dependencies..."
npm ci --production

# Build the Next.js app
echo "[7/8] Building Next.js application..."
npm run build

# Create .env.local (ask for values)
echo "[8/8] Setting up environment variables..."
if [ ! -f .env.local ]; then
  echo "Creating .env.local file..."
  read -p "Enter RESEND_API_KEY: " RESEND_KEY
  read -p "Enter NEXT_PUBLIC_RECAPTCHA_KEY: " RECAPTCHA_PUBLIC
  read -p "Enter RECAPTCHA_SECRET_KEY: " RECAPTCHA_SECRET
  read -p "Enter your domain (e.g., enricos.com): " DOMAIN
  
  cat > .env.local << EOF
RESEND_API_KEY=$RESEND_KEY
NEXT_PUBLIC_RECAPTCHA_KEY=$RECAPTCHA_PUBLIC
RECAPTCHA_SECRET_KEY=$RECAPTCHA_SECRET
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://$DOMAIN
EOF
  
  chmod 600 .env.local
fi

# Setup PM2 startup
echo "Starting with PM2..."
pm2 delete enricos 2>/dev/null || true
pm2 start npm --name "enricos" -- start
pm2 save
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME

# Setup Nginx (optional but recommended)
echo ""
echo "Optional: Setup Nginx Reverse Proxy"
echo "Would you like to setup Nginx? (y/n)"
read -r setup_nginx

if [ "$setup_nginx" = "y" ]; then
  sudo apt-get install -y nginx
  
  # Create Nginx config
  sudo tee /etc/nginx/sites-available/enricos > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
  
  sudo ln -sf /etc/nginx/sites-available/enricos /etc/nginx/sites-enabled/
  sudo nginx -t
  sudo systemctl restart nginx
  
  echo "Nginx configured! Install SSL with: sudo apt install certbot python3-certbot-nginx"
fi

echo ""
echo "================================"
echo "✅ Deployment complete!"
echo "================================"
echo "App running at: http://localhost:3000"
echo "Database location: /var/www/enricos/data/"
echo ""
echo "Useful PM2 commands:"
echo "  pm2 logs enricos          - View logs"
echo "  pm2 restart enricos       - Restart app"
echo "  pm2 stop enricos          - Stop app"
echo "  pm2 delete enricos        - Remove app from PM2"
echo "  pm2 monit                 - Monitor resources"
