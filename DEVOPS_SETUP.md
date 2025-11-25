# DevOps Pipeline Setup Guide

## 🚀 Complete CI/CD Pipeline with Jenkins, SonarQube, Nexus & Kubernetes

---

## **Prerequisites**

- Docker & Docker Compose installed
- Kubernetes cluster (Minikube, K3s, or Docker Desktop with Kubernetes)
- Jenkins running with required plugins
- Git configured

---

## **1. Start DevOps Tools Stack**

### **Option A: Start All Services (Application + DevOps Tools)**

```bash
cd ~/Desktop/Job-Applicaton-Manager

# Copy the extended docker-compose file to VM
# Then run:
docker-compose -f docker-compose-devops.yml up -d
```

### **Services Started:**
- **MySQL**: `localhost:3306`
- **Backend**: `localhost:8089`
- **Frontend**: `localhost:80`
- **SonarQube**: `localhost:9000`
- **Nexus**: `localhost:8081`

---

## **2. Configure SonarQube**

### **Initial Setup:**

1. **Access SonarQube**: http://localhost:9000
2. **Default credentials**: 
   - Username: `admin`
   - Password: `admin`
3. **Change password** when prompted
4. **Create a project**:
   - Project key: `job-application-manager`
   - Display name: `Job Application Manager`
