# 🚀 Neon Murer CMS - Vollständige Server-Deployment-Anleitung

## 📋 Übersicht

Diese Anleitung führt dich Schritt für Schritt durch das komplette Deployment des Neon Murer CMS auf deinem Server mit Docker Compose, inklusive PostgreSQL-Datenbank, Redis-Cache, Nginx-Proxy und automatischen Backups.

---

## 🛠️ Voraussetzungen

### Server-Anforderungen:
- **OS**: Ubuntu 20.04+ / Debian 11+ / CentOS 8+ (empfohlen: Ubuntu 22.04 LTS)
- **RAM**: Mindestens 4GB (empfohlen: 8GB+)
- **CPU**: Mindestens 2 Cores (empfohlen: 4 Cores)
- **Storage**: Mindestens 50GB SSD
- **Network**: Feste IP-Adresse oder Domain

### Software-Voraussetzungen:
- **Docker** (Version 20.10+)
- **Docker Compose** (Version 2.0+)
- **Git**
- **Curl**
- **Nginx** (optional, für SSL-Termination)

---

## 🔧 Schritt 1: Server-Vorbereitung

### 1.1 System aktualisieren
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

### 1.2 Docker installieren
```bash
# Ubuntu/Debian - Offizieller Docker-Installer
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Docker-Compose installieren
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Docker-Service starten
sudo systemctl enable docker
sudo systemctl start docker

# Benutzer zur Docker-Gruppe hinzufügen
sudo usermod -aG docker $USER
```

### 1.3 Firewall konfigurieren
```bash
# Ubuntu UFW
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 3001  # CMS (temporär für Testing)
sudo ufw enable

# CentOS Firewalld
sudo firewall-cmd --permanent --add-port=22/tcp
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --reload
```

---

## 📁 Schritt 2: Projekt-Setup

### 2.1 Projekt auf Server übertragen
```bash
# Option A: Git Clone (empfohlen)
cd /opt
sudo git clone https://github.com/your-username/neon-murer-cms.git
sudo chown -R $USER:$USER neon-murer-cms
cd neon-murer-cms

# Option B: SCP Upload von lokaler Maschine
# scp -r ./neon-murer-cms/ user@your-server:/opt/
```

### 2.2 Verzeichnisse erstellen
```bash
# Erstelle notwendige Verzeichnisse
mkdir -p {content/images,uploads,logs,backups/db,database/init,nginx,config}

# Rechte setzen
chmod 755 content uploads logs backups
chmod 700 database/init
```

---

## 🔐 Schritt 3: Umgebungsvariablen konfigurieren

### 3.1 Production Environment File erstellen
```bash
# Kopiere das Template
cp .env.production.template .env

# Bearbeite die .env-Datei
nano .env
```

### 3.2 Kritische Werte in .env setzen:
```bash
# =====================================
# KRITISCHE PRODUCTION-WERTE
# =====================================

# Starke Passwörter generieren
POSTGRES_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)
ADMIN_PASSWORD=$(openssl rand -base64 24)

# Domain-Konfiguration
FRONTEND_URL="https://your-domain.com"
ALLOWED_ORIGINS="https://your-domain.com,https://www.your-domain.com"

# Admin-Zugangsdaten
ADMIN_EMAIL="admin@your-domain.com"

# E-Mail-Konfiguration (optional)
SMTP_HOST="smtp.your-provider.com"
SMTP_PORT="587"
SMTP_USER="noreply@your-domain.com"
SMTP_PASS="your-smtp-password"

# Monitoring (optional)
SENTRY_DSN="https://your-sentry-dsn@sentry.io/project-id"
```

### 3.3 Sichere .env-Datei
```bash
chmod 600 .env
```

---

## 🐳 Schritt 4: Docker-Konfiguration

### 4.1 Redis-Konfiguration
```bash
# Erstelle Redis-Config
cat > config/redis.conf << 'EOF'
# Redis Production Configuration
bind 0.0.0.0
port 6379
timeout 300
tcp-keepalive 60
maxmemory 512mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
appendonly yes
appendfsync everysec
EOF
```

### 4.2 Nginx-Konfiguration (Optional)
```bash
# Erstelle Nginx-Config für Reverse Proxy
cat > nginx/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3001;
    }

    server {
        listen 80;
        server_name your-domain.com www.your-domain.com;
        
        # Redirect HTTP to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com www.your-domain.com;

        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
        ssl_prefer_server_ciphers off;

        # Security Headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # Static Files
        location /content/ {
            alias /usr/share/nginx/html/content/;
            expires 30d;
        }

        location /uploads/ {
            alias /usr/share/nginx/html/uploads/;
            expires 7d;
        }

        # Proxy to App
        location / {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF
```

