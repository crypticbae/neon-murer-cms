# 📋 Content-Inventar - Neon Murer Website

*Erstellt: Januar 2025*  
*Status: Analyse für Directus Migration*

---

## 🎯 Übersicht

### Zu migrierende Content-Bereiche
- **Team-Mitglieder** (6 Personen)
- **Kunden-Logos** (18+ Logos)
- **Service-Kategorien** (3 Hauptbereiche + Unterkategorien)
- **Bilder & Assets** (100+ Dateien)
- **Kontakt & Firmeninfos**

---

## 👥 TEAM-MITGLIEDER

### Quelle: `neon-murer/kontaktpersonen.html`

| Name | Position | Standort | E-Mail | Telefon | Bild |
|------|----------|----------|--------|---------|------|
| **Benno Murer** | VR-Vorsitz, Geschäftsführung, Beratung und Verkauf | Werk Uznach | benno.murer@neonmurer.ch | 055 225 50 25 | person1.jpg |
| **Andreas Zybach** | Produktionsleiter, Beratung und Verkauf | Werk Uznach | andreas.zybach@neonmurer.ch | 055 225 50 25 | person2.jpg |
| **Roman Janser** | Beratung und Verkauf | Werk Uznach | roman.janser@neonmurer.ch | 055 225 50 18 | person3.jpg |
| **Sandy Jucker** | Beratung und Verkauf | Werk Uznach | sandy.jucker@neonmurer.ch | 055 225 50 12 | person4_new.jpg |
| **Beatrice Murer** | Geschäftsführung, technische Leitung und Produktionsleitung Schriftenmalerei | Werk Jona | bea.murer@neonmurer.ch | 055 212 63 67 | person5.jpg |
| **Jan Vetter** | Graphik, Werbung, technische Beratung und Produktentwicklung | Werk Uznach | jan.vetter@neonmurer.ch | 055 225 50 27 | person6.jpg |

**📁 Bilder-Pfad:** `content/images/person*.jpg`

---

## 🏢 KUNDEN-LOGOS

### Quelle: `index.html` (Slick Carousel)

| Firma | Logo-Datei | Format | Status |
|-------|------------|--------|--------|
| **Rexroth** | rexroth.png | PNG | ✅ |
| **Lindt** | Lindt.png | PNG | ✅ |
| **McDonald's** | McDonalds.png | PNG | ✅ |
| **Agrola** | Agrola.png | PNG | ✅ |
| **Dieci** | dieci.png | PNG | ✅ |
| **Avia** | Avia.svg | SVG | ✅ |
| **Baloise** | Baloise.svg | SVG | ✅ |
| **Bayard** | Bayard.svg | SVG | ✅ |
| **Feldschlösschen** | Feldschlösschen.svg | SVG | ✅ |
| **Läderach** | LäderachSwitzerland.svg | SVG | ✅ |
| **LLB** | LLB.svg | SVG | ✅ |
| **Ottos** | Ottos.svg | SVG | ✅ |
| **Vaudoise** | Vaudoise.svg | SVG | ✅ |
| **Bosch Service** | BoschService.svg | SVG | ✅ |
| **Carglass** | Carglass.svg | SVG | ✅ |
| **Helvetia** | Helvetia.svg | SVG | ✅ |
| **SGKB** | SGKB.svg | SVG | ✅ |
| **Spar Express** | SparExpress.svg | SVG | ✅ |

**📁 Bilder-Pfad:** `content/images/`

---

## 🛠️ SERVICE-KATEGORIEN

### 1. LICHTWERBUNG
**Quelle:** `lichtwerbung.html` + Unterseiten

#### Hauptkategorie
- **Titel:** Lichtwerbung
- **Beschreibung:** "Ihre Marke strahlt 24/7! Von handgefertigten Neon-Kreationen aus unserer eigenen Glasbläserei bis zu modernster LED-Technik."
- **Hero-Image:** `content/images/546aa65af854dcf4936912fbbde4dfd2.jpg`

#### Unterkategorien
| Service | Beschreibung | Bilder |
|---------|--------------|--------|
| **Leuchtschriften** | LED & Neon Schriften | leuchttransparente-*.jpg |
| **Leuchttransparente** | Transparente Leuchtflächen | leuchttransparente-*.jpg |
| **Halbrelief-/Plattenschriften** | 3D Buchstaben | halbrelief-plattenschriften-*.jpg |
| **Neon / LED-Technik** | Moderne Technik | neon-led-technik-*.jpg |
| **Pylonen** | Wegweiser & Pylonen | pylonen-*.jpg |

### 2. BESCHRIFTUNGEN
**Quelle:** `beschriftungen.html` + Unterseiten

#### Hauptkategorie
- **Titel:** Beschriftungen
- **Beschreibung:** "Jede Oberfläche wird zur Werbefläche! Professionelle Beschriftungen für maximale Markenvisibilität."
- **Hero-Image:** `content/images/8be3073f251df0431fd23062e5b8ccc5.jpg`