5. **Generate token**:
   - Go to: My Account → Security → Generate Tokens
   - Name: `jenkins`
   - Copy the token (you'll need it for Jenkins)

### **Configure in Jenkins:**

1. Go to: **Manage Jenkins → Configure System**
2. Find **SonarQube servers** section
3. Add SonarQube:
   - Name: `SonarQube`
   - Server URL: `http://localhost:9000`
   - Server authentication token: (paste the token from SonarQube)

---

## **3. Configure Nexus**

### **Initial Setup:**

1. **Access Nexus**: http://localhost:8081
2. **Get initial password**:
   ```bash
   docker exec nexus cat /nexus-data/admin.password
   ```
3. **Login** with username `admin` and the password from above
4. **Complete setup wizard**:
   - Set new password
   - Enable anonymous access (optional)
   - Configure repositories

### **Create Maven Repositories:**

Nexus comes with default repositories:
- `maven-releases` (for release artifacts)
- `maven-snapshots` (for snapshot artifacts)
- `maven-central` (proxy to Maven Central)

### **Configure in Jenkins:**

Create `~/.m2/settings.xml` in Jenkins container:

```xml
<settings>
  <servers>
    <server>
      <id>nexus-releases</id>
      <username>admin</username>
      <password>YOUR_NEXUS_PASSWORD</password>
    </server>
    <server>
      <id>nexus-snapshots</id>
      <username>admin</username>
      <password>YOUR_NEXUS_PASSWORD</password>
    </server>
  </servers>
</settings>
```

---

## **4. Setup Kubernetes**

### **Option A: Minikube (Recommended for local development)**

```bash
# Install Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Start Minikube
minikube start --driver=docker

# Verify
kubectl get nodes
```

### **Option B: Docker Desktop Kubernetes**

1. Open Docker Desktop
2. Settings → Kubernetes
3. Enable Kubernetes
4. Apply & Restart

### **Option C: K3s (Lightweight Kubernetes)**

```bash
curl -sfL https://get.k3s.io | sh -
sudo chmod 644 /etc/rancher/k3s/k3s.yaml
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
```

### **Configure kubectl in Jenkins:**

```bash
# Copy kubeconfig to Jenkins container
docker cp ~/.kube/config jenkins:/var/jenkins_home/.kube/config
docker exec jenkins chown jenkins:jenkins /var/jenkins_home/.kube/config
```

---

## **5. Install Required Jenkins Plugins**

Go to **Manage Jenkins → Manage Plugins → Available**

Install:
- ✅ SonarQube Scanner
- ✅ Kubernetes CLI
- ✅ Docker Pipeline
- ✅ Nexus Artifact Uploader
- ✅ Pipeline Utility Steps

---

## **6. Configure Jenkins Tools**

**Manage Jenkins → Global Tool Configuration**

### **Maven:**
- Name: `Maven`
- Install automatically: ✅
- Version: 3.9.x

### **JDK:**
- Name: `JDK-17`
- Install automatically: ✅
- Version: 17

### **SonarQube Scanner:**
- Name: `SonarQube Scanner`
- Install automatically: ✅

---

## **7. Pipeline Execution Flow**

```
1. Checkout Code (Git)
2. Build & Package (Maven)
3. Run Tests (JUnit)
4. SonarQube Analysis (Code Quality)
5. Quality Gate Check
6. Upload to Nexus (Artifact Repository)
7. Archive Artifacts (Jenkins)
8. Build Docker Images
9. Push to Registry (Optional)
10. Deploy to Kubernetes
11. Verify Deployment
```

---

## **8. Run the Pipeline**

### **In Jenkins:**

1. Go to your pipeline job
2. Click **Build Now**
3. Monitor the pipeline stages
4. Check console output for any errors

### **Expected Results:**

- ✅ All tests pass
- ✅ SonarQube analysis completes
- ✅ Quality gate passes
- ✅ Artifacts uploaded to Nexus
- ✅ Docker images built
- ✅ Kubernetes deployment successful

---

## **9. Verify Kubernetes Deployment**

```bash
# Check pods
kubectl get pods

# Check services
kubectl get services

# Check deployments
kubectl get deployments

# View logs
kubectl logs -f deployment/backend
kubectl logs -f deployment/frontend

# Access application
kubectl port-forward service/frontend 8080:80
# Then visit: http://localhost:8080
```

---

## **10. Access Deployed Application**

### **If using LoadBalancer (cloud):**
```bash
kubectl get service frontend
# Use EXTERNAL-IP
```

### **If using NodePort (local):**
```bash
kubectl get service frontend
# Access via: http://<node-ip>:<node-port>
```

### **If using Port Forward:**
```bash
kubectl port-forward service/frontend 8080:80
# Access via: http://localhost:8080
```

---

## **11. Monitoring & Logs**

### **SonarQube Dashboard:**
- URL: http://localhost:9000
- View code quality metrics, bugs, vulnerabilities

### **Nexus Repository:**
- URL: http://localhost:8081
- Browse uploaded artifacts

### **Kubernetes Dashboard (Optional):**
```bash
# For Minikube
minikube dashboard

# For K3s/others
kubectl proxy
# Then visit: http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/
```

---

## **12. Troubleshooting**

### **SonarQube Issues:**
```bash
# Check logs
docker-compose logs sonarqube

# Restart
docker-compose restart sonarqube
```

### **Nexus Issues:**
```bash
# Check logs
docker-compose logs nexus

# Get admin password
docker exec nexus cat /nexus-data/admin.password
```

### **Kubernetes Issues:**
```bash
# Check pod status
kubectl describe pod <pod-name>

# View events
kubectl get events --sort-by='.lastTimestamp'

# Check logs
kubectl logs <pod-name>
```

### **Jenkins Pipeline Fails:**
- Check Jenkins console output
- Verify all credentials are configured
- Ensure all tools are installed
- Check network connectivity between services

---

## **13. Clean Up**

### **Stop all services:**
```bash
docker-compose -f docker-compose-devops.yml down
```

### **Remove volumes (fresh start):**
```bash
docker-compose -f docker-compose-devops.yml down -v
```

### **Delete Kubernetes resources:**
```bash
kubectl delete -f k8s/
```

---

## **🎯 Next Steps**

1. ✅ Add monitoring with Prometheus & Grafana
2. ✅ Implement automated testing with Selenium
3. ✅ Add security scanning with OWASP Dependency Check
4. ✅ Configure auto-scaling in Kubernetes
5. ✅ Set up GitOps with ArgoCD
6. ✅ Implement blue-green or canary deployments

---

## **📚 Resources**

- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [SonarQube Documentation](https://docs.sonarqube.org/)
- [Nexus Documentation](https://help.sonatype.com/repomanager3)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Docker Documentation](https://docs.docker.com/)
