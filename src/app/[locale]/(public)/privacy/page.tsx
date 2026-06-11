import type { Metadata } from "next";
import {
  LegalLayout,
  type LegalSection,
} from "@/components/shared/legal-layout";

// Datenschutzerklärung / Privacy Policy.
//
// German is the authoritative version (primary market: Germany; GDPR supervisory
// authority is German). The `de` locale renders the German text; `en` and `ar`
// render the English translation with a note that the German version governs.
// Drafted for legal review — see docs/LEGAL-REVIEW-BRIEF.md before launch.
//
// Controller identity comes from the same COMPANY_* env vars as the Impressum.

const company = {
  legalName:
    process.env.COMPANY_LEGAL_NAME ??
    "Mudita IT Solutions UG (haftungsbeschränkt)",
  addressLine1: process.env.COMPANY_ADDRESS_LINE1 ?? "[Straße und Hausnummer]",
  addressLine2: process.env.COMPANY_ADDRESS_LINE2 ?? "[PLZ Ort]",
  country: process.env.COMPANY_COUNTRY ?? "Deutschland",
  email: process.env.COMPANY_EMAIL ?? "hello@schulab.com",
};

const childAge = process.env.CHILD_AGE_THRESHOLD ?? "16";

const sectionDefs: { id: string; de: string; en: string }[] = [
  { id: "controller", de: "Verantwortlicher", en: "Controller" },
  { id: "overview", de: "Überblick der Verarbeitungen", en: "Overview of processing" },
  { id: "legal-bases", de: "Rechtsgrundlagen", en: "Legal bases" },
  { id: "hosting", de: "Hosting & Infrastruktur", en: "Hosting & infrastructure" },
  { id: "account", de: "Registrierung & Konto", en: "Registration & account" },
  { id: "children", de: "Kinder & elterliche Einwilligung", en: "Children & parental consent" },
  { id: "learning", de: "Lernfortschritt & Zertifikate", en: "Learning progress & certificates" },
  { id: "email", de: "E-Mail-Kommunikation", en: "Email communication" },
  { id: "video", de: "Video-Inhalte", en: "Video content" },
  { id: "live", de: "Live-Unterricht", en: "Live classroom" },
  { id: "uploads", de: "Datei-Uploads", en: "File uploads" },
  { id: "payments", de: "Zahlungsabwicklung", en: "Payment processing" },
  { id: "cookies", de: "Cookies & Analyse", en: "Cookies & analytics" },
  { id: "transfers", de: "Drittlandübermittlungen", en: "International transfers" },
  { id: "retention", de: "Speicherdauer", en: "Retention" },
  { id: "rights", de: "Ihre Rechte", en: "Your rights" },
  { id: "security", de: "Datensicherheit", en: "Data security" },
  { id: "contact", de: "Änderungen & Kontakt", en: "Changes & contact" },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return locale === "de"
    ? {
        title: "Datenschutzerklärung | Schulab",
        description:
          "Datenschutzerklärung der Schulab-Plattform: Welche Daten wir verarbeiten, auf welcher Rechtsgrundlage, und welche Rechte Sie haben (DSGVO).",
      }
    : {
        title: "Privacy Policy | Schulab",
        description:
          "Privacy policy for Schulab: what data we process, on which legal basis, and your rights under the GDPR.",
      };
}

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const de = locale === "de";

  const sections: LegalSection[] = sectionDefs.map((s) => ({
    id: s.id,
    label: de ? s.de : s.en,
  }));

  return (
    <LegalLayout
      title={de ? "Datenschutzerklärung" : "Privacy Policy"}
      description={
        de
          ? "Wie wir personenbezogene Daten verarbeiten und schützen — nach DSGVO."
          : "How we process and protect personal data under the GDPR. The German version of this policy is authoritative."
      }
      lastUpdated={de ? "11. Juni 2026" : "June 11, 2026"}
      sections={sections}
    >
      <section id="controller">
        <h2>{de ? "1. Verantwortlicher" : "1. Controller"}</h2>
        <p>
          {de
            ? "Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:"
            : "The controller within the meaning of the General Data Protection Regulation (GDPR) is:"}
        </p>
        <p>
          <strong>{company.legalName}</strong>
          <br />
          {company.addressLine1}
          <br />
          {company.addressLine2}
          <br />
          {company.country}
          <br />
          E-Mail: <a href={`mailto:${company.email}`}>{company.email}</a>
        </p>
      </section>

      <section id="overview">
        <h2>{de ? "2. Überblick der Verarbeitungen" : "2. Overview of processing"}</h2>
        {de ? (
          <>
            <p>
              Schulab ist eine Lernplattform für MINT-Bildung für Kinder und
              Jugendliche (3–18 Jahre). Wir verarbeiten personenbezogene Daten,
              um die Plattform bereitzustellen:
            </p>
            <ul>
              <li>Konto- und Profildaten (Name, E-Mail-Adresse, Geburtsdatum, Spracheinstellung)</li>
              <li>Lerndaten (Kurseinschreibungen, Fortschritt, Quiz-Ergebnisse, Zertifikate, Abzeichen)</li>
              <li>Einwilligungsnachweise (z. B. elterliche Einwilligung, Marketing-Einwilligung)</li>
              <li>Buchungs- und Sitzungsdaten für Live-Unterricht</li>
              <li>Kommunikationsdaten (Nachrichten, Support-Anfragen)</li>
              <li>Technische Daten (IP-Adresse, Geräte-/Browserinformationen, Protokolldaten)</li>
            </ul>
          </>
        ) : (
          <>
            <p>
              Schulab is a STEM learning platform for children and teenagers
              (ages 3–18). We process personal data to provide the platform:
            </p>
            <ul>
              <li>Account and profile data (name, email address, date of birth, language preference)</li>
              <li>Learning data (enrollments, progress, quiz results, certificates, badges)</li>
              <li>Consent records (e.g. parental consent, marketing consent)</li>
              <li>Booking and session data for live classes</li>
              <li>Communication data (messages, support requests)</li>
              <li>Technical data (IP address, device/browser information, log data)</li>
            </ul>
          </>
        )}
      </section>

      <section id="legal-bases">
        <h2>{de ? "3. Rechtsgrundlagen" : "3. Legal bases"}</h2>
        {de ? (
          <ul>
            <li>
              <strong>Art. 6 Abs. 1 lit. b DSGVO</strong> (Vertragserfüllung):
              Bereitstellung des Kontos, der Kurse, Zertifikate und des
              Live-Unterrichts.
            </li>
            <li>
              <strong>Art. 6 Abs. 1 lit. a DSGVO</strong> (Einwilligung):
              Marketing-E-Mails, Analyse-/Marketing-Cookies sowie die
              Verarbeitung von Kinderdaten gemäß Art. 8 DSGVO.
            </li>
            <li>
              <strong>Art. 6 Abs. 1 lit. f DSGVO</strong> (berechtigtes
              Interesse): Sicherheit der Plattform, Missbrauchsprävention,
              Fehlerdiagnose.
            </li>
            <li>
              <strong>Art. 6 Abs. 1 lit. c DSGVO</strong> (rechtliche
              Verpflichtung): handels- und steuerrechtliche Aufbewahrung.
            </li>
          </ul>
        ) : (
          <ul>
            <li>
              <strong>Art. 6(1)(b) GDPR</strong> (contract): providing the
              account, courses, certificates, and live classes.
            </li>
            <li>
              <strong>Art. 6(1)(a) GDPR</strong> (consent): marketing emails,
              analytics/marketing cookies, and processing of children&apos;s
              data under Art. 8 GDPR.
            </li>
            <li>
              <strong>Art. 6(1)(f) GDPR</strong> (legitimate interest):
              platform security, abuse prevention, error diagnostics.
            </li>
            <li>
              <strong>Art. 6(1)(c) GDPR</strong> (legal obligation): retention
              required by commercial and tax law.
            </li>
          </ul>
        )}
      </section>

      <section id="hosting">
        <h2>{de ? "4. Hosting & Infrastruktur" : "4. Hosting & infrastructure"}</h2>
        {de ? (
          <p>
            Die Plattform und die Datenbank werden bei der{" "}
            <strong>Hetzner Online GmbH</strong> (Deutschland/EU) betrieben;
            Datenbank-Sicherungen werden verschlüsselt gespeichert. Als
            Content-Delivery-Network und zum Schutz vor Angriffen setzen wir{" "}
            <strong>Cloudflare, Inc.</strong> (USA) ein; Cloudflare verarbeitet
            dabei technische Verbindungsdaten (u. a. IP-Adresse). Mit allen
            Dienstleistern bestehen Auftragsverarbeitungsverträge (Art. 28
            DSGVO).
          </p>
        ) : (
          <p>
            The platform and database are hosted by{" "}
            <strong>Hetzner Online GmbH</strong> (Germany/EU); database backups
            are stored encrypted. We use <strong>Cloudflare, Inc.</strong>{" "}
            (USA) as a content-delivery network and for attack protection;
            Cloudflare processes technical connection data (including IP
            addresses). Data-processing agreements (Art. 28 GDPR) are in place
            with all providers.
          </p>
        )}
      </section>

      <section id="account">
        <h2>{de ? "5. Registrierung & Konto" : "5. Registration & account"}</h2>
        {de ? (
          <p>
            Bei der Registrierung erheben wir Name, E-Mail-Adresse und Passwort
            (verschlüsselt gespeichert) sowie das Geburtsdatum zur
            Altersprüfung (siehe Abschnitt 6). Alternativ ist die Anmeldung
            über <strong>Google</strong> (Google Ireland Ltd.) möglich; dabei
            erhalten wir Name, E-Mail-Adresse und Profilbild aus Ihrem
            Google-Konto. E-Mail-Adressen werden vor der ersten Anmeldung
            verifiziert.
          </p>
        ) : (
          <p>
            On registration we collect your name, email address, and password
            (stored encrypted), plus date of birth for the age check (see
            section 6). You can alternatively sign in with{" "}
            <strong>Google</strong> (Google Ireland Ltd.); we then receive your
            name, email address, and profile picture from your Google account.
            Email addresses are verified before first login.
          </p>
        )}
      </section>

      <section id="children">
        <h2>
          {de ? "6. Kinder & elterliche Einwilligung" : "6. Children & parental consent"}
        </h2>
        {de ? (
          <>
            <p>
              Unsere Plattform richtet sich auch an Kinder. Für Nutzerinnen und
              Nutzer unter <strong>{childAge} Jahren</strong> ist die
              nachweisbare Einwilligung einer sorgeberechtigten Person
              erforderlich (Art. 8 DSGVO). Ohne diese Einwilligung können
              Minderjährige sich nicht in Kurse einschreiben und keine
              kostenpflichtigen Inhalte nutzen.
            </p>
            <ul>
              <li>Einwilligungen werden revisionssicher protokolliert (Zeitpunkt, Version, erteilende Person).</li>
              <li>Eltern können die Einwilligung jederzeit über das Eltern-Dashboard widerrufen.</li>
              <li>Eltern können die Daten ihres Kindes einsehen, korrigieren oder deren Löschung verlangen.</li>
              <li>Kinderdaten werden niemals verkauft und nicht für Werbung verwendet.</li>
            </ul>
          </>
        ) : (
          <>
            <p>
              Our platform is also aimed at children. Users under{" "}
              <strong>{childAge} years</strong> require verifiable consent from
              a parent or guardian (Art. 8 GDPR). Without this consent, minors
              cannot enrol in courses or access paid content.
            </p>
            <ul>
              <li>Consents are recorded in an audit-proof ledger (time, version, consenting person).</li>
              <li>Parents can withdraw consent at any time via the parent dashboard.</li>
              <li>Parents can review, correct, or request deletion of their child&apos;s data.</li>
              <li>Children&apos;s data is never sold and never used for advertising.</li>
            </ul>
          </>
        )}
      </section>

      <section id="learning">
        <h2>
          {de ? "7. Lernfortschritt & Zertifikate" : "7. Learning progress & certificates"}
        </h2>
        {de ? (
          <p>
            Wir speichern Kurseinschreibungen, Lektionsfortschritt,
            Quiz-Ergebnisse, Abzeichen und ausgestellte Zertifikate, um den
            Lernstand darzustellen und Zertifikate verifizierbar zu machen.
            Zertifikate enthalten den Namen der Lernenden und eine eindeutige
            Prüfnummer.
          </p>
        ) : (
          <p>
            We store enrollments, lesson progress, quiz results, badges, and
            issued certificates to display learning status and make
            certificates verifiable. Certificates contain the learner&apos;s
            name and a unique verification code.
          </p>
        )}
      </section>

      <section id="email">
        <h2>{de ? "8. E-Mail-Kommunikation" : "8. Email communication"}</h2>
        {de ? (
          <p>
            Transaktionale E-Mails (z. B. E-Mail-Bestätigung,
            Einschreibungsbestätigungen) versenden wir über{" "}
            <strong>Resend, Inc.</strong> (USA). Marketing-E-Mails versenden
            wir ausschließlich mit Ihrer ausdrücklichen Einwilligung (Art. 6
            Abs. 1 lit. a DSGVO, § 7 UWG); Sie können diese jederzeit in den
            Kontoeinstellungen oder über den Abmeldelink widerrufen.
          </p>
        ) : (
          <p>
            Transactional emails (e.g. email verification, enrollment
            confirmations) are sent via <strong>Resend, Inc.</strong> (USA).
            Marketing emails are sent only with your explicit consent (Art.
            6(1)(a) GDPR); you can withdraw it at any time in your account
            settings or via the unsubscribe link.
          </p>
        )}
      </section>

      <section id="video">
        <h2>{de ? "9. Video-Inhalte" : "9. Video content"}</h2>
        {de ? (
          <p>
            Kursvideos werden über <strong>Mux, Inc.</strong> (USA)
            bereitgestellt. Beim Abspielen verarbeitet Mux technische Daten
            (IP-Adresse, Geräteinformationen, Wiedergabestatistiken) zur
            Auslieferung und Qualitätssicherung der Videos. Einzelne Inhalte
            können alternativ über YouTube oder Vimeo eingebettet sein; dabei
            gelten die Datenschutzhinweise des jeweiligen Anbieters.
          </p>
        ) : (
          <p>
            Course videos are delivered via <strong>Mux, Inc.</strong> (USA).
            During playback, Mux processes technical data (IP address, device
            information, playback statistics) to deliver and quality-assure the
            videos. Individual items may alternatively be embedded from YouTube
            or Vimeo, in which case the respective provider&apos;s privacy
            policy applies.
          </p>
        )}
      </section>

      <section id="live">
        <h2>{de ? "10. Live-Unterricht" : "10. Live classroom"}</h2>
        {de ? (
          <p>
            Live-Unterrichtsstunden (Audio/Video, Chat, Umfragen) laufen über{" "}
            <strong>LiveKit, Inc.</strong> (USA). Verarbeitet werden
            Teilnahme-Zeitpunkte, Chat-Nachrichten und — sofern Sie Kamera oder
            Mikrofon aktivieren — Audio-/Videoströme in Echtzeit.
            Unterrichtsstunden werden derzeit <strong>nicht aufgezeichnet</strong>.
          </p>
        ) : (
          <p>
            Live classes (audio/video, chat, polls) run on{" "}
            <strong>LiveKit, Inc.</strong> (USA). We process join/leave times,
            chat messages, and — if you enable camera or microphone — real-time
            audio/video streams. Classes are currently{" "}
            <strong>not recorded</strong>.
          </p>
        )}
      </section>

      <section id="uploads">
        <h2>{de ? "11. Datei-Uploads" : "11. File uploads"}</h2>
        {de ? (
          <p>
            Von Nutzenden hochgeladene Dateien (z. B. Profilbilder) werden über{" "}
            <strong>UploadThing</strong> (USA) gespeichert und ausgeliefert.
          </p>
        ) : (
          <p>
            Files uploaded by users (e.g. profile pictures) are stored and
            delivered via <strong>UploadThing</strong> (USA).
          </p>
        )}
      </section>

      <section id="payments">
        <h2>{de ? "12. Zahlungsabwicklung" : "12. Payment processing"}</h2>
        {de ? (
          <p>
            Während der Early-Access-Phase ist die Nutzung kostenlos; es werden
            keine Zahlungsdaten erhoben. Sobald kostenpflichtige Angebote
            verfügbar sind, erfolgt die Zahlungsabwicklung über{" "}
            <strong>Stripe Payments Europe, Ltd.</strong> (Irland) bzw. Stripe,
            Inc. (USA). Kreditkartendaten werden dabei ausschließlich von
            Stripe verarbeitet und erreichen unsere Server nicht.
          </p>
        ) : (
          <p>
            During the early-access phase the platform is free of charge and no
            payment data is collected. Once paid offerings are available,
            payments will be processed by{" "}
            <strong>Stripe Payments Europe, Ltd.</strong> (Ireland) / Stripe,
            Inc. (USA). Card data is processed exclusively by Stripe and never
            reaches our servers.
          </p>
        )}
      </section>

      <section id="cookies">
        <h2>{de ? "13. Cookies & Analyse" : "13. Cookies & analytics"}</h2>
        {de ? (
          <p>
            Technisch notwendige Cookies (z. B. Login-Sitzung,
            Spracheinstellung) setzen wir auf Grundlage von § 25 Abs. 2 TDDDG.
            Analyse- und Marketing-Cookies werden nur mit Ihrer Einwilligung
            über den Cookie-Banner gesetzt (§ 25 Abs. 1 TDDDG, Art. 6 Abs. 1
            lit. a DSGVO). Als Analyse-Dienst kann <strong>PostHog</strong>{" "}
            oder <strong>Google Analytics 4</strong> zum Einsatz kommen; ohne
            Ihre Einwilligung bleiben diese Dienste deaktiviert. Ihre Auswahl
            können Sie jederzeit über die Cookie-Einstellungen ändern.
          </p>
        ) : (
          <p>
            Strictly necessary cookies (e.g. login session, language
            preference) are set under § 25(2) German TDDDG. Analytics and
            marketing cookies are set only with your consent via the cookie
            banner (§ 25(1) TDDDG, Art. 6(1)(a) GDPR). <strong>PostHog</strong>{" "}
            or <strong>Google Analytics 4</strong> may be used for analytics;
            without your consent these services remain disabled. You can change
            your choice at any time in the cookie settings.
          </p>
        )}
      </section>

      <section id="transfers">
        <h2>{de ? "14. Drittlandübermittlungen" : "14. International transfers"}</h2>
        {de ? (
          <p>
            Einige der genannten Dienstleister (Cloudflare, Resend, Mux,
            LiveKit, UploadThing, ggf. Stripe und Google) verarbeiten Daten in
            den USA. Die Übermittlung stützt sich auf den
            Angemessenheitsbeschluss zum <strong>EU-US Data Privacy
            Framework</strong>, soweit der Anbieter zertifiziert ist, und
            ergänzend auf <strong>EU-Standardvertragsklauseln</strong> (Art. 46
            DSGVO).
          </p>
        ) : (
          <p>
            Some of the providers named above (Cloudflare, Resend, Mux,
            LiveKit, UploadThing, and where applicable Stripe and Google)
            process data in the USA. Transfers rely on the adequacy decision
            for the <strong>EU-US Data Privacy Framework</strong> where the
            provider is certified, and additionally on{" "}
            <strong>EU Standard Contractual Clauses</strong> (Art. 46 GDPR).
          </p>
        )}
      </section>

      <section id="retention">
        <h2>{de ? "15. Speicherdauer" : "15. Retention"}</h2>
        {de ? (
          <p>
            Kontodaten speichern wir für die Dauer der Kontoführung. Nach
            Löschung des Kontos werden personenbezogene Daten gelöscht, soweit
            keine gesetzlichen Aufbewahrungspflichten (z. B. 6 bzw. 10 Jahre
            nach HGB/AO für Rechnungsdaten) entgegenstehen.
            Einwilligungsnachweise bewahren wir zur Rechenschaftspflicht (Art.
            5 Abs. 2 DSGVO) auf.
          </p>
        ) : (
          <p>
            Account data is stored for as long as the account exists. After
            account deletion, personal data is erased unless statutory
            retention periods apply (e.g. 6 or 10 years under German
            commercial/tax law for invoice data). Consent records are retained
            to meet our accountability obligation (Art. 5(2) GDPR).
          </p>
        )}
      </section>

      <section id="rights">
        <h2>{de ? "16. Ihre Rechte" : "16. Your rights"}</h2>
        {de ? (
          <>
            <p>Sie haben gegenüber uns folgende Rechte:</p>
            <ul>
              <li>Auskunft (Art. 15 DSGVO)</li>
              <li>Berichtigung (Art. 16 DSGVO)</li>
              <li>Löschung (Art. 17 DSGVO)</li>
              <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Widerspruch gegen Verarbeitungen auf Grundlage berechtigter Interessen (Art. 21 DSGVO)</li>
              <li>Widerruf erteilter Einwilligungen mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO)</li>
            </ul>
            <p>
              In den Kontoeinstellungen stehen hierfür die Funktionen „Meine
              Daten exportieren“ und „Konto löschen“ bereit. Außerdem haben Sie
              das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu
              beschweren (Art. 77 DSGVO).
            </p>
          </>
        ) : (
          <>
            <p>You have the following rights:</p>
            <ul>
              <li>Access (Art. 15 GDPR)</li>
              <li>Rectification (Art. 16 GDPR)</li>
              <li>Erasure (Art. 17 GDPR)</li>
              <li>Restriction of processing (Art. 18 GDPR)</li>
              <li>Data portability (Art. 20 GDPR)</li>
              <li>Objection to processing based on legitimate interests (Art. 21 GDPR)</li>
              <li>Withdrawal of consent with effect for the future (Art. 7(3) GDPR)</li>
            </ul>
            <p>
              The account settings provide &quot;Export my data&quot; and
              &quot;Delete my account&quot; for this purpose. You also have the
              right to lodge a complaint with a data-protection supervisory
              authority (Art. 77 GDPR).
            </p>
          </>
        )}
      </section>

      <section id="security">
        <h2>{de ? "17. Datensicherheit" : "17. Data security"}</h2>
        {de ? (
          <p>
            Wir setzen technische und organisatorische Maßnahmen nach Art. 32
            DSGVO ein, u. a. Transportverschlüsselung (TLS), verschlüsselte
            Passwort-Speicherung, Zugriffsbeschränkungen, Protokollierung
            administrativer Vorgänge und regelmäßige, verschlüsselte
            Datensicherungen.
          </p>
        ) : (
          <p>
            We apply technical and organisational measures under Art. 32 GDPR,
            including transport encryption (TLS), encrypted password storage,
            access restrictions, audit logging of administrative actions, and
            regular encrypted backups.
          </p>
        )}
      </section>

      <section id="contact">
        <h2>{de ? "18. Änderungen & Kontakt" : "18. Changes & contact"}</h2>
        {de ? (
          <p>
            Wir passen diese Datenschutzerklärung an, wenn sich die
            Verarbeitungen ändern; maßgeblich ist die jeweils hier
            veröffentlichte Fassung. Bei Fragen zum Datenschutz erreichen Sie
            uns unter{" "}
            <a href={`mailto:${company.email}`}>{company.email}</a>.
          </p>
        ) : (
          <p>
            We update this policy when our processing changes; the version
            published here applies. The <strong>German version of this policy
            is authoritative</strong>. For privacy questions, contact{" "}
            <a href={`mailto:${company.email}`}>{company.email}</a>.
          </p>
        )}

        <p className="mt-8 rounded-md border border-dashed border-muted-foreground/30 p-4 text-xs">
          <strong>{de ? "Hinweis:" : "Note:"}</strong>{" "}
          {de
            ? "Dieses Dokument ist ein Vorentwurf und muss vor dem Produktivstart durch eine auf Datenschutzrecht spezialisierte Kanzlei geprüft und freigegeben werden."
            : "This document is a draft and must be reviewed and approved by counsel specialising in data-protection law before production launch."}
        </p>
      </section>
    </LegalLayout>
  );
}