#### Unterkategorien
| Service | Beschreibung | Bilder |
|---------|--------------|--------|
| **Fahrzeugbeschriftung** | Komplette Fahrzeuggestaltung | fahrzeugbeschriftung-*.jpg |
| **Fensterbeschriftung** | Schaufenster & Fenster | fensterbeschriftung-*.jpg |
| **Signaletik** | Leitsysteme & Wegweiser | signaletik-*.jpg |
| **Tafelbeschriftung** | Schilder & Tafeln | tafelbeschriftung-*.jpg |
| **Blachen und Fahnen** | Outdoor-Werbung | blachen-fahnen-*.jpg |
| **Grossformatdruck** | Plakate & Banner | grossformatdruck-*.jpg |

### 3. DIGITAL SIGNAGE
**Quelle:** `digital-signage.html`

#### Hauptkategorie
- **Titel:** Digital Signage
- **Beschreibung:** "Dynamische Inhalte, die begeistern! Moderne Digital-Displays für zeitgemäße Kommunikation."
- **Hero-Image:** `content/images/cbbedb5f094d40d5fcbb568be5ac1d5e.jpg`

#### Services
- Interaktive Displays
- LED-Screens & Preisanzeigen
- Content Management
- Digital-Signage Lösungen

---

## 📊 BILDER & ASSETS

### Content-Verzeichnis Struktur
```
content/images/
├── 📸 Team-Fotos (6 Dateien)
│   ├── person1.jpg - person6.jpg
│   └── person4_new.jpg
├── 🏢 Kunden-Logos (18 Dateien)
│   ├── *.png (5 Dateien)
│   └── *.svg (13 Dateien)
├── 🛠️ Service-Bilder (60+ Dateien)
│   ├── lichtwerbung-*.jpg
│   ├── beschriftung-*.jpg
│   ├── digital-signage-*.webp
│   └── detail*.jpg (Projekt-Details)
├── 🏭 Firmen-Bilder
│   ├── team-gruppenfoto.jpg
│   ├── mitarbeiter.jpg
│   └── fachkompetenzen-*.webp
└── 🎯 Hero-Images
    ├── Hero-Slider Bilder (3 Hauptbilder)
    └── Category-Header Bilder
```

### Bildqualität & Formate
- **Gesamt:** ~100 Bilddateien
- **Formate:** JPG, PNG, SVG, WebP
- **Qualität:** Gemischt (einige sehr hochauflösend)
- **Optimierung nötig:** Ja (WebP-Konvertierung)

---

## 🔧 SITE-SETTINGS & METADATEN

### Firmen-Kontaktdaten
```json
{
  "company": "Neon Murer AG",
  "founding_year": "1949",
  "locations": [
    {
      "name": "Werk Uznach",
      "address": "Burgerrietstrasse 30, 8730 Uznach",
      "phone": "+41 55 225 50 25",
      "email": "neon@neonmurer.ch",
      "coordinates": "47.2196, 8.9795"
    },
    {
      "name": "Werk Jona", 
      "address": "Tägernaustrasse 21, 8640 Rapperswil-Jona",
      "phone": "+41 55 212 63 67",
      "email": "neon@neonmurer.ch",
      "coordinates": "47.2344, 8.8409"
    }
  ]
}
```

### SEO-Metadaten (Schema.org)
- **LocalBusiness** Schema
- **Organization** Schema  
- **WebSite** Schema
- **Aggregate Rating:** 4.8/5 (47 Reviews)
- **Service Types:** Detailliert definiert

---

## 📋 MIGRATIONS-PRIORITÄTEN

### Phase 1 (Hoch)
- [ ] **Team-Mitglieder** → `team_members` Collection
- [ ] **Kunden-Logos** → `client_logos` Collection
- [ ] **Site-Settings** → `site_settings` Collection

### Phase 2 (Mittel)
- [ ] **Service-Kategorien** → `service_categories` Collection
- [ ] **Service-Items** → `service_items` Collection
- [ ] **Hero-Images** Migration

### Phase 3 (Niedrig)
- [ ] **News/Blog** System aufbauen
- [ ] **Projekt-Portfolio** entwickeln
- [ ] **Mehrsprachigkeit** vorbereiten

---

## 🚨 Besondere Hinweise

### Kritische Dateien
- **Team-Fotos:** Hohe Qualität beibehalten
- **Kunden-Logos:** Exakte Farben wichtig (Marken-Guidelines)
- **Schema.org:** Existing SEO-Benefits nicht verlieren

### Technische Anforderungen
- **Image-Optimization:** WebP + Fallbacks
- **Responsive Images:** Multiple Sizes generieren
- **Alt-Texts:** Accessibility sicherstellen
- **Loading Performance:** Lazy Loading implementieren

---

*Content-Inventar vervollständigt ✅* 