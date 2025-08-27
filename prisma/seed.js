const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { seedSettings } = require('./seed-settings');
const { seedDienstleistungen } = require('./seed-dienstleistungen');
const { seedCompanyHistory } = require('./seed-company-history');
const { seedFachKompetenzen } = require('./seed-fachkompetenzen');
const { seedTeamMembers } = require('./seed-team-members');
const { seedCustomers } = require('./seed-customers');
const { seedAgb } = require('./seed-agb');
const { seedDatenschutz } = require('./seed-datenschutz');
const { seedJobsAndNews } = require('./seed-jobs-news');
const { seedCategoryCards } = require('./seed-category-cards');
const seedNewsletterData = require('./seed-newsletter');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@neonmurer.ch' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@neonmurer.ch',
      password: hashedPassword,
      name: process.env.ADMIN_NAME || 'Administrator',
      role: 'ADMIN'
    }
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create pages for existing website structure - ALL 24 PAGES
  const pages = [
    // Main Pages
    {
      title: 'Homepage',
      slug: 'index',
      path: 'index.html',
      category: 'Hauptseiten',
      type: 'HOMEPAGE',
      metaTitle: 'Neon Murer - Lichtwerbung & Beschriftungen',
      metaDescription: 'Professionelle Lichtwerbung und Beschriftungen von Neon Murer.',
      heroSection: {
        title: 'Willkommen bei Neon Murer',
        subtitle: 'Ihr Partner für professionelle Lichtwerbung',
        description: 'Seit über 40 Jahren Ihr zuverlässiger Partner für hochwertige Lichtwerbung und Beschriftungen.',
        backgroundColor: '#2c3e50'
      }
    },
    {
      title: 'Beschriftungen',
      slug: 'beschriftungen',
      path: 'beschriftungen.html',
      category: 'Hauptseiten',
      type: 'CATEGORY',
      metaTitle: 'Beschriftungen - Neon Murer',
      metaDescription: 'Professionelle Beschriftungen für Fahrzeuge, Fenster und mehr.',
      heroSection: {
        title: 'Beschriftungen',
        subtitle: 'Professionelle Beschriftungen für jeden Bedarf',
        description: 'Von Fahrzeugbeschriftung bis Fensterbeschriftung - wir machen Ihre Werbung sichtbar.',
        backgroundColor: '#34495e'
      }
    },
    {
      title: 'Lichtwerbung',
      slug: 'lichtwerbung',
      path: 'lichtwerbung.html',
      category: 'Hauptseiten',
      type: 'CATEGORY',
      metaTitle: 'Lichtwerbung - Neon Murer',
      metaDescription: 'Professionelle Lichtwerbung und LED-Technik.',
      heroSection: {
        title: 'Lichtwerbung',
        subtitle: 'Leuchtende Werbung die begeistert',
        description: 'Moderne LED-Technik und klassische Neon-Lösungen für maximale Aufmerksamkeit.',
        backgroundColor: '#2c3e50'
      }
    },
    {
      title: 'Digital Signage',
      slug: 'digital-signage',
      path: 'digital-signage.html',
      category: 'Hauptseiten',
      type: 'SERVICE',
      metaTitle: 'Digital Signage - Neon Murer',
      metaDescription: 'Moderne digitale Werbetafeln und Displays.',
      heroSection: {
        title: 'Digital Signage',
        subtitle: 'Digitale Werbung der Zukunft',
        description: 'Moderne digitale Displays und Werbetafeln für dynamische Inhalte.',
        backgroundColor: '#1a1a1a'
      }
    },
    {
      title: 'Dienstleistungen',
      slug: 'dienstleistungen',
      path: 'dienstleistungen.html',
      category: 'Hauptseiten',
      type: 'PAGE',
      metaTitle: 'Dienstleistungen - Neon Murer',
      metaDescription: 'Alle Dienstleistungen von Neon Murer im Überblick.',
      heroSection: {
        title: 'Unsere Dienstleistungen',
        subtitle: 'Vollservice rund um Lichtwerbung',
        description: 'Von der Beratung bis zur Montage - wir bieten alles aus einer Hand.',
        backgroundColor: '#34495e'
      }
    },
    {
      title: 'Datenschutz',
      slug: 'datenschutz',
      path: 'datenschutz.html',
      category: 'Hauptseiten',
      type: 'PAGE',
      metaTitle: 'Datenschutz - Neon Murer',
      metaDescription: 'Datenschutzerklärung der Neon Murer Website.'
    },
    {
      title: 'Geschäftsbedingungen',
      slug: 'geschaeftsbedingungen',
      path: 'geschaeftsbedingungen.html',
      category: 'Hauptseiten',
      type: 'PAGE',
      metaTitle: 'AGB - Neon Murer',
      metaDescription: 'Allgemeine Geschäftsbedingungen von Neon Murer.'
    },
    {
      title: 'Impressum',
      slug: 'impressum',
      path: 'impressum.html',
      category: 'Hauptseiten',
      type: 'PAGE',
      metaTitle: 'Impressum - Neon Murer',
      metaDescription: 'Impressum und Kontaktdaten von Neon Murer.'
    },

    // Beschriftungs-Seiten
    {
      title: 'Blachen & Fahnen',
      slug: 'blachen-fahnen',
      path: 'beschriftungen/blachen-fahnen.html',
      category: 'Beschriftungen',
      type: 'SERVICE',
      metaTitle: 'Blachen & Fahnen - Neon Murer',
      metaDescription: 'Hochwertige Blachen und Fahnen für Ihre Werbung.',
      heroSection: {
        title: 'Blachen & Fahnen',
        subtitle: 'Wetterfeste Werbung für jeden Einsatz',
        description: 'Hochwertige Blachen und Fahnen für Events, Baustellen und dauerhafte Außenwerbung.',
        backgroundColor: '#27ae60'
      },
      projectsSection: {
        title: 'Unsere Blachen & Fahnen Projekte',
        description: 'Von Event-Bannern bis zu dauerhaften Werbeblachen - unsere Projekte zeigen die Vielfalt unserer Lösungen.',
        projects: [
          { name: 'Event Banner', imageUrl: '../content/images/blachen-fahnen-1.jpg', order: 0 },
          { name: 'Firmen Fahnen', imageUrl: '../content/images/blachen-fahnen-2.jpg', order: 1 },
          { name: 'Werbeblachen', imageUrl: '../content/images/blachen-fahnen-3.jpg', order: 2 },
          { name: 'Mesh Banner', imageUrl: '../content/images/blachen-fahnen-4.jpg', order: 3 }
        ]
      }
    },
    {
      title: 'Fahrzeugbeschriftung',
      slug: 'fahrzeugbeschriftung',
      path: 'beschriftungen/fahrzeugbeschriftung.html',
      category: 'Beschriftungen',
      type: 'SERVICE',
      metaTitle: 'Fahrzeugbeschriftung - Neon Murer',
      metaDescription: 'Professionelle Beschriftung für alle Fahrzeugtypen.',
      heroSection: {
        title: 'Fahrzeugbeschriftung',
        subtitle: 'Mobile Werbung die auffällt',
        description: 'Professionelle Fahrzeugbeschriftung für maximale Werbewirkung im Straßenverkehr.',
        backgroundColor: '#e74c3c'
      },
      projectsSection: {
        title: 'Unsere Fahrzeugprojekte',
        description: 'Von Firmenwagen bis LKW - wir machen Ihre Fahrzeuge zu mobilen Werbeflächen.',
        projects: [
          { name: 'Lieferwagen Beschriftung', imageUrl: '../content/images/fahrzeugbeschriftung-1.jpg', order: 0 },
          { name: 'LKW Vollbeschriftung', imageUrl: '../content/images/fahrzeugbeschriftung-2.jpg', order: 1 },
          { name: 'PKW Teilbeschriftung', imageUrl: '../content/images/fahrzeugbeschriftung-3.jpg', order: 2 },
          { name: 'Bus Beschriftung', imageUrl: '../content/images/fahrzeugbeschriftung-4.jpg', order: 3 }
        ]
      }
    },
    {
      title: 'Fensterbeschriftung',
      slug: 'fensterbeschriftung',
      path: 'beschriftungen/fensterbeschriftung.html',
      category: 'Beschriftungen',
      type: 'SERVICE',
      metaTitle: 'Fensterbeschriftung - Neon Murer',
      metaDescription: 'Professionelle Fensterbeschriftung für Ihr Geschäft.',
      heroSection: {
        title: 'Fensterbeschriftung',
        subtitle: 'Ihre Schaufenster als Werbefläche',
        description: 'Professionelle Fensterbeschriftung für Geschäfte, Büros und Restaurants.',
        backgroundColor: '#3498db'
      },
      projectsSection: {
        title: 'Fensterbeschriftung Projekte',
        description: 'Kreative Lösungen für Schaufenster und Glasflächen.',
        projects: [
          { name: 'Restaurant Fenster', imageUrl: '../content/images/fensterbeschriftung-1.jpg', order: 0 },
          { name: 'Büro Sichtschutz', imageUrl: '../content/images/fensterbeschriftung-2.jpg', order: 1 },
          { name: 'Laden Beschriftung', imageUrl: '../content/images/fensterbeschriftung-3.jpg', order: 2 },
          { name: 'Praxis Fenster', imageUrl: '../content/images/fensterbeschriftung-4.jpg', order: 3 }
        ]
      }
    },
    {
      title: 'Großformatdruck',
      slug: 'grossformatdruck',
      path: 'beschriftungen/grossformatdruck.html',
      category: 'Beschriftungen',
      type: 'SERVICE',
      metaTitle: 'Großformatdruck - Neon Murer',
      metaDescription: 'Hochwertiger Großformatdruck für Ihre Werbung.',
      heroSection: {
        title: 'Großformatdruck',
        subtitle: 'Große Formate, große Wirkung',
        description: 'Hochwertiger Großformatdruck für Plakate, Banner und Displays.',
        backgroundColor: '#9b59b6'
      },
      projectsSection: {
        title: 'Großformatdruck Projekte',
        description: 'Von Messeständen bis Außenwerbung - unsere Drucke beeindrucken.',
        projects: [
          { name: 'Messe Display', imageUrl: '../content/images/grossformatdruck-1.jpg', order: 0 },
          { name: 'Plakat Kampagne', imageUrl: '../content/images/grossformatdruck-2.jpg', order: 1 },
          { name: 'Banner Werbung', imageUrl: '../content/images/grossformatdruck-3.jpg', order: 2 },
          { name: 'Roll-Up Display', imageUrl: '../content/images/grossformatdruck-4.jpg', order: 3 }
        ]
      }
    },
    {
      title: 'Signaletik',
      slug: 'signaletik',
      path: 'beschriftungen/signaletik.html',
      category: 'Beschriftungen',
      type: 'SERVICE',
      metaTitle: 'Signaletik - Neon Murer',
      metaDescription: 'Professionelle Signaletik und Wegweiser.',
      heroSection: {
        title: 'Signaletik',
        subtitle: 'Orientierung die überzeugt',
        description: 'Professionelle Wegweiser und Orientierungssysteme für Gebäude und Außenbereiche.',
        backgroundColor: '#f39c12'
      },
      projectsSection: {
        title: 'Signaletik Projekte',
        description: 'Durchdachte Leitsysteme für optimale Orientierung.',
        projects: [
          { name: 'Bürogebäude Leitsystem', imageUrl: '../content/images/signaletik-1.jpg', order: 0 },
          { name: 'Krankenhaus Wegweiser', imageUrl: '../content/images/signaletik-2.jpg', order: 1 },
          { name: 'Einkaufszentrum Signaletik', imageUrl: '../content/images/signaletik-3.jpg', order: 2 },
          { name: 'Parkhaus Orientierung', imageUrl: '../content/images/signaletik-4.jpg', order: 3 }
        ]
      }
    },
    {
      title: 'Tafelbeschriftung',
      slug: 'tafelbeschriftung',
      path: 'beschriftungen/tafelbeschriftung.html',
      category: 'Beschriftungen',
      type: 'SERVICE',
      metaTitle: 'Tafelbeschriftung - Neon Murer',
      metaDescription: 'Hochwertige Tafelbeschriftung und Schilder.',
      heroSection: {
        title: 'Tafelbeschriftung',
        subtitle: 'Klassische Schilder mit Tradition',
        description: 'Hochwertige Tafelbeschriftung für dauerhafte und repräsentative Beschilderung.',
        backgroundColor: '#2c3e50'
      },
      projectsSection: {
        title: 'Tafelbeschriftung Projekte',
        description: 'Traditionelle Handwerkskunst für moderne Ansprüche.',
        projects: [
          { name: 'Firmenschild Gravur', imageUrl: '../content/images/tafelbeschriftung-1.jpg', order: 0 },
          { name: 'Praxisschild Edelstahl', imageUrl: '../content/images/tafelbeschriftung-2.jpg', order: 1 },
          { name: 'Hinweisschild Outdoor', imageUrl: '../content/images/tafelbeschriftung-3.jpg', order: 2 },
          { name: 'Türschild Individual', imageUrl: '../content/images/tafelbeschriftung-4.jpg', order: 3 }
        ]
      }
    },

    // Lichtwerbungs-Seiten
    {
      title: 'Halbrelief & Plattenschriften',
      slug: 'halbrelief-plattenschriften',
      path: 'lichtwerbung/halbrelief-plattenschriften.html',
      category: 'Lichtwerbung',
      type: 'SERVICE',
      metaTitle: 'Halbrelief & Plattenschriften - Neon Murer',
      metaDescription: 'Professionelle Halbrelief und Plattenschriften.',
      heroSection: {
        title: 'Halbrelief & Plattenschriften',
        subtitle: 'Dreidimensionale Schriften mit Tiefenwirkung',
        description: 'Hochwertige Halbrelief und Plattenschriften für repräsentative Außenwerbung.',
        backgroundColor: '#34495e'
      },
      projectsSection: {
        title: 'Halbrelief Projekte',
        description: 'Eindrucksvolle 3D-Schriften für maximale Präsenz.',
        projects: [
          { name: 'Bank Fassadenschrift', imageUrl: '../content/images/halbrelief-plattenschriften-1.jpg', order: 0 },
          { name: 'Hotel Eingangschrift', imageUrl: '../content/images/halbrelief-plattenschriften-2.jpg', order: 1 },
          { name: 'Firmen Logo 3D', imageUrl: '../content/images/halbrelief-plattenschriften-3.jpg', order: 2 },
          { name: 'Praxis Schrift Relief', imageUrl: '../content/images/halbrelief-plattenschriften-4.jpg', order: 3 }
        ]
      }
    },
    {
      title: 'Leuchtschriften',
      slug: 'leuchtschriften',
      path: 'lichtwerbung/leuchtschriften.html',
      category: 'Lichtwerbung',
      type: 'SERVICE',
      metaTitle: 'Leuchtschriften - Neon Murer',
      metaDescription: 'Moderne LED-Leuchtschriften für Ihre Werbung.',
      heroSection: {
        title: 'Leuchtschriften',
        subtitle: 'Ihre Spezialisten für hochwertige Beschriftungen und Werbeanlagen',
        description: 'Wir fertigen Buchstaben und Logos in jeder gewünschten Form – aus Aluminium oder Vollplexi mit stilvollen Acrylglas-Fronten.',
        backgroundColor: '#1a1a1a'
      },
      projectsSection: {
        title: 'Unsere Kundenprojekte',
        description: 'Unsere Projekte im Bereich Leuchtschriften zeigen eindrucksvoll, wie Marken und Botschaften strahlend in Szene gesetzt werden können.',
        projects: [
          { name: 'Agrola Tankstellen', imageUrl: '../content/images/detail1.jpg', order: 0 },
          { name: 'Baloise Versicherungen AG', imageUrl: '../content/images/detail2.jpg', order: 1 },
          { name: 'Brasserie Verkehrshaus', imageUrl: '../content/images/detail3.jpg', order: 2 },
          { name: 'Brunox', imageUrl: '../content/images/detail4.jpg', order: 3 },
          { name: 'Dieci AG', imageUrl: '../content/images/detail5.jpg', order: 4 },
          { name: 'Entra Rapperswil', imageUrl: '../content/images/detail6.jpg', order: 5 }
        ]
      }
    },
    {
      title: 'Leuchttransparente',
      slug: 'leuchttransparente',
      path: 'lichtwerbung/leuchttransparente.html',
      category: 'Lichtwerbung',
      type: 'SERVICE',
      metaTitle: 'Leuchttransparente - Neon Murer',
      metaDescription: 'Auffällige Leuchttransparente für Ihre Werbung.',
      heroSection: {
        title: 'Leuchttransparente',
        subtitle: 'Leuchtende Werbung für maximale Aufmerksamkeit',
        description: 'Hochwertige Leuchttransparente für Geschäfte, Restaurants und öffentliche Einrichtungen.',
        backgroundColor: '#e74c3c'
      },
      projectsSection: {
        title: 'Leuchttransparent Projekte',
        description: 'Strahlende Werbetafeln für Tag und Nacht.',
        projects: [
          { name: 'Restaurant Leuchtkasten', imageUrl: '../content/images/leuchttransparente-1.jpg', order: 0 },
          { name: 'Apotheke Transparent', imageUrl: '../content/images/leuchttransparente-2.jpg', order: 1 },
          { name: 'Hotel Werbetafel', imageUrl: '../content/images/leuchttransparente-3.jpg', order: 2 }
        ]
      }
    },
    {
      title: 'Neon & LED-Technik',
      slug: 'neon-led-technik',
      path: 'lichtwerbung/neon-led-technik.html',
      category: 'Lichtwerbung',
      type: 'SERVICE',
      metaTitle: 'Neon & LED-Technik - Neon Murer',
      metaDescription: 'Innovative Neon und LED-Technik für Lichtwerbung.',
      heroSection: {
        title: 'Neon & LED-Technik',
        subtitle: 'Moderne LED meets klassisches Neon',
        description: 'Innovative LED-Technik und traditionelle Neon-Lösungen für jeden Anspruch.',
        backgroundColor: '#9b59b6'
      },
      projectsSection: {
        title: 'Neon & LED Projekte',
        description: 'Von klassischen Neonröhren bis zu modernster LED-Technik.',
        projects: [
          { name: 'LED Strip Installation', imageUrl: '../content/images/neon-led-technik-1.jpg', order: 0 }
        ]
      }
    },
    {
      title: 'Pylonen',
      slug: 'pylonen',
      path: 'lichtwerbung/pylonen.html',
      category: 'Lichtwerbung',
      type: 'SERVICE',
      metaTitle: 'Pylonen - Neon Murer',
      metaDescription: 'Professionelle Pylonen und Werbetürme.',
      heroSection: {
        title: 'Pylonen',
        subtitle: 'Werbetürme die weithin sichtbar sind',
        description: 'Professionelle Pylonen und Werbetürme für maximale Fernwirkung.',
        backgroundColor: '#27ae60'
      },
      projectsSection: {
        title: 'Pylonen Projekte',
        description: 'Imposante Werbetürme für Tankstellen, Einkaufszentren und Industriebetriebe.',
        projects: [
          { name: 'Tankstellen Pylon', imageUrl: '../content/images/pylonen-1.jpg', order: 0 },
          { name: 'Einkaufszentrum Turm', imageUrl: '../content/images/pylonen-2.jpg', order: 1 },
          { name: 'Autohaus Pylon', imageUrl: '../content/images/pylonen-3.jpg', order: 2 },
          { name: 'Hotel Werbeturm', imageUrl: '../content/images/pylonen-4.jpg', order: 3 },
          { name: 'Industrie Pylon', imageUrl: '../content/images/pylonen-5.jpg', order: 4 },
          { name: 'Restaurant Turm', imageUrl: '../content/images/pylonen-6.jpg', order: 5 }
        ]
      }
    },

    // Neon Murer Seiten
    {
      title: 'Fachkompetenzen',
      slug: 'fachkompetenzen',
      path: 'neon-murer/fachkompetenzen.html',
      category: 'Neon Murer',
      type: 'PAGE',
      metaTitle: 'Fachkompetenzen - Neon Murer',
      metaDescription: 'Erfahren Sie mehr über unsere Fachkompetenzen.',
      heroSection: {
        title: 'Unsere Fachkompetenzen',
        subtitle: 'Expertise in Lichtwerbung seit über 40 Jahren',
        description: 'Umfassende Kompetenz von der Beratung bis zur Realisierung Ihrer Werbeanlage.',
        backgroundColor: '#34495e'
      }
    },
    {
      title: 'Firmengeschichte',
      slug: 'firmengeschichte',
      path: 'neon-murer/firmengeschichte.html',
      category: 'Neon Murer',
      type: 'PAGE',
      metaTitle: 'Firmengeschichte - Neon Murer',
      metaDescription: 'Die Geschichte und Entwicklung von Neon Murer.',
      heroSection: {
        title: 'Unsere Firmengeschichte',
        subtitle: 'Tradition und Innovation seit 1982',
        description: 'Erfahren Sie mehr über die Entwicklung von Neon Murer zum führenden Anbieter für Lichtwerbung.',
        backgroundColor: '#2c3e50'
      }
    },
    {
      title: 'Kontaktpersonen',
      slug: 'kontaktpersonen',
      path: 'neon-murer/kontaktpersonen.html',
      category: 'Neon Murer',
      type: 'PAGE',
      metaTitle: 'Kontaktpersonen - Neon Murer',
      metaDescription: 'Unsere Ansprechpartner für Ihre Anfragen.',
      heroSection: {
        title: 'Unsere Kontaktpersonen',
        subtitle: 'Ihr direkter Draht zu uns',
        description: 'Lernen Sie unser Team kennen und finden Sie den richtigen Ansprechpartner für Ihr Projekt.',
        backgroundColor: '#3498db'
      }
    },
    {
      title: 'News',
      slug: 'news',
      path: 'neon-murer/news.html',
      category: 'Neon Murer',
      type: 'PAGE',
      metaTitle: 'News - Neon Murer',
      metaDescription: 'Aktuelle News und Neuigkeiten von Neon Murer.',
      heroSection: {
        title: 'Aktuelle News',
        subtitle: 'Neuigkeiten aus der Welt der Lichtwerbung',
        description: 'Bleiben Sie auf dem Laufenden über neue Projekte, Technologien und Entwicklungen.',
        backgroundColor: '#e74c3c'
      }
    },
    {
      title: 'Stellenangebote',
      slug: 'stellenangebote',
      path: 'neon-murer/stellenangebote.html',
      category: 'Neon Murer',
      type: 'PAGE',
      metaTitle: 'Stellenangebote - Neon Murer',
      metaDescription: 'Aktuelle Stellenangebote bei Neon Murer.',
      heroSection: {
        title: 'Stellenangebote',
        subtitle: 'Werden Sie Teil unseres Teams',
        description: 'Entdecken Sie spannende Karrieremöglichkeiten bei Neon Murer.',
        backgroundColor: '#27ae60'
      }
    }
  ];

  // Create pages with sections and projects
  for (const pageData of pages) {
    const { heroSection, projectsSection, ...pageInfo } = pageData;
    
    const page = await prisma.page.upsert({
      where: { slug: pageData.slug },
      update: {},
      create: {
        ...pageInfo,
        createdBy: adminUser.id
      }
    });

    // Create hero section
    if (heroSection) {
      await prisma.heroSection.upsert({
        where: { pageId: page.id },
        update: {},
        create: {
          ...heroSection,
          pageId: page.id
        }
      });
    }

    // Create projects section with projects
    if (projectsSection) {
      const { projects, ...projectsSectionData } = projectsSection;
      
      const projSection = await prisma.projectsSection.upsert({
        where: { pageId: page.id },
        update: {},
        create: {
          ...projectsSectionData,
          pageId: page.id
        }
      });

      // Create projects
      for (const project of projects) {
        await prisma.project.upsert({
          where: { 
            projectsSectionId_order: {
              projectsSectionId: projSection.id,
              order: project.order
            }
          },
          update: {},
          create: {
            ...project,
            projectsSectionId: projSection.id,
            isVisible: true
          }
        });
      }
    }

    console.log(`✅ Page created: ${page.title}`);
  }

  // Seed all modules
  console.log('📋 Running comprehensive seeding...');
  
  await seedSettings();
  console.log('✅ Settings seeded');
  
  await seedDienstleistungen();
  console.log('✅ Dienstleistungen seeded');
  
  await seedCompanyHistory();
  console.log('✅ Company History seeded');
  
  await seedFachKompetenzen();
  console.log('✅ Fachkompetenzen seeded');
  
  await seedTeamMembers();
  console.log('✅ Team Members seeded');
  
  await seedCustomers();
  console.log('✅ Customers seeded');
  
  await seedAgb();
  console.log('✅ AGB seeded');
  
  await seedDatenschutz();
  console.log('✅ Datenschutz seeded');
  
  await seedJobsAndNews();
  console.log('✅ Jobs & News seeded');
  
  await seedCategoryCards();
  console.log('✅ Category Cards seeded');
  
  await seedNewsletterData();
  console.log('✅ Newsletter system seeded');

  console.log('🎉 Complete seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 