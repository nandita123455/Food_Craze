# Production Deployment Guide - Desktop as Public Server

## 🌍 Make Your Desktop Publicly Accessible

There are several ways to expose your local server to the internet. I'll show you the **easiest and recommended** methods.

---

## Option 1: ngrok (Recommended - Easiest)

### What is ngrok?
- Creates a secure tunnel from public internet to your localhost
- Free tier available with HTTPS
- No router configuration needed
- Works behind any firewall

### Setup Steps

#### 1. Download and Install ngrok
```bash
# Download from: https://ngrok.com/download
# Or use Chocolatey (Windows)
choco install ngrok
```

#### 2. Sign up for free account
- Go to https://ngrok.com/signup
- Get your auth token

#### 3. Configure ngrok
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

#### 4. Start ngrok tunnels
You need to expose 3 services:

**Terminal 1 - Frontend (Port 5173)**
```bash
ngrok http 5173
```

**Terminal 2 - Backend API (Port 5000)**
```bash
ngrok http 5000
```

**Terminal 3 - Recommendation Service (Port 8001)**
```bash
ngrok http 8001
```

You'll get URLs like:
```
Frontend:      https://abc123.ngrok-free.app
Backend:       https://def456.ngrok-free.app  
Recommendations: https://ghi789.ngrok-free.app
```

#### 5. Update Environment Variables

**Frontend (.env)**
```env
VITE_API_URL=https://def456.ngrok-free.app/api
VITE_RECOMMENDATION_API_URL=https://ghi789.ngrok-free.app
```

**Backend (.env)**
```env
CLIENT_URL=https://abc123.ngrok-free.app
```

**Python Service (.env)**
```env
NODE_BACKEND_URL=https://def456.ngrok-free.app
```

#### 6. Rebuild and Restart
```bash
# Frontend
cd EverestMart/myshop
npm run build
npm run preview  # Use preview instead of dev for production

# Backend & Python - just restart them
```

#### 7. Share Your Link!
Give people the frontend URL: `https://abc123.ngrok-free.app`

### ⚠️ ngrok Free Limitations
- URLs change every time you restart (use paid plan for static URLs)
- Limited to 3 tunnels at once (upgrade to Pro)
- Session timeout after 8 hours
- Some visitors might see ngrok warning page

---

## Option 2: Serveo (100% Free Alternative)

### What is Serveo?
- SSH-based tunneling
- No installation required
- Completely free
- No registration needed

### Setup Steps

**Terminal 1 - Frontend**
```bash
ssh -R 80:localhost:5173 serveo.net
```

**Terminal 2 - Backend**
```bash
ssh -R 80:localhost:5000 serveo.net
```

**Terminal 3 - Recommendations**
```bash
ssh -R 80:localhost:8001 serveo.net
```

You'll get URLs displayed in the terminal. Update your .env files accordingly.

---

## Option 3: Cloudflare Tunnel (Best for Production)

### Setup Steps

#### 1. Install Cloudflare Tunnel
```bash
# Download from: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/
```

#### 2. Login
```bash
cloudflared tunnel login
```

#### 3. Create Tunnel
```bash
cloudflared tunnel create everestmart
```

#### 4. Create config file
Create `config.yml`:
```yaml
tunnel: everestmart
credentials-file: C:/Users/YOUR_USER/.cloudflared/UUID.json

ingress:
  - hostname: everestmart.yourdomain.com
    service: http://localhost:5173
  - hostname: api.everestmart.yourdomain.com
    service: ${import.meta.env.VITE_API_URL || 'http://localhost:5000'}
  - hostname: ml.everestmart.yourdomain.com
    service: http://localhost:8001
  - service: http_status:404
```

#### 5. Run tunnel
```bash
cloudflared tunnel run everestmart
```

---

## Option 4: Port Forwarding (Advanced - Permanent)

### Requirements
- Static public IP or Dynamic DNS service
- Router admin access
- Domain name (optional but recommended)

### Setup Steps

#### 1. Find Your Local IP
```bash
ipconfig
# Look for IPv4 Address (e.g., 192.168.1.100)
```

#### 2. Configure Router Port Forwarding
Login to your router (usually 192.168.1.1 or 192.168.0.1):

Forward these ports:
```
External Port 80 → Internal 192.168.1.100:5173 (Frontend)
External Port 5000 → Internal 192.168.1.100:5000 (Backend)
External Port 8001 → Internal 192.168.1.100:8001 (ML Service)
```

#### 3. Get Your Public IP
```bash
curl ifconfig.me
```

