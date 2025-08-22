const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedNewsletterData() {
    console.log('🌱 Seeding Newsletter data...');

    // Sample newsletter template
    const sampleTemplate = {
        name: 'Beispiel Newsletter - Projekt Showcase',
        content: JSON.stringify([
            {
                type: 'header',
                content: {
                    logo: 'https://via.placeholder.com/200x60/112357/ffd401?text=NEON+MURER',
                    tagline: '75 Jahre Lichtwerbung-Expertise'
                }
            },
            {
                type: 'hero',
                content: {
                    title: 'Neue Leuchtschriften-Projekte',
                    subtitle: 'Entdecken Sie unsere neuesten Realisierungen und lassen Sie sich inspirieren',
                    image: 'https://via.placeholder.com/560x300/112357/ffd401?text=Hero+Project+Image',
                    imageAlt: 'Leuchtschriften Projekt'
                }
            },
            {
                type: 'project',
                content: {
                    title: 'Restaurant Signage',
                    description: 'Moderne LED-Leuchtschrift mit warmweißem Licht für gemütliche Atmosphäre. Energieeffizient und wetterfest.',
                    image: 'https://via.placeholder.com/560x200/1a2f63/ffd401?text=Projekt+1',
                    imageAlt: 'Restaurant Leuchtschrift'
                }
            },
            {
                type: 'cta',
                content: {
                    title: 'Haben Sie ein Lichtwerbung-Projekt?',
                    text: 'Lassen Sie uns gemeinsam Ihre Vision zum Leuchten bringen. Kostenlose Beratung und unverbindliche Offerte.',
                    buttonText: 'Jetzt Beratung anfragen',
                    buttonUrl: 'https://www.neonmurer.ch/kontakt'
                }
            },
            {
                type: 'footer',
                content: {
                    logo: 'https://via.placeholder.com/150x45/ffffff/ffd401?text=NEON+MURER',
                    companyText: 'Seit 1949 Ihr vertrauensvoller Partner für Lichtwerbung',
                    contact: {
                        address: 'Tägernaustrasse 21, 8640 Rapperswil-Jona',
                        phone: '+41 55 225 50 25',
                        email: 'neon@neonmurer.ch',
                        website: 'www.neonmurer.ch'
                    }
                }
            }
        ]),
        htmlContent: '', // Will be generated
        isActive: true
    };

    // Generate HTML for the sample template
    sampleTemplate.htmlContent = generateSampleHTML();

    try {
        // Create sample newsletter template
        const template = await prisma.newsletterTemplate.create({
            data: sampleTemplate
        });

        console.log('✅ Newsletter template created:', template.name);

        // Create some sample subscribers
        const sampleSubscribers = [
            {
                email: 'kunde@beispiel.ch',
                firstName: 'Max',
                lastName: 'Mustermann',
                isActive: true,
                isConfirmed: true,
                segments: ['kunden', 'newsletter'],
                confirmedAt: new Date()
            },
            {
                email: 'interessent@firma.ch',
                firstName: 'Anna',
                lastName: 'Beispiel',
                isActive: true,
                isConfirmed: false,
                segments: ['interessenten'],
                confirmToken: 'sample_token_123'
            }
        ];

        for (const subscriber of sampleSubscribers) {
            await prisma.newsletterSubscriber.create({
                data: subscriber
            });
        }

        console.log('✅ Newsletter subscribers created');

        console.log('🎉 Newsletter data seeding completed!');

    } catch (error) {
        console.error('❌ Error seeding newsletter data:', error);
        throw error;
    }
}

