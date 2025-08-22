const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedTeamMembers() {
  console.log('🌱 Seeding Team Members...');

  // Team Members basierend auf der bestehenden kontaktpersonen.html Seite
  const teamMembers = [
    {
      firstName: 'Benno',
      lastName: 'Murer',
      email: 'benno.murer@neonmurer.ch',
      phone: '055 225 50 25',
      position: 'VR-Vorsitz, Geschäftsführung, Beratung und Verkauf',
      department: 'Geschäftsführung',
      location: 'Werk Uznach',
      profileImage: 'content/images/person1.jpg',
      biography: 'Als VR-Vorsitzender und Geschäftsführer bringt Benno Murer jahrzehntelange Erfahrung in der Werbetechnik mit und führt das Familienunternehmen in die Zukunft.',
      specialties: 'Geschäftsführung, strategische Beratung, Verkauf',
      displayOrder: 1,
      isActive: true,
      isPublic: true
    },
    {
      firstName: 'Andreas',
      lastName: 'Zybach',
      email: 'andreas.zybach@neonmurer.ch',
      phone: '055 225 50 25',
      position: 'Produktionsleiter, Beratung und Verkauf',
      department: 'Produktion',
      location: 'Werk Uznach',
      profileImage: 'content/images/person2.jpg',
      biography: 'Andreas Zybach leitet unsere Produktion und sorgt dafür, dass jedes Projekt termingerecht und in höchster Qualität umgesetzt wird.',
      specialties: 'Produktionsleitung, technische Beratung, Projektmanagement',
      displayOrder: 2,
      isActive: true,
      isPublic: true
    },
    {
      firstName: 'Roman',
      lastName: 'Janser',
      email: 'roman.janser@neonmurer.ch',
      phone: '055 225 50 18',
      position: 'Beratung und Verkauf',
      department: 'Beratung und Verkauf',
      location: 'Werk Uznach',
      profileImage: 'content/images/person3.jpg',
      biography: 'Roman Janser ist Ihr kompetenter Ansprechpartner für individuelle Beratung und maßgeschneiderte Lösungen in der Werbetechnik.',
      specialties: 'Kundenberatung, Verkauf, Projektbetreuung',
      displayOrder: 3,
      isActive: true,
      isPublic: true
    },
    {
      firstName: 'Sandy',
      lastName: 'Jucker',
      email: 'sandy.jucker@neonmurer.ch',
      phone: '055 225 50 12',
      position: 'Beratung und Verkauf',
      department: 'Beratung und Verkauf',
      location: 'Werk Uznach',
      profileImage: 'content/images/person4_new.jpg',
      biography: 'Sandy Jucker unterstützt Sie kompetent bei der Auswahl der perfekten Werbetechnik-Lösung für Ihr Unternehmen.',
      specialties: 'Kundenberatung, Verkauf, Lösungsentwicklung',
      displayOrder: 4,
      isActive: true,
      isPublic: true
    },
    {
      firstName: 'Beatrice',
      lastName: 'Murer',
      email: 'bea.murer@neonmurer.ch',
      phone: '055 212 63 67',
      position: 'Geschäftsführung, technische Leitung und Produktionsleitung Schriftenmalerei',
      department: 'Geschäftsführung',
      location: 'Werk Jona',
      profileImage: 'content/images/person5.jpg',
      biography: 'Beatrice Murer führt die technische Leitung und spezialisiert sich auf traditionelle Schriftenmalerei mit modernen Techniken.',
      specialties: 'Geschäftsführung, Schriftenmalerei, technische Leitung',
      displayOrder: 5,
      isActive: true,
      isPublic: true
    },
    {
      firstName: 'Jan',
      lastName: 'Vetter',
      email: 'jan.vetter@neonmurer.ch',
      phone: '055 225 50 27',
      position: 'Graphik, Werbung, technische Beratung und Produktentwicklung',
      department: 'Design und Entwicklung',
      location: 'Werk Uznach',
      profileImage: 'content/images/person6.jpg',
      biography: 'Jan Vetter ist unser Kreativkopf für Grafik und Design sowie Spezialist für innovative Produktentwicklung.',
      specialties: 'Grafik-Design, Produktentwicklung, technische Beratung',
      displayOrder: 6,
      isActive: true,
      isPublic: true
    }
  ];

  try {
    // Clear existing team members
    await prisma.teamMember.deleteMany();
    console.log('🗑️ Cleared existing team members');

    // Insert team members
    for (const member of teamMembers) {
      await prisma.teamMember.create({
        data: member
      });
    }
    console.log(`✅ Created ${teamMembers.length} team members`);

    console.log('🎉 Team Members seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding team members:', error);
    throw error;
  }
}

if (require.main === module) {
  seedTeamMembers()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { seedTeamMembers }; 