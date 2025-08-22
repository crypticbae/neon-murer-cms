const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const agbSections = [
    {
        title: "Allgemeines",
        content: `<p>Die Zusammenarbeit erfolgt aufgrund der nachstehend aufgeführten Bestimmungen die einen integrierten Bestandteil jeder Verkaufs- und Liefervereinbarung bilden. Abweichende Vereinbarungen sind nur gültig wenn diese schriftlich vereinbart werden. Mit der Erteilung eines Auftrages anerkennt der Kunde diese Bestimmungen vollumfänglich.</p>`,
        boxType: "DEFAULT",
        iconClass: "fa-solid fa-info-circle",
        sortOrder: 1,
        isActive: true,
        showInQuickNav: true
    },
    {
        title: "Auftragsgrundlagen",
        content: `<p>Als Grundlage für ein Angebot gelten die vom Kunden angegebenen Eckdaten. Für die Richtigkeit der vom Auftraggeber/Besteller als fix übermittelten Masse übernehmen wir keine Verantwortung. Allfällige Fehlläufe und Mehrkosten hieraus gehen zu Lasten des Auftraggebers.</p>`,
        boxType: "DEFAULT",
        iconClass: "fa-solid fa-file-contract",
        sortOrder: 2,
        isActive: true,
        showInQuickNav: false
    },
    {
        title: "Angebot/Offerte",
        content: `<p>Schriftlich abgegebene Angebote haben unter normalen Umständen eine <strong>Gültigkeit von 2 Monate</strong> ab Ausstellungsdatum. Bei nachträglicher Änderung der Menge behalten wir uns eine Preisanpassung vor. Das Angebot wird aufgrund aktueller und überschaubarer Marktdaten erstellt. Sollte sich das Marktumfeld kurzfristig verändern behalten wir uns eine Preisanpassung vor.</p>
        <p>In den Preisen nicht inbegriffen sind zusätzliche Kosten für Arbeiten und Aufwände die bei der Offertstellung nicht bekannt oder vorgesehen waren. Offerten auf der Basis telefonischer Anfrage ohne Einsicht in Vorlagen etc. sind grundsätzlich nur als Richtwerte zu verstehen.</p>`,
        boxType: "DEFAULT",
        iconClass: "fa-solid fa-file-invoice-dollar",
        sortOrder: 3,
        isActive: true,
        showInQuickNav: true
    },
    {
        title: "Preise",
        content: `<p>Alle Preise verstehen sich und soweit nicht anders angegeben <strong>exklusive der gesetzlichen MWSt</strong> und unverpackt ab Werk. Daten und Vorlagen vom Kunden sind gemäss unseren Angaben gebrauchsfähig zu liefern. Nachträgliche Datenbearbeitung in jeglicher Form wird zusätzlich in Rechnung gestellt.</p>`,
        boxType: "DEFAULT",
        iconClass: "fa-solid fa-tags",
        sortOrder: 4,
        isActive: true,
        showInQuickNav: false
    },
    {
        title: "Gut zur Ausführung",
        content: `<p>Der Kunde erhält vor der Fertigung ein <strong>Layout der gewünschten Beschriftung</strong> zur Ansicht und Endkontrolle für die Ausführung. Der Auftraggeber hat die Pflicht dieses Layout in allen Belangen zu prüfen und in irgendeiner Form <strong>schriftlich zu genehmigen</strong>.</p>
        <p class="warning-text">⚠️ Wird die Ausführung ohne schriftliche Genehmigung erteilt oder verlangt und treten dann Beanstandungen auf, können wir jegliche Gewährleistung oder Haftung ablehnen.</p>`,
        boxType: "HIGHLIGHT",
        iconClass: "fa-solid fa-check-circle",
        sortOrder: 5,
        isActive: true,
        showInQuickNav: true
    },
    {
        title: "Auftrag",
        content: `<p>Ein Auftrag gilt als erteilt, sobald eine Bestellung vom Kunden in irgendeiner Form vorliegt. Jede Arbeit wird individuell für den Kunden ausgeführt. Sollte der Auftrag aufgrund individueller Umstände gestoppt oder zurückgezogen werden sind wir berechtigt, alle bis dahin getätigten Arbeiten, Auslagen sowie verwendetes Material in Rechnung zu stellen.</p>
        <p>Auftraggeber ist der direkte Besteller der auch bei Bestellung für Dritte Vertragspartner bis zur vollständigen Bezahlung der Rechnung bleibt. Das gestalten und ausarbeiten eines speziellen Logos, Signets, Erscheinungsbildes o.ä. für den Kunden bildet bereits einen Auftrag und wird auch bei Nichterteilung eines Ausführungsauftrages in Rechnung gestellt.</p>`,
        boxType: "DEFAULT",
        iconClass: "fa-solid fa-handshake",
        sortOrder: 6,
        isActive: true,
        showInQuickNav: false
    },
    {
        title: "Liefertermin",
        content: `<p>Der Liefertermin gilt ab dem Zeitpunkt der <strong>schriftlichen Freigabe für die Produktion</strong> und ab Vorlage der behördlichen Baugenehmigung. Eventuelle Lieferverzögerungen berechtigen den Kunden weder zum Vertragsrücktritt, verzögerter Zahlung oder Geltendmachung von Schadenersatzforderungen.</p>`,
        boxType: "DEFAULT",
        iconClass: "fa-solid fa-calendar-check",
        sortOrder: 9,
        isActive: true,
        showInQuickNav: true
    },
    {
        title: "Reklamationen",
        content: `<p>Die Lieferung und Montage der Ware gilt als vollumfänglich genehmigt, sofern der Kunde nicht <strong>innert 5 Arbeitstagen</strong> eine schriftliche und begründete Mängelrüge angezeigt hat.</p>
        <p>Geringe Abweichungen oder Unterschiede in Grösse, Form und Farbe insbesondere auch im Farbton der Lackierung oder des Acrylglases können nicht als Mängel geltend gemacht werden. Beanstandungen aus Lieferung durch Transportunternehmen müssen unverzüglich und sofort nach Erhalt schriftlich angezeigt werden.</p>`,
        boxType: "IMPORTANT",
        iconClass: "fa-solid fa-exclamation-triangle",
        sortOrder: 11,
        isActive: true,
        showInQuickNav: true
    },
    {
        title: "Garantie",
        content: `<p>Auf den von uns hergestellten Waren gewähren wir eine <strong>Garantie von 24 Monaten</strong> auf Material und Arbeit. Hiervon ausgenommen sind die mutwillige Beschädigung durch Dritte, Vandalismus, Elementarschäden und Glasbruch.</p>
        <p>Für Garantiearbeiten muss der mühelose Zugang zu den Bauteilen bauseits und SUVA konform gewährleistet sein. Allfällige Kosten für Gerüst, Skyworker etc. gehen (auch wenn die Firma Neon Murer AG dies organisiert) zu Lasten des Bestellers.</p>
        <p class="warning-text">⚠️ Lässt der Besteller ohne ausdrückliche und schriftliche Zustimmung der Neon Murer AG durch Dritte Arbeiten am Objekt ausführen, so erlischt dadurch jeglicher Gewährleistungsanspruch.</p>
        <p><strong>Für Folgeschäden oder Schäden bei Dritten übernehmen wir keine Haftung.</strong></p>`,
        boxType: "HIGHLIGHT",
        iconClass: "fa-solid fa-shield-halved",
        sortOrder: 12,
        isActive: true,
        showInQuickNav: true
    },
    {
        title: "Zahlung",
        content: `<p>Unsere normalen Zahlungskonditionen verstehen sich als <strong>zahlbar innert 30 Tagen rein netto</strong>. Anderslautende Vereinbarungen müssen schriftlich festgehalten werden. Unberechtigte Skontoabzüge werden inklusive eines Verwaltungskostenzuschlages nachgefordert.</p>
        <p>Verspätete Zahlungen mit einer Verzugszeit von mehr als 15 Tagen können durch uns mit einem <strong>Verzugszins von 6%</strong> plus Verwaltungskostenzuschlag nachbelastet werden. Verrechnung mit berechtigten Forderungen dürfen nur mit schriftlicher Zustimmung der Neon Murer AG vorgenommen werden.</p>`,
        boxType: "DEFAULT",
        iconClass: "fa-solid fa-credit-card",
        sortOrder: 13,
        isActive: true,
        showInQuickNav: true
    },
    {
        title: "Eigentumsvorbehalt",
        content: `<p>Die Ware bleibt vollumfänglich bis zur <strong>vollständigen Bezahlung Eigentum der Neon Murer AG</strong> und darf weder veräussert noch verpfändet werden.</p>`,
        boxType: "IMPORTANT",
        iconClass: "fa-solid fa-key",
        sortOrder: 14,
        isActive: true,
        showInQuickNav: false
    },
    {
        title: "Baugenehmigung",
        content: `<p>Sofern für die Ausführung eine Baugenehmigung erforderlich ist, werden wir diese im Auftragsverhältnis für den Kunden einholen und als Zusatzarbeit mit einer Pauschale zzgl. der Kosten vom amtlichen Katasterplan verrechnen.</p>
        <p>Mehraufwände wie z.B. die Baubegehung vor Ort mit einem Vertreter der Behörde oder gleichartige Arbeiten sind nicht in der Pauschale inbegriffen und werden gesondert gelistet und verrechnet. Die amtlichen Kosten für die Baugenehmigung werden dem Auftraggeber direkt von der Behörde verrechnet.</p>`,
        boxType: "DEFAULT",
        iconClass: "fa-solid fa-building",
        sortOrder: 7,
        isActive: true,
        showInQuickNav: false
    },
    {
        title: "Bemusterung / Attrappen / Bauvisiere",
        content: `<p>Eine Bemusterung der Ausführung oder das erstellen von Attrappen und Bauvisieren sind, soweit nicht anders vereinbart, <strong>kostenpflichtig</strong> und werden zusätzlich nach Aufwand verrechnet. Diese Arbeiten werden auch in Rechnung gestellt, wenn der Auftrag nicht zur Ausführung kommen sollte.</p>`,
        boxType: "DEFAULT",
        iconClass: "fa-solid fa-cube",
        sortOrder: 8,
        isActive: true,
        showInQuickNav: false
    },
    {
        title: "Übernahme der Lieferung und Gefahrenübernahme",
        content: `<p>Bei Lieferung <strong>«ab Werk»</strong> geht die Gefahr an den Besteller über, wenn die Ware die Fabrik verlässt, auch wenn der Transport durch Transportmittel des Lieferanten erfolgt. Bei <strong>«anschlussfertig»</strong> oder <strong>«inklusive Montage»</strong> gelieferter Ware ist die Gefahrenübernahme, ungeachtet der Fertigstellung, ab dem Zeitpunkt, wo die Ware fest montiert ist.</p>
        <p>Erfolgt die Lieferung per Post, Spedition, Kurier etc. muss die Ware bei der Übergabe sofort auf äussere Schäden hin überprüft werden und im Schadenfall gegenüber dem Transportunternehmen sofort schriftlich festgehalten und reklamiert werden.</p>`,
        boxType: "DEFAULT",
        iconClass: "fa-solid fa-truck",
        sortOrder: 10,
        isActive: true,
        showInQuickNav: false
    },
    {
        title: "Gerichtsstand",
        content: `<p><strong>Gerichtsstand für den Besteller ist Uznach.</strong> Die Neon Murer AG ist jedoch berechtigt, den Besteller auch an dessen Firmensitz rechtlich zu belangen. Das Rechtsverhältnis untersteht ausschliesslich dem schweizerischen Recht.</p>`,
        boxType: "DEFAULT",
        iconClass: "fa-solid fa-gavel",
        sortOrder: 16,
        isActive: true,
        showInQuickNav: false
    },
    {
        title: "Verbindlichkeit der AGB",
        content: `<p>Diese AGB bleibt auch bei Unwirksamkeit einzelner Punkte in ihren übrigen Teilen verbindlich.</p>`,
        boxType: "DEFAULT",
        iconClass: "fa-solid fa-balance-scale",
        sortOrder: 17,
        isActive: true,
        showInQuickNav: false
    },
    {
        title: "Zustimmungserklärung des Bestellers",
        content: `<p><strong>Mit der Erteilung eines Auftrages bescheinigt der Besteller diese AGB gelesen zu haben und anerkennt den Inhalt dieser AGB vollumfänglich.</strong></p>
        <div class="signature-section">
            <p class="company-signature">
                <strong>Neon Murer AG<br>
                Benno Murer</strong>
            </p>
        </div>`,
        boxType: "HIGHLIGHT",
        iconClass: "fa-solid fa-signature",
        sortOrder: 18,
        isActive: true,
        showInQuickNav: false
    },
    {
        title: "Urheberrecht",
        content: `<p>Alle von uns angefertigten <strong>Entwürfe, Layouts und Skizzen sind urheberrechtlich geschützt</strong> und dürfen ohne unsere Zustimmung nicht an Dritte weitergegeben oder anderweitig kommerziell genutzt werden.</p>
        <p class="warning-text">⚠️ Der Missbrauch wird mit einer Schadenersatzforderung belegt.</p>`,
        boxType: "IMPORTANT",
        iconClass: "fa-solid fa-copyright",
        sortOrder: 15,
        isActive: true,
        showInQuickNav: true
    }
];

async function main() {
    console.log('🌱 Seeding AGB sections...');

    try {
        // Clear existing AGB sections
        await prisma.agbSection.deleteMany({});
        console.log('📭 Cleared existing AGB sections');

        // Create new AGB sections
        for (const section of agbSections) {
            const created = await prisma.agbSection.create({
                data: section
            });
            console.log(`✅ Created AGB section: ${created.title}`);
        }

        console.log(`🎉 Successfully seeded ${agbSections.length} AGB sections!`);
    } catch (error) {
        console.error('❌ Error seeding AGB sections:', error);
        throw error;
    }
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

module.exports = { agbSections };