import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "Allgemeine Geschäftsbedingungen | Schulab",
  description:
    "Allgemeine Geschäftsbedingungen (AGB) der Schulab-Plattform für Nutzerinnen und Nutzer in Deutschland, Österreich und der Schweiz.",
};

export default function AgbPage() {
  return (
    <div className="py-16">
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Allgemeine Geschäftsbedingungen
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Stand: [Datum]</p>

        <h2 className="mt-8 mb-3 text-xl font-semibold">
          § 1 Geltungsbereich
        </h2>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle
          Verträge, die zwischen dem Anbieter (siehe Impressum) und den
          Nutzerinnen und Nutzern über die Plattform Schulab geschlossen
          werden. Abweichende Bedingungen der Nutzenden werden nicht
          anerkannt, es sei denn, der Anbieter stimmt ihrer Geltung
          ausdrücklich in Textform zu.
        </p>

        <h2 className="mt-8 mb-3 text-xl font-semibold">
          § 2 Vertragsgegenstand
        </h2>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          Der Anbieter stellt über die Plattform digitale Bildungsinhalte
          (z. B. Online-Kurse, Quizze, Zertifikate), Live-Tutoring sowie
          ergänzende physische Lernprodukte (STEM-Kits) bereit. Der konkrete
          Leistungsumfang ergibt sich aus der jeweiligen Produktbeschreibung
          zum Zeitpunkt des Vertragsschlusses.
        </p>

        <h2 className="mt-8 mb-3 text-xl font-semibold">
          § 3 Vertragsschluss
        </h2>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          Die Darstellung der Produkte auf der Plattform stellt kein
          rechtlich bindendes Angebot dar, sondern eine Aufforderung zur
          Bestellung. Mit Bestätigung der Bestellung bzw. mit Eingang einer
          Zahlungsbestätigung kommt der Vertrag zustande.
        </p>

        <h2 className="mt-8 mb-3 text-xl font-semibold">
          § 4 Preise, Zahlung, Rechnungsstellung
        </h2>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          Alle Preise verstehen sich in Euro inklusive der gesetzlichen
          Umsatzsteuer. Die Zahlung erfolgt über den im Checkout-Prozess
          ausgewählten Zahlungsdienstleister. Rechnungen werden elektronisch
          übermittelt und enthalten alle Pflichtangaben nach § 14 UStG.
        </p>

        <h2 className="mt-8 mb-3 text-xl font-semibold">
          § 5 Widerrufsrecht für Verbraucher
        </h2>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          Verbraucherinnen und Verbrauchern steht ein 14-tägiges Widerrufs­recht
          zu. Die Einzelheiten und Rechtsfolgen entnehmen Sie bitte der{" "}
          <Link
            href="/widerruf"
            className="text-primary underline underline-offset-4 hover:text-primary/80"
          >
            Widerrufsbelehrung
          </Link>
          .
        </p>

        <h2 className="mt-8 mb-3 text-xl font-semibold">
          § 6 Laufzeit und Kündigung von Abonnements
        </h2>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          Abonnements verlängern sich automatisch um den jeweils gewählten
          Zeitraum (monatlich oder jährlich), sofern sie nicht vor Ablauf der
          laufenden Periode über den Abrechnungsbereich gekündigt werden. Das
          Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt
          unberührt.
        </p>

        <h2 className="mt-8 mb-3 text-xl font-semibold">
          § 7 Pflichten der Nutzenden
        </h2>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          Die Nutzenden verpflichten sich, keine rechtswidrigen Inhalte
          einzustellen, ihre Zugangsdaten geheim zu halten und die Plattform
          nicht missbräuchlich zu verwenden. Für Minderjährige ist die
          Zustimmung der erziehungsberechtigten Person erforderlich.
        </p>

        <h2 className="mt-8 mb-3 text-xl font-semibold">
          § 8 Haftung
        </h2>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          Der Anbieter haftet unbeschränkt für Vorsatz und grobe
          Fahrlässigkeit sowie für Schäden aus der Verletzung des Lebens,
          des Körpers oder der Gesundheit. Im Übrigen ist die Haftung auf
          den typischerweise vorhersehbaren Schaden begrenzt.
        </p>

        <h2 className="mt-8 mb-3 text-xl font-semibold">
          § 9 Schlussbestimmungen
        </h2>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss
          des UN-Kaufrechts. Ist eine der vorstehenden Bestimmungen unwirksam,
          bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
        </p>

        <p className="mt-8 rounded-md border border-dashed border-muted-foreground/30 p-4 text-xs text-muted-foreground">
          Hinweis: Dieses Dokument ist ein Vorentwurf und muss vor dem
          Produktivstart in der DACH-Region durch eine auf E-Commerce- und
          EdTech-Recht spezialisierte Kanzlei geprüft und freigegeben werden.
        </p>
      </section>
    </div>
  );
}
