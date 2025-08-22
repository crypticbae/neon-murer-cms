const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedCompanyHistory() {
  console.log('🏢 Seeding Company History...');

  try {
    // Create company history
    const companyHistory = await prisma.companyHistory.upsert({
      where: { id: 'default' },
      update: {},
      create: {
        id: 'default',
        title: 'Unsere Geschichte',
        subtitle: '75 Jahre Leidenschaft für Lichtwerbung',
        heroBackgroundImage: null,
        finaleTitle: 'Heute und in die Zukunft',
        finaleText: 'Die langjährige Erfahrung und eine gut ausgebaute Infrastruktur ermöglichen es uns, Ihre Ideen effizient und qualitativ hochstehend zu realisieren. Das möchten wir Ihnen gerne beweisen.'
      }
    });

    console.log('✅ Company History created');

    // Delete existing chapters to avoid duplicates
    await prisma.companyHistoryChapter.deleteMany({
      where: { companyHistoryId: companyHistory.id }
    });

    // Create chapters based on existing HTML content
    const chapters = [
      {
        year: '75+ Jahre',
        title: 'Eine Tradition beginnt',
        text: 'Seit über 75 Jahren bekannt für Lichtwerbung. Ob bei Leuchtreklamen, Beschriftungen oder Orientierungs-Systemen: Wenn es um Werbung geht, ist Neon Murer wegweisend. Nicht nur in der Region, sondern auch über die Schweizer Grenzen hinaus.',
        backgroundImage: '../content/images/mitarbeiter.jpg',
        foregroundImage: '../content/images/leistungen-1.jpg',
        imageAlt: 'Tradition in der Lichtwerbung',
        order: 0,
        layoutDirection: 'LEFT'
      },
      {
        year: '1948',
        title: 'Die Vision von Josef Murer',
        text: '«Unsere Aufgaben sind so vielseitig wie die Wünsche unserer Kunden – einseitig und konsequent ist jedoch immer unser Anspruch an eine hochwertige Verarbeitung.» Getreu diesem Motto gründete Josef Murer seine Firma vor mehr als 75 Jahren.',
        backgroundImage: '../content/images/leistungen-2.jpg',
        foregroundImage: '../content/images/leistungen-3.jpg',
        imageAlt: 'Josef Murer Gründung',
        order: 1,
        layoutDirection: 'RIGHT'
      },
      {
        year: '1985',
        title: 'Neue Generation, bewährte Werte',
        text: 'Seit 1985 leitet sein Sohn Benno die Geschicke des Unternehmens weiterhin nach diesem Grundsatz. Ihm zur Seite steht ein Team von gut ausgebildeten Fachkräften in den Bereichen Neonfertigung, Metall-, Kunststoff- und Folien-Verarbeitung sowie Datenbearbeitung, Service, Beratung und Verkauf.',
        backgroundImage: '../content/images/leistungen-4.jpg',
        foregroundImage: '../content/images/leistungen-5.jpg',
        imageAlt: 'Benno Murer Übernahme',
        order: 2,
        layoutDirection: 'LEFT'
      },
      {
        year: '1990er',
        title: 'Wachstum braucht Raum',
        text: 'Das stete Wachstum unseres Unternehmens führte zu mehreren Domizilwechseln, bis wir unseren heutigen Hauptsitz an der Tägernaustrasse 21 in Rapperswil-Jona bezogen haben. Die moderne Infrastruktur und die zentrale Lage ermöglichen es uns, unsere Kunden optimal zu betreuen.',
        backgroundImage: '../content/images/leistungen-6.jpg',
        foregroundImage: '../content/images/person1.jpg',
        imageAlt: 'Expansion und Wachstum',
        order: 3,
        layoutDirection: 'RIGHT'
      },
      {
        year: '2006',
        title: 'Neon Murer AG',
        text: 'Auch unsere Gesellschaftsform wurde per 1. Januar 2006 durch die Wandlung der Einzelfirma in die Neon Murer AG an die heutige Firmengrösse angepasst.',
        backgroundImage: '../content/images/person2.jpg',
        foregroundImage: '../content/images/person3.jpg',
        imageAlt: 'Neon Murer AG',
        order: 4,
        layoutDirection: 'LEFT'
      },
      {
        year: '2018',
        title: 'Expansion nach Uznach',
        text: 'Um der stetig wachsenden Nachfrage gerecht zu werden, nahmen wir 2018 unser modernes Produktionswerk in Uznach in Betrieb. Diese strategische Erweiterung bietet uns viel Flexibilität und Raum zur Deckung unseres stetig steigenden Platzbedarfs und ermöglicht es uns, noch effizienter zu produzieren.',
        backgroundImage: '../content/images/uznach1.jpg',
        foregroundImage: '../content/images/uznach2.jpg.jpg',
        imageAlt: 'Produktionswerk Uznach',
        order: 5,
        layoutDirection: 'RIGHT'
      }
    ];

    // Create chapters
    for (const chapterData of chapters) {
      await prisma.companyHistoryChapter.create({
        data: {
          ...chapterData,
          companyHistoryId: companyHistory.id
        }
      });
    }

    console.log(`✅ Created ${chapters.length} company history chapters`);
    console.log('🎉 Company History seeding completed!');

  } catch (error) {
    console.error('❌ Error seeding company history:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedCompanyHistory()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { seedCompanyHistory };