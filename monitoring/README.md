# 📊 Monitoring Setup Guide

## Overview
Your Job Application Manager has comprehensive monitoring with **Prometheus** (metrics collection) and **Grafana** (visualization).

---

## 🚀 Quick Start

### 1. Access Grafana Dashboard
**URL:** `http://192.168.245.132:3000`

**Login Credentials:**
- Username: `admin`
- Password: `admin123`

### 2. View Pre-configured Dashboard
After logging in:
1. Click **Dashboards** (left sidebar)
2. Select **"Job Application Manager - Spring Boot Metrics"**

The dashboard will automatically load with real-time metrics!

---

## 📈 Dashboard Metrics Explained

### **Top Row - Key Performance Indicators (KPIs)**

#### 1. Application Uptime
- **What it shows:** How long the backend has been running (in seconds)
- **Why it matters:** Verify application stability
- **Example:** `86400` = 24 hours uptime

#### 2. Requests per Minute
- **What it shows:** Number of HTTP requests hitting your API per minute
- **Why it matters:** Monitor traffic load
- **Example:** `50 req/min` = healthy traffic

#### 3. Average Response Time
- **What it shows:** How fast your API responds (in seconds)
- **Why it matters:** User experience indicator
- **Thresholds:**
  - 🟢 Green: < 0.5s (Good)
  - 🟡 Yellow: 0.5-1s (Acceptable)
  - 🔴 Red: > 1s (Slow - needs optimization)

#### 4. CPU Usage
- **What it shows:** System CPU usage percentage
- **Why it matters:** Resource utilization
- **Normal:** 10-40% average

---

### **Middle Section - Resource Monitoring**

#### 5. JVM Memory Usage
Monitors Java Virtual Machine memory:
- **Heap Used:** Memory used by your application objects
- **Heap Max:** Maximum heap memory available
- **Non-Heap Used:** Memory for classes, code, etc.

**What to watch:**
- If "Heap Used" approaches "Heap Max" → potential OutOfMemory errors
- Frequent spikes → check for memory leaks

#### 6. JVM Threads
Monitors application threads:
- **Live Threads:** Currently active threads
- **Daemon Threads:** Background service threads
- **Peak Threads:** Maximum threads reached

**Normal behavior:**
- Live threads: 20-50 typically
- Sudden spikes → potential thread leaks

---

### **Performance Metrics**

#### 7. HTTP Request Rate by Endpoint
Shows which API endpoints receive the most traffic:
- **GET /api/candidates** - View candidates
- **POST /api/applications** - Submit applications
- **GET /api/job-offers** - View job offers

**Use case:** Identify hottest endpoints for optimization

#### 8. HTTP Response Time (95th Percentile)
Shows the 95th percentile response time for each endpoint.

**What this means:**
- `p95 = 0.5s` → 95% of requests complete in under 0.5 seconds
- The slowest 5% take longer

**Use case:** Find slow endpoints that need optimization

---

### **Database & Infrastructure**

#### 9. Database Connection Pool (HikariCP)
Monitors MySQL connection pool:
- **Active Connections:** Currently in use
- **Idle Connections:** Available for new requests
- **Max Connections:** Pool limit (usually 10)

**What to watch:**
- If Active ≈ Max → increase pool size
- If Active = 0 → database not being used

#### 10. Garbage Collection Time
Shows Java garbage collection activity:
- **Young Generation GC:** Quick, frequent cleanups
- **Old Generation GC:** Longer, less frequent cleanups

**Normal behavior:**
- Occasional spikes are normal
- Frequent long pauses → tune JVM settings

---

## 🔍 Prometheus Targets

### View Metrics Collection Status

**URL:** `http://192.168.245.132:9090/targets`

**You should see:**
- ✅ **spring-boot-backend** (UP) - `http://backend:8089/actuator/prometheus`
- ✅ **prometheus** (UP) - `http://localhost:9090/metrics`

If any target shows **DOWN**, check:
1. Service is running: `docker ps`
2. Endpoint is accessible: `curl http://localhost:8089/actuator/prometheus`

---

## 🔧 Advanced Prometheus Queries

Access Prometheus Query UI: `http://192.168.245.132:9090/graph`

### Useful Queries

**1. Request Rate (Last 5 minutes)**
```promql
rate(http_server_requests_seconds_count[5m])
```

**2. Memory Usage Percentage**
```promql
(jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"}) * 100
```

**3. Error Rate**
```promql
rate(http_server_requests_seconds_count{status=~"5.."}[5m])
```

**4. Database Query Time**
```promql
hikaricp_connections_acquire_seconds_sum / hikaricp_connections_acquire_seconds_count
```

**5. Top 5 Slowest Endpoints**
```promql
topk(5, histogram_quantile(0.95, sum(rate(http_server_requests_seconds_bucket[5m])) by (le, uri)))
```

---

## 📊 Creating Custom Dashboards

