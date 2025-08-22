const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedDienstleistungen() {
  console.log('🛠️ Seeding Dienstleistungen...');

  try {
    // Create page
    const page = await prisma.dienstleistungPage.upsert({
      where: { id: 'dienstleistungen-main' },
      update: {},
      create: {
        id: 'dienstleistungen-main',
        title: 'Dienstleistungen',
        subtitle: 'Umfassende Lösungen rund um Ihre Leuchtreklame',
        description: 'Wir bieten Ihnen umfassende Lösungen rund um Ihre Leuchtreklame – von der Planung und Bewilligung über die Montage bis hin zu Wartung, Reparatur und Reinigung. Mit unserem erfahrenen Team und modernster Technik sorgen wir dafür, dass Ihre Werbeanlagen stets perfekt in Szene gesetzt und funktional bleiben. Verlassen Sie sich auf Qualität, Professionalität und einen Service, der individuell auf Ihre Bedürfnisse abgestimmt ist.',
        isActive: true
      }
    });

    // Create services
    const services = [
      {
        title: 'Persönliche Beratung',
        subtitle: 'Vor-Ort-Termine schweizweit',
        description: 'Schweizweite Vor-Ort-Beratung mit professioneller Analyse, Vermessung und realistischen Fotomontagen. Unser Expertenteam entwickelt die perfekte Lösung für Ihre Leuchtreklame.',
        iconClass: 'fas fa-handshake',
        iconColor: '#ffd401',
        backgroundImage: 'content/images/leistungen-1.jpg',
        features: ['🎯 Vor-Ort-Termin', '📸 Fotomontage', '📐 Vermessung'],
        ctaText: 'Beratung anfragen',
        order: 0
      },
      {
        title: 'Bewilligungseingaben',
        subtitle: 'Komplette Abwicklung',
        description: 'Komplette Abwicklung aller Bewilligungsverfahren. Von Reklamegesuch bis Katasterplan - wir übernehmen den gesamten Papierkram für Sie.',
        iconClass: 'fas fa-file-contract',
        iconColor: '#112357',
        backgroundImage: 'content/images/leistungen-2.jpg',
        features: ['⏱️ 4-8 Wochen', '📋 Vollservice', '🏛️ Gemeinde'],
        ctaText: 'Bewilligung beantragen',
        order: 1
      },
      {
        title: 'Montageservice',
        subtitle: 'Professionelle Installation',
        description: 'Professionelle Montage mit Spezialfahrzeugen und Hebebühnen bis 22m Höhe. ESTI-konforme Installation für höchste Sicherheit und Qualität.',
        iconClass: 'fas fa-tools',
        iconColor: '#ffd401',
        backgroundImage: 'content/images/leistungen-3.jpg',
        features: ['🏗️ Hebebühne 22m', '⚡ ESTI-konform', '👷 Professionell'],
        ctaText: 'Montage buchen',
        order: 2
      },
      {
        title: 'Reparaturservice',
        subtitle: 'Schnell und zuverlässig',
        description: 'Schnelle Reparaturen meist innerhalb einer Woche. Mit eigener Glasbläserei, Schriftenmalerei und Plexi-Atelier für perfekte Ergebnisse.',
        iconClass: 'fas fa-wrench',
        iconColor: '#28a745',
        backgroundImage: 'content/images/leistungen-4.jpg',
        features: ['⚡ 1 Woche', '🔬 Glasbläserei', '🏗️ Alle Höhen'],
        ctaText: 'Reparatur anfragen',
        order: 3
      },
      {
        title: 'Reinigungsservice',
        subtitle: 'Wartung und Pflege',
        description: 'Jährliche Reinigung und Kontrolle mit Service- oder Vollservice-Vertrag. Immer gepflegte Leuchtreklame für den besten Eindruck.',
        iconClass: 'fas fa-spray-can',
        iconColor: '#17a2b8',
        backgroundImage: 'content/images/leistungen-5.jpg',
        features: ['📅 Jährlich', '🛡️ Vollservice', '📋 Vertrag'],
        ctaText: 'Service buchen',
        order: 4
      },
      {
        title: 'Weihnachtsbeleuchtung',
        subtitle: 'Festliche Highlights',
        description: 'Festliche Weihnachtsbeleuchtung mit Quick-Fix-System und IP44-Standard. Kompletter Montage- und Demontage-Service inklusive.',
        iconClass: 'fas fa-star',
        iconColor: '#dc3545',
        backgroundImage: 'content/images/leistungen-6.jpg',
        features: ['⚡ Quick-Fix', '🌧️ IP44', '🎁 Saisonal'],
        ctaText: 'Beleuchtung planen',
        order: 5
      }
    ];

    for (const serviceData of services) {
      await prisma.dienstleistungService.upsert({
        where: { 
          pageId_order: {
            pageId: page.id,
            order: serviceData.order
          }
        },
        update: serviceData,
        create: {
          ...serviceData,
          pageId: page.id
        }
      });
    }

    console.log('✅ Dienstleistungen successfully seeded');
    console.log(`   📄 Created/updated page: ${page.title}`);
    console.log(`   🔧 Created/updated ${services.length} services`);

  } catch (error) {
    console.error('❌ Error seeding Dienstleistungen:', error);
    throw error;
  }
}

module.exports = { seedDienstleistungen };

// Run if called directly
if (require.main === module) {
  seedDienstleistungen()
    .then(() => {
      console.log('🎉 Dienstleistungen seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Dienstleistungen seeding failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}