# 🚀 Neon Murer CMS - Standalone Docker Deployment

## 📋 Übersicht

**Komplettes System in Docker** - ALLES containerisiert, keine externen Abhängigkeiten!  
Läuft auf **Port 3835** mit allen Services integriert.

---

## ⚡ One-Click Deployment

```bash
# 1. Repository klonen
git clone https://github.com/your-repo/neon-murer-cms.git
cd neon-murer-cms

# 2. Standalone Deployment starten
./deploy-standalone.sh
```

**Das war's!** Nach 2-3 Minuten läuft das komplette CMS auf:
- 🌐 **Website**: `http://localhost:3835/`
- 🎛️ **Admin**: `http://localhost:3835/cms-admin/`
- 🔧 **Nginx**: `http://localhost/` (Port 80 Proxy)

---

## 🐳 Was ist enthalten?

### **Alle Services in Docker:**
- ✅ **Node.js Application** (Port 3835)
- ✅ **PostgreSQL Database** (Port 5432)
- ✅ **Redis Cache** (Port 6379)
- ✅ **Nginx Reverse Proxy** (Port 80)
- ✅ **Database Initialization** (Migrations + Seeding)
- ✅ **Automated Backups** (täglich)
- ✅ **Health Monitoring** (alle 5 Min)

### **Integrierte Features:**
- 🔐 **Vorkonfigurierte Credentials**
- 📊 **Health Checks** für alle Services
- 💾 **Persistente Volumes** für Daten
- 🔄 **Auto-Restart** bei Fehlern
- 📈 **Resource-Limits** optimiert
- 🛡️ **Security Headers** via Nginx

---

## 🔐 Standard-Zugangsdaten

```
E-Mail: admin@neonmurer.ch
Passwort: admin_secure_2024
```

---

## 🛠️ Management Commands

### **Status prüfen:**
```bash
docker-compose -f docker-compose.standalone.yml ps
```

### **Logs anzeigen:**
```bash
# Alle Services
docker-compose -f docker-compose.standalone.yml logs -f

# Nur App
docker-compose -f docker-compose.standalone.yml logs -f app

# Nur Database
docker-compose -f docker-compose.standalone.yml logs -f db
```

### **Services verwalten:**
```bash
# Neustart
docker-compose -f docker-compose.standalone.yml restart

# Stoppen
docker-compose -f docker-compose.standalone.yml down

# Komplett neu starten
docker-compose -f docker-compose.standalone.yml down
./deploy-standalone.sh
```

### **Database-Zugriff:**
```bash
# Database Console
docker-compose -f docker-compose.standalone.yml exec db psql -U neon_user -d neon_murer_cms

# Backup erstellen
docker-compose -f docker-compose.standalone.yml exec db pg_dump -U neon_user neon_murer_cms > backup.sql
```

---

## 📊 Service-Übersicht

| Service | Container | Port | Beschreibung |
|---------|-----------|------|--------------|
| **App** | neon-murer-cms | 3835 | Haupt-CMS-Anwendung |
| **Database** | neon-murer-db | 5432 | PostgreSQL mit Daten |
| **Redis** | neon-murer-redis | 6379 | Cache & Sessions |
| **Nginx** | neon-murer-nginx | 80 | Reverse Proxy |
| **Init** | neon-murer-init | - | DB-Initialisierung |
| **Backup** | neon-murer-backup | - | Auto-Backups |
| **Monitor** | neon-murer-monitor | - | Health Checks |

---

## 💾 Persistente Daten

Alle wichtigen Daten werden in Docker-Volumes gespeichert:

- **`postgres_data`** - Datenbank-Inhalte
- **`redis_data`** - Cache-Daten
- **`app_content`** - Website-Inhalte
- **`app_uploads`** - Hochgeladene Dateien
- **`app_logs`** - Anwendungs-Logs
- **`app_backups`** - File-Backups
- **`db_backups`** - Datenbank-Backups

