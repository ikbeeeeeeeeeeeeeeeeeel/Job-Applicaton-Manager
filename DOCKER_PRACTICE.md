# 🎓 Docker Hands-On Practice Guide

## 🎯 Learning Objectives
By the end of this practice, you will:
- ✅ Build Docker images from Dockerfiles
- ✅ Run containers with various configurations
- ✅ Debug container issues
- ✅ Use Docker Compose for multi-container apps
- ✅ Optimize images for production

---

## 📚 Exercise 1: Build Your First Image (Backend)

### Step 1: Navigate to Backend
```bash
cd ~/Desktop/job-application-manager/application-management
```

### Step 2: Examine the Dockerfile
```bash
cat Dockerfile
```

**Questions to answer:**
1. How many stages does this Dockerfile have?
2. What is the base image for the build stage?
3. What is the base image for the runtime stage?
4. What port does the application expose?

### Step 3: Build the Image
```bash
# Build with tag
docker build -t job-backend:v1 .

# Watch the build process
# Notice how each instruction creates a layer
```

### Step 4: Verify the Image
```bash
# List images
docker images | grep job-backend

# Check image size
docker images job-backend:v1

# View image layers
docker history job-backend:v1
```

**Expected Output:**
```
REPOSITORY    TAG    IMAGE ID      CREATED        SIZE
job-backend   v1     abc123def     2 minutes ago  ~300MB
```

### Step 5: Inspect the Image
```bash
# View detailed information
docker inspect job-backend:v1

# Check exposed ports
docker inspect job-backend:v1 | grep ExposedPorts

# Check entrypoint
docker inspect job-backend:v1 | grep Entrypoint
```

---

## 📚 Exercise 2: Run Backend Container

### Step 1: Run in Foreground (Interactive)
```bash
# Run and see logs directly
docker run -p 8089:8089 job-backend:v1

# Press Ctrl+C to stop
```

### Step 2: Run in Background (Detached)
```bash
# Run as daemon
docker run -d -p 8089:8089 --name my-backend job-backend:v1

# Check if running
docker ps
```

### Step 3: View Logs
```bash
# View all logs
docker logs my-backend

# Follow logs (live)
docker logs -f my-backend

# Last 50 lines
docker logs --tail 50 my-backend

# Press Ctrl+C to stop following
```

### Step 4: Test the Application
```bash
# Check health endpoint
curl http://localhost:8089/actuator/health

# Expected output:
# {"status":"UP"}

# Check info endpoint
curl http://localhost:8089/actuator/info
```

### Step 5: Enter the Container
```bash
# Open bash shell inside container
docker exec -it my-backend bash

# Inside container, try:
ls -la /app
cat /app/app.jar
whoami  # Should show 'spring' user
exit
```

### Step 6: Stop and Remove
```bash
# Stop container
docker stop my-backend

# Remove container
docker rm my-backend

# Or do both at once
docker rm -f my-backend
```

---

## 📚 Exercise 3: Build Frontend Image

### Step 1: Navigate to Frontend
```bash
cd ~/Desktop/job-application-manager/frontend
```

### Step 2: Build the Image
```bash
# Build frontend image
docker build -t job-frontend:v1 .

# This will take longer (npm install)
```

### Step 3: Run Frontend Container
```bash
# Run on port 80
docker run -d -p 80:80 --name my-frontend job-frontend:v1

# Or run on port 3000
docker run -d -p 3000:80 --name my-frontend job-frontend:v1
```

### Step 4: Test Frontend
```bash
# Open in browser
curl http://localhost

# Or if using port 3000
curl http://localhost:3000

# Check nginx status
docker exec my-frontend nginx -t
```

### Step 5: View Nginx Logs
```bash
# Access logs
docker logs my-frontend

# Nginx access log
docker exec my-frontend cat /var/log/nginx/access.log

# Nginx error log
docker exec my-frontend cat /var/log/nginx/error.log
```