### Step 1: Create New Dashboard
1. In Grafana, click **"+"** → **Dashboard**
2. Click **"Add new panel"**

### Step 2: Configure Panel
1. **Data Source:** Select "Prometheus"
2. **Query:** Enter PromQL query (examples above)
3. **Visualization:** Choose graph type (Time series, Gauge, Stat, etc.)
4. **Panel Title:** Give it a meaningful name

### Step 3: Save Dashboard
1. Click **💾 Save dashboard**
2. Enter name and folder
3. Click **Save**

---

## 🔔 Setting Up Alerts (Optional)

### Configure Alert Rules in Grafana

**Example: High Response Time Alert**

1. Edit a panel in your dashboard
2. Go to **Alert** tab
3. Click **Create Alert**
4. Set condition:
   ```
   WHEN avg() OF query(A, 5m, now) IS ABOVE 1
   ```
5. Configure notification channel (Email, Slack, etc.)

**Common Alerts to Set:**
- Response time > 1 second
- CPU usage > 80%
- Memory usage > 90%
- Error rate > 5%
- Database connections at max

---

## 📁 File Structure

```
monitoring/
├── prometheus.yml                    # Prometheus configuration
├── grafana-datasources.yml          # Auto-provision Prometheus datasource
├── grafana-dashboards.yml           # Dashboard provisioning config
├── dashboards/
│   └── spring-boot-dashboard.json   # Spring Boot metrics dashboard
└── README.md                        # This file
```

---

## 🐛 Troubleshooting

### Dashboard Shows "No Data"

**Problem:** Panels display "No data"

**Solutions:**
1. Check if backend is running:
   ```bash
   docker ps | grep backend
   ```

2. Verify Prometheus is scraping:
   ```bash
   curl http://192.168.245.132:9090/targets
   ```

3. Check backend metrics endpoint:
   ```bash
   curl http://192.168.245.132:8089/actuator/prometheus
   ```

4. Verify time range in Grafana (top-right corner)
   - Try: "Last 15 minutes"

---

### Prometheus Shows Target "Down"

**Problem:** Backend target shows as DOWN in Prometheus

**Solutions:**
1. Check backend health:
   ```bash
   docker logs job-manager-backend
   curl http://localhost:8089/actuator/health
   ```

2. Verify network connectivity:
   ```bash
   docker exec -it job-manager-prometheus wget -O- http://backend:8089/actuator/prometheus
   ```

3. Restart services:
   ```bash
   docker-compose restart backend prometheus
   ```

---

### Grafana Won't Load

**Problem:** Cannot access Grafana at port 3000

**Solutions:**
1. Check if container is running:
   ```bash
   docker ps | grep grafana
   ```

2. Check logs:
   ```bash
   docker logs job-manager-grafana
   ```

3. Restart Grafana:
   ```bash
   docker-compose restart grafana
   ```

---

## 🎯 Best Practices

### 1. **Monitor Regularly**
- Check dashboard daily during development
- Set up alerts for production

### 2. **Baseline Performance**
- Record normal metrics (e.g., "avg response time = 0.2s")
- Identify anomalies by comparing to baseline

### 3. **Correlate Metrics**
- High CPU + High Request Rate = normal
- High CPU + Low Request Rate = inefficient code

### 4. **Use Time Ranges Wisely**
- **Development:** Last 15 minutes
- **Testing:** Last 1 hour
- **Production:** Last 24 hours

### 5. **Export Dashboards**
- Settings → JSON Model → Copy
- Save as backup before making changes

---

## 📚 Additional Resources

### Official Documentation
- **Prometheus:** https://prometheus.io/docs/
- **Grafana:** https://grafana.com/docs/
- **Spring Boot Actuator:** https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html
- **Micrometer:** https://micrometer.io/docs

### Pre-built Dashboards
- **Grafana Dashboard Library:** https://grafana.com/grafana/dashboards/
- **Spring Boot Dashboard:** https://grafana.com/grafana/dashboards/6756

---

## ✅ Quick Health Check

Run these commands to verify everything is working:

```bash
# 1. Check all containers are running
docker-compose ps

# 2. Test backend metrics endpoint
curl http://localhost:8089/actuator/prometheus | head -n 20

# 3. Test Prometheus
curl http://localhost:9090/-/healthy

# 4. Test Grafana
curl http://localhost:3000/api/health

# 5. View Prometheus targets
curl http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | {job: .labels.job, health: .health}'
```

**Expected Results:** All should return healthy status!

---

## 🎉 Success Indicators

You know monitoring is working when:
- ✅ Grafana dashboard loads without errors
- ✅ All panels show data (not "No data")
- ✅ Metrics update in real-time (refresh every 10s)
- ✅ Prometheus targets page shows all targets UP
- ✅ You can query metrics directly in Prometheus

---

**Your monitoring stack is now ready for production! 🚀**
