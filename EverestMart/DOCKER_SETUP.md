# EverestMart - Docker Setup Guide

## 🐳 Docker Complete Setup

This project includes complete Docker containerization for development and production environments.

### Prerequisites

- Docker Desktop installed (https://www.docker.com/products/docker-desktop/)
- Docker Compose (included with Docker Desktop)

---

## 📦 What's Included

- **Backend** (Node.js + Express) - Port 5000
- **Frontend** (React + Vite) - Port 5173
- **Admin Panel** (React) - Port 3001
- **MongoDB** (Database) - Port 27017

---

## 🚀 Quick Start

### Development Environment

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes database)
docker-compose down -v
```

**Access the services:**
- Customer App: http://localhost:5173
- Admin Panel: http://localhost:3001
- Backend API: ${import.meta.env.VITE_API_URL || 'http://localhost:5000'}
- MongoDB: mongodb://admin:adminpassword@localhost:27017

### Production Environment

```bash
# Build and start production containers
docker-compose -f docker-compose.prod.yml up -d

# View production logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop production
docker-compose -f docker-compose.prod.yml down
```

---

## 🛠️ Individual Service Commands

### Backend Only
```bash
cd myshop-backend
docker build -t everestmart-backend .
docker run -p 5000:5000 \
  -e MONGODB_URI="your-mongo-uri" \
  -e JWT_SECRET="your-secret" \
  everestmart-backend
```

### Frontend Only
```bash
cd myshop
docker build -t everestmart-frontend .
docker run -p 5173:5173 everestmart-frontend
```

### Admin Only
```bash
cd everestmart-admin
docker build -t everestmart-admin .
docker run -p 3001:3001 everestmart-admin
```

---

## 🔧 Configuration

### Environment Variables

Create `.env` file in root for production:

```env
# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/everestmart

# Security
JWT_SECRET=your-super-secret-jwt-key
SESSION_SECRET=your-super-secret-session-key

# URLs
CLIENT_URL=https://yourdomain.com
ADMIN_URL=https://admin.yourdomain.com
PRODUCTION_CLIENT_URL=https://yourdomain.com
PRODUCTION_ADMIN_URL=https://admin.yourdomain.com
```

---

## 📊 Docker Compose Services

### Development (`docker-compose.yml`)

| Service | Port | Description |
|---------|------|-------------|
| mongodb | 27017 | Local MongoDB database |
| backend | 5000 | API server with hot reload |
| frontend | 5173 | Vite dev server |
| admin | 3001 | CRA dev server |

### Production (`docker-compose.prod.yml`)

| Service | Port | Description |
|---------|------|-------------|
| backend | 5000 | Optimized Node.js server |
| frontend | 80 | Nginx serving React build |
| admin | 3001 | Nginx serving admin build |

---

## 🔍 Useful Commands

### View running containers
```bash
docker ps
```

### View all containers (including stopped)
```bash
docker ps -a
```

### Check logs for specific service
```bash
docker-compose logs backend
docker-compose logs frontend
docker-compose logs admin
```

### Restart a single service
```bash
docker-compose restart backend
```

### Rebuild a service
```bash
docker-compose up -d --build backend
```

### Execute command in running container
```bash
# Access backend shell
docker-compose exec backend sh

# Run npm command
docker-compose exec backend npm install new-package
```

### Clean up Docker
```bash
# Remove unused containers, networks, images
docker system prune

# Remove all stopped containers
docker container prune

# Remove unused images
docker image prune
```

---

## 🌐 Deployment Options

### Option 1: Railway (Recommended)

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login and initialize:
```bash
railway login
railway init
```

3. Deploy backend:
```bash
cd myshop-backend
railway up
```

4. Set environment variables in Railway dashboard

### Option 2: DigitalOcean Droplet

1. Create Ubuntu droplet
2. Install Docker:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

3. Clone repository and run:
```bash
git clone <your-repo>
cd EverestMart
docker-compose -f docker-compose.prod.yml up -d
```

### Option 3: AWS ECS

1. Build images:
```bash
docker-compose -f docker-compose.prod.yml build
```

2. Tag and push to ECR:
```bash
docker tag everestmart-backend:latest xxx.ecr.region.amazonaws.com/backend:latest
docker push xxx.ecr.region.amazonaws.com/backend:latest
```

3. Create ECS task definitions and services

---

## 🐛 Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs backend

# Check if port is already in use
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # Mac/Linux

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

### MongoDB connection issues
```bash
# Check MongoDB is running
docker-compose ps mongodb

# Check MongoDB logs
docker-compose logs mongodb

# Verify connection string
docker-compose exec backend env | grep MONGODB
```

### Hot reload not working
```bash
# Ensure volumes are properly mounted
docker-compose down
docker-compose up -d

# On Windows, may need WSL2
```

---

## 📈 Performance Tips

1. **Use .dockerignore** - Already configured
2. **Multi-stage builds** - Implemented for production
3. **Layer caching** - Dependencies cached separately
4. **Volume mounting** - Dev files mounted for hot reload
5. **Health checks** - Configured for all services

---

## 🔒 Security Best Practices

✅ **Implemented:**
- Non-root user in production containers
- Environment variables for secrets
- Nginx security headers
- Health check endpoints
- Separate dev/prod builds

⚠️ **Before Production:**
- Change default MongoDB password
- Use strong JWT secrets
- Enable HTTPS with SSL certificates
- Restrict MongoDB access
- Set up firewall rules

---

## 📝 Notes

- **Development**: Uses volume mounts for hot reload
- **Production**: Optimized builds with Nginx
- **Database**: MongoDB included for local dev only (use Atlas for production)
- **Images**: Stored in `uploads/` volume (use CloudinaryS3 for production)

---

## 🆘 Support

For issues:
1. Check container logs: `docker-compose logs`
2. Verify environment variables
3. Ensure ports are not in use
4. Check Docker Desktop is running

Happy deploying! 🚀
