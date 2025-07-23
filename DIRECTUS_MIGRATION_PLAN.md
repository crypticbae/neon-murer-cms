# 🚀 Directus CMS Migration Plan - Neon Murer Website

## 📋 Projekt-Übersicht
**Ziel:** Integration von Directus CMS in die bestehende Neon Murer Website für bessere Content-Verwaltung  
**Zeitrahmen:** 4-6 Wochen  
**Bestehende Technologie:** HTML, Bootstrap, jQuery, Template-System  
**Neue Technologie:** Directus CMS + REST API Integration  

---

## 🎯 Phase 1: Vorbereitung & Setup (Woche 1)

### ✅ Infrastruktur & Installation

- [ ] **Directus Server Setup**
  - [ ] Hosting-Umgebung vorbereiten (Docker oder direktes Setup)
  - [ ] Directus neueste Version installieren
  - [ ] Datenbank erstellen (MySQL/PostgreSQL)
  - [ ] Admin-Benutzer einrichten
  - [ ] SSL-Zertifikat für API-Endpunkt konfigurieren

- [ ] **Entwicklungsumgebung**
  - [ ] Lokale Directus-Instanz für Tests aufsetzen
  - [ ] Backup der aktuellen Website erstellen
  - [ ] Git-Repository für Versionskontrolle einrichten
  - [ ] Staging-Environment vorbereiten

- [ ] **Analyse der bestehenden Website**
  - [ ] Content-Inventar erstellen (alle Texte, Bilder, Daten)
  - [ ] Template-Struktur dokumentieren
  - [ ] API-Anforderungen definieren
  - [ ] Bestehende JavaScript-Funktionen analysieren

---

## 🏗️ Phase 2: Directus Collections Design (Woche 1-2)

### ✅ Content-Strukturen erstellen

- [ ] **Team Management Collection**
  ```
  Collection: team_members
  - id (Primary Key)
  - name (String)
  - position (String)
  - location (String - Uznach/Jona)
  - email (String)
  - phone (String)
  - image (File - Directus Assets)
  - sort_order (Integer)
  - status (String - active/inactive)
  ```

- [ ] **Service Categories Collection**
  ```
  Collection: service_categories
  - id (Primary Key)
  - title (String)
  - description (Text)
  - hero_image (File)
  - slug (String - URL-friendly)
  - meta_title (String)
  - meta_description (Text)
  - sort_order (Integer)
  - status (String)
  ```

- [ ] **Service Items Collection**
  ```
  Collection: service_items
  - id (Primary Key)
  - category_id (Many-to-One → service_categories)
  - title (String)
  - description (Text)
  - features (JSON - Array von Features)
  - images (Files - Multiple)
  - slug (String)
  - sort_order (Integer)
  - status (String)
  ```

- [ ] **Client Logos Collection**
  ```
  Collection: client_logos
  - id (Primary Key)
  - company_name (String)
  - logo_file (File)
  - website_url (String, Optional)
  - sort_order (Integer)
  - status (String)
  ```

- [ ] **News/Blog Collection**
  ```
  Collection: news_articles
  - id (Primary Key)
  - title (String)
  - content (Rich Text)
  - excerpt (Text)
  - featured_image (File)
  - author (Many-to-One → team_members)
  - published_date (DateTime)
  - slug (String)
  - meta_title (String)
  - meta_description (Text)
  - status (String - draft/published)
  ```

- [ ] **Site Settings Collection**
  ```
  Collection: site_settings
  - id (Primary Key)
  - key (String - eindeutig)
  - value (Text/JSON)
  - description (Text)
  - type (String - text/json/file)
  ```

### ✅ Beziehungen & Permissions

- [ ] **Collections-Beziehungen definieren**
  - [ ] Service Categories ↔ Service Items (One-to-Many)
  - [ ] Team Members ↔ News Articles (One-to-Many)
  - [ ] Multilingual Support für zukünftige Erweiterung

- [ ] **Benutzer-Rollen erstellen**
  - [ ] Admin (Full Access)
  - [ ] Content Manager (Create, Read, Update)
  - [ ] Content Editor (Read, Update eigener Inhalte)

- [ ] **API Permissions konfigurieren**
  - [ ] Public Read-Access für Frontend
  - [ ] Authentication für Admin-Bereiche
  - [ ] Rate Limiting einrichten

---

## 🔧 Phase 3: Frontend API-Integration (Woche 2-3)

### ✅ JavaScript API Client entwickeln

- [ ] **API Helper Functions erstellen**
  ```javascript
  // file: template/assets/js/directus-api.js
  class DirectusAPI {
    constructor(baseURL) {
      this.baseURL = baseURL;
    }
    
    async getTeamMembers() { ... }
    async getServiceCategories() { ... }
    async getClientLogos() { ... }
    async getNews() { ... }
  }
  ```

- [ ] **Error Handling & Fallbacks**
  - [ ] Loading States implementieren
  - [ ] Fallback auf statische Daten bei API-Fehlern
  - [ ] Retry-Mechanismus für fehlgeschlagene Requests
  - [ ] User-friendly Error Messages

