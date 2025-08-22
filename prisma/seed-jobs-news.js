const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedJobsAndNews() {
  console.log('🌱 Seeding Jobs and News...');

  try {
    // Sample Jobs
    const job1 = await prisma.job.create({
      data: {
        title: 'Polymechaniker/in EFZ',
        position: 'Polymechaniker/in EFZ',
        department: 'produktion',
        jobType: 'vollzeit',
        location: 'neuhaus',
        excerpt: 'Wir suchen eine engagierte Fachkraft für die Produktion von hochwertigen Werbeträgern und Lichtwerbeanlagen.',
        content: `<h3>Ihre Aufgaben</h3>
<p>Als Polymechaniker/in EFZ bei Neon Murer übernehmen Sie vielseitige Aufgaben in der Produktion:</p>
<ul>
<li>Herstellung und Bearbeitung von Metallteilen für Lichtwerbeanlagen</li>
<li>Montage und Installation von Werbetafeln und -systemen</li>
<li>Qualitätskontrolle und Wartung von Produktionsanlagen</li>
<li>Unterstützung bei der Entwicklung neuer Produkte</li>
</ul>

<h3>Wir bieten</h3>
<ul>
<li>Einen sicheren Arbeitsplatz in einem traditionsreichen Familienunternehmen</li>
<li>Moderne Arbeitsplätze und zeitgemäße Infrastruktur</li>
<li>Weiterbildungsmöglichkeiten und Karrierechancen</li>
<li>Flexible Arbeitszeiten und familienfreundliche Arbeitskultur</li>
</ul>`,
        status: 'PUBLISHED',
        isActive: true,
        showOnWebsite: true,
        validUntil: new Date('2024-06-30'),
        metaTitle: 'Polymechaniker/in EFZ - Neon Murer',
        metaDescription: 'Werden Sie Teil unseres Teams als Polymechaniker/in EFZ. Vielseitige Aufgaben in der Werbetechnik erwarten Sie.',
        keywords: 'Polymechaniker, EFZ, Werbetechnik, Vollzeit, Neuhaus',
        requirements: {
          create: [
            { text: 'Abgeschlossene Ausbildung als Polymechaniker/in EFZ', order: 0 },
            { text: 'Berufserfahrung in der Metallbearbeitung von Vorteil', order: 1 },
            { text: 'Teamfähigkeit und Zuverlässigkeit', order: 2 },
            { text: 'Deutschkenntnisse in Wort und Schrift', order: 3 },
            { text: 'Führerausweis Kategorie B von Vorteil', order: 4 }
          ]
        }
      }
    });

    const job2 = await prisma.job.create({
      data: {
        title: 'Grafiker/in 80-100%',
        position: 'Grafiker/in',
        department: 'grafik',
        jobType: 'vollzeit',
        location: 'uznach',
        excerpt: 'Kreative Gestaltung von Werbemitteln und visueller Kommunikation für unsere Kundenprojekte.',
        content: `<h3>Ihre Aufgaben</h3>
<p>Als Grafiker/in gestalten Sie die visuelle Identität unserer Kunden:</p>
<ul>
<li>Entwicklung von Konzepten für Lichtwerbung und Beschriftungen</li>
<li>Gestaltung von Logos, Schriften und visuellen Elementen</li>
<li>Erstellung von Druckvorlagen und technischen Zeichnungen</li>
<li>Kundenberatung und Präsentation von Entwürfen</li>
</ul>

<h3>Ihr Profil</h3>
<ul>
<li>Abgeschlossene Ausbildung als Grafiker/in oder gleichwertig</li>
<li>Sicherer Umgang mit Adobe Creative Suite</li>
<li>Kreativität und Gespür für Design</li>
<li>Teamgeist und Kundenorientierung</li>
</ul>`,
        status: 'PUBLISHED',
        isActive: true,
        showOnWebsite: true,
        validUntil: new Date('2024-05-31'),
        metaTitle: 'Grafiker/in 80-100% - Neon Murer',
        metaDescription: 'Kreative Position als Grafiker/in in der Werbetechnik. Gestalten Sie mit uns innovative Lösungen.',
        keywords: 'Grafiker, Design, Werbetechnik, Vollzeit, Uznach',
        requirements: {
          create: [
            { text: 'Ausbildung als Grafiker/in oder Mediengestalter/in', order: 0 },
            { text: 'Erfahrung mit Adobe Creative Suite (Illustrator, Photoshop, InDesign)', order: 1 },
            { text: 'Kreativität und visuelles Gespür', order: 2 },
            { text: 'Teamfähigkeit und Kommunikationsstärke', order: 3 }
          ]
        }
      }
    });

    const job3 = await prisma.job.create({
      data: {
        title: 'Kaufmännische/r Lernende/r',
        position: 'Kaufmännische/r Lernende/r',
        department: 'administration',
        jobType: 'lehrstelle',
        location: 'neuhaus',
        excerpt: 'Starten Sie Ihre Karriere mit einer kaufmännischen Lehre in unserem innovativen Unternehmen.',
        content: `<h3>Deine Lehre bei uns</h3>
<p>Als kaufmännische/r Lernende/r EFZ lernst Du alle Bereiche unseres Unternehmens kennen:</p>
<ul>
<li>Administration und Büroorganisation</li>
<li>Kundenbetreuung und Auftragsabwicklung</li>
<li>Buchhaltung und Rechnungswesen</li>
<li>Marketing und Kommunikation</li>
</ul>

<h3>Das bieten wir Dir</h3>
<ul>
<li>Umfassende Ausbildung in einem vielseitigen Betrieb</li>
<li>Moderne Arbeitsplätze und IT-Ausstattung</li>
<li>Persönliche Betreuung durch erfahrene Berufsbildner</li>
<li>Übernahmechancen nach erfolgreichem Abschluss</li>
</ul>`,
        status: 'PUBLISHED',
        isActive: true,
        showOnWebsite: true,
        validUntil: new Date('2024-08-31'),
        metaTitle: 'Kaufmännische Lehre - Neon Murer',
        metaDescription: 'Starten Sie Ihre Karriere mit einer kaufmännischen Lehre bei Neon Murer. Jetzt bewerben!',
        keywords: 'Lehrstelle, Kaufmann, Ausbildung, EFZ, Neuhaus',
        requirements: {
          create: [
            { text: 'Abgeschlossene Sekundarschule oder Gymnasium', order: 0 },
            { text: 'Interesse an kaufmännischen Tätigkeiten', order: 1 },
            { text: 'Gute Deutschkenntnisse in Wort und Schrift', order: 2 },
            { text: 'Teamfähigkeit und Lernbereitschaft', order: 3 }
          ]
        }
      }
    });

    // Sample News
    const news1 = await prisma.newsArticle.create({
      data: {
        title: 'Neue energieeffiziente LED-Technologie im Einsatz',
        slug: 'neue-led-technologie-2024',
        category: 'technologie',
        excerpt: 'Wir setzen auf modernste LED-Module, die bis zu 40% weniger Energie verbrauchen und eine längere Lebensdauer bieten.',
        content: `<p>Neon Murer setzt ab sofort auf die neueste Generation energieeffizienter LED-Technologie. Die neuen Module verbrauchen bis zu 40% weniger Energie als herkömmliche Systeme und bieten eine deutlich längere Lebensdauer.</p>

<h3>Vorteile der neuen Technologie</h3>
<ul>
<li><strong>Energieeffizienz:</strong> Bis zu 40% geringerer Stromverbrauch</li>
<li><strong>Langlebigkeit:</strong> Über 50.000 Betriebsstunden</li>
<li><strong>Umweltfreundlich:</strong> Reduzierte CO2-Bilanz</li>
<li><strong>Kostenersparnis:</strong> Niedrigere Betriebskosten für unsere Kunden</li>
</ul>

<p>Diese Innovation unterstreicht unser Engagement für nachhaltige Werbetechnik und bestätigt unsere Position als Technologieführer in der Branche.</p>`,
        newsDate: new Date('2024-01-15'),
        status: 'PUBLISHED',
        showOnWebsite: true,
        isFeatured: true,
        metaTitle: 'Neue LED-Technologie - Neon Murer',
        metaDescription: 'Neon Murer setzt auf energieeffiziente LED-Technologie für nachhaltige Werbetechnik.',
        keywords: 'LED, Technologie, Energieeffizient, Nachhaltigkeit, Werbetechnik'
      }
    });

    const news2 = await prisma.newsArticle.create({
      data: {
        title: 'Erfolgreiche Projektrealisierung: Agrola Tankstellennetz',
        slug: 'agrola-projekt-2024',
        category: 'projekte',
        excerpt: 'Abschluss der umfassenden Neugestaltung von über 50 Agrola Tankstellen mit moderner LED-Beleuchtung.',
        content: `<p>Nach 18 Monaten intensiver Arbeit haben wir erfolgreich die Neugestaltung von über 50 Agrola Tankstellen abgeschlossen. Das Projekt umfasste die komplette Erneuerung der Außenwerbung mit modernster LED-Technologie.</p>

<h3>Projektumfang</h3>
<ul>
<li>Installation von über 200 LED-Pylonen</li>
<li>Erneuerung von Fassadenbeschriftungen</li>
<li>Digitale Preisanzeigen an allen Standorten</li>
<li>24/7 Service und Wartungsvertrag</li>
</ul>

<p>Die neue Beleuchtung sorgt nicht nur für eine bessere Sichtbarkeit, sondern reduziert auch den Energieverbrauch um durchschnittlich 60%.</p>

<blockquote>
"Die Zusammenarbeit mit Neon Murer war ausgezeichnet. Die Qualität und Professionalität haben unsere Erwartungen übertroffen."
<cite>- Projektleiter Agrola</cite>
</blockquote>`,
        newsDate: new Date('2024-02-10'),
        status: 'PUBLISHED',
        showOnWebsite: true,
        isFeatured: true,
        metaTitle: 'Agrola Projekt erfolgreich abgeschlossen - Neon Murer',
        metaDescription: 'Erfolgreiche Neugestaltung von über 50 Agrola Tankstellen mit moderner LED-Technologie.',
        keywords: 'Agrola, Tankstelle, LED, Projekt, Pylonen, Werbetechnik'
      }
    });

    const news3 = await prisma.newsArticle.create({
      data: {
        title: 'Team-Event: Betriebsausflug nach Davos',
        slug: 'team-event-davos-2024',
        category: 'team',
        excerpt: 'Unser diesjähriger Betriebsausflug führte das gesamte Team nach Davos für zwei unvergessliche Tage.',
        content: `<p>Ende März verbrachte unser gesamtes Team zwei wunderbare Tage in Davos. Bei strahlendem Sonnenschein und perfekten Schneeverhältnissen konnten alle die Auszeit vom Arbeitsalltag genießen.</p>

<h3>Programm-Highlights</h3>
<ul>
<li>Skifahren und Snowboarden auf der Parsenn</li>
<li>Gemeinsames Abendessen im Bergrestaurant</li>
<li>Team-Building-Aktivitäten</li>
<li>Entspannung im Spa-Bereich des Hotels</li>
</ul>

<p>Solche Events stärken den Zusammenhalt im Team und zeigen unsere Wertschätzung für die tägliche Arbeit aller Mitarbeitenden. Die nächste Aktivität ist bereits in Planung!</p>`,
        newsDate: new Date('2024-03-28'),
        status: 'PUBLISHED',
        showOnWebsite: true,
        metaTitle: 'Team-Event in Davos - Neon Murer',
        metaDescription: 'Betriebsausflug des Neon Murer Teams nach Davos mit Skifahren und Team-Building.',
        keywords: 'Team, Event, Davos, Betriebsausflug, Mitarbeiter, Team-Building'
      }
    });

    console.log('✅ Sample Jobs created:', [job1.title, job2.title, job3.title]);
    console.log('✅ Sample News created:', [news1.title, news2.title, news3.title]);
    console.log('🎉 Jobs and News seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding jobs and news:', error);
    throw error;
  }
}

// Only run if called directly
if (require.main === module) {
  seedJobsAndNews()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { seedJobsAndNews }; 