function generateSampleHTML() {
    return `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Neon Murer Newsletter</title>
    <style>
        /* Newsletter Styles */
        body, table, td, p, a, li { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        .nm-header { background: linear-gradient(135deg, #112357 0%, #1a2f63 100%); padding: 30px 20px; text-align: center; }
        .nm-hero { background: #f8f9fa; padding: 40px 20px; text-align: center; }
        .nm-content { padding: 30px 20px; }
        .nm-cta { background: linear-gradient(135deg, #112357 0%, #1a2f63 100%); padding: 40px 20px; text-align: center; margin: 30px 0; border-radius: 12px; }
        .nm-footer { background: #112357; padding: 30px 20px; text-align: center; }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff;">
    <table border="0" cellpadding="0" cellspacing="0" height="100%" width="100%">
        <tr>
            <td align="center" valign="top">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                    <tr>
                        <td class="nm-header">
                            <img src="https://via.placeholder.com/200x60/112357/ffd401?text=NEON+MURER" alt="Neon Murer AG" style="max-width: 200px; height: auto;">
                            <p style="color: #ffd401; font-size: 14px; margin: 10px 0 0 0; font-weight: 600;">75 Jahre Lichtwerbung-Expertise</p>
                        </td>
                    </tr>
                    <tr>
                        <td class="nm-hero">
                            <h1 style="color: #112357; font-size: 28px; font-weight: 900; margin: 0 0 15px 0; line-height: 1.2;">Neue Leuchtschriften-Projekte</h1>
                            <p style="color: #666666; font-size: 16px; margin: 0 0 25px 0; line-height: 1.4;">Entdecken Sie unsere neuesten Realisierungen und lassen Sie sich inspirieren</p>
                            <img src="https://via.placeholder.com/560x300/112357/ffd401?text=Hero+Project+Image" alt="Leuchtschriften Projekt" style="max-width: 100%; height: auto; border-radius: 12px;">
                        </td>
                    </tr>
                    <tr>
                        <td class="nm-content">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #ffffff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); margin: 0 0 20px 0; overflow: hidden;">
                                <tr>
                                    <td>
                                        <img src="https://via.placeholder.com/560x200/1a2f63/ffd401?text=Projekt+1" alt="Restaurant Leuchtschrift" style="width: 100%; height: auto; display: block;">
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 20px;">
                                        <h3 style="color: #112357; font-size: 18px; font-weight: 700; margin: 0 0 10px 0;">Restaurant Signage</h3>
                                        <p style="color: #666666; font-size: 14px; line-height: 1.5; margin: 0;">Moderne LED-Leuchtschrift mit warmweißem Licht für gemütliche Atmosphäre. Energieeffizient und wetterfest.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td class="nm-cta">
                            <h2 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0 0 15px 0;">Haben Sie ein Lichtwerbung-Projekt?</h2>
                            <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; margin: 0 0 25px 0; line-height: 1.4;">Lassen Sie uns gemeinsam Ihre Vision zum Leuchten bringen. Kostenlose Beratung und unverbindliche Offerte.</p>
                            <a href="https://www.neonmurer.ch/kontakt" style="background: linear-gradient(45deg, #ffd401, #ffed4e); color: #112357; text-decoration: none; padding: 15px 30px; border-radius: 25px; font-size: 16px; font-weight: 700; display: inline-block;">Jetzt Beratung anfragen</a>
                        </td>
                    </tr>
                    <tr>
                        <td class="nm-footer">
                            <img src="https://via.placeholder.com/150x45/ffffff/ffd401?text=NEON+MURER" alt="Neon Murer AG" style="max-width: 150px; height: auto; margin: 0 0 20px 0;">
                            <p style="color: rgba(255, 255, 255, 0.8); font-size: 14px; line-height: 1.5; margin: 0 0 20px 0;">Seit 1949 Ihr vertrauensvoller Partner für Lichtwerbung</p>
                            <div style="color: rgba(255, 255, 255, 0.9); font-size: 14px; margin: 0 0 20px 0;">
                                <strong>Neon Murer AG</strong><br>
                                Tägernaustrasse 21, 8640 Rapperswil-Jona<br>
                                Tel: <a href="tel:+41552255025" style="color: #ffd401; text-decoration: none;">+41 55 225 50 25</a><br>
                                E-Mail: <a href="mailto:neon@neonmurer.ch" style="color: #ffd401; text-decoration: none;">neon@neonmurer.ch</a><br>
                                Web: <a href="https://www.neonmurer.ch" style="color: #ffd401; text-decoration: none;">www.neonmurer.ch</a>
                            </div>
                            <p style="color: rgba(255, 255, 255, 0.6); font-size: 12px; margin: 20px 0 0 0;">
                                <a href="{$unsubscribe_link}" style="color: #ffd401; text-decoration: underline;">Newsletter abmelden</a> | 
                                <a href="https://www.neonmurer.ch/datenschutz.html" style="color: #ffd401; text-decoration: underline;">Datenschutz</a> | 
                                <a href="https://www.neonmurer.ch/impressum.html" style="color: #ffd401; text-decoration: underline;">Impressum</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}

// Run seeding if called directly
if (require.main === module) {
    seedNewsletterData()
        .catch((e) => {
            console.error(e);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}

module.exports = seedNewsletterData;