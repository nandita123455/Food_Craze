# QUIXO Rider App 🏍️

Mobile application for delivery riders to manage deliveries.

## Setup

1. **Install dependencies** (already done):
```bash
npm install
```

2. **Update API URL**:
   - Open `src/services/api.js`
   - Change `API_URL` to your computer's IP address:
   ```javascript
   const API_URL = 'http://YOUR_IP:5000/api';
   ```

3. **Run the app**:
```bash
npx expo start
```

## Features

✅ **Authentication**
- Rider login with email/password
- Session persistence
- Secure token storage

✅ **Dashboard**
- Real-time earnings stats
- Today's deliveries count
- Online/Offline toggle
- Available orders count

✅ **Order Management**
- View available orders
- Accept orders
- Active delivery tracking
- Customer contact info

✅ **Delivery Workflow**
- Mark as picked up
- Navigate to customer
- OTP verification for delivery
- Call customer directly

✅ **Earnings**
- Daily earnings
- Weekly earnings
- Delivery count tracking

## Screens

1. **Login** - Rider authentication
2. **Dashboard** - Main screen with stats
3. **Available Orders** - List of orders to accept
4. **Active Delivery** - Current delivery details
5. **Earnings** - Earnings breakdown

## Test Credentials

Use existing rider accounts from your web dashboard.

## Notes

- Make sure backend is running on port 5000
- Update API_URL with correct IP address
- Requires location permissions for tracking
