# Environment Variables Documentation

This document provides a complete reference for all environment variables used across the EverestMart application.

## Frontend (myshop)

All frontend environment variables must be prefixed with `VITE_` to be accessible in the application.

### API Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend server base URL | `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}` | ✅ Yes |
| `VITE_API_BASE_URL` | Backend API base URL | `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api` | ✅ Yes |
| `VITE_SOCKET_URL` | WebSocket server URL | `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}` | ✅ Yes |

### Application Settings

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `VITE_APP_ENV` | Environment mode | `development`, `staging`, `production` | ✅ Yes |
| `VITE_APP_NAME` | Application name | `EverestMart` | ❌ No |
| `VITE_ENABLE_ANALYTICS` | Enable analytics | `true`, `false` | ❌ No |
| `VITE_ENABLE_DEBUG` | Enable debug logs | `true`, `false` | ❌ No |

### Firebase Configuration

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_FIREBASE_API_KEY` | Firebase API key | ✅ Yes |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | ✅ Yes |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | ✅ Yes |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | ✅ Yes |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | ✅ Yes |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | ✅ Yes |
| `VITE_FIREBASE_MEASUREMENT_ID` | Firebase measurement ID | ❌ No |

### Google Services

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID | ✅ Yes |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API key | ✅ Yes |

---

## Admin Panel (everestmart-admin)

All admin panel environment variables must be prefixed with `REACT_APP_`.

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `REACT_APP_API_URL` | Backend API base URL | `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api` | ✅ Yes |
| `REACT_APP_BACKEND_URL` | Backend server base URL | `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}` | ✅ Yes |
| `REACT_APP_SOCKET_URL` | WebSocket server URL | `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}` | ✅ Yes |
| `REACT_APP_ENV` | Environment mode | `development`, `production` | ✅ Yes |
| `REACT_APP_NAME` | Application name | `EverestMart Admin` | ❌ No |
| `REACT_APP_ENABLE_DEBUG` | Enable debug logs | `true`, `false` | ❌ No |

---

## Backend (myshop-backend)

### Server Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | `5000` | ❌ No (default: 5000) |
| `NODE_ENV` | Environment mode | `development`, `production` | ✅ Yes |

### Database

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` | ✅ Yes |
| `MONGO_URI` | Alternative MongoDB variable | Same as MONGODB_URI | ❌ No |

### Security

| Variable | Description | Required | Notes |
|----------|-------------|----------|-------|
| `SESSION_SECRET` | Session secret key | ✅ Yes | Generate with crypto |
| `JWT_SECRET` | JWT signing secret | ✅ Yes | Generate with crypto |

**Generate secure secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### URLs & CORS

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `CLIENT_URL` | Frontend URL | `http://localhost:5173` | ✅ Yes |
| `ADMIN_URL` | Admin panel URL | `http://localhost:3001` | ✅ Yes |
| `PRODUCTION_CLIENT_URL` | Production frontend URL | `https://yourdomain.com` | ❌ No |
| `PRODUCTION_ADMIN_URL` | Production admin URL | `https://admin.yourdomain.com` | ❌ No |

### Firebase Admin SDK

| Variable | Description | Required |
|----------|-------------|----------|
| `FIREBASE_PROJECT_ID` | Firebase project ID | ✅ Yes |
| `FIREBASE_PRIVATE_KEY` | Firebase private key | ✅ Yes |
| `FIREBASE_CLIENT_EMAIL` | Firebase client email | ✅ Yes |

**Note:** Get these from Firebase Console > Project Settings > Service Accounts > Generate New Private Key

### Google OAuth

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | ✅ Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | ✅ Yes |
| `GOOGLE_CALLBACK_URL` | OAuth callback URL | ✅ Yes |

**Example callback URL:** `https://api.yourdomain.com/api/auth/google/callback`

### Payment Gateway (PayU)

| Variable | Description | Required |
|----------|-------------|----------|
| `PAYU_MERCHANT_KEY` | PayU merchant key | ✅ Yes |
| `PAYU_MERCHANT_SALT` | PayU merchant salt | ✅ Yes |
| `PAYU_MODE` | PayU mode (`test` or `live`) | ✅ Yes |

### Twilio (SMS)

