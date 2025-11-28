# 🐳 Docker & Dockerfile Complete Guide

## 📚 Table of Contents
1. [Dockerfile Basics](#dockerfile-basics)
2. [Backend Dockerfile Explained](#backend-dockerfile-explained)
3. [Frontend Dockerfile Explained](#frontend-dockerfile-explained)
4. [Building Images](#building-images)
5. [Running Containers](#running-containers)
6. [Docker Compose](#docker-compose)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Dockerfile Basics

### What is a Dockerfile?
A **Dockerfile** is a text file containing instructions to build a Docker image. Each instruction creates a layer in the image.

### Common Dockerfile Instructions:

| Instruction | Purpose | Example |
|-------------|---------|---------|
| `FROM` | Base image | `FROM openjdk:21` |
| `WORKDIR` | Set working directory | `WORKDIR /app` |
| `COPY` | Copy files | `COPY . .` |
| `RUN` | Execute command | `RUN mvn clean package` |
| `EXPOSE` | Document port | `EXPOSE 8089` |
| `CMD` | Default command | `CMD ["java", "-jar", "app.jar"]` |
| `ENTRYPOINT` | Main command | `ENTRYPOINT ["java", "-jar"]` |
| `ENV` | Environment variable | `ENV PORT=8089` |
| `USER` | Switch user | `USER spring` |
| `HEALTHCHECK` | Health check | `HEALTHCHECK CMD curl ...` |

---

## 🔧 Backend Dockerfile Explained

### File: `application-management/Dockerfile`

```dockerfile
# Multi-stage build for Spring Boot Backend

# ============================================
# STAGE 1: BUILD
# ============================================
FROM maven:3.8.7-openjdk-21-slim AS build
# Base image with Maven 3.8.7 and Java 21
# "AS build" names this stage for reference

WORKDIR /app
# Set working directory to /app

# Copy pom.xml and download dependencies
COPY pom.xml .
# Copy only pom.xml first (layer caching optimization)

RUN mvn dependency:go-offline -B
# Download all dependencies
# -B = batch mode (non-interactive)
# This layer is cached unless pom.xml changes

# Copy source code and build
COPY src ./src
# Copy source code

RUN mvn clean package -DskipTests
# Build the application
# -DskipTests = skip running tests (already done in CI)
# Creates JAR file in target/

# ============================================
# STAGE 2: RUNTIME
# ============================================
FROM openjdk:21-jdk-slim
# Smaller runtime image (no Maven needed)

WORKDIR /app

# Create non-root user for security
RUN groupadd -r spring && useradd -r -g spring spring
# -r = system user/group
# Never run containers as root!

# Copy JAR from build stage
COPY --from=build /app/target/*.jar app.jar
# Copy only the JAR, not source code or Maven

# Set ownership
RUN chown -R spring:spring /app
# Give ownership to spring user

# Switch to non-root user
USER spring
# All subsequent commands run as 'spring' user

# Expose port
EXPOSE 8089
# Document which port the app uses
# (doesn't actually publish the port)

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8089/actuator/health || exit 1
# Check if app is healthy every 30 seconds
# Wait 60 seconds before first check (startup time)
# Retry 3 times before marking unhealthy

# Run application
ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=prod", "app.jar"]
# Start the Spring Boot application
# -Dspring.profiles.active=prod = use production profile
```

### Why Multi-Stage Build?

**Without multi-stage:**
- Image size: ~800 MB (includes Maven, source code, build tools)

**With multi-stage:**
- Image size: ~300 MB (only JRE + JAR)
- 60% smaller!
- More secure (no build tools in production)

---

## 🎨 Frontend Dockerfile Explained

### File: `frontend/Dockerfile`

```dockerfile
# Multi-stage build for React Frontend

# ============================================
# STAGE 1: BUILD
# ============================================
FROM node:20-alpine AS build
# Alpine = minimal Linux (5 MB vs 1 GB)
# Node 20 = latest LTS version

WORKDIR /app

# Copy package files
COPY package*.json ./
# Copy package.json and package-lock.json
# Layer caching: only re-install if these change

# Install dependencies
RUN npm ci --only=production
# npm ci = clean install (faster, more reliable)
# --only=production = skip devDependencies

# Copy source code
COPY . .
# Copy all source files

# Build for production
RUN npm run build
# Creates optimized production build in /app/dist
# Minified, bundled, optimized

# ============================================
# STAGE 2: PRODUCTION WITH NGINX
# ============================================
FROM nginx:alpine
# Nginx = web server for static files
# Alpine = minimal (20 MB total!)

WORKDIR /usr/share/nginx/html

# Remove default nginx content
RUN rm -rf ./*
# Clean default nginx files

# Copy built app from build stage
COPY --from=build /app/dist .
# Copy only the built files, not source

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Custom config for React Router

# Expose port
EXPOSE 80
# Standard HTTP port

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1
# Check if nginx is serving content

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
# -g daemon off = run nginx in foreground
# (Docker needs foreground process)
```

### Why Nginx for React?

1. **Performance:** Serves static files faster than Node.js
2. **Size:** 20 MB vs 200 MB (Node.js)
3. **Features:** Gzip, caching, SSL, reverse proxy
4. **Production-ready:** Battle-tested web server

---

## 🔨 Building Images

### Build Backend Image

```bash
# Navigate to backend directory
cd application-management

# Build image
docker build -t job-manager-backend:latest .

# Build with custom tag
docker build -t job-manager-backend:v1.0.0 .

# Build with no cache (force rebuild)
docker build --no-cache -t job-manager-backend:latest .

# View build progress
docker build -t job-manager-backend:latest . --progress=plain
```

### Build Frontend Image

```bash
# Navigate to frontend directory
cd frontend

# Build image
docker build -t job-manager-frontend:latest .

# Build with build arguments
docker build --build-arg NODE_ENV=production -t job-manager-frontend:latest .
```

### View Images

```bash
# List all images
docker images

# Filter images
docker images | grep job-manager

# View image details
docker inspect job-manager-backend:latest

# View image layers
docker history job-manager-backend:latest
```

---

## 🚀 Running Containers

### Run Backend Container

```bash
# Basic run
docker run -p 8089:8089 job-manager-backend:latest

# Run in background (detached)
docker run -d -p 8089:8089 --name backend job-manager-backend:latest

# Run with environment variables
docker run -d -p 8089:8089 \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/job_db \
  -e SPRING_DATASOURCE_USERNAME=user \
  -e SPRING_DATASOURCE_PASSWORD=pass \
  --name backend \
  job-manager-backend:latest

# Run with volume (for logs)
docker run -d -p 8089:8089 \
  -v /var/log/app:/app/logs \
  --name backend \
  job-manager-backend:latest

# Run with restart policy
docker run -d -p 8089:8089 \
  --restart unless-stopped \
  --name backend \
  job-manager-backend:latest
```

### Run Frontend Container

```bash
# Basic run
docker run -p 80:80 job-manager-frontend:latest

# Run in background
docker run -d -p 80:80 --name frontend job-manager-frontend:latest

# Run on different port
docker run -d -p 3000:80 --name frontend job-manager-frontend:latest
```

### Container Management

```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# View container logs
docker logs backend
docker logs -f backend  # Follow logs (live)
docker logs --tail 100 backend  # Last 100 lines

# Execute command in container
docker exec -it backend bash
docker exec backend ls -la /app

# Stop container
docker stop backend

# Start stopped container
docker start backend

# Restart container
docker restart backend

# Remove container
docker rm backend
docker rm -f backend  # Force remove (even if running)

# View container stats
docker stats backend

# View container processes
docker top backend
```

---

## 🐙 Docker Compose

### File: `docker-compose.yml`

Docker Compose orchestrates multiple containers.

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Start specific service
docker-compose up backend

# Build and start
docker-compose up --build

# View logs
docker-compose logs
docker-compose logs -f backend  # Follow specific service

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Restart services
docker-compose restart

# View running services
docker-compose ps

# Execute command in service
docker-compose exec backend bash

# Scale service (multiple instances)
docker-compose up --scale backend=3
```

---

## ✅ Best Practices

### 1. **Use Multi-Stage Builds**
```dockerfile
# ✅ Good: Multi-stage (small image)
FROM maven:3.8.7 AS build
RUN mvn package
FROM openjdk:21-slim
COPY --from=build /app/target/*.jar app.jar

# ❌ Bad: Single stage (large image)
FROM maven:3.8.7
RUN mvn package
CMD ["java", "-jar", "target/app.jar"]
```

### 2. **Optimize Layer Caching**
```dockerfile
# ✅ Good: Copy dependencies first
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn package

# ❌ Bad: Copy everything first
COPY . .
RUN mvn package
```

### 3. **Use Specific Tags**
```dockerfile
# ✅ Good: Specific version
FROM openjdk:21-jdk-slim

# ❌ Bad: Latest tag (unpredictable)
FROM openjdk:latest
```

### 4. **Don't Run as Root**
```dockerfile
# ✅ Good: Non-root user
RUN useradd -r spring
USER spring

# ❌ Bad: Running as root
# (default if not specified)
```

### 5. **Use .dockerignore**
```
# .dockerignore
node_modules
target
.git
.env
*.log
```

### 6. **Add Health Checks**
```dockerfile
# ✅ Good: Health check
HEALTHCHECK CMD curl -f http://localhost:8089/health || exit 1

# ❌ Bad: No health check
```

### 7. **Minimize Layers**
```dockerfile
# ✅ Good: Combined commands
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

# ❌ Bad: Multiple RUN commands
RUN apt-get update
RUN apt-get install -y curl
RUN rm -rf /var/lib/apt/lists/*
```

---

## 🐛 Troubleshooting

### Common Issues:

#### 1. **Build fails: "Cannot find pom.xml"**
```bash
# Solution: Check you're in correct directory
cd application-management
docker build -t backend .
```

#### 2. **Container exits immediately**
```bash
# Check logs
docker logs backend

# Run interactively to debug
docker run -it backend bash
```

#### 3. **Port already in use**
```bash
# Find what's using the port
sudo lsof -i :8089

# Use different port
docker run -p 8090:8089 backend
```

#### 4. **Cannot connect to database**
```bash
# Check network
docker network ls
docker network inspect bridge

# Use host network (for testing)
docker run --network host backend
```

#### 5. **Image too large**
```bash
# Check image size
docker images

# Use multi-stage build
# Use alpine base images
# Clean up in same layer:
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
```

#### 6. **Health check failing**
```bash
# Check health status
docker inspect backend | grep Health

# Test health endpoint manually
docker exec backend curl http://localhost:8089/actuator/health
```

---

## 📊 Useful Commands Reference

```bash
# Build
docker build -t name:tag .
docker build --no-cache -t name:tag .

# Run
docker run -d -p 8089:8089 --name backend image
docker run -it --rm image bash  # Interactive, auto-remove

# Manage
docker ps                    # List running
docker ps -a                 # List all
docker logs -f container     # Follow logs
docker exec -it container bash  # Enter container
docker stop container        # Stop
docker rm container          # Remove
docker rmi image            # Remove image

# Clean up
docker system prune         # Remove unused data
docker system prune -a      # Remove all unused images
docker volume prune         # Remove unused volumes

# Compose
docker-compose up -d        # Start all
docker-compose down         # Stop all
docker-compose logs -f      # Follow logs
docker-compose ps           # List services
docker-compose restart      # Restart all
```

---

## 🎯 Quick Test

### Test Backend:
```bash
cd application-management
docker build -t test-backend .
docker run -d -p 8089:8089 --name test-backend test-backend
curl http://localhost:8089/actuator/health
docker logs test-backend
docker stop test-backend && docker rm test-backend
```

### Test Frontend:
```bash
cd frontend
docker build -t test-frontend .
docker run -d -p 80:80 --name test-frontend test-frontend
curl http://localhost
docker logs test-frontend
docker stop test-frontend && docker rm test-frontend
```

### Test Full Stack:
```bash
cd job-application-manager
docker-compose up -d
docker-compose ps
docker-compose logs -f
# Access: http://localhost
docker-compose down
```

---

## 📚 Additional Resources

- **Docker Docs:** https://docs.docker.com
- **Dockerfile Best Practices:** https://docs.docker.com/develop/dev-best-practices/
- **Docker Compose:** https://docs.docker.com/compose/
- **Multi-stage Builds:** https://docs.docker.com/build/building/multi-stage/

---

**🎉 You now have production-ready Dockerfiles with multi-stage builds, security best practices, and health checks!**