### **Volume-Management:**
```bash
# Volumes anzeigen
docker volume ls | grep neon

# Volume-Details
docker volume inspect neon_postgres_data

# Volumes bereinigen (⚠️ VORSICHT - löscht Daten!)
docker-compose -f docker-compose.standalone.yml down -v
```

---

## 🔧 Konfiguration anpassen

### **Ports ändern:**
In `docker-compose.standalone.yml` bearbeiten:
```yaml
services:
  app:
    ports:
      - "NEUER_PORT:3835"
    environment:
      - PORT=3835  # Container-intern bleibt 3835
```

### **Passwörter ändern:**
```yaml
environment:
  - POSTGRES_PASSWORD=NEUES_DB_PASSWORT
  - ADMIN_PASSWORD=NEUES_ADMIN_PASSWORT
  - JWT_SECRET=NEUER_JWT_SECRET
```

### **Resource-Limits:**
```yaml
deploy:
  resources:
    limits:
      cpus: '4.0'      # Mehr CPUs
      memory: 4G       # Mehr RAM
```

---

## 🚨 Troubleshooting

### **Port bereits belegt:**
```bash
# Prüfen welcher Prozess Port 3835 nutzt
lsof -i :3835

# Prozess beenden oder anderen Port wählen
```

### **Services starten nicht:**
```bash
# Logs prüfen
docker-compose -f docker-compose.standalone.yml logs

# Services einzeln starten
docker-compose -f docker-compose.standalone.yml up db
docker-compose -f docker-compose.standalone.yml up app
```

### **Database-Probleme:**
```bash
# Database-Status prüfen
docker-compose -f docker-compose.standalone.yml exec db pg_isready -U neon_user

# Database neu initialisieren
docker-compose -f docker-compose.standalone.yml down -v
./deploy-standalone.sh
```

### **Performance-Probleme:**
```bash
# Resource-Usage prüfen
docker stats

# Container-Limits anpassen (siehe Konfiguration)
```

---

## 🔄 Updates & Maintenance

### **Update durchführen:**
```bash
# Code aktualisieren
git pull origin main

# Neu deployen
./deploy-standalone.sh
```

### **Backup vor Update:**
```bash
# Manual Backup
docker-compose -f docker-compose.standalone.yml exec db pg_dump -U neon_user neon_murer_cms > pre-update-backup.sql

# Files backup
docker run --rm -v neon_app_content:/content -v neon_app_uploads:/uploads -v $(pwd):/backup alpine tar czf /backup/files-backup.tar.gz -C / content uploads
```

### **Clean Installation:**
```bash
# Alles löschen und neu starten
docker-compose -f docker-compose.standalone.yml down -v
docker system prune -f
./deploy-standalone.sh
```

---

## 📈 Monitoring & Health

### **Health Check URLs:**
- App: `http://localhost:3835/api/health`
- Database: Container-intern überwacht
- Redis: Container-intern überwacht
- Nginx: `http://localhost/health`

### **Automatisches Monitoring:**
Das System überwacht sich selbst:
- ✅ **Health Checks** alle 30 Sekunden
- ✅ **Auto-Restart** bei Fehlern
- ✅ **Backup-Alerts** bei Problemen
- ✅ **Resource-Monitoring** via Docker Stats

---

## 🎯 Vorteile der Standalone-Lösung

- 🐳 **Alles in Docker** - keine externen Dependencies
- ⚡ **One-Click Deployment** - läuft in Minuten
- 🔒 **Isolierte Umgebung** - keine Konflikte mit anderen Services
- 💾 **Persistente Daten** - Updates ohne Datenverlust
- 📈 **Production-Ready** - optimiert für Produktiveinsatz
- 🛡️ **Security** - konfigurierte Firewall-Regeln
- 🔄 **Auto-Healing** - Services starten automatisch neu

**Perfect für Server-Deployment! 🚀**