---

## 📚 Exercise 4: Docker Compose - Full Stack

### Step 1: Navigate to Project Root
```bash
cd ~/Desktop/job-application-manager
```

### Step 2: Review docker-compose.yml
```bash
cat docker-compose.yml
```

**Questions:**
1. How many services are defined?
2. Which service depends on which?
3. What networks are created?
4. What volumes are created?

### Step 3: Start All Services
```bash
# Start in foreground (see all logs)
docker-compose up

# Or start in background
docker-compose up -d
```

### Step 4: Monitor Services
```bash
# List running services
docker-compose ps

# View logs of all services
docker-compose logs

# View logs of specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mysql

# Follow logs
docker-compose logs -f backend
```

### Step 5: Test Full Stack
```bash
# Wait 60 seconds for everything to start

# Test backend
curl http://localhost:8089/actuator/health

# Test frontend
curl http://localhost

# Test Grafana
curl http://localhost:3000

# Test Prometheus
curl http://localhost:9090
```

### Step 6: Scale Services
```bash
# Run 3 backend instances
docker-compose up -d --scale backend=3

# Check running instances
docker-compose ps
```

### Step 7: Stop Everything
```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

---

## 📚 Exercise 5: Debugging Containers

### Scenario 1: Container Exits Immediately
```bash
# Run container
docker run -d --name debug-test job-backend:v1

# Check if running
docker ps -a | grep debug-test

# If STATUS shows "Exited", check logs
docker logs debug-test

# Common causes:
# - Missing environment variables
# - Database connection failed
# - Port already in use
```

### Scenario 2: Cannot Connect to Container
```bash
# Check if port is exposed
docker port my-backend

# Check if port is in use on host
sudo lsof -i :8089

# Check container IP
docker inspect my-backend | grep IPAddress

# Try connecting to container IP
curl http://172.17.0.2:8089/actuator/health
```

### Scenario 3: Container is Slow
```bash
# Check resource usage
docker stats my-backend

# Check running processes
docker top my-backend

# Enter container and investigate
docker exec -it my-backend bash
top
ps aux
```

### Scenario 4: Health Check Failing
```bash
# Check health status
docker inspect my-backend | grep Health -A 10

# Manually run health check command
docker exec my-backend curl -f http://localhost:8089/actuator/health

# Check if actuator is enabled
docker exec my-backend curl http://localhost:8089/actuator
```

---

## 📚 Exercise 6: Image Optimization

### Challenge: Reduce Image Size

#### Current Backend Image: ~300 MB

**Try these optimizations:**

1. **Use Alpine Base Image**
```dockerfile
# Instead of:
FROM openjdk:21-jdk-slim

# Try:
FROM openjdk:21-jdk-alpine
```

2. **Remove Unnecessary Files**
```dockerfile
RUN mvn clean package -DskipTests && \
    rm -rf ~/.m2/repository
```

3. **Use JRE Instead of JDK**
```dockerfile
FROM eclipse-temurin:21-jre-alpine
```

### Build and Compare
```bash
# Build original
docker build -t backend-original .

# Build optimized
docker build -f Dockerfile.optimized -t backend-optimized .

# Compare sizes
docker images | grep backend
```

---

## 📚 Exercise 7: Environment Variables

### Step 1: Run with Environment Variables
```bash
# Run backend with custom database
docker run -d -p 8089:8089 \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://192.168.245.131:3306/testdb \
  -e SPRING_DATASOURCE_USERNAME=testuser \
  -e SPRING_DATASOURCE_PASSWORD=testpass \
  -e SPRING_PROFILES_ACTIVE=dev \
  --name backend-custom \
  job-backend:v1
```

### Step 2: Use .env File
```bash
# Create .env file
cat > .env << EOF
SPRING_DATASOURCE_URL=jdbc:mysql://192.168.245.131:3306/testdb
SPRING_DATASOURCE_USERNAME=testuser
SPRING_DATASOURCE_PASSWORD=testpass
EOF

