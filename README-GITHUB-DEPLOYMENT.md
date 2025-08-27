# 🚀 Neon Murer CMS - GitHub Container Deployment

## 📋 Übersicht

**Deployment direkt von GitHub Container Registry** - Keine lokalen Builds nötig!  
Das System wird automatisch von GitHub als fertige Docker Images bereitgestellt.

---

## ⚡ Sofort-Deployment (Für jeden Server)

### **Option 1: Automatisches Script**
```bash
# Direkt von GitHub deployen (kein Git Clone nötig!)
curl -o deploy.sh https://raw.githubusercontent.com/crypticbae/neon-murer-cms/main/deploy-github.sh
chmod +x deploy.sh
./deploy.sh
```

### **Option 2: Manuelles Deployment**
```bash
# 1. Compose-Datei downloaden
mkdir neon-cms && cd neon-cms
curl -o docker-compose.yml https://raw.githubusercontent.com/crypticbae/neon-murer-cms/main/docker-compose.github.yml

# 2. Starten
docker compose up -d
```

**Das war's!** System läuft auf Port 3835 mit allen Services.

---

## 🐳 Was wird automatisch deployed?

### **Pre-Built Images von GitHub:**
- ✅ **`ghcr.io/crypticbae/neon-murer-cms:latest`** - CMS Application
- ✅ **`postgres:15-alpine`** - Database
- ✅ **`redis:7-alpine`** - Cache
- ✅ **`nginx:alpine`** - Reverse Proxy

### **Automatische Features:**
- 🔄 **Auto-Updates** - immer neueste Version von GitHub
- 📦 **No Build Required** - fertige Images werden gepullt
- 🚀 **Schneller Start** - keine Build-Zeit
- 💾 **Persistente Daten** - Volumes bleiben erhalten

---

## 🎯 Zugriff nach Deployment

- **🌐 Website**: `http://your-server:3835/`
- **🎛️ Admin-Panel**: `http://your-server:3835/cms-admin/`
- **📊 API Health**: `http://your-server:3835/api/health`
- **🔧 Nginx Proxy**: `http://your-server/` (Port 80)

### **Login-Daten:**
```
E-Mail: admin@neonmurer.ch
Passwort: admin123
```

---

## 📦 GitHub Container Registry

### **Automatische Builds:**
Das System baut automatisch neue Docker Images bei jedem GitHub Commit:

- 🔧 **GitHub Actions** - CI/CD Pipeline
- 📦 **Multi-Platform** - AMD64 & ARM64 Support
- 🏷️ **Tagging** - `latest`, `main`, Versionen
- 🔒 **Authentifizierung** - GitHub Token basiert

### **Image-Updates:**
```bash
# Neueste Version holen
docker compose pull

# Services neu starten mit Updates
docker compose up -d
```

---

## 🛠️ Management Commands

### **Service-Management:**
```bash
# Status prüfen
docker compose ps

# Logs anzeigen
docker compose logs -f app

# Neustart
docker compose restart

# Services stoppen
docker compose down

# Komplettes Update
docker compose pull && docker compose up -d
```

### **Daten-Management:**
```bash
# Database-Backup
docker compose exec db pg_dump -U neon_user neon_murer_cms > backup.sql

# Volume-Status
docker volume ls | grep neon

# Cleanup (⚠️ löscht Daten!)
docker compose down -v
```

---

## 🔧 Konfiguration anpassen

### **Environment-Variablen:**
Editiere `docker-compose.yml` um Einstellungen zu ändern:

```yaml
environment:
  - PORT=3835                    # Port ändern
  - ADMIN_PASSWORD=NEUES_PASSWORT # Admin-Passwort
  - DATABASE_URL=...             # Database-Connection
  - JWT_SECRET=...               # JWT-Sicherheit
```

### **Port-Mapping:**
```yaml
ports:
  - "NEUER_PORT:3835"           # Externen Port ändern
```

### **Volumes & Backup:**
```yaml
volumes:
  - ./backups:/app/backups      # Lokaler Backup-Ordner
  - ./content:/app/content      # Lokaler Content-Ordner
```

---

## 🚀 Vorteile der GitHub-Deployment

### **🎯 Für Entwickler:**
- ✅ **No Local Build** - keine Dockerfile nötig
- ✅ **CI/CD Ready** - automatische Updates
- ✅ **Multi-Platform** - läuft überall
- ✅ **Version Control** - alle Releases verfügbar

### **🎯 Für Server-Deployment:**
- ✅ **Schnelle Installation** - sofort verfügbar
- ✅ **Kleine Downloads** - optimierte Images
- ✅ **Auto-Updates** - einfach `docker compose pull`
- ✅ **Rollbacks** - vorherige Versionen verfügbar

### **🎯 Für Produktion:**
- ✅ **Reproducible Builds** - gleiche Images überall
- ✅ **Security Updates** - automatisch eingespielt
- ✅ **Monitoring** - GitHub Container Registry Metrics
- ✅ **Compliance** - nachverfolgbare Deployments

---

## 🔒 Security & Updates

### **Automatische Updates:**
GitHub Actions baut bei jedem Push neue Images:

```yaml
# .github/workflows/docker-build.yml
- Automatischer Build bei Push auf main
- Multi-Platform Support (AMD64/ARM64)
- Cache-Optimierung für schnelle Builds
- Security-Scanning inklusive
```

### **Manual Security Updates:**
```bash
# Neueste Security-Updates holen
docker compose pull

# Alle Services mit neuen Images starten
docker compose up -d

# Alte Images bereinigen
docker image prune -f
```

---

## 📊 Monitoring & Health

### **Health Checks:**
Alle Services haben integrierte Health Checks:

```bash
# Service-Status prüfen
docker compose ps

# Health-Status der App
curl http://localhost:3835/api/health

# Detaillierte Logs
docker compose logs --tail=100 app
```

### **Resource-Monitoring:**
```bash
# Resource-Usage
docker stats

# Disk-Usage
docker system df

# Volume-Usage
docker volume ls
```

---

## 🚨 Troubleshooting

### **Image-Download-Probleme:**
```bash
# GitHub Container Registry Login (falls private)
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Image manuell pullen
docker pull ghcr.io/crypticbae/neon-murer-cms:latest
```

### **Service-Start-Probleme:**
```bash
# Reihenfolge-Probleme lösen
docker compose up -d db redis
sleep 30
docker compose up -d app nginx

# Logs analysieren
docker compose logs db
docker compose logs app
```

### **Port-Konflikte:**
```bash
# Port-Usage prüfen
netstat -tulpn | grep :3835

# Alternative Ports verwenden
sed -i 's/3835:3835/3836:3835/' docker-compose.yml
```

---

## 🔄 CI/CD Integration

Das System ist vollständig CI/CD-ready:

### **Automatische Pipeline:**
1. **Code Push** → GitHub Repository
2. **GitHub Actions** → Build Docker Image
3. **Container Registry** → Published Image
4. **Server Update** → `docker compose pull && docker compose up -d`

### **Integration-Beispiele:**
```bash
# Watchtower für Auto-Updates
docker run -d --name watchtower \
  -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower \
  --interval 300

# Webhook für Deployments
curl -X POST http://your-server/webhook/deploy
```

---

## 🎉 Fazit

**GitHub Container Deployment** bietet:
- 🚀 **Schnellstes Deployment** - keine Build-Zeit
- 🔄 **Einfachste Updates** - `docker compose pull`
- 🏗️ **Production-Ready** - CI/CD optimiert
- 📦 **Platform-Agnostic** - läuft überall

**Perfect für professionelle Server-Deployments! 🌟**
