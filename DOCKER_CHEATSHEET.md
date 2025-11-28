# 🐳 Docker Cheat Sheet - Quick Reference

## 📦 Images

```bash
# Build
docker build -t name:tag .                    # Build image
docker build --no-cache -t name:tag .         # Build without cache
docker build -f Dockerfile.dev -t name:tag .  # Use specific Dockerfile

# List
docker images                                 # List all images
docker images -a                              # Include intermediate images
docker images | grep keyword                  # Filter images

# Remove
docker rmi image_id                           # Remove image
docker rmi $(docker images -q)                # Remove all images
docker image prune                            # Remove unused images
docker image prune -a                         # Remove all unused images

# Inspect
docker inspect image_name                     # View image details
docker history image_name                     # View image layers
```

## 🚀 Containers

```bash
# Run
docker run image                              # Run container
docker run -d image                           # Run in background (detached)
docker run -it image bash                     # Run interactive with bash
docker run -p 8080:80 image                   # Map ports (host:container)
docker run --name myapp image                 # Name the container
docker run -e VAR=value image                 # Set environment variable
docker run -v /host:/container image          # Mount volume
docker run --rm image                         # Auto-remove after exit
docker run --restart unless-stopped image     # Restart policy

# List
docker ps                                     # List running containers
docker ps -a                                  # List all containers
docker ps -q                                  # List container IDs only

# Manage
docker start container_id                     # Start stopped container
docker stop container_id                      # Stop running container
docker restart container_id                   # Restart container
docker pause container_id                     # Pause container
docker unpause container_id                   # Unpause container
docker kill container_id                      # Force stop container

# Remove
docker rm container_id                        # Remove stopped container
docker rm -f container_id                     # Force remove running container
docker rm $(docker ps -aq)                    # Remove all containers
docker container prune                        # Remove stopped containers

# Logs & Debug
docker logs container_id                      # View logs
docker logs -f container_id                   # Follow logs (live)
docker logs --tail 100 container_id           # Last 100 lines
docker logs --since 1h container_id           # Logs from last hour
docker exec -it container_id bash             # Enter container
docker exec container_id command              # Run command in container
docker top container_id                       # View processes
docker stats container_id                     # View resource usage
docker inspect container_id                   # View details
docker port container_id                      # View port mappings
docker diff container_id                      # View file changes
```

## 🐙 Docker Compose

```bash
# Start
docker-compose up                             # Start all services
docker-compose up -d                          # Start in background
docker-compose up --build                     # Build and start
docker-compose up service_name                # Start specific service
docker-compose up --scale service=3           # Scale service to 3 instances

# Stop
docker-compose down                           # Stop all services
docker-compose down -v                        # Stop and remove volumes
docker-compose stop                           # Stop without removing
docker-compose stop service_name              # Stop specific service

# Manage
docker-compose ps                             # List services
docker-compose logs                           # View all logs
docker-compose logs -f service_name           # Follow service logs
docker-compose exec service_name bash         # Enter service container
docker-compose restart                        # Restart all services
docker-compose restart service_name           # Restart specific service
docker-compose pull                           # Pull latest images
docker-compose build                          # Build all services
docker-compose build service_name             # Build specific service

# Config
docker-compose config                         # Validate and view config
docker-compose config --services              # List services
```

## 📁 Volumes

```bash
# Create
docker volume create volume_name              # Create volume

# List
docker volume ls                              # List volumes

# Inspect
docker volume inspect volume_name             # View volume details

# Remove
docker volume rm volume_name                  # Remove volume
docker volume prune                           # Remove unused volumes
```

## 🌐 Networks

```bash
# Create
docker network create network_name            # Create network
docker network create --driver bridge net     # Create bridge network

# List
docker network ls                             # List networks

# Inspect
docker network inspect network_name           # View network details

# Connect
docker network connect network container      # Connect container to network
docker network disconnect network container   # Disconnect container

# Remove
docker network rm network_name                # Remove network
docker network prune                          # Remove unused networks
```

## 🧹 Cleanup

```bash
# Remove Everything
docker system prune                           # Remove unused data
docker system prune -a                        # Remove all unused data
docker system prune -a --volumes              # Remove everything unused

# Specific Cleanup
docker container prune                        # Remove stopped containers
docker image prune                            # Remove unused images
docker image prune -a                         # Remove all unused images
docker volume prune                           # Remove unused volumes
docker network prune                          # Remove unused networks

# Disk Usage
docker system df                              # Show disk usage
docker system df -v                           # Verbose disk usage
```

## 🔍 Inspect & Debug

