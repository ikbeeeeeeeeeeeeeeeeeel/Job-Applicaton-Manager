# 🚀 DevOps Setup Guide - Job Application Manager

## 📋 Prerequisites Installed
- ✅ Jenkins 2.539
- ✅ Java 21
- ✅ Maven 3.8.7
- ✅ Docker

---

## 🛠️ Step 1: Install Additional Tools

### 1.1 Install Docker Compose
```bash
sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

### 1.2 Install SonarQube via Docker
```bash
docker run -d --name sonarqube \
  -p 9000:9000 \
  -e SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true \
  sonarqube:latest

# Wait 2-3 minutes for SonarQube to start
# Access: http://192.168.245.131:9000
# Default credentials: admin/admin
```

### 1.3 Install Nexus via Docker
```bash
docker run -d --name nexus \
  -p 8081:8081 \
  -v nexus-data:/nexus-data \
  sonatype/nexus3:latest

# Wait 2-3 minutes for Nexus to start
# Access: http://192.168.245.131:8081
# Get admin password:
docker exec -it nexus cat /nexus-data/admin.password
```

---

## 🔧 Step 2: Configure Jenkins

### 2.1 Install Jenkins Plugins
Go to Jenkins → Manage Jenkins → Plugins → Available Plugins

Install these plugins:
- ✅ Git
- ✅ GitHub
- ✅ Pipeline
- ✅ Docker Pipeline
- ✅ SonarQube Scanner
- ✅ JaCoCo
- ✅ JUnit

### 2.2 Configure Maven in Jenkins
1. Go to **Manage Jenkins** → **Tools**
2. Add Maven:
   - Name: `Maven-3.8.7`
   - MAVEN_HOME: `/usr/share/maven`

### 2.3 Configure JDK in Jenkins
1. Go to **Manage Jenkins** → **Tools**
2. Add JDK:
   - Name: `JDK-21`
   - JAVA_HOME: `/usr/lib/jvm/java-21-openjdk-amd64`

### 2.4 Configure SonarQube in Jenkins
1. Go to **Manage Jenkins** → **System**
2. Add SonarQube Server:
   - Name: `SonarQube`
   - Server URL: `http://192.168.245.131:9000`
   - Token: Generate from SonarQube → My Account → Security → Generate Token

3. Add token as Jenkins credential:
   - Go to **Manage Jenkins** → **Credentials**
   - Add → Secret text
   - ID: `sonarqube-token`
   - Secret: [paste token]

### 2.5 Configure Docker Hub Credentials
1. Go to **Manage Jenkins** → **Credentials**
2. Add → Username with password
   - ID: `dockerhub-credentials`
   - Username: [your Docker Hub username]
   - Password: [your Docker Hub password]

### 2.6 Configure Nexus Credentials
1. Go to **Manage Jenkins** → **Credentials**
2. Add → Username with password
   - ID: `nexus-credentials`
   - Username: `admin`
   - Password: [from Step 1.3]

---

## 📝 Step 3: Update Maven Settings for Nexus

Create `~/.m2/settings.xml`:
```xml
<settings>
  <servers>
    <server>
      <id>nexus</id>
      <username>admin</username>
      <password>YOUR_NEXUS_PASSWORD</password>
    </server>
  </servers>
  
  <mirrors>
    <mirror>
      <id>nexus</id>
      <mirrorOf>*</mirrorOf>
      <url>http://localhost:8081/repository/maven-public/</url>
    </mirror>
  </mirrors>
</settings>
```

---

## 🐳 Step 4: Setup Docker

### 4.1 Add Jenkins user to Docker group
```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### 4.2 Verify Docker access
```bash
sudo -u jenkins docker ps
```

---

## 🔐 Step 5: Configure SonarQube

1. Access SonarQube: `http://192.168.245.131:9000`
2. Login with: `admin/admin` → Change password
3. Go to **Administration** → **Configuration** → **Webhooks**
4. Create webhook:
   - Name: `Jenkins`
   - URL: `http://192.168.245.131:8080/sonarqube-webhook/`

---

