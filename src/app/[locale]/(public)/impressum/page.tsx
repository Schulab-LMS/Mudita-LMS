import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum | Schulab",
  description:
    "Impressum gemäß § 5 TMG für Schulab, betrieben von Mudita IT Solutions UG.",
};

// Env-driven so the legal details can be updated without a code change.
// Fallbacks are placeholder strings — they must be replaced with real
// values before the German-market launch and signed off by counsel.
const company = {
  legalName: process.env.COMPANY_LEGAL_NAME ?? "Mudita IT Solutions UG (haftungsbeschränkt)",
  addressLine1: process.env.COMPANY_ADDRESS_LINE1 ?? "[Straße und Hausnummer]",
  addressLine2: process.env.COMPANY_ADDRESS_LINE2 ?? "[PLZ Ort]",
  country: process.env.COMPANY_COUNTRY ?? "Deutschland",
  email: process.env.COMPANY_EMAIL ?? "hello@schulab.com",
  phone: process.env.COMPANY_PHONE ?? "[Telefonnummer folgt]",
  registerCourt: process.env.COMPANY_REGISTER_COURT ?? "[Amtsgericht]",
  registerNumber: process.env.COMPANY_REGISTER_NUMBER ?? "[HRB-Nummer]",
  managingDirector: process.env.COMPANY_MANAGING_DIRECTOR ?? "[Geschäftsführung]",
  vatId: process.env.COMPANY_VAT_ID ?? "[USt-IdNr. gemäß § 27 a UStG]",
  responsibleEditor:
    process.env.COMPANY_RESPONSIBLE_EDITOR ?? "[Verantwortlich für den Inhalt]",
};

export default function ImpressumPage() {
  return (
    <div className="py-16">
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Impressum
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Angaben gemäß § 5 TMG
        </p>

        <h2 className="mt-8 mb-3 text-xl font-semibold">Anbieter</h2>
        <p className="mb-1 leading-relaxed text-muted-foreground">
          {company.legalName}
        </p>
        <p className="mb-1 leading-relaxed text-muted-foreground">
          {company.addressLine1}
        </p>
        <p className="mb-1 leading-relaxed text-muted-foreground">
          {company.addressLine2}
        </p>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          {company.country}
        </p>

        <h2 className="mt-8 mb-3 text-xl font-semibold">Kontakt</h2>
        <p className="mb-1 leading-relaxed text-muted-foreground">
          E-Mail:{" "}
          <a
            href={`mailto:${company.email}`}
            className="text-primary underline underline-offset-4 hover:text-primary/80"
          >
            {company.email}
          </a>
        </p>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          Telefon: {company.phone}
        </p>

        <h2 className="mt-8 mb-3 text-xl font-semibold">Vertretungsberechtigt</h2>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          {company.managingDirector}
        </p>

        <h2 className="mt-8 mb-3 text-xl font-semibold">Registereintrag</h2>
        <p className="mb-1 leading-relaxed text-muted-foreground">
          Registergericht: {company.registerCourt}
        </p>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          Registernummer: {company.registerNumber}
        </p>

        <h2 className="mt-8 mb-3 text-xl font-semibold">
          Umsatzsteuer-Identifikationsnummer
        </h2>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          {company.vatId}
        </p>

        <h2 className="mt-8 mb-3 text-xl font-semibold">
          Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
        </h2>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          {company.responsibleEditor}
        </p>

        <h2 className="mt-8 mb-3 text-xl font-semibold">
          EU-Streitschlichtung
        </h2>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          Die Europäische Kommission stellt eine Plattform zur
          Online-Streitbeilegung (OS) bereit:{" "}
          <a
            href="https://ec.europa.eu/consumers/odr/"
            className="text-primary underline underline-offset-4 hover:text-primary/80"
            target="_blank"
            rel="noreferrer noopener"
          >
            https://ec.europa.eu/consumers/odr/
          </a>
          . Unsere E-Mail-Adresse finden Sie oben im Impressum.
        </p>

        <h2 className="mt-8 mb-3 text-xl font-semibold">
          Verbraucherstreitbeilegung / Universalschlichtungsstelle
        </h2>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren
          vor einer Verbraucherschlichtungsstelle teilzunehmen.
        </p>

        <p className="mt-8 rounded-md border border-dashed border-muted-foreground/30 p-4 text-xs text-muted-foreground">
          Hinweis: Diese Seite ist ein Platzhalter für den Markteintritt in der
          DACH-Region. Die tatsächlichen Unternehmensangaben werden über
          Umgebungsvariablen konfiguriert (<code>COMPANY_*</code>) und der
          finale Inhalt muss vor dem Produktivbetrieb von einer Anwältin bzw.
          einem Anwalt freigegeben werden.
        </p>
      </section>
    </div>
  );
}
