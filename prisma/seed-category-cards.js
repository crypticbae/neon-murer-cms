const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedCategoryCards() {
  console.log('🌱 Seeding Category Cards...');

  // Beschriftungen Category Cards
  const beschriftungenCards = [
    {
      title: 'Fahrzeugbeschriftung',
      linkUrl: 'beschriftungen/fahrzeugbeschriftung.html',
      ctaText: 'Mehr erfahren',
      backgroundImage: 'content/images/fahrzeugbeschriftung-1.jpg',
      pageSlug: 'beschriftungen',
      category: 'beschriftungen',
      order: 1,
      isActive: true
    },
    {
      title: 'Fensterbeschriftung',
      linkUrl: 'beschriftungen/fensterbeschriftung.html',
      ctaText: 'Mehr erfahren',
      backgroundImage: 'content/images/fensterbeschriftung-1.jpg',
      pageSlug: 'beschriftungen',
      category: 'beschriftungen',
      order: 2,
      isActive: true
    },
    {
      title: 'Tafelbeschriftung',
      linkUrl: 'beschriftungen/tafelbeschriftung.html',
      ctaText: 'Mehr erfahren',
      backgroundImage: 'content/images/tafelbeschriftung-1.jpg',
      pageSlug: 'beschriftungen',
      category: 'beschriftungen',
      order: 3,
      isActive: true
    },
    {
      title: 'Signaletik',
      linkUrl: 'beschriftungen/signaletik.html',
      ctaText: 'Mehr erfahren',
      backgroundImage: 'content/images/signaletik-1.jpg',
      pageSlug: 'beschriftungen',
      category: 'beschriftungen',
      order: 4,
      isActive: true
    },
    {
      title: 'Grossformatdruck',
      linkUrl: 'beschriftungen/grossformatdruck.html',
      ctaText: 'Mehr erfahren',
      backgroundImage: 'content/images/grossformatdruck-1.jpg',
      pageSlug: 'beschriftungen',
      category: 'beschriftungen',
      order: 5,
      isActive: true
    },
    {
      title: 'Blachen und Fahnen',
      linkUrl: 'beschriftungen/blachen-fahnen.html',
      ctaText: 'Mehr erfahren',
      backgroundImage: 'content/images/blachen-fahnen-1.jpg',
      pageSlug: 'beschriftungen',
      category: 'beschriftungen',
      order: 6,
      isActive: true
    }
  ];

  // Lichtwerbung Category Cards
  const lichtwerbungCards = [
    {
      title: 'Leuchtschriften',
      linkUrl: 'lichtwerbung/leuchtschriften.html',
      ctaText: 'Mehr erfahren',
      backgroundImage: 'content/images/546aa65af854dcf4936912fbbde4dfd2.jpg',
      pageSlug: 'lichtwerbung',
      category: 'lichtwerbung',
      order: 1,
      isActive: true
    },
    {
      title: 'Leuchttransparente',
      linkUrl: 'lichtwerbung/leuchttransparente.html',
      ctaText: 'Mehr erfahren',
      backgroundImage: 'content/images/8be3073f251df0431fd23062e5b8ccc5.jpg',
      pageSlug: 'lichtwerbung',
      category: 'lichtwerbung',
      order: 2,
      isActive: true
    },
    {
      title: 'Halbrelief-/Plattenschriften',
      linkUrl: 'lichtwerbung/halbrelief-plattenschriften.html',
      ctaText: 'Mehr erfahren',
      backgroundImage: 'content/images/cbbedb5f094d40d5fcbb568be5ac1d5e.jpg',
      pageSlug: 'lichtwerbung',
      category: 'lichtwerbung',
      order: 3,
      isActive: true
    },
    {
      title: 'Neon / LED-Technik',
      linkUrl: 'lichtwerbung/neon-led-technik.html',
      ctaText: 'Mehr erfahren',
      backgroundImage: 'content/images/a16b3822a2a16cdbbe78ab7213a2a198.jpg',
      pageSlug: 'lichtwerbung',
      category: 'lichtwerbung',
      order: 4,
      isActive: true
    },
    {
      title: 'Pylonen',
      linkUrl: 'lichtwerbung/pylonen.html',
      ctaText: 'Mehr erfahren',
      backgroundImage: 'content/images/f4c31de2a867772abdb61cf539a7eaed.jpg',
      pageSlug: 'lichtwerbung',
      category: 'lichtwerbung',
      order: 5,
      isActive: true
    },
    {
      title: 'Persönliche Beratung',
      linkUrl: 'tel:+41552255025',
      ctaText: 'Jetzt anrufen',
      backgroundColor: 'linear-gradient(135deg, #112357 0%, #1a3066 100%)',
      icon: 'fa-solid fa-phone',
      pageSlug: 'lichtwerbung',
      category: 'lichtwerbung',
      order: 6,
      isActive: true
    }
  ];

  try {
    // Clear existing category cards
    await prisma.categoryCard.deleteMany();
    console.log('🗑️ Cleared existing category cards');

    // Insert Beschriftungen cards
    for (const card of beschriftungenCards) {
      await prisma.categoryCard.create({
        data: card
      });
    }
    console.log(`✅ Created ${beschriftungenCards.length} Beschriftungen cards`);

    // Insert Lichtwerbung cards
    for (const card of lichtwerbungCards) {
      await prisma.categoryCard.create({
        data: card
      });
    }
    console.log(`✅ Created ${lichtwerbungCards.length} Lichtwerbung cards`);

    console.log('🎉 Category Cards seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding category cards:', error);
    throw error;
  }
}

if (require.main === module) {
  seedCategoryCards()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { seedCategoryCards }; 