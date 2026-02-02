# EverestMart Deployment Guide

## Overview

This guide covers deploying the EverestMart e-commerce platform, which consists of three components:
1. **Frontend** (Customer-facing website)
2. **Admin Panel** (Administrative dashboard)
3. **Backend** (API server)

## Prerequisites

Before deploying, ensure you have:
- [ ] Node.js 18+ installed
- [ ] MongoDB database (recommend MongoDB Atlas for production)
- [ ] Domain names configured (e.g., `yourdomain.com`, `admin.yourdomain.com`, `api.yourdomain.com`)
- [ ] SSL certificates (most hosting providers provide free SSL)
- [ ] Third-party API keys (Firebase, Google OAuth, Payment Gateway, etc.)

## Quick Start - Local Production Testing

### 1. Build All Components

```bash
# From the EverestMart root directory
cd myshop
npm run build

cd ../everestmart-admin
npm run build

cd ../myshop-backend
# Backend doesn't need building, but ensure dependencies are installed
npm install
```

### 2. Configure Environment Variables

Create `.env.production` files for each component (see `.env.production.example` templates).

### 3. Start Backend in Production Mode

```bash
cd myshop-backend
NODE_ENV=production npm start
```

### 4. Serve Frontend Builds

```bash
# Frontend
cd myshop
npm run preview

# Admin (in another terminal)
cd everestmart-admin
npx serve -s build -p 3001
```

## Production Deployment Options

### Option 1: Vercel (Recommended for Frontend)

**Frontend & Admin Deployment:**

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy Frontend:
```bash
cd myshop
vercel --prod
```

3. Deploy Admin:
```bash
cd everestmart-admin
vercel --prod
```

4. Configure Environment Variables in Vercel Dashboard:
   - Go to Project Settings > Environment Variables
   - Add all variables from `.env.production.example`

**Backend Deployment:**
- Vercel supports Node.js, but for WebSocket support, consider alternatives below

### Option 2: Netlify (Alternative for Frontend)

1. Install Netlify CLI:
```bash
npm i -g netlify-cli
```

2. Deploy:
```bash
cd myshop
netlify deploy --prod
```

3. Configure in `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Option 3: AWS / DigitalOcean / VPS (Full Control)

#### Backend Deployment with PM2

1. Install PM2:
```bash
npm install -g pm2
```

2. Start backend:
```bash
cd myshop-backend
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

3. Monitor:
```bash
pm2 monit
pm2 logs
```

#### Frontend Deployment with Nginx

1. Build frontend:
```bash
cd myshop
npm run build
```

2. Copy to Nginx directory:
```bash
sudo cp -r dist/* /var/www/yourdomain.com/
```

3. Nginx configuration (`/etc/nginx/sites-available/yourdomain.com`):
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/yourdomain.com;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass ${import.meta.env.VITE_API_URL || 'http://localhost:5000'};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

4. Enable site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Option 4: Heroku (Backend)

1. Create `Procfile`:
```
web: npm start
```

2. Deploy:
```bash
cd myshop-backend
heroku create your-app-backend
git push heroku main
```

3. Set environment variables:
```bash
heroku config:set MONGODB_URI="your_mongodb_uri"
heroku config:set NODE_ENV="production"
# ... set all other variables
```

### Option 5: Railway/Render (Modern Platform)

1. Connect GitHub repository
2. Select `myshop-backend` folder
3. Set environment variables in dashboard
4. Deploy automatically on push

## Environment Configuration

### Frontend (.env.production)

Required variables:
```bash
VITE_API_URL=https://api.yourdomain.com
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_SOCKET_URL=https://api.yourdomain.com
VITE_APP_ENV=production
```

See [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) for complete list.

### Backend (.env)

Critical variables:
```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
PORT=5000
SESSION_SECRET=your_secret
JWT_SECRET=your_jwt_secret
CLIENT_URL=https://yourdomain.com
ADMIN_URL=https://admin.yourdomain.com
```

## Database Setup (MongoDB Atlas)

1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (Free tier available)
3. Create database user
4. Whitelist IP addresses (0.0.0.0/0 for all IPs in production)
5. Get connection string and add to `MONGODB_URI`

Example connection string:
```
mongodb+srv://username:password@cluster.mongodb.net/everestmart?retryWrites=true&w=majority
```

## SSL/HTTPS Configuration

### With Nginx (Free Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### With Vercel/Netlify

Automatic HTTPS is provided.

## Post-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database connected and accessible
- [ ] SSL certificates installed
- [ ] Domain DNS configured
- [ ] CORS origins updated in backend
- [ ] Test user registration and login
- [ ] Test product listing and search
- [ ] Test cart and checkout
- [ ] Test payment gateway (use test mode first)
- [ ] Test admin panel access
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Test mobile responsiveness

## Monitoring & Maintenance

### PM2 Monitoring (if using PM2)

```bash
pm2 monit                  # Real-time monitoring
pm2 logs                   # View logs
pm2 restart all            # Restart all apps
pm2 stop all               # Stop all apps
```

### Health Check Endpoint

Test backend health:
```bash
curl https://api.yourdomain.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected",
  "uptime": 12345
}
```

## Troubleshooting

### Build Errors

**Error: "Cannot find module"**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### CORS Errors

Update `myshop-backend/server.js` CORS configuration:
```javascript
const allowedOrigins = [
  'https://yourdomain.com',
  'https://admin.yourdomain.com',
];
```

### Database Connection Issues

- Check MongoDB Atlas IP whitelist
- Verify connection string format
- Ensure database user has correct permissions

### API 500 Errors

Check backend logs:
```bash
pm2 logs myshop-backend
```

## Scaling Considerations

### Horizontal Scaling

For high traffic, run multiple backend instances:
```bash
pm2 start ecosystem.config.js -i max
```

### CDN Configuration

Use CDN for static assets:
- Cloudflare (free plan available)
- AWS CloudFront
- Vercel Edge Network (built-in)

### Caching Strategy

- Implement Redis for session storage
- Use CDN for image assets
- Enable backend caching (already configured)

## Security Checklist

- [ ] Environment variables not committed to Git
- [ ] Strong JWT and session secrets
- [ ] HTTPS enforced (no HTTP)
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection protection (using Mongoose)
- [ ] XSS protection (Helmet configured)
- [ ] CORS properly configured
- [ ] File upload size limits
- [ ] Regular dependency updates

## Support

For issues or questions:
- Check logs: `pm2 logs` or hosting platform logs
- Review environment variables
- Test API endpoints with Postman
- Check MongoDB connection
- Verify DNS configuration

## Rollback Strategy

If deployment fails:

1. Revert to previous version:
```bash
pm2 restart myshop-backend --update-env
```

2. Check previous working environment variables

3. Restore database backup if needed

## Next Steps

After successful deployment:
1. Set up monitoring (e.g., UptimeRobot, Pingdom)
2. Configure automated backups
3. Set up CI/CD pipeline (GitHub Actions)
4. Implement error tracking (e.g., Sentry)
5. Set up analytics
6. Configure email notifications
7. Plan scaling strategy

---

**Need Help?** Refer to [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) for complete environment variable documentation.