### 4.3 Database Init Script
```bash
# Erstelle DB-Initialisierungsscript
cat > database/init/01-init.sql << 'EOF'
-- Neon Murer CMS Database Initialization
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Performance Settings
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET track_activity_query_size = 2048;
ALTER SYSTEM SET log_min_duration_statement = 1000;

-- Create additional indexes for better performance
-- (Will be created by Prisma migrations)
EOF
```

---

## 🚀 Schritt 5: Deployment ausführen

### 5.1 Docker Images bauen
```bash
# Prüfe Docker-Installation
docker --version
docker-compose --version

# Baue Production-Images
docker-compose -f docker-compose.prod.yml build --no-cache
```

### 5.2 Services starten
```bash
# Starte alle Services
docker-compose -f docker-compose.prod.yml up -d

# Logs überwachen
docker-compose -f docker-compose.prod.yml logs -f app
```

### 5.3 Datenbank initialisieren
```bash
# Warte bis Datenbank bereit ist
sleep 30

# Führe Prisma-Migrationen aus
docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy

# Generiere Prisma Client
docker-compose -f docker-compose.prod.yml exec app npx prisma generate

# Führe Seeding aus (optional)
docker-compose -f docker-compose.prod.yml exec app npm run seed

# Erstelle Admin-User
docker-compose -f docker-compose.prod.yml exec app npm run create-admin
```

---

## ✅ Schritt 6: Verifikation & Testing

### 6.1 Health Checks
```bash
# Prüfe Service-Status
docker-compose -f docker-compose.prod.yml ps

# Teste API-Endpoints
curl -f http://localhost:3001/api/health
curl -f http://localhost:3001/api/health/detailed

# Teste Database-Connection
docker-compose -f docker-compose.prod.yml exec db psql -U neon_user -d neon_murer_cms -c "SELECT COUNT(*) FROM users;"
```

### 6.2 Frontend-Test
```bash
# Teste Hauptwebsite
curl -I http://localhost:3001/

# Teste Admin-Panel
curl -I http://localhost:3001/cms-admin/
```

### 6.3 Log-Überprüfung
```bash
# App-Logs
docker-compose -f docker-compose.prod.yml logs app

# Database-Logs
docker-compose -f docker-compose.prod.yml logs db

# System-Logs
tail -f logs/combined-$(date +%Y-%m-%d).log
```

---

## 🔒 Schritt 7: Sicherheits-Konfiguration

### 7.1 SSL-Zertifikate (Let's Encrypt)
```bash
# Installiere Certbot
sudo apt install certbot

# Erhalte SSL-Zertifikat
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Kopiere Zertifikate für Nginx
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/key.pem
sudo chmod 644 nginx/ssl/cert.pem
sudo chmod 600 nginx/ssl/key.pem

# Automatische Renewal
sudo crontab -e
# Füge hinzu: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 7.2 Firewall-Feintuning
```bash
# Entferne Port 3001 nach SSL-Setup
sudo ufw delete allow 3001

# Nur über Nginx zugreifen
sudo ufw status
```

### 7.3 Docker-Security
```bash
# Erstelle dedicated User für Container
sudo useradd -r -s /bin/false neon-cms
```

---

## 📈 Schritt 8: Monitoring & Backups

### 8.1 Backup-Script erstellen
```bash
# Erstelle Backup-Script
cat > scripts/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/neon-murer-cms/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Database Backup
docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U neon_user neon_murer_cms > $BACKUP_DIR/db/backup_$DATE.sql

# Files Backup
tar -czf $BACKUP_DIR/files_$DATE.tar.gz content/ uploads/

# Keep only last 30 backups
find $BACKUP_DIR/db/ -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR/ -name "files_*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
EOF

chmod +x scripts/backup.sh
```

### 8.2 Cron-Jobs einrichten
```bash
# Bearbeite Crontab
crontab -e

# Füge hinzu:
# Daily backup at 2 AM
0 2 * * * /opt/neon-murer-cms/scripts/backup.sh

# Weekly restart (Sunday 3 AM)
0 3 * * 0 cd /opt/neon-murer-cms && docker-compose -f docker-compose.prod.yml restart app

# Monthly log cleanup
0 4 1 * * find /opt/neon-murer-cms/logs/ -name "*.log" -mtime +30 -delete
```

### 8.3 Monitoring-Script
```bash
# Erstelle Monitoring-Script
cat > scripts/monitor.sh << 'EOF'
#!/bin/bash
LOGFILE="/opt/neon-murer-cms/logs/monitor.log"

echo "$(date): Running health checks" >> $LOGFILE

