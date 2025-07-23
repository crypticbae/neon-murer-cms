# 🚀 Directus CMS Setup-Anleitung - Neon Murer

## 📋 Voraussetzungen

### System-Anforderungen
- **Docker Desktop** (neueste Version)
- **Git** für Versionskontrolle
- **Node.js 18+** (für Frontend-Entwicklung)
- **Mindestens 4GB RAM** für alle Services

### Benötigte Ports
- `8055` - Directus CMS Admin Interface
- `8080` - phpMyAdmin (Database Management)
- `3306` - MySQL Database
- `6379` - Redis Cache

---

## 🛠️ Lokale Installation

### Schritt 1: Repository klonen
```bash
# Repository klonen (falls noch nicht vorhanden)
git clone [REPOSITORY_URL]
cd neon

# Oder in bestehendem Verzeichnis
git init
git add .
git commit -m "Initial commit - Neon Murer Website"
```

### Schritt 2: Directus mit Docker starten
```bash
# Docker Services starten
docker-compose up -d

# Logs verfolgen (optional)
docker-compose logs -f directus
```

### Schritt 3: Installation überprüfen
Nach ca. 2-3 Minuten sollten alle Services laufen:

- **Directus Admin:** http://localhost:8055
- **phpMyAdmin:** http://localhost:8080
- **MySQL:** localhost:3306

### Schritt 4: Erste Anmeldung
1. Öffne http://localhost:8055
2. Anmeldedaten:
   - **E-Mail:** admin@neonmurer.ch
   - **Passwort:** NeonMurer2025!

---

## 📊 Phase 2: Collections erstellen

### Team Members Collection
```bash
# Im Directus Admin Interface:
# Settings → Data Model → Create Collection

Collection Name: team_members
Fields:
- id (Primary Key, Auto-generated)
- name (String, Required)
- position (Text)
- location (Select: Uznach, Jona)
- email (String, Email validation)
- phone (String)
- image (File, Image only)
- sort_order (Integer, Default: 0)
- status (Select: active, inactive)
```

### Service Categories Collection
```bash
Collection Name: service_categories
Fields:
- id (Primary Key)
- title (String, Required)
- description (Text)
- hero_image (File, Image only)
- slug (String, Required, Unique)
- meta_title (String)
- meta_description (Text)
- sort_order (Integer)
- status (Select: published, draft)
```

### Client Logos Collection
```bash
Collection Name: client_logos
Fields:
- id (Primary Key)
- company_name (String, Required)
- logo_file (File, Image only)
- website_url (String, URL validation)
- sort_order (Integer)
- status (Select: active, inactive)
```

---

## 🔧 API-Integration Vorbereitung

### JavaScript API Client erstellen
Erstelle `template/assets/js/directus-api.js`:

```javascript
class NeonMurerAPI {
  constructor() {
    this.baseURL = 'http://localhost:8055';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 Minuten
  }

  async fetchData(endpoint, useCache = true) {
    const cacheKey = endpoint;
    
    // Cache check
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const response = await fetch(`${this.baseURL}/items/${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Cache result
      if (useCache) {
        this.cache.set(cacheKey, {
          data: data,
          timestamp: Date.now()
        });
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      return this.getFallbackData(endpoint);
    }
  }

  async getTeamMembers() {
    const data = await this.fetchData('team_members?filter[status][_eq]=active&sort=sort_order');
    return data?.data || [];
  }

  async getServiceCategories() {
    const data = await this.fetchData('service_categories?filter[status][_eq]=published&sort=sort_order');
    return data?.data || [];
  }

  async getClientLogos() {
    const data = await this.fetchData('client_logos?filter[status][_eq]=active&sort=sort_order');
    return data?.data || [];
  }

  getFallbackData(endpoint) {
    // Fallback für offline/error scenarios
    const fallbacks = {
      'team_members': [
        {
          name: "Benno Murer",
          position: "VR-Vorsitz, Geschäftsführung",
          location: "Uznach",
          email: "benno.murer@neonmurer.ch",
          phone: "055 225 50 25"
        }
        // ... weitere Team-Mitglieder
      ],
      'client_logos': [
        { company_name: "McDonald's", logo_file: "content/images/McDonalds.png" },
        { company_name: "Lindt", logo_file: "content/images/Lindt.png" }
        // ... weitere Logos
      ]
    };
    
    return fallbacks[endpoint.split('?')[0]] || [];
  }
}