# Run with .env file
docker run -d -p 8089:8089 --env-file .env --name backend-env job-backend:v1
```

### Step 3: Verify Environment Variables
```bash
# Check environment variables
docker exec backend-env env | grep SPRING
```

---

## 📚 Exercise 8: Volumes and Persistence

### Step 1: Create Volume
```bash
# Create named volume
docker volume create app-logs

# List volumes
docker volume ls
```

### Step 2: Run with Volume
```bash
# Mount volume for logs
docker run -d -p 8089:8089 \
  -v app-logs:/app/logs \
  --name backend-logs \
  job-backend:v1
```

### Step 3: Access Volume Data
```bash
# View logs from volume
docker exec backend-logs ls -la /app/logs

# Copy file from container
docker cp backend-logs:/app/logs/application.log ./
```

### Step 4: Bind Mount (Development)
```bash
# Mount local directory
docker run -d -p 8089:8089 \
  -v $(pwd)/logs:/app/logs \
  --name backend-dev \
  job-backend:v1

# Now logs appear in local ./logs directory
ls -la logs/
```

---

## 📚 Exercise 9: Networking

### Step 1: Create Custom Network
```bash
# Create bridge network
docker network create app-network

# List networks
docker network ls
```

### Step 2: Run Containers on Same Network
```bash
# Run MySQL
docker run -d \
  --name mysql \
  --network app-network \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=jobdb \
  mysql:8.0

# Run backend (can connect to mysql by name)
docker run -d \
  --name backend \
  --network app-network \
  -p 8089:8089 \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/jobdb \
  job-backend:v1
```

### Step 3: Test Network Connectivity
```bash
# From backend, ping mysql
docker exec backend ping mysql

# Check DNS resolution
docker exec backend nslookup mysql
```

---

## 📚 Exercise 10: Multi-Stage Build Practice

### Create Your Own Dockerfile

**Challenge:** Create a Dockerfile for a simple Java app

```dockerfile
# Stage 1: Build
FROM maven:3.8.7-openjdk-21 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn package -DskipTests

# Stage 2: Runtime
FROM openjdk:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
```

**Build and test:**
```bash
docker build -t my-custom-app .
docker run -p 8080:8080 my-custom-app
```

---

## ✅ Practice Checklist

Complete these tasks:

- [ ] Build backend image
- [ ] Build frontend image
- [ ] Run backend container
- [ ] Run frontend container
- [ ] View container logs
- [ ] Enter running container
- [ ] Stop and remove containers
- [ ] Use docker-compose to start full stack
- [ ] Scale services with docker-compose
- [ ] Debug a failing container
- [ ] Use environment variables
- [ ] Create and use volumes
- [ ] Create custom network
- [ ] Optimize image size
- [ ] Write your own Dockerfile

---

## 🎯 Quiz

1. What is the difference between `CMD` and `ENTRYPOINT`?
2. Why use multi-stage builds?
3. What does `-d` flag do in `docker run`?
4. How do you view logs of a stopped container?
5. What is the purpose of `.dockerignore`?
6. How do you remove all stopped containers?
7. What is the difference between `COPY` and `ADD`?
8. Why should you avoid running containers as root?

---

## 📚 Additional Challenges

### Challenge 1: Create a Development Dockerfile
Create `Dockerfile.dev` with hot-reload for development

### Challenge 2: Add Health Check Script
Create custom health check script in container

### Challenge 3: Multi-Architecture Build
Build image for both AMD64 and ARM64

### Challenge 4: Optimize Build Time
Reduce build time using layer caching

### Challenge 5: Security Scan
Scan your images for vulnerabilities using Trivy

---

**🎉 Congratulations! You've mastered Docker basics!**

**Next Steps:**
- Practice building images daily
- Experiment with different base images
- Learn Kubernetes for orchestration
- Explore Docker security best practices
