# ⚡ DevOps Quick Start - 5 Minutes

## ✅ What I've Created for You:

### 1. **Jenkinsfile** - Complete CI/CD Pipeline
- 13 stages from checkout to deployment
- Parallel Docker builds
- Automated testing & quality checks
- Security scanning

### 2. **Docker Configuration**
- ✅ `application-management/Dockerfile` - Backend
- ✅ `frontend/Dockerfile` - Frontend  
- ✅ `frontend/nginx.conf` - Nginx config
- ✅ `docker-compose.yml` - Full stack orchestration

### 3. **Monitoring Setup**
- ✅ `monitoring/prometheus.yml` - Prometheus config
- ✅ `monitoring/grafana-datasources.yml` - Grafana datasource
- ✅ Actuator endpoints enabled

### 4. **Maven Configuration**
- ✅ Updated `pom.xml` with:
  - JaCoCo (code coverage)
  - Surefire (testing)
  - SonarQube plugin
  - Mockito dependencies
  - Actuator + Prometheus

---

## 🚀 Next Steps (In Your Ubuntu VM):

### Step 1: Install Missing Tools (5 min)
```bash
# Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# SonarQube
docker run -d --name sonarqube -p 9000:9000 sonarqube:latest

# Nexus (optional for now)
docker run -d --name nexus -p 8081:8081 sonatype/nexus3:latest
```

### Step 2: Configure Jenkins (10 min)
1. **Install Plugins:**
   - Git, Pipeline, Docker Pipeline, SonarQube Scanner, JaCoCo

2. **Add Tools:**
   - Maven: Name=`Maven-3.8.7`, Home=`/usr/share/maven`
   - JDK: Name=`JDK-21`, Home=`/usr/lib/jvm/java-21-openjdk-amd64`

3. **Add Credentials:**
   - SonarQube token (from http://192.168.245.131:9000)
   - Docker Hub credentials (optional)

### Step 3: Configure Pipeline
Your pipeline is already configured! Just need to:
```bash
# On your Ubuntu VM, clone the repo
cd ~/Desktop
git clone https://github.com/ikbeeeeeeeeeeeeel/Job-Application-Manager.git

# OR pull latest changes if already cloned
cd ~/Desktop/job-application-manager
git pull origin main
```

### Step 4: Run Pipeline
1. Go to Jenkins: http://192.168.245.131:8080
2. Click your pipeline: `job-application-manager-pipeline`
3. Click **"Build Now"**
4. Watch it run! 🎉

---

## 📊 What You'll See:

### Jenkins Pipeline View:
```
✅ Checkout          (5s)
✅ Clean             (3s)
✅ Build Backend     (20s)
✅ Unit Tests        (15s)
✅ SonarQube         (30s)
✅ Quality Gate      (5s)
✅ Package           (10s)
✅ Build Docker      (60s)
✅ Security Scan     (30s)
✅ Deploy            (30s)
✅ Health Check      (30s)
```

### After Success:
- **Backend:** http://192.168.245.131:8089
- **Frontend:** http://192.168.245.131
- **Grafana:** http://192.168.245.131:3000 (admin/admin123)
- **Prometheus:** http://192.168.245.131:9090
- **SonarQube:** http://192.168.245.131:9000

---

## 🔧 Quick Commands:

### View logs:
```bash
docker logs -f job-manager-backend
docker logs -f job-manager-frontend
```

### Restart services:
```bash
docker-compose restart
```

### Stop everything:
```bash
docker-compose down
```

### Clean Docker:
```bash
docker system prune -a
```

---

## 🆘 If Pipeline Fails:

### Common Issues:

**1. Docker permission denied:**
```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

**2. SonarQube not ready:**
Wait 2-3 minutes after starting SonarQube

**3. Maven build fails:**
```bash
cd application-management
mvn clean install -U
```

**4. Port already in use:**
```bash
# Check what's using the port
sudo lsof -i :8089
# Kill the process or change port in application.properties
```

---

## ✅ Success Checklist:

- [ ] Jenkins running on :8080
- [ ] SonarQube running on :9000
- [ ] Docker & Docker Compose installed
- [ ] Jenkins has Git, Docker, SonarQube plugins
- [ ] Maven & JDK configured in Jenkins
- [ ] Pipeline created and connected to GitHub
- [ ] Code pushed to GitHub (with Jenkinsfile)
- [ ] First build successful
- [ ] Application accessible at :8089 and :80

---

## 📖 Full Documentation:

See `DEVOPS_SETUP.md` for complete step-by-step guide with all details.

---

**🎯 Goal:** Complete CI/CD pipeline with automated testing, code analysis, security scanning, and deployment!

**Current Status:**
- ✅ Jenkinsfile created
- ✅ Dockerfiles created
- ✅ Docker Compose configured
- ✅ Monitoring setup ready
- ✅ Maven configured with plugins
- ⏳ Waiting for you to configure Jenkins tools

**Time to first successful build:** ~20-30 minutes

Good luck! 🚀
