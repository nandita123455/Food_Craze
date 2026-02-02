# Quick Start Guide - Automation System

## ✅ What's Done
- Automation code integrated into your app
- When you register: Welcome email sent automatically
- When you order: Rider assigned, emails sent, SMS sent (if configured)

## 🚀 To Activate Automation

### Step 1: Install Redis

**Option A - Chocolatey (Recommended):**
```powershell
# Run as Administrator
choco install redis-64 -y
```

**Option B - Manual Download:**
1. Download: https://github.com/microsoftarchive/redis/releases/download/win-3.0.504/Redis-x64-3.0.504.msi
2. Install the MSI file
3. Redis will auto-start as a Windows service

### Step 2: Start Redis
```powershell
redis-server
```

### Step 3: Restart Your Backend
```powershell
cd myshop-backend
npm run dev
```

You should see:
```
🤖 Automation workers initialized
📧 Email worker started
📱 SMS worker started
📦 Order worker started
📦 Inventory worker started
⏰ Scheduled jobs initialized
```

## ✅ Test It!

1. **Register a new user** → Check email for welcome message
2. **Place an order** → Email + rider auto-assigned
3. **Check console** → See automation logs

## 📝 Optional: SMS Setup

To enable SMS notifications:

1. Get MSG91 API key: https://msg91.com (100 free SMS)
2. Add to `.env`:
```
SMS_API_KEY=your-actual-key-here
```

## 🎯 That's It!

Automation is now working. Every order, registration, and action triggers automated workflows in the background!