### ✅ Template-Integration

- [ ] **Team-Seite (kontaktpersonen.html) dynamisch machen**
  - [ ] Bestehende statische Team-Daten analysieren
  - [ ] Template-Struktur für dynamische Daten anpassen
  - [ ] Loading-Animation während API-Calls
  - [ ] Responsive Grid beibehalten

- [ ] **Kunden-Logos Carousel erweitern**
  - [ ] Slick Slider mit Directus-Daten speisen
  - [ ] Lazy Loading für Performance
  - [ ] Admin-Interface für Logo-Management

- [ ] **Service-Kategorien dynamisch laden**
  - [ ] beschriftungen.html als Template umbauen
  - [ ] Hero-Images aus Directus
  - [ ] SEO-Metadaten aus API

- [ ] **News-System implementieren**
  - [ ] news.html mit Blog-Funktionalität
  - [ ] Artikel-Detail-Seiten
  - [ ] Pagination und Filtering

### ✅ Template-System erweitern

- [ ] **Template Loader (simple-template-loader.js) erweitern**
  - [ ] API-Integration in bestehenden Loader
  - [ ] Caching-Mechanismus für bessere Performance
  - [ ] Progressive Enhancement (funktioniert auch ohne JavaScript)

- [ ] **SEO-Integration**
  - [ ] Meta-Tags dynamisch aus Directus
  - [ ] JSON-LD Schema.org aus API-Daten generieren
  - [ ] Sitemap.xml automatisch generieren

---

## 📊 Phase 4: Content-Migration (Woche 3)

### ✅ Daten-Migration

- [ ] **Team-Daten migrieren**
  - [ ] Bestehende Team-Fotos in Directus Assets hochladen
  - [ ] Kontaktdaten aus HTML extrahieren
  - [ ] Team-Mitglieder in Directus Collections eingeben
  - [ ] E-Mail und Telefonnummern validieren

- [ ] **Kunden-Logos importieren**
  - [ ] Logo-Dateien aus `content/images/` sammeln
  - [ ] In Directus Asset-Management hochladen
  - [ ] Client-Collection mit Metadaten befüllen

- [ ] **Service-Inhalte strukturieren**
  - [ ] Texte aus bestehenden HTML-Seiten extrahieren
  - [ ] Service-Bilder kategorisieren und hochladen
  - [ ] Features und Beschreibungen in Collections

- [ ] **Site-Settings konfigurieren**
  - [ ] Kontaktdaten (Telefon, E-Mail, Adressen)
  - [ ] Social Media Links
  - [ ] Öffnungszeiten
  - [ ] Firmen-Metadaten

### ✅ Content-Qualität sicherstellen

- [ ] **Bildoptimierung**
  - [ ] Alle Bilder für Web optimieren (WebP-Unterstützung)
  - [ ] Alt-Texte für Accessibility
  - [ ] Responsive Bildgrößen definieren

- [ ] **Content-Review**
  - [ ] Alle Texte auf Aktualität prüfen
  - [ ] Rechtschreibung und Grammatik
  - [ ] Konsistente Formatierung

---

## 🧪 Phase 5: Testing & Qualitätssicherung (Woche 4)

### ✅ Funktions-Tests

- [ ] **Frontend-Funktionalität**
  - [ ] Team-Seite lädt korrekt
  - [ ] Kunden-Carousel funktioniert
  - [ ] Service-Kategorien werden angezeigt
  - [ ] News-System funktioniert
  - [ ] Responsive Design auf allen Geräten

- [ ] **Performance-Tests**
  - [ ] Ladezeiten messen (< 3 Sekunden)
  - [ ] API-Response-Zeiten optimieren
  - [ ] Image Loading optimieren
  - [ ] Lighthouse-Score > 90

- [ ] **SEO-Tests**
  - [ ] Meta-Tags werden korrekt generiert
  - [ ] JSON-LD Schema validieren
  - [ ] Sitemap funktioniert
  - [ ] Google Search Console testen

### ✅ Browser-Kompatibilität

- [ ] **Cross-Browser Tests**
  - [ ] Chrome (aktuell + 1 Version zurück)
  - [ ] Firefox (aktuell + 1 Version zurück)
  - [ ] Safari (aktuell)
  - [ ] Edge (aktuell)
  - [ ] Mobile Browser (iOS Safari, Chrome Mobile)

- [ ] **Fallback-Szenarien**
  - [ ] JavaScript deaktiviert
  - [ ] API nicht erreichbar
  - [ ] Langsame Internetverbindung
  - [ ] Veraltete Browser

---

## 🚀 Phase 6: Deployment & Go-Live (Woche 5)

### ✅ Production-Vorbereitung

- [ ] **Server-Konfiguration**
  - [ ] Directus Production-Setup
  - [ ] SSL-Zertifikate
  - [ ] Backup-Strategien
  - [ ] Monitoring einrichten

