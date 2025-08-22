# Neon Murer - Admin Dashboard

Ein modernes, responsives Admin-Dashboard für die Verwaltung der Neon Murer Website.

## 🚀 Features

### Dashboard-Übersicht
- **Statistik-Karten**: Zeigt wichtige Kennzahlen (Seiten, Bilder, Projekte, Services)
- **Aktivitäts-Feed**: Letzte Änderungen und Aktivitäten
- **Quick Actions**: Schnellzugriff auf häufig verwendete Funktionen

### Content Management
- **Seiten verwalten**: Übersicht und Bearbeitung aller Website-Seiten
- **Status-Tracking**: Veröffentlicht/Entwurf-Status
- **Bearbeitungshistorie**: Letzte Änderungen nachverfolgen

### Medien-Verwaltung
- **Bild-Upload**: Drag & Drop Datei-Upload
- **Medien-Bibliothek**: Organisierte Übersicht aller Medien
- **Vorschau-Funktion**: Schnelle Medien-Vorschau

### Dienstleistungen
- **Service-Management**: Hinzufügen, Bearbeiten, Löschen von Services
- **Icon-Verwaltung**: Font Awesome Icons für Services
- **Beschreibungen**: Rich-Text Beschreibungen

### Team-Verwaltung
- **Mitarbeiter-Profile**: Team-Mitglieder verwalten
- **Kontaktinformationen**: E-Mail, Telefon, Position
- **Profilbilder**: Foto-Upload für Team-Mitglieder

### Einstellungen
- **Website-Konfiguration**: Titel, Beschreibung, Meta-Daten
- **Benutzer-Verwaltung**: Admin-Accounts und Passwörter
- **System-Einstellungen**: Backup, Cache, Performance

## 🔐 Authentifizierung

### Demo-Zugang
- **E-Mail**: `admin@neonmurer.ch`
- **Passwort**: `admin123`

### Login-Features
- **Secure Login**: Passwort-geschützter Zugang
- **Remember Me**: Angemeldet bleiben Option
- **Session Management**: Automatische Weiterleitung bei aktiver Session

## 🎨 Design & UX

### Moderne Benutzeroberfläche
- **Bootstrap 5**: Responsive Design Framework
- **Font Awesome**: Professionelle Icons
- **Custom CSS**: Firmen-spezifisches Branding

### Responsive Design
- **Mobile-First**: Optimiert für alle Geräte
- **Tablet-Support**: Touch-freundliche Navigation
- **Desktop**: Vollständige Funktionalität

### Farbschema
- **Primary**: Neon Murer Blau (#007bff)
- **Secondary**: Professionelles Grau (#6c757d)
- **Accent**: Warning Orange (#ffc107)
- **Success**: Grün (#28a745)

## 📁 Dateistruktur

```
cms-admin/
├── index.html          # Haupt-Dashboard
├── login.html          # Login-Seite
├── assets/
│   ├── css/
│   │   └── admin.css   # Dashboard-Styles
│   └── js/
│       └── admin.js    # Dashboard-Funktionalität
└── README.md           # Diese Dokumentation
```

## 🛠️ Technische Details

### Frontend-Technologien
- **HTML5**: Semantisches Markup
- **CSS3**: Moderne Styling-Features
- **JavaScript ES6+**: Interaktive Funktionalität
- **Bootstrap 5**: UI-Framework
- **Font Awesome 6**: Icon-Library

### Features
- **Single Page Application**: Schnelle Navigation ohne Seitenreload
- **Local Storage**: Session-Persistierung
- **Notifications**: Toast-Benachrichtigungen
- **Form Validation**: Client-seitige Validierung

### Performance
- **CDN-Integration**: Schnelle Ladezeiten durch externe CDNs
- **Optimierte Assets**: Minimierte CSS/JS für Production
- **Lazy Loading**: Medien werden bei Bedarf geladen

## 🔧 Installation & Setup

### 1. Datei-Upload
Laden Sie alle Dateien in das `/cms-admin/` Verzeichnis Ihres Webservers hoch.

### 2. Ordner-Struktur
Stellen Sie sicher, dass die Ordner-Struktur korrekt ist:
```
/cms-admin/
├── index.html
├── login.html
├── assets/css/admin.css
└── assets/js/admin.js
```

### 3. Zugriff
Öffnen Sie `https://ihre-domain.ch/cms-admin/login.html` im Browser.

## 🚧 Entwicklung & Anpassung

### Neue Sektion hinzufügen
1. HTML-Sektion in `index.html` erstellen
2. Navigation-Link in Sidebar hinzufügen
3. CSS-Styling in `admin.css` ergänzen
4. JavaScript-Handler in `admin.js` implementieren

### Styling anpassen
- Farben in CSS-Variablen (`:root`) ändern
- Layout in `admin.css` anpassen
- Responsive Breakpoints in Media Queries

### Funktionalität erweitern
- Neue Funktionen in `admin.js` hinzufügen
- API-Integration für Backend-Kommunikation
- Datenbank-Anbindung für persistente Speicherung

## 📋 Todo / Zukünftige Features

### Content Management
- [ ] WYSIWYG-Editor für Seiten-Inhalte
- [ ] Drag & Drop Seiten-Organisation
- [ ] Versionierung und Rollback
- [ ] SEO-Optimierung Tools

### Medien-Verwaltung
- [ ] Automatische Bildoptimierung
- [ ] Bulk-Upload für mehrere Dateien
- [ ] Ordner-Organisation
- [ ] Automatische Alt-Text Generierung

### Analytics & Reporting
- [ ] Website-Traffic Dashboard
- [ ] Performance-Metriken
- [ ] User-Interaktion Tracking
- [ ] Export-Funktionen

### Integration
- [ ] Backend-API Anbindung
- [ ] Database Integration (MySQL/PostgreSQL)
- [ ] Cloud-Storage Integration
- [ ] Email-Benachrichtigungen

## 🔒 Sicherheit

### Authentifizierung
- Passwort-geschützter Zugang
- Session-Management
- Automatische Logout-Funktion

### Empfohlene Sicherheitsmaßnahmen
- HTTPS-Verschlüsselung
- Starke Passwörter verwenden
- Regelmäßige Backups
- Server-seitige Validierung

## 📞 Support

Bei Fragen oder Problemen wenden Sie sich an:
- **E-Mail**: admin@neonmurer.ch
- **Telefon**: +41 XX XXX XX XX

## 📄 Lizenz

© 2024 Neon Murer AG. Alle Rechte vorbehalten.

---

**Version**: 1.0.0  
**Erstellt**: Juli 2024  
**Letztes Update**: Juli 2024 