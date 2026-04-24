import type { Metadata } from "next";
import {
  LegalLayout,
  type LegalSection,
} from "@/components/shared/legal-layout";

export const metadata: Metadata = {
  title: "Impressum | Schulab",
  description:
    "Impressum gemäß § 5 TMG für Schulab, betrieben von Mudita IT Solutions UG.",
};

// Env-driven so the legal details can be updated without a code change.
// Fallbacks are placeholder strings — they must be replaced with real
// values before the German-market launch and signed off by counsel.
const company = {
  legalName:
    process.env.COMPANY_LEGAL_NAME ??
    "Mudita IT Solutions UG (haftungsbeschränkt)",
  addressLine1:
    process.env.COMPANY_ADDRESS_LINE1 ?? "[Straße und Hausnummer]",
  addressLine2: process.env.COMPANY_ADDRESS_LINE2 ?? "[PLZ Ort]",
  country: process.env.COMPANY_COUNTRY ?? "Deutschland",
  email: process.env.COMPANY_EMAIL ?? "hello@schulab.com",
  phone: process.env.COMPANY_PHONE ?? "[Telefonnummer folgt]",
  registerCourt: process.env.COMPANY_REGISTER_COURT ?? "[Amtsgericht]",
  registerNumber: process.env.COMPANY_REGISTER_NUMBER ?? "[HRB-Nummer]",
  managingDirector:
    process.env.COMPANY_MANAGING_DIRECTOR ?? "[Geschäftsführung]",
  vatId: process.env.COMPANY_VAT_ID ?? "[USt-IdNr. gemäß § 27 a UStG]",
  responsibleEditor:
    process.env.COMPANY_RESPONSIBLE_EDITOR ?? "[Verantwortlich für den Inhalt]",
};

const sections: LegalSection[] = [
  { id: "anbieter", label: "Anbieter" },
  { id: "kontakt", label: "Kontakt" },
  { id: "vertretung", label: "Vertretungsberechtigt" },
  { id: "register", label: "Registereintrag" },
  { id: "ust", label: "Umsatzsteuer-ID" },
  { id: "verantwortlich", label: "Verantwortlich für den Inhalt" },
  { id: "eu-os", label: "EU-Streitschlichtung" },
  { id: "vsbg", label: "Verbraucherstreitbeilegung" },
];

export default function ImpressumPage() {
  return (
    <LegalLayout
      title="Impressum"
      description="Angaben gemäß § 5 TMG für den Betrieb dieser Website."
      sections={sections}
    >
      <section id="anbieter">
        <h2>Anbieter</h2>
        <p>
          <strong>{company.legalName}</strong>
          <br />
          {company.addressLine1}
          <br />
          {company.addressLine2}
          <br />
          {company.country}
        </p>
      </section>

      <section id="kontakt">
        <h2>Kontakt</h2>
        <p>
          E-Mail:{" "}
          <a href={`mailto:${company.email}`}>{company.email}</a>
          <br />
          Telefon: {company.phone}
        </p>
      </section>

      <section id="vertretung">
        <h2>Vertretungsberechtigt</h2>
        <p>{company.managingDirector}</p>
      </section>

      <section id="register">
        <h2>Registereintrag</h2>
        <p>
          Registergericht: {company.registerCourt}
          <br />
          Registernummer: {company.registerNumber}
        </p>
      </section>

      <section id="ust">
        <h2>Umsatzsteuer-Identifikationsnummer</h2>
        <p>{company.vatId}</p>
      </section>

      <section id="verantwortlich">
        <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
        <p>{company.responsibleEditor}</p>
      </section>

      <section id="eu-os">
        <h2>EU-Streitschlichtung</h2>
        <p>
          Die Europäische Kommission stellt eine Plattform zur
          Online-Streitbeilegung (OS) bereit:{" "}
          <a
            href="https://ec.europa.eu/consumers/odr/"
            target="_blank"
            rel="noreferrer noopener"
          >
            https://ec.europa.eu/consumers/odr/
          </a>
          . Unsere E-Mail-Adresse finden Sie oben im Impressum.
        </p>
      </section>

      <section id="vsbg">
        <h2>Verbraucherstreitbeilegung / Universalschlichtungsstelle</h2>
        <p>
          Wir sind nicht bereit oder verpflichtet, an
          Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
          teilzunehmen.
        </p>

        <p className="mt-8 rounded-md border border-dashed border-muted-foreground/30 p-4 text-xs">
          <strong>Hinweis:</strong> Diese Seite ist ein Platzhalter für den
          Markteintritt in der DACH-Region. Die tatsächlichen
          Unternehmensangaben werden über Umgebungsvariablen konfiguriert
          (<code>COMPANY_*</code>) und der finale Inhalt muss vor dem
          Produktivbetrieb von einer Anwältin bzw. einem Anwalt freigegeben
          werden.
        </p>
      </section>
    </LegalLayout>
  );
}
