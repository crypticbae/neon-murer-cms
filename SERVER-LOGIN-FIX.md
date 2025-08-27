# 🔧 Server Login Problem - Lösung

## Problem
Der CMS-Admin Login unter `http://51.77.68.64:3835/cms-admin/login.html` zeigt einen **Internal Server Error**.

## Ursache
Das Problem liegt an einer fehlerhaften Datenbank-Konfiguration. Der Server versucht auf eine lokale Docker-Datenbank zuzugreifen, aber die richtige Neon-Datenbank ist konfiguriert.

## 🚀 Schnelle Lösung

### Option 1: Automatisches Fix-Script (Empfohlen)

```bash
# 1. Script ausführbar machen
chmod +x deploy-server-fix.sh

# 2. Fix-Script ausführen
./deploy-server-fix.sh
```

### Option 2: Manuelle Lösung

1. **Environment-Datei aktualisieren:**
```bash
# Kopiere die Server-Konfiguration
cp .env.server .env
```

2. **Anwendung neu starten:**
```bash
# Stoppe existierende Prozesse
pm2 stop neon-murer-cms
# oder
pkill -f "node server.js"

# Starte neu
npm run production
```

3. **Datenbank-Migration ausführen:**
```bash
npm run migrate:deploy
npm run seed
```

## 🔍 Verifikation

Nach dem Fix sollten folgende URLs funktionieren:

- ✅ **Health Check**: http://51.77.68.64:3835/api/health
- ✅ **Admin Login**: http://51.77.68.64:3835/cms-admin/login.html
- ✅ **Website**: http://51.77.68.64:3835

## 🔐 Login-Daten

- **Email**: `admin@neonmurer.ch`
- **Passwort**: `admin123`

⚠️ **Wichtig**: Ändern Sie das Passwort nach dem ersten Login!

## 📊 Status Prüfen

```bash
# Server-Status
curl http://51.77.68.64:3835/api/health

# Login-Test
curl -X POST http://51.77.68.64:3835/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@neonmurer.ch","password":"admin123"}'

# Logs anzeigen
tail -f logs/app.log
```

## 🐛 Problemdiagnose

Falls der Fehler weiterhin auftritt:

### 1. Logs prüfen
```bash
# Anwendungs-Logs
tail -f logs/app.log

# PM2 Logs (falls verwendet)
pm2 logs neon-murer-cms

# System-Logs
journalctl -u neon-murer-cms -f
```

### 2. Datenbank-Verbindung testen
```bash
# Direkte Verbindung testen
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$connect()
  .then(() => console.log('✅ Database connected'))
  .catch(err => console.error('❌ Database error:', err.message))
  .finally(() => process.exit(0));
"
```

### 3. Port-Konflikte prüfen
```bash
# Prüfe welcher Prozess Port 3835 verwendet
netstat -tuln | grep 3835
lsof -i :3835
```

### 4. Environment-Variablen prüfen
```bash
# Zeige aktuelle Konfiguration
node -e "console.log({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL ? '[SET]' : '[MISSING]',
  JWT_SECRET: process.env.JWT_SECRET ? '[SET]' : '[MISSING]'
})"
```

## 🔧 Häufige Probleme

### Problem: "ECONNREFUSED 127.0.0.1:5432"
**Lösung**: Datenbank-URL in `.env` korrigieren
```bash
DATABASE_URL="postgresql://neondb_owner:npg_EngRD1KBXGM0@ep-aged-bonus-a2rcyr0p-pooler.eu-central-1.aws.neon.tech/neonmurer?sslmode=require"
```

### Problem: "JWT_SECRET too short"
**Lösung**: Längeren JWT-Secret verwenden
```bash
JWT_SECRET="YWVur7jaDh/Yb1LVGYoWRgMcCyqHOYGzTxYouFzXOQz58HODSWRxkXv4zTCFtoRN"
```

### Problem: "Permission denied"
**Lösung**: Dateiberechtigungen korrigieren
```bash
chmod 600 .env
chmod +x *.sh
```

### Problem: "Port already in use"
**Lösung**: Existierende Prozesse beenden
```bash
lsof -ti:3835 | xargs kill -9
```

## 📞 Support

Falls das Problem weiterhin besteht:

1. **Logs sammeln**:
```bash
# Erstelle Debug-Report
./deploy-server-fix.sh > debug-report.log 2>&1
```

2. **System-Info sammeln**:
```bash
echo "System Info:" > system-info.log
uname -a >> system-info.log
node --version >> system-info.log
npm --version >> system-info.log
docker --version >> system-info.log
```

3. **Support kontaktieren** mit den Log-Dateien

## ✅ Nach dem Fix

1. **Passwort ändern**: Erster Login → Einstellungen → Passwort ändern
2. **SSL einrichten**: Für Production HTTPS aktivieren
3. **Backups konfigurieren**: Regelmäßige Datenbank-Backups
4. **Monitoring einrichten**: Uptime-Monitoring aktivieren

---

*Diese Anleitung wurde erstellt zur Behebung des Login-Problems auf Server 51.77.68.64:3835*
