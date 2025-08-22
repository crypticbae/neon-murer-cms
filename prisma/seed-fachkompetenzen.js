// ========== SEED FACHKOMPETENZEN DATA ==========

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedFachKompetenzen() {
    console.log('🎯 Seeding Fachkompetenzen data...');
    
    try {
        // Create or update main Fachkompetenzen entry
        let fachKompetenzen = await prisma.fachKompetenzen.findFirst();
        
        if (!fachKompetenzen) {
            fachKompetenzen = await prisma.fachKompetenzen.create({
                data: {
                    heroTitle: 'Unsere Fachkompetenzen',
                    heroSubtitle: '75 Jahre Erfahrung und Expertise in der Werbetechnik',
                    heroDescription: 'Von traditioneller Handwerkskunst bis hin zu modernster Technologie – unsere vielfältigen Fachkompetenzen ermöglichen es uns, massgeschneiderte Lösungen für jeden Anspruch zu realisieren. Entdecken Sie die Bereiche, in denen wir Ihr zuverlässiger Partner sind.',
                    sectionTitle: 'Unsere Kernkompetenzen',
                    sectionSubtitle: 'Modernste Technik trifft auf bewährte Handwerkskunst – so entstehen Werbelösungen auf höchstem Niveau'
                }
            });
            console.log('✅ Created main Fachkompetenzen entry');
        }

        // Sample Fachkompetenz Cards
        const sampleCards = [
            {
                title: 'Metallbauarbeiten',
                description: 'Präzise Metallbearbeitung für stabile und langlebige Konstruktionen von einfachen Halterungen bis zu komplexen Werbeträgern.',
                backgroundImage: '../content/images/fachkompetenzen-1.webp',
                iconClass: 'fa-solid fa-hammer',
                features: ['Schweissen', 'Konstruktion', 'Oberflächenbehandlung', 'Korrosionsschutz'],
                order: 0
            },
            {
                title: 'Blechbearbeitung',
                description: 'Professionelle Bearbeitung verschiedener Blecharten für massgeschneiderte Werbelösungen und technische Anwendungen.',
                backgroundImage: '../content/images/fachkompetenzen-2.webp',
                iconClass: 'fa-solid fa-industry',
                features: ['Schneiden & Stanzen', 'Biegen & Formen', 'Kantbearbeitung', 'Oberflächenveredelung'],
                order: 1
            },
            {
                title: 'CNC-Frästechnik',
                description: 'Hochpräzise computergesteuerte Bearbeitung für komplexe Formen und filigrane Details mit höchster Genauigkeit.',
                backgroundImage: '../content/images/fachkompetenzen-3.webp',
                iconClass: 'fa-solid fa-cog',
                features: ['3D-Bearbeitung', 'Prototyping', 'Serienfertigung', 'Verschiedene Materialien'],
                order: 2
            },
            {
                title: 'Laser-Schneidtechnik',
                description: 'Modernste Lasertechnologie für präzise Schnitte und filigrane Konturen in verschiedenen Materialien.',
                backgroundImage: '../content/images/fachkompetenzen-4.webp',
                iconClass: 'fa-solid fa-bolt',
                features: ['Präzisionsschnitte', 'Gravuren & Markierungen', 'Verschiedene Materialstärken'],
                order: 3
            },
            {
                title: 'Acrylglas-Atelier',
                description: 'Spezialisierte Bearbeitung von Acrylglas für hochwertige, transparente und lichtdurchlässige Werbeelemente.',
                backgroundImage: '../content/images/fachkompetenzen-5.webp',
                iconClass: 'fa-solid fa-gem',
                features: ['Präzisionszuschnitt', 'Kanten polieren', 'Biegeverfahren', 'UV-beständige Materialien'],
                order: 4
            },
            {
                title: 'Lackiererei',
                description: 'Professionelle Oberflächenbeschichtung für optimalen Schutz und perfekte Optik in jeder gewünschten Farbe.',
                backgroundImage: '../content/images/fachkompetenzen-6.webp',
                iconClass: 'fa-solid fa-spray-can',
                features: ['RAL-Farbpalette', 'Witterungsschutz', 'Pulverbeschichtung', 'Spezialverfahren'],
                order: 5
            },
            {
                title: 'LED-Beleuchtungsplanung',
                description: 'Moderne LED-Technologie für energieeffiziente und langlebige Beleuchtungslösungen mit optimaler Lichtverteilung.',
                backgroundImage: '../content/images/fachkompetenzen-7.webp',
                iconClass: 'fa-solid fa-lightbulb',
                features: ['Energieeffiziente Lösungen', 'Farbtemperatur-Anpassung', 'Dimming-Funktionen'],
                order: 6
            },
            {
                title: 'Digitale Druckverfahren',
                description: 'Hochauflösende Drucktechnologien für brillante Farben und gestochen scharfe Details auf verschiedenen Materialien.',
                backgroundImage: '../content/images/fachkompetenzen-8.webp',
                iconClass: 'fa-solid fa-print',
                features: ['UV-beständige Tinten', 'Grossformatdruck', 'Verschiedene Substrate'],
                order: 7
            },
            {
                title: 'Schriftenmalerei',
                description: 'Professionelle Beschriftungslösungen durch digitales Plotten und moderne Verarbeitungstechniken für präzise Ergebnisse.',
                backgroundImage: '../content/images/fachkompetenzen-9.webp',
                iconClass: 'fa-solid fa-pen-nib',
                features: ['Digitales Plotten', 'Klebefolien-Verarbeitung', 'Konturenschnitt', 'Präzise Montage'],
                order: 8
            }
        ];

        // Create cards
        for (const cardData of sampleCards) {
            const existingCard = await prisma.fachKompetenzCard.findFirst({
                where: {
                    fachKompetenzenId: fachKompetenzen.id,
                    title: cardData.title
                }
            });

            if (!existingCard) {
                await prisma.fachKompetenzCard.create({
                    data: {
                        ...cardData,
                        fachKompetenzenId: fachKompetenzen.id
                    }
                });
                console.log(`✅ Created card: ${cardData.title}`);
            } else {
                console.log(`⚠️ Card already exists: ${cardData.title}`);
            }
        }

        console.log('🎯 Fachkompetenzen seeding completed!');

    } catch (error) {
        console.error('❌ Error seeding fachkompetenzen:', error);
        throw error;
    }
}

// Run seeding if this script is executed directly
if (require.main === module) {
    seedFachKompetenzen()
        .then(() => {
            console.log('✅ Fachkompetenzen seed completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Fachkompetenzen seed failed:', error);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}

module.exports = { seedFachKompetenzen };