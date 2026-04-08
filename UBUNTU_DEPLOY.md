# Ubuntu VPS Deployment Guide (1GB RAM)

## Quick Start

### 1. SSH into your Ubuntu VPS

```bash
ssh root@your_server_ip
```

### 2. Clone and Deploy

```bash
cd /tmp
curl -O https://raw.githubusercontent.com/Endemyuon/enricos/main/deploy-ubuntu.sh
chmod +x deploy-ubuntu.sh
./deploy-ubuntu.sh
```

---

## Manual Deployment Steps

If you prefer to deploy manually, follow these steps:

### Step 1: Update System
```bash
sudo apt-get update
sudo apt-get upgrade -y
```

### Step 2: Install Node.js (v22 LTS)
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
npm --version
```

### Step 3: Install Git
```bash
sudo apt-get install -y git
```

### Step 4: Clone Repository
```bash
sudo mkdir -p /var/www/enricos
sudo chown -R $USER:$USER /var/www/enricos
cd /var/www/enricos
git clone https://github.com/Endemyuon/enricos.git .
```

### Step 5: Install Dependencies
```bash
npm ci --production
```

### Step 6: Setup Environment
```bash
cp .env.example .env.local
# Edit .env.local with your values
nano .env.local
```

Example .env.local:
```
RESEND_API_KEY=your_key_here
NEXT_PUBLIC_RECAPTCHA_KEY=your_key_here
RECAPTCHA_SECRET_KEY=your_key_here
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://yourdomain.com
```

### Step 7: Build the App
```bash
npm run build
```

### Step 8: Install PM2 Process Manager
```bash
sudo npm install -g pm2
```

### Step 9: Start the App with PM2
```bash
pm2 start npm --name \"enricos\" -- start
pm2 save
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
```

### Step 10: Setup Nginx Reverse Proxy (Recommended)
```bash
sudo apt-get install -y nginx

# Create nginx config
sudo tee /etc/nginx/sites-available/enricos > /dev/null <<EOF
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\\$host;
        proxy_cache_bypass \\\$http_upgrade;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/enricos /etc/nginx/sites-enabled/

# Test and restart
sudo nginx -t
sudo systemctl restart nginx
```

### Step 11: Setup SSL with Certbot
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 1GB RAM Optimization

For smooth operation on 1GB RAM:

### 1. Enable Swap
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### 2. Configure PM2 Memory Limits
```bash
pm2 start npm --name "enricos" -- start --max-memory-restart 512M
```

### 3. Monitor Resources
```bash
pm2 monit
```

---

## Maintenance

### View Logs
```bash
pm2 logs enricos
```

### Restart App
```bash
pm2 restart enricos
```

### Update Code
```bash
cd /var/www/enricos
git pull origin main
npm ci --production
npm run build
pm2 restart enricos
```

### Database Backup
```bash
# BackupSQLite databases
cp -r /var/www/enricos/data /var/www/enricos/data.backup.$(date +%Y%m%d)
```

---

## Troubleshooting

### App won't start
```bash
pm2 logs enricos
```

### Port 3000 already in use
```bash
lsof -i :3000
kill -9 <PID>
```

### Nginx not forwarding
```bash
sudo nginx -t
sudo systemctl restart nginx
```

### Database permission errors
```bash
chmod -R 755 /var/www/enricos/data
```

---

## Monitoring

Setup monitoring with:

```bash
# CPU/Memory usage
pm2 monit

# Real-time logs
pm2 logs enricos --lines 100 --raw

# Status check
pm2 status
```