## 🚀 Step 6: Run the Pipeline

### 6.1 Push code to GitHub
```bash
cd ~/Desktop/job-application-manager
git add .
git commit -m "Add DevOps configuration"
git push origin main
```

### 6.2 Trigger Jenkins Build
Option 1: **Manual**
- Go to Jenkins Dashboard
- Click "Build Now" on your pipeline

Option 2: **Automatic (Poll SCM)**
- Already configured (H/5 * * * *)
- Jenkins will check GitHub every 5 minutes

### 6.3 Monitor Build
- Click on build number → Console Output
- Watch each stage execute

---

## 📊 Step 7: Access Monitoring Tools

### Grafana
```bash
# After docker-compose up
# Access: http://192.168.245.131:3000
# Login: admin/admin123
```

**Import Dashboard:**
1. Go to Dashboards → New → Import
2. Use Dashboard ID: `4701` (JVM Micrometer)
3. Select Prometheus datasource

### Prometheus
```bash
# Access: http://192.168.245.131:9090
# Check targets: Status → Targets
```

---

## 🧪 Step 8: Create Sample Tests (Optional)

Create a simple test to verify JUnit + Mockito:

**File:** `application-management/src/test/java/com/example/applicationsManagement/SimpleTest.java`

```java
package com.example.applicationsManagement;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class SimpleTest {
    
    @Test
    public void testAddition() {
        assertEquals(4, 2 + 2);
    }
    
    @Test
    public void testSubtraction() {
        assertEquals(0, 2 - 2);
    }
}
```

---

## ✅ Pipeline Stages Overview

| Stage | Purpose | Duration |
|-------|---------|----------|
| 📋 Checkout | Clone from GitHub | ~5s |
| 🧹 Clean | Clean previous builds | ~3s |
| 🔨 Build | Compile Java code | ~20s |
| 🧪 Unit Tests | Run JUnit tests | ~15s |
| 📊 SonarQube | Code analysis | ~30s |
| ✅ Quality Gate | Check quality | ~5s |
| 📦 Package | Create JAR | ~10s |
| 📤 Nexus | Upload artifact | ~10s |
| 🐳 Docker Build | Build images | ~60s |
| 🔐 Security Scan | Trivy scan | ~30s |
| 📤 Docker Push | Push to Hub | ~30s |
| 🚀 Deploy | Docker Compose | ~30s |
| ✅ Health Check | Verify running | ~30s |

**Total:** ~4-5 minutes

---

## 🐛 Troubleshooting

### Jenkins can't connect to Docker
```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### SonarQube not starting
```bash
# Increase max_map_count
sudo sysctl -w vm.max_map_count=262144
```

### Permission denied on Nexus
```bash
docker exec -it nexus chown -R nexus:nexus /nexus-data
docker restart nexus
```

### Pipeline fails on Maven
```bash
# Reload Maven in Jenkins
mvn clean install -U
```

---

## 📈 Success Metrics

After successful pipeline:
- ✅ All tests pass
- ✅ Code coverage > 50%
- ✅ SonarQube Quality Gate passes
- ✅ Docker images built and pushed
- ✅ Application deployed and healthy
- ✅ Grafana shows metrics

---

## 🎯 Next Steps

1. **Write More Tests** - Increase code coverage
2. **Configure Email Notifications** - Alert on failures
3. **Add Slack Integration** - Real-time notifications
4. **Setup Backup Strategy** - Database backups
5. **Add Integration Tests** - Test full workflows
6. **Performance Testing** - JMeter/Gatling
7. **Security Scanning** - OWASP Dependency Check

---

## 📚 Useful Commands

```bash
# View Jenkins logs
sudo journalctl -u jenkins -f

# View Docker logs
docker logs -f job-manager-backend
docker logs -f job-manager-frontend

# Restart all services
docker-compose restart

# View running containers
docker ps

# Clean Docker
docker system prune -a --volumes

# Maven test only
mvn test

# Maven with coverage
mvn clean test jacoco:report
```

---

**🎉 Your CI/CD pipeline is ready!**
