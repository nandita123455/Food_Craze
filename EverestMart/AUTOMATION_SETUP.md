# Automation System - Quick Setup Guide

## Prerequisites
- [x] Node.js installed
- [ ] Redis installed
- [ ] SMS provider account (MSG91 or Tw ilio)

## Step 1: Install Redis

### Windows
```powershell
# Option A: Using Chocolatey
choco install redis-64

# Option B: Using MSI installer
# Download from: https://github.com/microsoftarchive/redis/releases
# Install Redis-x64-3.0.504.msi

# Option C: Using Docker (Recommended)
docker run -d -p 6379:6379 --name redis redis

# Start Redis
redis-server
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install redis-server
sudo systemctl start redis
```

### macOS
```bash
brew install redis
brew services start redis
```

### Verify Redis is Running
```bash
redis-cli ping
# Should return: PONG
```

## Step 2: Get SMS Provider API Keys

### Option A: MSG91 (Recommended for India)
1. Go to https://msg91.com
2. Sign up for free account
3. Get 100 free SMS credits
4. Navigate to Dashboard → API Keys
5. Copy your Auth Key
6. Cost: ~₹0.15 per SMS

### Option B: Twilio (International)
1. Go to https://www.twilio.com
2. Sign up for free trial
3. Get free trial credits
4. Go to Console Dashboard
5. Copy Account SID and Auth Token
6. Purchase a phone number
7. Cost: ~$0.0079 per SMS

## Step 3: Configure Environment

Create `.env` file in `myshop-backend` folder:

```bash
# Copy automation example
cp .env.automation.example .env

# Add your keys
REDIS_HOST=localhost
REDIS_PORT=6379

# For MSG91
SMS_PROVIDER=msg91
SMS_API_KEY=your-actual-msg91-key
SMS_SENDER_ID=EVRMART

# OR for Twilio
# SMS_PROVIDER=twilio
# TWILIO_ACCOUNT_SID=your-sid
# TWILIO_AUTH_TOKEN=your-token  
# TWILIO_PHONE_NUMBER=+1234567890
```

## Step 4: Test the System

```bash
# Start Redis (if not running)
redis-server

# Start your backend
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

## Step 5: Test Automation

### Test 1: Create an Order
```javascript
// Place an order through your app
// Automatically:
// ✅ Inventory updates
// ✅ Rider assigned
// ✅ Email sent
// ✅ SMS sent
```

### Test 2: Check Abandoned Carts
```javascript
// Add items to cart but don't checkout
// Wait 1 hour
// Check email for abandoned cart reminder
```

### Test 3: Low Stock Alert
```javascript
// Update a product to have stock <= 10
// Wait for next inventory check (runs every 6 hours)
// Or manually trigger:
const { inventoryQueue } = require('./config/queue');
await inventoryQueue.add('check-low-stock', { type: 'check-low-stock', data: {} });
```

## Troubleshooting

### Redis not connecting
```bash
# Check if Redis is running
redis-cli ping

# If not running
redis-server

# Check connection
redis-cli
127.0.0.1:6379> INFO
```

### SMS not sending
1. Check SMS_API_KEY is correct
2. Verify provider balance
3. Check phone number format (+91XXXXXXXXXX for India)
4. Review logs in console

### Jobs not processing
```bash
# Check queue status  
redis-cli
> LLEN bull:email-notifications:wait
> LLEN bull:sms-notifications:wait
```

## Monitor Queue Status

Install Bull Board (optional):
```bash
npm install @bull-board/express @bull-board/api
```

Access dashboard at: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/admin/queues`

## Production Deployment

### Use Cloud Redis:
- **Redis Labs Cloud**: https://redislabs.com (30MB free)
- **AWS ElastiCache**: Redis managed service
- **Azure Cache**: Redis managed service

Update `.env`:
```bash
REDIS_HOST=your-cloud-redis-host.com
REDIS_PORT=12345
REDIS_PASSWORD=your-redis-password
```

## Next Steps

1. ✅ Test all automations locally
2. ✅ Configure SMS provider
3. ✅ Setup cloud Redis for production
4. 📱 Add WhatsApp Business API (optional)
5. 📊 Add analytics dashboard

## Support

- Redis docs: https://redis.io/documentation
- MSG91 docs: https://docs.msg91.com
- Twilio docs: https://www.twilio.com/docs
- Bull docs: https://github.com/OptimalBits/bull