- [ ] **DNS & CDN**
  - [ ] API-Subdomain einrichten (api.neonmurer.ch)
  - [ ] CDN für Assets konfigurieren
  - [ ] Cache-Strategien implementieren

### ✅ Deployment-Prozess

- [ ] **Staging-Tests**
  - [ ] Vollständige Website auf Staging testen
  - [ ] Content-Team Feedback einholen
  - [ ] Final Performance-Tests

- [ ] **Go-Live Checklist**
  - [ ] Backup der alten Website
  - [ ] DNS-Umstellung vorbereiten
  - [ ] Rollback-Plan definieren
  - [ ] Go-Live in wartungsarmer Zeit

- [ ] **Post-Launch Monitoring**
  - [ ] Server-Performance überwachen
  - [ ] Error-Logs checken
  - [ ] User-Feedback sammeln
  - [ ] Analytics einrichten

---

## 📚 Phase 7: Training & Dokumentation (Woche 6)

### ✅ Team-Schulung

- [ ] **Admin-Interface Training**
  - [ ] Directus Admin-Panel Einführung
  - [ ] Content erstellen und bearbeiten
  - [ ] Bilder hochladen und verwalten
  - [ ] Team-Mitglieder hinzufügen/entfernen

- [ ] **Content-Management Workflows**
  - [ ] News-Artikel veröffentlichen
  - [ ] Service-Beschreibungen aktualisieren
  - [ ] Kunden-Logos hinzufügen
  - [ ] SEO-Metadaten pflegen

### ✅ Dokumentation erstellen

- [ ] **Admin-Handbuch** (deutsch)
  - [ ] Login und Navigation
  - [ ] Content-Editing Schritt-für-Schritt
  - [ ] Häufige Aufgaben (FAQ)
  - [ ] Troubleshooting

- [ ] **Entwickler-Dokumentation**
  - [ ] API-Endpunkte dokumentieren
  - [ ] Code-Struktur erklären
  - [ ] Deployment-Prozess
  - [ ] Wartung und Updates

---

## 🔄 Langfristige Wartung & Erweiterungen

### ✅ Wartungsplan

- [ ] **Regelmäßige Updates**
  - [ ] Directus Updates (monatlich prüfen)
  - [ ] Security Patches
  - [ ] Content-Backups
  - [ ] Performance-Monitoring

### ✅ Zukünftige Erweiterungen

- [ ] **Mehrsprachigkeit** (Phase 2)
  - [ ] Directus Translations konfigurieren
  - [ ] Frontend für EN/FR vorbereiten

- [ ] **Projekt-Portfolio** (Phase 3)
  - [ ] Referenz-Projekte mit Before/After
  - [ ] Filterfunktionen nach Service-Typ

- [ ] **Kontaktformular-Integration** (Phase 4)
  - [ ] Anfragen direkt in Directus
  - [ ] E-Mail-Benachrichtigungen
  - [ ] CRM-Integration

---

## 📊 Erfolgskriterien

### ✅ Technische KPIs
- [ ] **Performance:** Ladezeit < 3 Sekunden
- [ ] **Verfügbarkeit:** 99.9% Uptime
- [ ] **SEO:** Lighthouse Score > 90
- [ ] **Mobile:** PageSpeed > 85

### ✅ Business KPIs
- [ ] **Content-Updates:** Team kann selbständig Content pflegen
- [ ] **Zeitersparnis:** 80% weniger Zeit für Content-Updates
- [ ] **Flexibilität:** Neue Services einfach hinzufügbar
- [ ] **Zukunftssicherheit:** Erweiterbar für neue Anforderungen

---

## 🛠️ Benötigte Ressourcen

### 👥 Team
- **Frontend-Entwickler:** 40 Stunden
- **Backend-Entwickler:** 20 Stunden  
- **Content-Manager:** 16 Stunden
- **Projektleiter:** 8 Stunden

### 💰 Tools & Infrastruktur
- **Directus Cloud:** €29/Monat oder Self-Hosted
- **Staging-Server:** €15-30/Monat
- **CDN:** €10-20/Monat
- **SSL-Zertifikate:** Kostenlos (Let's Encrypt)

### 📅 Zeitplan-Übersicht
```
Woche 1: Setup & Collections Design
Woche 2: API-Integration beginnen
Woche 3: Content-Migration
Woche 4: Testing & QA
Woche 5: Deployment
Woche 6: Training & Dokumentation
```

---

## 🚨 Risiken & Mitigation

### ⚠️ Technische Risiken
- **API-Performance:** Load Testing + Caching-Strategien
- **Browser-Kompatibilität:** Progressive Enhancement
- **SEO-Impact:** Graduelle Migration, 301-Redirects

### ⚠️ Business-Risiken  
- **Content-Verlust:** Umfassende Backups vor Migration
- **Downtime:** Staging-Tests + Rollback-Plan
- **Team-Akzeptanz:** Frühzeitiges Training + Support

---

*Letzte Aktualisierung: Januar 2025*  
*Projektverantwortlich: [Name eintragen]* 