```bash
# Container Info
docker inspect container_id                   # Full container details
docker inspect -f '{{.State.Status}}' cont    # Specific field
docker inspect -f '{{.NetworkSettings.IPAddress}}' cont  # Container IP

# Logs
docker logs container_id                      # View logs
docker logs -f container_id                   # Follow logs
docker logs --tail 50 container_id            # Last 50 lines
docker logs --since 2h container_id           # Last 2 hours

# Stats
docker stats                                  # All containers stats
docker stats container_id                     # Specific container
docker top container_id                       # Container processes

# Health
docker inspect -f '{{.State.Health.Status}}' cont  # Health status
docker events                                 # Docker events stream
```

## 📝 Dockerfile Instructions

```dockerfile
FROM image:tag                                # Base image
WORKDIR /app                                  # Set working directory
COPY source dest                              # Copy files
ADD source dest                               # Copy + extract archives
RUN command                                   # Execute command
CMD ["executable", "param"]                   # Default command
ENTRYPOINT ["executable"]                     # Main executable
EXPOSE 8080                                   # Document port
ENV KEY=value                                 # Environment variable
ARG KEY=value                                 # Build argument
VOLUME /data                                  # Create mount point
USER username                                 # Switch user
LABEL key=value                               # Add metadata
HEALTHCHECK CMD command                       # Health check
```

## 🔐 Best Practices

```dockerfile
# Multi-stage build
FROM maven:3.8.7 AS build
RUN mvn package
FROM openjdk:21-slim
COPY --from=build /app/target/*.jar app.jar

# Minimize layers
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

# Use specific tags
FROM openjdk:21-jdk-slim                      # ✅ Good
FROM openjdk:latest                           # ❌ Bad

# Don't run as root
RUN useradd -r appuser
USER appuser

# Use .dockerignore
node_modules
.git
*.log

# Add health checks
HEALTHCHECK CMD curl -f http://localhost/health || exit 1
```

## 🚀 Common Workflows

### Build and Run
```bash
docker build -t myapp:v1 .
docker run -d -p 8080:80 --name myapp myapp:v1
docker logs -f myapp
```

### Debug Container
```bash
docker ps -a
docker logs container_id
docker exec -it container_id bash
docker inspect container_id
```

### Full Stack with Compose
```bash
docker-compose up -d
docker-compose ps
docker-compose logs -f
docker-compose down
```

### Clean Everything
```bash
docker stop $(docker ps -aq)
docker rm $(docker ps -aq)
docker rmi $(docker images -q)
docker system prune -a --volumes
```

### Push to Registry
```bash
docker login
docker tag myapp:v1 username/myapp:v1
docker push username/myapp:v1
```

## 📊 Port Mapping Examples

```bash
-p 8080:80                                    # Host 8080 → Container 80
-p 127.0.0.1:8080:80                         # Bind to localhost only
-p 8080-8090:8080-8090                       # Range mapping
-P                                            # Auto-map all exposed ports
```

## 🔧 Environment Variables

```bash
-e VAR=value                                  # Single variable
-e VAR1=val1 -e VAR2=val2                    # Multiple variables
--env-file .env                               # From file
```

## 💾 Volume Mounting

```bash
-v /host/path:/container/path                 # Bind mount
-v volume_name:/container/path                # Named volume
-v /container/path                            # Anonymous volume
--mount type=bind,source=/host,target=/cont   # Explicit mount
```

## 🌐 Network Modes

```bash
--network bridge                              # Default bridge
--network host                                # Use host network
--network none                                # No networking
--network container:other_container           # Share network
--network custom_network                      # Custom network
```

## ⚡ Quick Commands

```bash
# One-liners
docker run -d -p 80:80 nginx                  # Quick nginx
docker run -it --rm alpine sh                 # Temporary alpine shell
docker run -it --rm -v $(pwd):/app node bash  # Node dev environment
docker exec -it $(docker ps -q) bash          # Enter last container

# Aliases (add to ~/.bashrc)
alias dps='docker ps'
alias dpsa='docker ps -a'
alias di='docker images'
alias dlog='docker logs -f'
alias dex='docker exec -it'
alias dcu='docker-compose up -d'
alias dcd='docker-compose down'
```

---

**💡 Pro Tips:**

1. Always use specific image tags, not `latest`
2. Use multi-stage builds to reduce image size
3. Add `.dockerignore` to exclude unnecessary files
4. Don't run containers as root
5. Use health checks for production
6. Clean up regularly with `docker system prune`
7. Use docker-compose for multi-container apps
8. Tag images with version numbers
9. Use volumes for persistent data
10. Monitor resource usage with `docker stats`

---

**🔗 Quick Links:**
- Docs: https://docs.docker.com
- Hub: https://hub.docker.com
- Compose: https://docs.docker.com/compose/

**📱 Save this cheat sheet for quick reference!**
