const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedCustomers() {
  console.log('🏢 Seeding customers...');

  try {
    // Sample Customer 1: Migros Aare (Large retail chain)
    const migros = await prisma.customer.create({
      data: {
        company: 'Migros Aare AG',
        email: 'werbung@migros-aare.ch',
        phone: '+41 62 858 85 85',
        website: 'https://www.migros-aare.ch',
        street: 'Industriestrasse 20',
        city: 'Aarau',
        zipCode: '5000',
        country: 'Schweiz',
        industry: 'Einzelhandel',
        customerType: 'BUSINESS',
        leadSource: 'Empfehlung',
        segment: 'Retail',
        revenuePotential: 150000.00,
        actualRevenue: 85000.00,
        priority: 'HIGH',
        status: 'ACTIVE',
        notes: 'Wichtiger Großkunde mit mehreren Filialen. Regelmäßige Projekte für Leuchtschriften und Digital Signage.',
        tags: JSON.stringify(['Großkunde', 'Retail', 'Leuchtschriften', 'Digital Signage']),
        acquisitionDate: new Date('2020-03-15'),
        lastContact: new Date('2025-07-20'),
        nextFollowUp: new Date('2025-08-15'),
        totalProjects: 12,
        contacts: {
          create: [
            {
              firstName: 'Sandra',
              lastName: 'Weber',
              title: 'Marketing Leiterin',
              department: 'Marketing',
              email: 'sandra.weber@migros-aare.ch',
              phone: '+41 62 858 85 90',
              mobile: '+41 79 123 45 67',
              position: 'Leitung Marketing & Kommunikation',
              isPrimary: true,
              language: 'de',
              notes: 'Sehr kompetente Ansprechpartnerin, entscheidet über Werbeprojekte'
            },
            {
              firstName: 'Thomas',
              lastName: 'Müller',
              title: 'Facility Manager',
              department: 'Facility Management',
              email: 'thomas.mueller@migros-aare.ch',
              phone: '+41 62 858 85 95',
              mobile: '+41 79 987 65 43',
              isPrimary: false,
              language: 'de',
              notes: 'Zuständig für Installationen und technische Umsetzung'
            }
          ]
        },
        activities: {
          create: [
            {
              type: 'MEETING',
              subject: 'Projektbesprechung neue Filiale Aarau Bahnhof',
              description: 'Besichtigung der neuen Filiale und Planung der kompletten Beschilderung',
              status: 'COMPLETED',
              activityDate: new Date('2025-07-20'),
              duration: 120,
              location: 'Migros Aarau Bahnhof',
              contactId: null,
              createdBy: 'Administrator'
            },
            {
              type: 'QUOTE',
              subject: 'Angebot für LED-Leuchtschriften',
              description: 'Detailliertes Angebot für 8 LED-Leuchtschriften für neue Filiale',
              status: 'COMPLETED',
              activityDate: new Date('2025-07-18'),
              contactId: null,
              createdBy: 'Administrator'
            }
          ]
        },
        projects: {
          create: [
            {
              title: 'Migros Aarau Bahnhof - Komplettausstattung',
              description: 'Leuchtschriften, Digital Signage und Wegweisersystem für neue Filiale',
              type: 'Lichtwerbung',
              status: 'IN_PROGRESS',
              estimatedValue: 45000.00,
              startDate: new Date('2025-08-01'),
              deadline: new Date('2025-09-15')
            },
            {
              title: 'Wartungsvertrag LED-Systeme',
              description: 'Jährlicher Wartungsvertrag für alle LED-Installationen',
              type: 'Wartung',
              status: 'COMPLETED',
              actualValue: 12000.00,
              startDate: new Date('2025-01-01'),
              endDate: new Date('2025-12-31')
            }
          ]
        }
      }
    });

    // Sample Customer 2: Restaurant Taverne (Local restaurant)
    const taverne = await prisma.customer.create({
      data: {
        company: 'Restaurant Taverne zur Post',
        firstName: 'Marco',
        lastName: 'Rossi',
        email: 'info@taverne-post.ch',
        phone: '+41 55 210 15 20',
        website: 'https://www.taverne-post.ch',
        street: 'Hauptstrasse 42',
        city: 'Rapperswil-Jona',
        zipCode: '8640',
        country: 'Schweiz',
        industry: 'Gastronomie',
        customerType: 'BUSINESS',
        leadSource: 'Webseite',
        segment: 'Gastronomie',
        revenuePotential: 25000.00,
        actualRevenue: 18500.00,
        priority: 'MEDIUM',
        status: 'ACTIVE',
        notes: 'Familienrestaurant mit Tradition. Sucht nach modernen Lösungen für Außenwerbung.',
        tags: JSON.stringify(['Gastronomie', 'Tradition', 'Leuchtschriften']),
        acquisitionDate: new Date('2024-11-10'),
        lastContact: new Date('2025-07-15'),
        nextFollowUp: new Date('2025-08-10'),
        totalProjects: 3,
        contacts: {
          create: [
            {
              firstName: 'Marco',
              lastName: 'Rossi',
              title: 'Inhaber',
              email: 'marco.rossi@taverne-post.ch',
              phone: '+41 55 210 15 20',
              mobile: '+41 79 555 12 34',
              isPrimary: true,
              language: 'de',
              notes: 'Sehr engagierter Gastronom, legt Wert auf Qualität'
            }
          ]
        },
        activities: {
          create: [
            {
              type: 'CALL',
              subject: 'Nachfrage zu Digital Menu Boards',
              description: 'Interessiert an digitalen Menütafeln für den Eingangsbereich',
              status: 'COMPLETED',
              activityDate: new Date('2025-07-15'),
              duration: 30,
              createdBy: 'Administrator'
            }
          ]
        },
        projects: {
          create: [
            {
              title: 'Neue Außen-Leuchtschrift',
              description: 'LED-Leuchtschrift mit warmweißer Beleuchtung',
              type: 'Lichtwerbung',
              status: 'COMPLETED',
              estimatedValue: 8500.00,
              actualValue: 8200.00,
              startDate: new Date('2024-12-01'),
              endDate: new Date('2024-12-20')
            }
          ]
        }
      }
    });

    // Sample Customer 3: Stadt Uznach (Government client)
    const stadtUznach = await prisma.customer.create({
      data: {
        company: 'Stadt Uznach',
        email: 'tiefbau@uznach.ch',
        phone: '+41 55 285 20 20',
        website: 'https://www.uznach.ch',
        street: 'Rathausplatz 1',
        city: 'Uznach',
        zipCode: '8730',
        country: 'Schweiz',
        industry: 'Öffentlicher Sektor',
        customerType: 'GOVERNMENT',
        leadSource: 'Ausschreibung',
        segment: 'Öffentlich',
        revenuePotential: 80000.00,
        actualRevenue: 35000.00,
        priority: 'HIGH',
        status: 'ACTIVE',
        notes: 'Öffentlicher Auftraggeber mit regelmäßigen Projekten für Stadtbeschilderung und Orientierungssysteme.',
        tags: JSON.stringify(['Öffentlich', 'Beschilderung', 'Orientierung']),
        acquisitionDate: new Date('2019-05-20'),
        lastContact: new Date('2025-07-10'),
        nextFollowUp: new Date('2025-08-05'),
        totalProjects: 8,
        contacts: {
          create: [
            {
              firstName: 'Peter',
              lastName: 'Hänggi',
              title: 'Leiter Tiefbau',
              department: 'Tiefbauamt',
              email: 'peter.haenggi@uznach.ch',
              phone: '+41 55 285 20 25',
              isPrimary: true,
              language: 'de',
              notes: 'Langjähriger Ansprechpartner, kennt alle Projekte der Stadt'
            },
            {
              firstName: 'Anna',
              lastName: 'Frei',
              title: 'Projektleiterin',
              department: 'Stadtentwicklung',
              email: 'anna.frei@uznach.ch',
              phone: '+41 55 285 20 30',
              isPrimary: false,
              language: 'de',
              notes: 'Zuständig für neue Projekte und Stadtplanung'
            }
          ]
        },
        projects: {
          create: [
            {
              title: 'Orientierungssystem Stadtzentrum',
              description: 'Modernes Leitsystem für Touristen und Besucher',
              type: 'Signaletik',
              status: 'PLANNED',
              estimatedValue: 65000.00,
              startDate: new Date('2025-09-01'),
              deadline: new Date('2025-11-30')
            }
          ]
        }
      }
    });

    // Sample Customer 4: Bäckerei Fröhlich (Small business)
    const baeckerei = await prisma.customer.create({
      data: {
        company: 'Bäckerei Fröhlich',
        firstName: 'Rita',
        lastName: 'Fröhlich',
        email: 'info@baeckerei-froehlich.ch',
        phone: '+41 55 210 88 77',
        street: 'Bahnhofstrasse 15',
        city: 'Uznach',
        zipCode: '8730',
        country: 'Schweiz',
        industry: 'Bäckerei',
        customerType: 'BUSINESS',
        leadSource: 'Kaltakquise',
        segment: 'Kleinbetrieb',
        revenuePotential: 8000.00,
        priority: 'LOW',
        status: 'PROSPECT',
        notes: 'Kleine Familienbäckerei, interessiert an kostengünstiger Lösung für Schaufensterbeschriftung.',
        tags: JSON.stringify(['Kleinbetrieb', 'Familie', 'Budget']),
        acquisitionDate: new Date('2025-07-01'),
        lastContact: new Date('2025-07-05'),
        nextFollowUp: new Date('2025-07-30'),
        totalProjects: 0,
        contacts: {
          create: [
            {
              firstName: 'Rita',
              lastName: 'Fröhlich',
              title: 'Inhaberin',
              email: 'rita@baeckerei-froehlich.ch',
              phone: '+41 55 210 88 77',
              isPrimary: true,
              language: 'de',
              notes: 'Sehr freundlich, aber preisbewusst'
            }
          ]
        },
        activities: {
          create: [
            {
              type: 'VISIT',
              subject: 'Erstbesuch und Beratung',
              description: 'Besichtigung des Ladens und Beratung zu Schaufensterbeschriftung',
              status: 'COMPLETED',
              activityDate: new Date('2025-07-05'),
              duration: 45,
              location: 'Bäckerei Fröhlich, Uznach',
              createdBy: 'Administrator'
            },
            {
              type: 'FOLLOW_UP',
              subject: 'Nachfassen Angebot',
              description: 'Telefonische Nachfrage zum übermittelten Angebot',
              status: 'PLANNED',
              activityDate: new Date('2025-07-30'),
              createdBy: 'Administrator'
            }
          ]
        }
      }
    });

    // Sample Customer 5: AutoCenter Huber (VIP Customer)
    const autoCenter = await prisma.customer.create({
      data: {
        company: 'AutoCenter Huber AG',
        email: 'marketing@autocenter-huber.ch',
        phone: '+41 55 225 30 30',
        website: 'https://www.autocenter-huber.ch',
        street: 'Industriepark 5',
        city: 'Rapperswil-Jona',
        zipCode: '8640',
        country: 'Schweiz',
        industry: 'Automobilhandel',
        customerType: 'BUSINESS',
        leadSource: 'Empfehlung',
        segment: 'Automotive',
        revenuePotential: 200000.00,
        actualRevenue: 125000.00,
        priority: 'CRITICAL',
        status: 'VIP',
        notes: 'VIP-Kunde mit langfristiger Partnerschaft. Mehrere Standorte, regelmäßige Großprojekte.',
        tags: JSON.stringify(['VIP', 'Automotive', 'Mehrstandorte', 'Digital Signage']),
        acquisitionDate: new Date('2018-02-10'),
        lastContact: new Date('2025-07-22'),
        nextFollowUp: new Date('2025-08-01'),
        totalProjects: 25,
        contacts: {
          create: [
            {
              firstName: 'Michael',
              lastName: 'Huber',
              title: 'Geschäftsführer',
              email: 'michael.huber@autocenter-huber.ch',
              phone: '+41 55 225 30 31',
              mobile: '+41 79 111 22 33',
              isPrimary: true,
              language: 'de',
              notes: 'Sehr innovativ, interessiert an neuesten Technologien'
            },
            {
              firstName: 'Claudia',
              lastName: 'Steiner',
              title: 'Marketing Managerin',
              department: 'Marketing',
              email: 'claudia.steiner@autocenter-huber.ch',
              phone: '+41 55 225 30 35',
              isPrimary: false,
              language: 'de',
              notes: 'Koordiniert alle Werbeprojekte'
            }
          ]
        },
        activities: {
          create: [
            {
              type: 'MEETING',
              subject: 'Strategiebesprechung Q4 2025',
              description: 'Planung der Werbemaßnahmen für das vierte Quartal',
              status: 'COMPLETED',
              activityDate: new Date('2025-07-22'),
              duration: 90,
              location: 'AutoCenter Huber AG',
              createdBy: 'Administrator'
            }
          ]
        },
        projects: {
          create: [
            {
              title: 'Digital Signage Expansion',
              description: 'Ausbau der digitalen Displays auf alle 4 Standorte',
              type: 'Digital Signage',
              status: 'IN_PROGRESS',
              estimatedValue: 95000.00,
              startDate: new Date('2025-07-01'),
              deadline: new Date('2025-10-31')
            }
          ]
        }
      }
    });

    console.log('✅ Customer seeding completed successfully!');
    console.log(`📊 Created customers:`);
    console.log(`   - ${migros.company} (${migros.status})`);
    console.log(`   - ${taverne.company} (${taverne.status})`);
    console.log(`   - ${stadtUznach.company} (${stadtUznach.status})`);
    console.log(`   - ${baeckerei.company} (${baeckerei.status})`);
    console.log(`   - ${autoCenter.company} (${autoCenter.status})`);

  } catch (error) {
    console.error('❌ Error seeding customers:', error);
    throw error;
  }
}

async function main() {
  try {
    await seedCustomers();
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { seedCustomers }; 