# Check if containers are running
if ! docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    echo "$(date): ERROR - Some containers are down!" >> $LOGFILE
    # Optional: Send alert email
fi

# Check disk space
DISK_USAGE=$(df /opt/neon-murer-cms | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 85 ]; then
    echo "$(date): WARNING - Disk usage is $DISK_USAGE%" >> $LOGFILE
fi

# Check application health
if ! curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "$(date): ERROR - Application health check failed!" >> $LOGFILE
    # Restart application
    docker-compose -f docker-compose.prod.yml restart app
fi
EOF

chmod +x scripts/monitor.sh

# Cron für Monitoring (alle 5 Minuten)
echo "*/5 * * * * /opt/neon-murer-cms/scripts/monitor.sh" | crontab -
```

---

## 🔧 Schritt 9: Performance-Optimierung

### 9.1 Docker-Container-Optimierung
```bash
# Limitiere Container-Ressourcen
cat >> docker-compose.prod.yml << 'EOF'
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G
EOF
```

### 9.2 PostgreSQL-Tuning
```bash
# Angepasste PostgreSQL-Konfiguration
cat > config/postgresql.conf << 'EOF'
# Connection Settings
max_connections = 200
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 16MB
maintenance_work_mem = 64MB

# Performance
random_page_cost = 1.1
effective_io_concurrency = 200
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100

# Monitoring
log_min_duration_statement = 1000
track_activity_query_size = 2048
track_functions = 'all'
EOF
```

---

## 🛠️ Schritt 10: Wartung & Updates

### 10.1 Update-Prozess
```bash
# Erstelle Update-Script
cat > scripts/update.sh << 'EOF'
#!/bin/bash
echo "Starting update process..."

# Backup before update
./scripts/backup.sh

# Pull latest changes
git pull origin main

# Rebuild containers
docker-compose -f docker-compose.prod.yml build --no-cache

# Run migrations
docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy

# Restart services
docker-compose -f docker-compose.prod.yml restart

echo "Update completed!"
EOF

chmod +x scripts/update.sh
```

### 10.2 Maintenance-Commands
```bash
# Container-Logs bereinigen
docker system prune -f

# Alte Images löschen
docker image prune -a -f

# Database-Maintenance
docker-compose -f docker-compose.prod.yml exec db psql -U neon_user -d neon_murer_cms -c "VACUUM ANALYZE;"
```

---

## 🎯 Wichtige URLs nach Deployment

Nach erfolgreichem Deployment sind folgende URLs verfügbar:

- **Hauptwebsite**: `https://your-domain.com/`
- **Admin-Panel**: `https://your-domain.com/cms-admin/`
- **API-Health**: `https://your-domain.com/api/health`
- **API-Docs**: `https://your-domain.com/api/docs`

---

## 🚨 Troubleshooting

### Häufige Probleme und Lösungen:

#### Problem: Container starten nicht
```bash
# Logs prüfen
docker-compose -f docker-compose.prod.yml logs

# Services einzeln starten
docker-compose -f docker-compose.prod.yml up db
docker-compose -f docker-compose.prod.yml up app
```

#### Problem: Database-Connection-Fehler
```bash
# Database-Container prüfen
docker-compose -f docker-compose.prod.yml exec db psql -U neon_user -d neon_murer_cms

# Connection-String prüfen
echo $DATABASE_URL
```

#### Problem: Out of Memory
```bash
# Memory-Usage prüfen
docker stats

# Container-Limits anpassen in docker-compose.prod.yml
```

#### Problem: SSL-Zertifikat-Fehler
```bash
# Zertifikat erneuern
sudo certbot renew

# Nginx neu starten
docker-compose -f docker-compose.prod.yml restart nginx
```

---

## ✅ Deployment-Checklist

- [ ] Server-Voraussetzungen erfüllt
- [ ] Docker & Docker Compose installiert
- [ ] Projekt auf Server übertragen
- [ ] `.env` konfiguriert mit sicheren Werten
- [ ] Docker-Services gestartet
- [ ] Database migriert und seeded
- [ ] Health Checks erfolgreich
- [ ] SSL-Zertifikate installiert
- [ ] Firewall konfiguriert
- [ ] Backup-System eingerichtet
- [ ] Monitoring aktiv
- [ ] Performance optimiert
- [ ] Dokumentation aktualisiert

---

## 📞 Support & Wartung

Bei Problemen:
1. Prüfe Logs: `docker-compose -f docker-compose.prod.yml logs`
2. Verifikation: `curl -f http://localhost:3001/api/health`
3. Container-Status: `docker-compose -f docker-compose.prod.yml ps`

**🎉 Herzlichen Glückwunsch! Dein Neon Murer CMS läuft jetzt produktionsbereit auf deinem Server!**
