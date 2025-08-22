const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedSettings() {
  console.log('🌱 Seeding settings...');

  // Default settings that should exist in the system
  const defaultSettings = [
    // General Settings
    {
      category: 'general',
      key: 'siteTitle',
      value: 'Neon Murer AG - Professionelle Beschriftungslösungen',
      isPublic: true,
      description: 'Titel der Website, der in Browser-Tabs und SEO verwendet wird'
    },
    {
      category: 'general',
      key: 'siteTagline',
      value: 'Ihr Partner für Lichtwerbung und Beschriftung',
      isPublic: true,
      description: 'Untertitel/Tagline der Website'
    },
    {
      category: 'general',
      key: 'siteDescription',
      value: 'Neon Murer AG ist Ihr Spezialist für professionelle Lichtwerbung, Fahrzeugbeschriftung und Grossformatdruck in der Schweiz. Über 40 Jahre Erfahrung.',
      isPublic: true,
      description: 'Allgemeine Beschreibung der Website für SEO'
    },
    {
      category: 'general',
      key: 'contactEmail',
      value: 'info@neonmurer.ch',
      isPublic: true,
      description: 'Hauptkontakt E-Mail-Adresse'
    },
    {
      category: 'general',
      key: 'contactPhone',
      value: '+41 55 240 20 70',
      isPublic: true,
      description: 'Hauptkontakt Telefonnummer'
    },

    // SEO Settings
    {
      category: 'seo',
      key: 'googleAnalyticsId',
      value: '',
      isPublic: false,
      description: 'Google Analytics Tracking ID (z.B. G-XXXXXXXXXX)'
    },
    {
      category: 'seo',
      key: 'googleTagManagerId',
      value: '',
      isPublic: false,
      description: 'Google Tag Manager Container ID (z.B. GTM-XXXXXXX)'
    },
    {
      category: 'seo',
      key: 'enableSitemap',
      value: true,
      isPublic: false,
      description: 'XML Sitemap automatisch generieren'
    },
    {
      category: 'seo',
      key: 'enableRobots',
      value: true,
      isPublic: false,
      description: 'Robots.txt aktivieren'
    },

    // Social Media Settings
    {
      category: 'social',
      key: 'facebookUrl',
      value: '',
      isPublic: true,
      description: 'Facebook Seiten-URL'
    },
    {
      category: 'social',
      key: 'instagramUrl',
      value: '',
      isPublic: true,
      description: 'Instagram Profil-URL'
    },
    {
      category: 'social',
      key: 'linkedinUrl',
      value: '',
      isPublic: true,
      description: 'LinkedIn Unternehmensseite URL'
    },
    {
      category: 'social',
      key: 'youtubeUrl',
      value: '',
      isPublic: true,
      description: 'YouTube Kanal URL'
    },
    {
      category: 'social',
      key: 'ogTitle',
      value: 'Neon Murer AG - Professionelle Beschriftung',
      isPublic: true,
      description: 'Open Graph Titel für Social Media Sharing'
    },
    {
      category: 'social',
      key: 'ogDescription',
      value: 'Ihr Spezialist für Fahrzeugbeschriftung, LED-Lichtwerbung und Signaletik in der Schweiz. Über 50 Jahre Erfahrung.',
      isPublic: true,
      description: 'Open Graph Beschreibung für Social Media Sharing'
    },
    {
      category: 'social',
      key: 'enableTwitterCard',
      value: true,
      isPublic: false,
      description: 'Twitter Cards aktivieren'
    },

    // Email Settings (Initially empty for security)
    {
      category: 'email',
      key: 'smtpHost',
      value: '',
      isPublic: false,
      description: 'SMTP Server Hostname'
    },
    {
      category: 'email',
      key: 'smtpPort',
      value: 587,
      isPublic: false,
      description: 'SMTP Server Port'
    },
    {
      category: 'email',
      key: 'smtpUsername',
      value: '',
      isPublic: false,
      description: 'SMTP Benutzername'
    },
    {
      category: 'email',
      key: 'smtpPassword',
      value: '',
      isPublic: false,
      description: 'SMTP Passwort (verschlüsselt gespeichert)'
    },
    {
      category: 'email',
      key: 'senderName',
      value: 'Neon Murer AG',
      isPublic: false,
      description: 'Absender Name für E-Mails'
    },
    {
      category: 'email',
      key: 'senderEmail',
      value: 'info@neonmurer.ch',
      isPublic: false,
      description: 'Absender E-Mail-Adresse'
    },
    {
      category: 'email',
      key: 'enableEmailLog',
      value: true,
      isPublic: false,
      description: 'E-Mail Versand protokollieren'
    },

    // Security Settings
    {
      category: 'security',
      key: 'enableTwoFactor',
      value: false,
      isPublic: false,
      description: 'Zwei-Faktor-Authentifizierung aktivieren'
    },
    {
      category: 'security',
      key: 'sessionTimeout',
      value: 1800, // 30 minutes
      isPublic: false,
      description: 'Session Timeout in Sekunden'
    },
    {
      category: 'security',
      key: 'maxLoginAttempts',
      value: 5,
      isPublic: false,
      description: 'Maximale Login-Versuche'
    },
    {
      category: 'security',
      key: 'forceSSL',
      value: true,
      isPublic: false,
      description: 'HTTPS erzwingen'
    },
    {
      category: 'security',
      key: 'enableHSTS',
      value: true,
      isPublic: false,
      description: 'HTTP Strict Transport Security aktivieren'
    },

    // Backup Settings
    {
      category: 'backup',
      key: 'backupInterval',
      value: 'daily',
      isPublic: false,
      description: 'Backup-Intervall (daily, weekly, monthly, manual)'
    },
    {
      category: 'backup',
      key: 'backupTime',
      value: '02:00',
      isPublic: false,
      description: 'Backup-Zeit (HH:MM Format)'
    },
    {
      category: 'backup',
      key: 'backupRetention',
      value: 30,
      isPublic: false,
      description: 'Backup-Aufbewahrung in Tagen'
    },
    {
      category: 'backup',
      key: 'maxBackups',
      value: 10,
      isPublic: false,
      description: 'Maximale Anzahl von Backups'
    },
    {
      category: 'backup',
      key: 'compressBackups',
      value: true,
      isPublic: false,
      description: 'Backups komprimieren'
    }
  ];

  // Insert or update settings
  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: {
        category_key: {
          category: setting.category,
          key: setting.key
        }
      },
      create: setting,
      update: {
        // Only update description, keep existing values
        description: setting.description,
        isPublic: setting.isPublic
      }
    });
  }

  console.log(`✅ Settings seeded: ${defaultSettings.length} settings created/updated`);
}

async function main() {
  try {
    await seedSettings();
  } catch (error) {
    console.error('❌ Error seeding settings:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { seedSettings };