#### 4. Setup Dynamic DNS (if no static IP)
Use services like:
- No-IP (https://www.noip.com/)
- DuckDNS (https://www.duckdns.org/)
- Dynu (https://www.dynu.com/)

Example with DuckDNS:
1. Create account
2. Get subdomain: `everestmart.duckdns.org`
3. Install DuckDNS client to keep IP updated

#### 5. Setup HTTPS with Let's Encrypt
```bash
# Install Certbot
choco install certbot

# Get certificate
certbot certonly --standalone -d everestmart.duckdns.org
```

#### 6. Use Nginx as Reverse Proxy
Install Nginx, create config:
```nginx
server {
    listen 80;
    server_name everestmart.duckdns.org;
    
    location / {
        proxy_pass http://localhost:5173;
    }
    
    location /api {
        proxy_pass ${import.meta.env.VITE_API_URL || 'http://localhost:5000'};
    }
    
    location /ml {
        proxy_pass http://localhost:8001;
        rewrite ^/ml/(.*) /$1 break;
    }
}
```

---

## 🚀 Production-Ready Checklist

### Backend Configuration

**server.js**
```javascript
const isDevelopment = process.env.NODE_ENV !== 'production';

// Update CORS
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://abc123.ngrok-free.app', // Your ngrok URL
];
```

**package.json** (add production scripts)
```json
{
  "scripts": {
    "start:prod": "NODE_ENV=production node server.js",
    "build": "echo 'Backend ready for production'"
  }
}
```

### Frontend Configuration

**Build for Production**
```bash
cd EverestMart/myshop
npm run build
```

**Serve Production Build**
```bash
# Option 1: Use Vite preview
npm run preview

# Option 2: Use serve
npm install -g serve
serve -s dist -p 5173
```

### Python Service

**production.py** (create this file)
```python
import uvicorn
from app import app

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8001,
        log_level="info",
        access_log=True
    )
```

Run in production:
```bash
python production.py
```

Or use Gunicorn:
```bash
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app:app --bind 0.0.0.0:8001
```

---

## 📊 Start All Services for Production

### Create Start Script

**start-all.bat** (Windows)
```batch
@echo off
echo Starting EverestMart Production Server...

start cmd /k "cd /d C:\Users\drago\OneDrive\Desktop\EverestMart\Everestmart\myshop-backend && npm run start:prod"
timeout /t 3

start cmd /k "cd /d C:\Users\drago\OneDrive\Desktop\EverestMart\recommendation-service && python app.py"
timeout /t 3

start cmd /k "cd /d C:\Users\drago\OneDrive\Desktop\EverestMart\EverestMart\myshop && npm run preview"
timeout /t 3

echo All services started!
echo.
echo Frontend: http://localhost:5173
echo Backend: ${import.meta.env.VITE_API_URL || 'http://localhost:5000'}
echo ML Service: http://localhost:8001
echo.
echo Starting ngrok tunnels...

start cmd /k "ngrok http 5173"
start cmd /k "ngrok http 5000"
start cmd /k "ngrok http 8001"

pause
```

### Start All Services
```bash
./start-all.bat
```

---

## 🌐 Quick Start with ngrok (Recommended)

### Step-by-Step

1. **Install ngrok**
   ```bash
   # Download from ngrok.com or:
   choco install ngrok
   ```

2. **Start Your Services** (use your existing terminals)
   - Frontend: Already running on 5173
   - Backend: Already running on 5000
   - Python: Already running on 8001

3. **Open 3 NEW Terminals for ngrok**
   ```bash
   # Terminal A
   ngrok http 5173
   
   # Terminal B
   ngrok http 5000
   
   # Terminal C
   ngrok http 8001
   ```

4. **Copy the HTTPS URLs** from each terminal

5. **Update Your .env Files** with the ngrok URLs

6. **Restart Frontend** (to pick up new env variables)
   ```bash
   # In frontend terminal: Ctrl+C to stop
   npm run dev
   ```

7. **Share the Frontend ngrok URL** with anyone!

---

## 🔒 Security Considerations

### Before Going Public

1. **Environment Variables**
   - Never commit .env files
   - Use strong MongoDB passwords
   - Change default secrets

2. **Rate Limiting**
   - Already configured in backend
   - Consider adding nginx rate limiting

3. **HTTPS**
   - ngrok provides HTTPS automatically
   - For port forwarding, use Let's Encrypt

4. **MongoDB**
   ```bash
   # Secure MongoDB
   # Enable authentication
   # Bind to localhost only (unless remote DB)
   ```

5. **Firewall**
   ```bash
   # Windows Firewall - only allow needed ports
   # If using port forwarding, be very careful
   ```

6. **Regular Updates**
   ```bash
   # Keep dependencies updated
   npm audit fix
   pip install --upgrade -r requirements.txt
   ```

---

## 📱 Testing Public Access

1. **Get your public URL** (from ngrok/serveo)
2. **Open on phone** (using mobile data, not WiFi)
3. **Share with friends** and test

### Expected Behavior
- ✅ Homepage loads
- ✅ Can browse products
- ✅ Can add to cart
- ✅ Can see recommendations
- ✅ Can place orders

---

## 🎯 Recommended Setup (Easiest)

For quick deployment right now:

```bash
# 1. Install ngrok
choco install ngrok

# 2. Your services are already running, so just start ngrok:

# New Terminal 1:
ngrok http 5173

# New Terminal 2:
ngrok http 5000

# New Terminal 3:
ngrok http 8001

# 3. Copy the HTTPS URLs and update .env files
# 4. Restart frontend
# 5. Share the frontend URL!
```

**That's it! Your app is now publicly accessible!**

---

## 💡 Tips

- **Free ngrok** URLs change on restart - save them somewhere
- **Paid ngrok** ($8/month) gives permanent URLs
- **For 24/7 hosting**, consider a cheap VPS ($5/month)
- **Keep your PC running** as long as you want the site available
- **Monitor MongoDB** disk space if getting lots of traffic

---

## 🆘 Troubleshooting

**ngrok shows "Tunnel not found"**
- Check you're logged in: `ngrok config add-authtoken TOKEN`

**CORS errors**
- Update backend CORS to include ngrok URLs

**Services won't start**
- Check ports aren't in use: `netstat -ano | findstr :5173`

**Can't access from phone**
- Make sure using ngrok HTTPS URL, not localhost
- Try incognito mode to avoid cache

---

## Next Steps

1. Try ngrok first (easiest)
2. If you like it, consider ngrok Pro ($8/month) for:
   - Custom domains
   - Reserved URLs
   - More concurrent tunnels
3. Or setup Cloudflare Tunnel for free permanent solution
4. Eventually consider VPS hosting for 24/7 uptime
