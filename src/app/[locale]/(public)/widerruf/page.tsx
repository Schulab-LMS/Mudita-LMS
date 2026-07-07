import type { Metadata } from "next";
import {
  LegalLayout,
  type LegalSection,
} from "@/components/shared/legal-layout";

export const metadata: Metadata = {
  title: "Widerrufsbelehrung",
  description:
    "14-tägiges Widerrufsrecht für Verbraucher nach § 312g BGB. Schulab-Plattform.",
};

const contact = {
  legalName:
    process.env.COMPANY_LEGAL_NAME ??
    "Mudita IT Solutions UG (haftungsbeschränkt)",
  addressLine1:
    process.env.COMPANY_ADDRESS_LINE1 ?? "[Straße und Hausnummer]",
  addressLine2: process.env.COMPANY_ADDRESS_LINE2 ?? "[PLZ Ort]",
  country: process.env.COMPANY_COUNTRY ?? "Deutschland",
  email: process.env.COMPANY_EMAIL ?? "hello@schulab.com",
};

const sections: LegalSection[] = [
  { id: "widerrufsrecht", label: "Widerrufsrecht" },
  { id: "folgen", label: "Folgen des Widerrufs" },
  { id: "digital", label: "Erlöschen bei digitalen Inhalten" },
  { id: "muster", label: "Muster-Widerrufsformular" },
];

export default function WiderrufPage() {
  return (
    <LegalLayout
      title="Widerrufsbelehrung"
      description="Verbraucherinnen und Verbraucher haben das folgende Widerrufsrecht."
      sections={sections}
    >
      <section id="widerrufsrecht">
        <h2>Widerrufsrecht</h2>
        <p>
          Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen
          diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn
          Tage ab dem Tag des Vertragsschlusses.
        </p>
        <p>
          Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (
          {contact.legalName}, {contact.addressLine1}, {contact.addressLine2},{" "}
          {contact.country}, E-Mail:{" "}
          <a href={`mailto:${contact.email}`}>{contact.email}</a>) mittels
          einer eindeutigen Erklärung (z. B. ein mit der Post versandter
          Brief oder eine E-Mail) über Ihren Entschluss, diesen Vertrag zu
          widerrufen, informieren. Zur Wahrung der Widerrufsfrist reicht es
          aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts
          vor Ablauf der Widerrufsfrist absenden.
        </p>
      </section>

      <section id="folgen">
        <h2>Folgen des Widerrufs</h2>
        <p>
          Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen,
          die wir von Ihnen erhalten haben, unverzüglich und spätestens
          binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die
          Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen
          ist. Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel,
          das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei
          denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in
          keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte
          berechnet.
        </p>
      </section>

      <section id="digital">
        <h2>Vorzeitiges Erlöschen des Widerrufsrechts bei digitalen Inhalten</h2>
        <p>
          Das Widerrufsrecht erlischt bei Verträgen zur Lieferung von nicht
          auf einem körperlichen Datenträger befindlichen digitalen Inhalten
          (z. B. Online-Kurse, Streaming-Videos), wenn wir mit der Ausführung
          des Vertrags begonnen haben, nachdem Sie ausdrücklich zugestimmt
          haben, dass wir mit der Ausführung des Vertrags vor Ablauf der
          Widerrufsfrist beginnen, und Sie Ihre Kenntnis davon bestätigt
          haben, dass Sie durch Ihre Zustimmung mit Beginn der Ausführung des
          Vertrags Ihr Widerrufsrecht verlieren.
        </p>
      </section>

      <section id="muster">
        <h2>Muster-Widerrufsformular</h2>
        <p>
          (Wenn Sie den Vertrag widerrufen wollen, füllen Sie dieses Formular
          aus und senden Sie es zurück.)
        </p>
        <div className="my-4 rounded-xl border border-border bg-muted/40 p-5 text-sm leading-relaxed">
          <p>
            <strong>An:</strong> {contact.legalName}
            <br />
            {contact.addressLine1}
            <br />
            {contact.addressLine2}
            <br />
            E-Mail: {contact.email}
          </p>
          <p className="mt-4">
            Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen
            Vertrag über den Kauf der folgenden Waren (*) / die Erbringung der
            folgenden Dienstleistung (*)
          </p>
          <p className="mt-4">
            Bestellt am (*) / erhalten am (*)
            <br />
            Name des/der Verbraucher(s)
            <br />
            Anschrift des/der Verbraucher(s)
            <br />
            Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier)
            <br />
            Datum
          </p>
          <p className="mt-4 text-xs">(*) Unzutreffendes streichen.</p>
        </div>

        <p className="mt-6 rounded-md border border-dashed border-muted-foreground/30 p-4 text-xs">
          <strong>Hinweis:</strong> Dieser Text orientiert sich an der
          gesetzlichen Musterbelehrung, ist jedoch ein Platzhalter und muss
          vor dem Produktivbetrieb von einer Anwältin bzw. einem Anwalt
          geprüft und freigegeben werden.
        </p>
      </section>
    </LegalLayout>
  );
}
