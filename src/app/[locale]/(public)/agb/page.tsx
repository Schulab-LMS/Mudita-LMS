import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import {
  LegalLayout,
  type LegalSection,
} from "@/components/shared/legal-layout";

export const metadata: Metadata = {
  title: "Allgemeine Geschäftsbedingungen | Schulab",
  description:
    "Allgemeine Geschäftsbedingungen (AGB) der Schulab-Plattform für Nutzerinnen und Nutzer in Deutschland, Österreich und der Schweiz.",
};

const sections: LegalSection[] = [
  { id: "geltungsbereich", label: "§ 1 Geltungsbereich" },
  { id: "vertragsgegenstand", label: "§ 2 Vertragsgegenstand" },
  { id: "vertragsschluss", label: "§ 3 Vertragsschluss" },
  { id: "preise", label: "§ 4 Preise & Zahlung" },
  { id: "widerruf", label: "§ 5 Widerrufsrecht" },
  { id: "laufzeit", label: "§ 6 Laufzeit & Kündigung" },
  { id: "pflichten", label: "§ 7 Pflichten der Nutzenden" },
  { id: "haftung", label: "§ 8 Haftung" },
  { id: "schluss", label: "§ 9 Schlussbestimmungen" },
];

export default function AgbPage() {
  return (
    <LegalLayout
      title="Allgemeine Geschäftsbedingungen"
      description="AGB für Nutzerinnen und Nutzer in Deutschland, Österreich und der Schweiz."
      lastUpdated="[Datum]"
      sections={sections}
    >
      <section id="geltungsbereich">
        <h2>§ 1 Geltungsbereich</h2>
        <p>
          Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle
          Verträge, die zwischen dem Anbieter (siehe Impressum) und den
          Nutzerinnen und Nutzern über die Plattform Schulab geschlossen
          werden. Abweichende Bedingungen der Nutzenden werden nicht
          anerkannt, es sei denn, der Anbieter stimmt ihrer Geltung
          ausdrücklich in Textform zu.
        </p>
      </section>

      <section id="vertragsgegenstand">
        <h2>§ 2 Vertragsgegenstand</h2>
        <p>
          Der Anbieter stellt über die Plattform digitale Bildungsinhalte
          (z. B. Online-Kurse, Quizze, Zertifikate), Live-Tutoring sowie
          ergänzende physische Lernprodukte (STEM-Kits) bereit. Der konkrete
          Leistungsumfang ergibt sich aus der jeweiligen Produktbeschreibung
          zum Zeitpunkt des Vertragsschlusses.
        </p>
      </section>

      <section id="vertragsschluss">
        <h2>§ 3 Vertragsschluss</h2>
        <p>
          Die Darstellung der Produkte auf der Plattform stellt kein
          rechtlich bindendes Angebot dar, sondern eine Aufforderung zur
          Bestellung. Mit Bestätigung der Bestellung bzw. mit Eingang einer
          Zahlungsbestätigung kommt der Vertrag zustande.
        </p>
      </section>

      <section id="preise">
        <h2>§ 4 Preise, Zahlung, Rechnungsstellung</h2>
        <p>
          Alle Preise verstehen sich in Euro inklusive der gesetzlichen
          Umsatzsteuer. Die Zahlung erfolgt über den im Checkout-Prozess
          ausgewählten Zahlungsdienstleister. Rechnungen werden elektronisch
          übermittelt und enthalten alle Pflichtangaben nach § 14 UStG.
        </p>
      </section>

      <section id="widerruf">
        <h2>§ 5 Widerrufsrecht für Verbraucher</h2>
        <p>
          Verbraucherinnen und Verbrauchern steht ein 14-tägiges
          Widerrufsrecht zu. Die Einzelheiten und Rechtsfolgen entnehmen Sie
          bitte der{" "}
          <Link href="/widerruf">Widerrufsbelehrung</Link>.
        </p>
      </section>

      <section id="laufzeit">
        <h2>§ 6 Laufzeit und Kündigung von Abonnements</h2>
        <p>
          Abonnements verlängern sich automatisch um den jeweils gewählten
          Zeitraum (monatlich oder jährlich), sofern sie nicht vor Ablauf
          der laufenden Periode über den Abrechnungsbereich gekündigt
          werden. Das Recht zur außerordentlichen Kündigung aus wichtigem
          Grund bleibt unberührt.
        </p>
      </section>

      <section id="pflichten">
        <h2>§ 7 Pflichten der Nutzenden</h2>
        <p>
          Die Nutzenden verpflichten sich, keine rechtswidrigen Inhalte
          einzustellen, ihre Zugangsdaten geheim zu halten und die Plattform
          nicht missbräuchlich zu verwenden. Für Minderjährige ist die
          Zustimmung der erziehungsberechtigten Person erforderlich.
        </p>
      </section>

      <section id="haftung">
        <h2>§ 8 Haftung</h2>
        <p>
          Der Anbieter haftet unbeschränkt für Vorsatz und grobe
          Fahrlässigkeit sowie für Schäden aus der Verletzung des Lebens,
          des Körpers oder der Gesundheit. Im Übrigen ist die Haftung auf
          den typischerweise vorhersehbaren Schaden begrenzt.
        </p>
      </section>

      <section id="schluss">
        <h2>§ 9 Schlussbestimmungen</h2>
        <p>
          Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss
          des UN-Kaufrechts. Ist eine der vorstehenden Bestimmungen
          unwirksam, bleibt die Wirksamkeit der übrigen Bestimmungen
          unberührt.
        </p>

        <p className="mt-8 rounded-md border border-dashed border-muted-foreground/30 p-4 text-xs">
          <strong>Hinweis:</strong> Dieses Dokument ist ein Vorentwurf und
          muss vor dem Produktivstart in der DACH-Region durch eine auf
          E-Commerce- und EdTech-Recht spezialisierte Kanzlei geprüft und
          freigegeben werden.
        </p>
      </section>
    </LegalLayout>
  );
}
