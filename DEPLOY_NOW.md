# 🌍 Deploy Your Laptop as Public Server - Step by Step Guide

## ✅ What You Need
- Your services are already running (Frontend, Backend, ML)
- 15 minutes of your time
- Internet connection

---

## 🚀 Method 1: ngrok (Recommended - Most Reliable)

### Step 1: Get ngrok Auth Token (2 minutes)

1. **Go to**: https://dashboard.ngrok.com/signup
2. **Sign up** (it's FREE - use Google/GitHub for instant signup)
3. **Copy your authtoken** from: https://dashboard.ngrok.com/get-started/your-authtoken

### Step 2: Configure ngrok

Open a new terminal and run:
```bash
cd c:/Users/drago/OneDrive/Desktop/EverestMart/ngrok
./ngrok.exe config add-authtoken YOUR_AUTH_TOKEN_HERE
```

### Step 3: Start Tunnels

**Terminal 1 - Frontend (THIS IS THE URL YOU'LL SHARE!)**
```bash
cd c:/Users/drago/OneDrive/Desktop/EverestMart/ngrok
./ngrok.exe http 5173
```

**Terminal 2 - Backend API**
```bash
cd c:/Users/drago/OneDrive/Desktop/EverestMart/ngrok
./ngrok.exe http 5000
```

**Terminal 3 - ML Service**
```bash
cd c:/Users/drago/OneDrive/Desktop/EverestMart/ngrok
./ngrok.exe http 8001
```

### Step 4: Copy the URLs

Each ngrok window will show something like:
```
Forwarding   https://abc123.ngrok-free.app -> http://localhost:5173
```

**Copy these HTTPS URLs:**
- Frontend: `https://[something].ngrok-free.app` ← **SHARE THIS ONE!**
- Backend: `https://[something].ngrok-free.app`
- ML Service: `https://[something].ngrok-free.app`

### Step 5: Update Environment Variables

**Frontend: `EverestMart/myshop/.env`**
```env
VITE_API_URL=https://YOUR-BACKEND-URL.ngrok-free.app/api
VITE_RECOMMENDATION_API_URL=https://YOUR-ML-URL.ngrok-free.app
```

**Backend: `Everestmart/myshop-backend/.env`**
```env
CLIENT_URL=https://YOUR-FRONTEND-URL.ngrok-free.app
ADMIN_URL=https://YOUR-FRONTEND-URL.ngrok-free.app
```

### Step 6: Restart Frontend

```bash
# In your frontend terminal, press Ctrl+C then:
npm run dev
```

### Step 7: Share Your Site! 🎉

Give people the **Frontend ngrok URL**: `https://abc123.ngrok-free.app`

**That's it! Your laptop is now a public server!**

---

## 🔄 Method 2: Serveo (100% Free, No Signup!)

If you don't want to sign up for ngrok, use Serveo:

### Step 1: Start SSH Tunnels

**Terminal 1 - Frontend**
```bash
ssh -R 80:localhost:5173 serveo.net
```

**Terminal 2 - Backend**
```bash
ssh -R 80:localhost:5000 serveo.net
```

**Terminal 3 - ML Service**
```bash
ssh -R 80:localhost:8001 serveo.net
```

Each will give you a URL like: `https://something.serveo.net`

Then follow Steps 5-7 from Method 1 above.

---

## 🌟 Method 3: LocalTunnel (Another Free Option)

### Install
```bash
npm install -g localtunnel
```

### Start Tunnels
```bash
# Terminal 1
lt --port 5173

# Terminal 2
lt --port 5000

# Terminal 3
lt --port 8001
```

Then follow Steps 5-7 from Method 1.

---

## ⚡ Quick Start Commands (After ngrok setup)

Create a file `start-public-server.bat`:

```batch
@echo off
echo Starting public server...

start "Frontend Tunnel" cmd /k "cd c:/Users/drago/OneDrive/Desktop/EverestMart/ngrok && ngrok.exe http 5173"
timeout /t 2

start "Backend Tunnel" cmd /k "cd c:/Users/drago/OneDrive/Desktop/EverestMart/ngrok && ngrok.exe http 5000"
timeout /t 2

start "ML Tunnel" cmd /k "cd c:/Users/drago/OneDrive/Desktop/EverestMart/ngrok && ngrok.exe http 8001"

echo.
echo ============================================
echo   Your site is now PUBLIC!
echo ============================================
echo.
echo Copy the HTTPS URLs from the ngrok windows
echo and share the FRONTEND URL with anyone!
echo.
echo Keep all windows open while site is live.
echo.
pause
```

---

## 📱 Testing Your Public Site

1. **Copy the Frontend ngrok URL**
2. **Open it on your phone** (using mobile data, not WiFi)
3. **Share with friends** and ask them to test
4. **Check MongoDB** to see behavior tracking working!

---

## 🔒 Security Tips

1. **ngrok URLs change** every time you restart (free plan)
   - For permanent URLs: Upgrade to ngrok Pro ($8/month)

2. **MongoDB Security**: Make sure MongoDB is NOT exposed publicly
   - It should only be accessible from localhost

3. **Keep services running** as long as you want the site available

4. **Monitor MongoDB disk space** if you get lots of traffic

---

## ⏰ How Long Can You Keep It Running?

- **Free ngrok**: Session resets after 8 hours
- **ngrok Pro**: Unlimited
- **Serveo**: No limit but less stable
- **LocalTunnel**: No official limit

Just restart the tunnels when they expire!

---

## 🎯 Complete Example

### 1. Sign up for ngrok
→ https://dashboard.ngrok.com/signup

### 2. Get your token
→ https://dashboard.ngrok.com/get-started/your-authtoken

### 3. Configure
```bash
cd c:/Users/drago/OneDrive/Desktop/EverestMart/ngrok
./ngrok.exe config add-authtoken YOUR_TOKEN_HERE
```

### 4. Start tunnels (3 terminals)
```bash
# Terminal A
./ngrok.exe http 5173

# Terminal B
./ngrok.exe http 5000

# Terminal C
./ngrok.exe http 8001
```

### 5. Example URLs you'll get:
```
Frontend:  https://abc123.ngrok-free.app
Backend:   https://def456.ngrok-free.app
ML:        https://ghi789.ngrok-free.app
```

### 6. Update .env files with these URLs

### 7. Restart frontend: `npm run dev`

### 8. Share `https://abc123.ngrok-free.app` with the world! 🌎

---

## 🆘 Troubleshooting

**"Authentication failed"**
- Make sure you added your authtoken: `ngrok config add-authtoken TOKEN`

**"Can't connect to ngrok"**
- Check your internet connection
- Try Serveo or LocalTunnel instead

**"Site loads but API doesn't work"**
- Double-check your .env file URLs
- Make sure you restarted the frontend
- Check CORS settings in backend

**"MongoDB connection error"**
- Make sure MongoDB is running
- Check if MongoDB is bound to localhost only (correct)

---

## 💡 Pro Tip

Want a permanent domain like `everestmart.com`?

1. **Buy a domain** ($10/year from Namecheap)
2. **Use Cloudflare Tunnel** (free forever!)
3. **Point domain to your laptop**
4. **Get SSL certificate automatically**

See PRODUCTION_DEPLOYMENT.md for full Cloudflare Tunnel setup!

---

## 📊 Monitor Your Public Site

While  your site is live:

1. **Check ngrok dashboard**: https://dashboard.ngrok.com/dashboard
2. **See visitor count**, requests, and more
3. **View real-time logs** in ngrok terminal
4. **Check MongoDB** for user behaviors

---

## 🎉 You're Done!

Your laptop is now a public server that anyone in the world can access!

**Share your link and enjoy!** 🚀