// Global instance
window.neonAPI = new NeonMurerAPI();
```

---

## 📦 Content-Migration Script

### Bilder-Upload Script
```bash
# Erstelle ein Upload-Script für bestehende Bilder
# upload-content.js

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

const DIRECTUS_URL = 'http://localhost:8055';
const ADMIN_TOKEN = 'YOUR_ADMIN_TOKEN'; // Aus Directus Admin Interface

async function uploadImage(imagePath, title) {
  const form = new FormData();
  form.append('file', fs.createReadStream(imagePath));
  form.append('title', title);
  
  const response = await fetch(`${DIRECTUS_URL}/files`, {
    method: 'POST',
    body: form,
    headers: {
      'Authorization': `Bearer ${ADMIN_TOKEN}`
    }
  });
  
  return response.json();
}

// Team-Bilder hochladen
async function uploadTeamImages() {
  const teamImages = [
    'content/images/person1.jpg',
    'content/images/person2.jpg',
    'content/images/person3.jpg'
    // ... weitere Bilder
  ];
  
  for (const imagePath of teamImages) {
    if (fs.existsSync(imagePath)) {
      const fileName = path.basename(imagePath);
      console.log(`Uploading ${fileName}...`);
      await uploadImage(imagePath, fileName);
    }
  }
}
```

---

## 🧪 Testing & Validation

### API Tests
```bash
# Test API Endpoints
curl "http://localhost:8055/items/team_members"
curl "http://localhost:8055/items/service_categories"
curl "http://localhost:8055/items/client_logos"
```

### Performance Tests
```javascript
// Performance monitoring
async function testAPIPerformance() {
  const start = performance.now();
  await window.neonAPI.getTeamMembers();
  const end = performance.now();
  
  console.log(`API Response Time: ${end - start}ms`);
}
```

---

## 🔐 Sicherheit & Production

### Environment Variables für Production
```env
# .env.production
KEY=your-unique-key-here
SECRET=your-secret-key-here
DB_HOST=your-production-db-host
DB_USER=your-db-user
DB_PASSWORD=your-secure-password
PUBLIC_URL=https://api.neonmurer.ch
ADMIN_EMAIL=admin@neonmurer.ch
CORS_ORIGIN=https://www.neonmurer.ch
```

### SSL & Domain Setup
```bash
# Nginx Configuration für Production
server {
    listen 443 ssl;
    server_name api.neonmurer.ch;
    
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;
    
    location / {
        proxy_pass http://localhost:8055;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 📚 Nützliche Befehle

### Docker Management
```bash
# Services stoppen
docker-compose down

# Services neustarten
docker-compose restart directus

# Logs anzeigen
docker-compose logs directus

# Database backup
docker exec mysql_container mysqldump -u directus -p neonmurer_cms > backup.sql

# Volumes löschen (ACHTUNG: Datenverlust!)
docker-compose down -v
```

### Directus CLI
```bash
# Direktes Management via CLI
npx directus bootstrap
npx directus schema apply ./schema.yaml
```

---

## 🚨 Troubleshooting

### Häufige Probleme

**Port bereits belegt:**
```bash
# Andere Services auf Port 8055 finden
lsof -i :8055
```

**Directus startet nicht:**
```bash
# Logs überprüfen
docker-compose logs directus
```

**Database Connection Error:**
```bash
# MySQL Status überprüfen
docker-compose ps mysql
```

**CORS-Probleme:**
- Stelle sicher, dass `CORS_ORIGIN=true` gesetzt ist
- Für Production spezifische Domain angeben

---

## 📞 Support & Kontakt

Bei Problemen:
1. Docker-Logs überprüfen
2. Browser Developer Tools checken
3. API-Endpunkte direkt testen
4. Directus Community Forum: https://github.com/directus/directus/discussions

---

*Setup-Anleitung erstellt: Januar 2025* 