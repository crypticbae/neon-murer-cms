const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedDatenschutz() {
  console.log('🔒 Seeding Datenschutz sections...');

  try {
    // Lösche alle bestehenden Datenschutz-Abschnitte
    await prisma.datenschutzSection.deleteMany({});

    // Erstelle die Datenschutz-Abschnitte basierend auf datenschutz.html
    const datenschutzSections = [
      {
        title: "Verantwortlich für die Datenverarbeitung",
        content: `<div class="responsible-info">
<h3>Neon Murer AG</h3>
<p>
  Tägernaustrasse 21<br>
  CH-8640 Rapperswil-Jona<br>
  Tel: +41 (0)55 225 50 25<br>
  E-Mail: <a href="mailto:neon@neonmurer.ch">neon@neonmurer.ch</a>
</p>
</div>`,
        boxType: "DEFAULT",
        iconClass: "fa-solid fa-building",
        sortOrder: 1,
        isActive: true,
        showInQuickNav: true,
        isEditable: true
      },
      {
        title: "Welche Daten erfassen wir?",
        content: `<ul class="data-list">
<li><strong>Kontaktdaten bei Anfragen:</strong> Name, E-Mail, Telefonnummer</li>
<li><strong>Kundendaten im Rahmen von Aufträgen:</strong> Anschrift, Zahlungsdaten etc.</li>
<li><strong>Bewerbungsunterlagen:</strong> Lebenslauf, Zeugnisse etc.</li>
<li><strong>Technische Daten bei Website-Nutzung:</strong> IP-Adresse, Browserdaten, Besuchszeitpunkt, besuchte Seiten</li>
</ul>`,
        boxType: "DEFAULT",
        iconClass: "fa-solid fa-database",
        sortOrder: 2,
        isActive: true,
        showInQuickNav: true,
        isEditable: true
      },
      {
        title: "Zweck der Datennutzung",
        content: `<ul class="purpose-list">
<li>Bearbeitung von Anfragen und Aufträgen</li>
<li>Kommunikation mit Kunden und Interessenten</li>
<li>Verarbeitung und Entscheidungsfindung im Bewerbungsprozess</li>
<li>Optimierung und Betrieb der Website (inkl. Reichweitenmessung)</li>
</ul>`,
        boxType: "DEFAULT",
        iconClass: "fa-solid fa-bullseye",
        sortOrder: 3,
        isActive: true,
        showInQuickNav: false,
        isEditable: true
      },
      {
        title: "Bewerbungsunterlagen",
        content: `<ul class="application-list">
<li>Bewerbungen werden <strong>vertraulich behandelt</strong></li>
<li><strong>Aufbewahrung:</strong> maximal 6 Monate nach Abschluss des Bewerbungsverfahrens</li>
<li>Danach werden die Daten <strong>vollständig gelöscht</strong></li>
<li>Bei erfolgter Anstellung werden Bewerbungsdaten in das Personaldossier übernommen</li>
<li>Auf Wunsch löschen wir Bewerbungsunterlagen <strong>jederzeit</strong> vor Ablauf dieser Frist</li>
</ul>`,
        boxType: "HIGHLIGHT",
        iconClass: "fa-solid fa-file-text",
        sortOrder: 4,
        isActive: true,
        showInQuickNav: true,
        isEditable: true
      },
      {
        title: "Cookies & Tracking",
        content: `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
<h3 style="color: #112357; margin: 0;">Cookie-Kategorien</h3>
<button onclick="resetCookieConsent()" class="cookie-reset-btn" style="margin: 0;">
  <i class="fas fa-cookie-bite"></i>
  Cookie-Banner öffnen
</button>
</div>

<div class="cookie-category-compact">
<div class="category-row">
  <div class="category-header">
    <i class="fas fa-shield-alt" style="color: #28a745;"></i>
    <strong>Notwendige Cookies</strong>
  </div>
  <div class="category-desc">Für Website-Betrieb erforderlich • Können nicht deaktiviert werden</div>
  <div class="category-cookies">
    <span class="cookie-tag">neon_cookie_consent</span>
    <span class="cookie-tag">neon_analytics_session</span>
  </div>
</div>

<div class="category-row">
  <div class="category-header">
    <i class="fas fa-chart-line" style="color: #007bff;"></i>
    <strong>Statistik & Analytics</strong>
  </div>
  <div class="category-desc">Anonyme Nutzungsanalyse • Optional • IP-Anonymisierung aktiv</div>
  <div class="category-cookies">
    <span class="cookie-tag">Lokales Tracking</span>
    <small>(Keine Google Analytics ohne Ihre Zustimmung)</small>
  </div>
</div>

<div class="category-row">
  <div class="category-header">
    <i class="fas fa-bullhorn" style="color: #ffc107;"></i>
    <strong>Marketing</strong>
  </div>
  <div class="category-desc">Derzeit nicht verwendet • Zukünftige Erweiterungen möglich</div>
  <div class="category-cookies">
    <span class="cookie-tag inactive">Keine Marketing-Cookies aktiv</span>
  </div>
</div>
</div>`,
        boxType: "DEFAULT",
        iconClass: "fa-solid fa-cookie",
        sortOrder: 5,
        isActive: true,
        showInQuickNav: true,
        isEditable: false // Cookie-Abschnitt nicht editierbar!
      },
      {
        title: "Google Analytics",
        content: `<p>Wir verwenden Google Analytics 4 zur anonymisierten Analyse der Website-Nutzung:</p>
<ul class="analytics-list">
<li>Ihre IP-Adresse wird standardmässig <strong>gekürzt</strong> (Anonymisierung)</li>
<li>Es werden <strong>keine personenbezogenen Profile</strong> erstellt</li>
<li>Die gewonnenen Daten helfen uns, die Website und unser Angebot zu verbessern</li>
<li>Falls Sie nicht möchten, dass Ihre Daten über Google Analytics erfasst werden, können Sie im Cookie-Banner ablehnen</li>
<li>Google LLC speichert diese Daten in den USA. Google ist verpflichtet, angemessene Datenschutzstandards zu gewährleisten</li>
</ul>`,
        boxType: "DEFAULT",
        iconClass: "fa-solid fa-chart-line",
        sortOrder: 6,
        isActive: true,
        showInQuickNav: true,
        isEditable: true
      },
      {
        title: "Weitergabe der Daten",
        content: `<p><strong>Keine Weitergabe</strong> Ihrer Daten an Dritte ohne Ihre ausdrückliche Zustimmung</p>
<p><strong>Ausnahme:</strong> gesetzliche Verpflichtungen oder technische Dienstleister (z. B. Hosting)</p>`,
        boxType: "IMPORTANT",
        iconClass: "fa-solid fa-share-alt",
        sortOrder: 7,
        isActive: true,
        showInQuickNav: false,
        isEditable: true
      },
      {
        title: "Aufbewahrung und Löschung",
        content: `<ul class="retention-list">
<li><strong>Geschäftsdaten:</strong> gemäss gesetzlichen Aufbewahrungspflichten (z. B. Buchhaltung)</li>
<li><strong>Kontaktdaten:</strong> solange sie für die Kommunikation oder Auftragserfüllung benötigt werden</li>
<li><strong>Bewerbungsunterlagen:</strong> max. 6 Monate</li>
</ul>
<p>Danach werden die Daten gelöscht oder anonymisiert.</p>`,
        boxType: "DEFAULT",
        iconClass: "fa-solid fa-clock",
        sortOrder: 8,
        isActive: true,
        showInQuickNav: false,
        isEditable: true
      },
      {
        title: "Ihre Rechte",
        content: `<p>Sie haben das Recht auf:</p>
<ul class="rights-list">
<li><strong>Auskunft</strong> über gespeicherte Daten</li>
<li><strong>Berichtigung</strong> unvollständiger oder falscher Daten</li>
<li><strong>Löschung</strong> Ihrer Daten (sofern keine gesetzliche Pflicht zur Aufbewahrung besteht)</li>
<li><strong>Widerspruch</strong> gegen die Bearbeitung</li>
</ul>
<p><strong>Anfragen bitte per E-Mail an:</strong> <a href="mailto:neon@neonmurer.ch">neon@neonmurer.ch</a></p>`,
        boxType: "HIGHLIGHT",
        iconClass: "fa-solid fa-user-shield",
        sortOrder: 9,
        isActive: true,
        showInQuickNav: true,
        isEditable: true
      },
      {
        title: "Datensicherheit",
        content: `<p>Wir schützen Ihre Daten durch angemessene technische und organisatorische Massnahmen. 
Unsere Server befinden sich ausschliesslich in der <strong>Schweiz oder der EU</strong>.</p>`,
        boxType: "DEFAULT",
        iconClass: "fa-solid fa-shield-halved",
        sortOrder: 10,
        isActive: true,
        showInQuickNav: false,
        isEditable: true
      },
      {
        title: "Urheberrechte",
        content: `<p>Die Urheber- und alle weiteren Rechte an Inhalten, Bildern, Fotos, Videos, Texten sowie anderen Dateien 
auf dieser Website gehören ausschliesslich der <strong>Neon Murer AG</strong> oder den ausdrücklich genannten Rechtsinhabern.</p>

<p><strong>Jegliche Nutzung, Vervielfältigung, Bearbeitung oder Verbreitung</strong> dieser Inhalte – auch auszugsweise – 
ist ohne vorherige schriftliche Zustimmung der jeweiligen Rechteinhaber untersagt.</p>

<p class="warning-text">⚠️ Zuwiderhandlungen werden rechtlich verfolgt.</p>`,
        boxType: "IMPORTANT",
        iconClass: "fa-solid fa-copyright",
        sortOrder: 11,
        isActive: true,
        showInQuickNav: false,
        isEditable: true
      }
    ];

    // Füge alle Abschnitte hinzu
    for (const section of datenschutzSections) {
      await prisma.datenschutzSection.create({
        data: section
      });
    }

    console.log(`✅ ${datenschutzSections.length} Datenschutz-Abschnitte erfolgreich erstellt!`);
    console.log('📝 Cookie-Abschnitt wurde als nicht-editierbar markiert');

  } catch (error) {
    console.error('❌ Fehler beim Seeding der Datenschutz-Abschnitte:', error);
    throw error;
  }
}

// Nur ausführen wenn direkt aufgerufen
if (require.main === module) {
  seedDatenschutz()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { seedDatenschutz };