| Variable | Description | Required |
|----------|-------------|----------|
| `TWILIO_ACCOUNT_SID` | Twilio account SID | ✅ Yes |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | ✅ Yes |
| `TWILIO_PHONE_NUMBER` | Twilio phone number | ✅ Yes |

### SendGrid (Email)

| Variable | Description | Required |
|----------|-------------|----------|
| `SENDGRID_API_KEY` | SendGrid API key | ✅ Yes |
| `SENDGRID_FROM_EMAIL` | Sender email address | ✅ Yes |

### Performance & Features

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `SKIP_RATE_LIMIT` | Disable rate limiting (testing only) | `true`, `false` | ❌ No |
| `MAX_FILE_SIZE` | Max upload size in MB | `10` | ❌ No |

---

## Environment-Specific Configurations

### Development

Create `.env.local` (frontend) or `.env` (backend) with localhost URLs:

```bash
# Frontend
VITE_API_URL=${import.meta.env.VITE_API_URL || 'http://localhost:5000'}
VITE_APP_ENV=development
VITE_ENABLE_DEBUG=true

# Backend
NODE_ENV=development
CLIENT_URL=http://localhost:5173
ADMIN_URL=http://localhost:3001
```

### Staging

Use production-like configuration with staging URLs:

```bash
# Frontend
VITE_API_URL=https://api-staging.yourdomain.com
VITE_APP_ENV=staging

# Backend
NODE_ENV=production
CLIENT_URL=https://staging.yourdomain.com
ADMIN_URL=https://admin-staging.yourdomain.com
```

### Production

Use production URLs with all security features enabled:

```bash
# Frontend
VITE_API_URL=https://api.yourdomain.com
VITE_APP_ENV=production
VITE_ENABLE_DEBUG=false
VITE_ENABLE_ANALYTICS=true

# Backend
NODE_ENV=production
SKIP_RATE_LIMIT=false
CLIENT_URL=https://yourdomain.com
ADMIN_URL=https://admin.yourdomain.com
```

---

## Platform-Specific Configuration

### Vercel

Set environment variables in Project Settings > Environment Variables:
- Production: Set for "Production" environment
- Preview: Set for "Preview" environment
- Development: Set for "Development" environment

### Netlify

Set in Site Settings > Build & deploy > Environment:
```bash
# netlify.toml
[build.environment]
  VITE_API_URL = "https://api.yourdomain.com"
```

### Heroku

```bash
heroku config:set MONGODB_URI="your_uri"
heroku config:set NODE_ENV="production"
```

### AWS/VPS

Create `.env` file on server or use environment variables in PM2:

```javascript
// ecosystem.config.js
env_production: {
  NODE_ENV: 'production',
  MONGODB_URI: process.env.MONGODB_URI,
  // ... other variables
}
```

---

## Security Best Practices

1. ✅ **Never commit `.env` files** to Git
2. ✅ **Use different secrets** for each environment
3. ✅ **Rotate secrets periodically** (every 90 days)
4. ✅ **Use strong random secrets** (32+ characters)
5. ✅ **Restrict API keys** to specific domains/IPs
6. ✅ **Use environment-specific** Firebase projects
7. ✅ **Enable MFA** on third-party services
8. ✅ **Monitor API usage** for unusual activity

---

## Troubleshooting

### Variables Not Loading

**Vite (Frontend):**
- Ensure variables start with `VITE_`
- Restart dev server after changing `.env`
- Check `import.meta.env.VITE_YOUR_VAR`

**React (Admin):**
- Ensure variables start with `REACT_APP_`
- Restart dev server after changing `.env`
- Check `process.env.REACT_APP_YOUR_VAR`

**Node.js (Backend):**
- Ensure `dotenv` is configured
- Check `process.env.YOUR_VAR`
- Verify `.env` file is in project root

### Missing Required Variables

Check console/logs for errors:
```bash
# Frontend
console.log(import.meta.env)

# Backend
console.log(process.env)
```

---

## Quick Reference

### Get All Templates

```bash
# Frontend
cp myshop/.env.example myshop/.env.local

# Admin
cp everestmart-admin/.env.example everestmart-admin/.env.local

# Backend
cp myshop-backend/.env.production.example myshop-backend/.env
```

### Validate Configuration

```bash
# Test backend health with environment check
curl ${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/health

# Check frontend build
cd myshop && npm run build

# Check admin build
cd everestmart-admin && npm run build
```
