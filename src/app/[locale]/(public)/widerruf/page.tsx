import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Widerrufsbelehrung | Schulab",
  description:
    "14-tägiges Widerrufsrecht für Verbraucher nach § 312g BGB. Schulab-Plattform.",
};

const contact = {
  legalName:
    process.env.COMPANY_LEGAL_NAME ?? "Mudita IT Solutions UG (haftungsbeschränkt)",
  addressLine1: process.env.COMPANY_ADDRESS_LINE1 ?? "[Straße und Hausnummer]",
  addressLine2: process.env.COMPANY_ADDRESS_LINE2 ?? "[PLZ Ort]",
  country: process.env.COMPANY_COUNTRY ?? "Deutschland",
  email: process.env.COMPANY_EMAIL ?? "hello@schulab.com",
};

export default function WiderrufPage() {
  return (
    <div className="py-16">
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Widerrufsbelehrung
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Verbraucherinnen und Verbraucher haben das folgende Widerrufsrecht.
        </p>

        <h2 className="mt-8 mb-3 text-xl font-semibold">Widerrufsrecht</h2>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen
          diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn
          Tage ab dem Tag des Vertragsschlusses.
        </p>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          Um Ihr Widerrufsrecht auszuüben, müssen Sie uns ({contact.legalName},
          {" "}
          {contact.addressLine1}, {contact.addressLine2}, {contact.country},
          E-Mail: {contact.email}) mittels einer eindeutigen Erklärung (z. B.
          ein mit der Post versandter Brief oder eine E-Mail) über Ihren
          Entschluss, diesen Vertrag zu widerrufen, informieren. Zur Wahrung
          der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die
          Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.
        </p>

        <h2 className="mt-8 mb-3 text-xl font-semibold">
          Folgen des Widerrufs
        </h2>
        <p className="mb-4 leading-relaxed text-muted-foreground">
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

        <h2 className="mt-8 mb-3 text-xl font-semibold">
          Vorzeitiges Erlöschen des Widerrufsrechts bei digitalen Inhalten
        </h2>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          Das Widerrufsrecht erlischt bei Verträgen zur Lieferung von nicht
          auf einem körperlichen Datenträger befindlichen digitalen Inhalten
          (z. B. Online-Kurse, Streaming-Videos), wenn wir mit der Ausführung
          des Vertrags begonnen haben, nachdem Sie ausdrücklich zugestimmt
          haben, dass wir mit der Ausführung des Vertrags vor Ablauf der
          Widerrufsfrist beginnen, und Sie Ihre Kenntnis davon bestätigt
          haben, dass Sie durch Ihre Zustimmung mit Beginn der Ausführung des
          Vertrags Ihr Widerrufsrecht verlieren.
        </p>

        <h2 className="mt-8 mb-3 text-xl font-semibold">Muster-Widerrufsformular</h2>
        <p className="mb-2 leading-relaxed text-muted-foreground">
          (Wenn Sie den Vertrag widerrufen wollen, füllen Sie dieses Formular
          aus und senden Sie es zurück.)
        </p>
        <div className="mb-4 rounded-md border border-muted-foreground/20 bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground">
          <p>An: {contact.legalName}</p>
          <p>{contact.addressLine1}</p>
          <p>{contact.addressLine2}</p>
          <p>E-Mail: {contact.email}</p>
          <p className="mt-3">
            Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen
            Vertrag über den Kauf der folgenden Waren (*) / die Erbringung der
            folgenden Dienstleistung (*)
          </p>
          <p className="mt-3">Bestellt am (*) / erhalten am (*)</p>
          <p>Name des/der Verbraucher(s)</p>
          <p>Anschrift des/der Verbraucher(s)</p>
          <p>Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier)</p>
          <p>Datum</p>
          <p className="mt-3 text-xs">(*) Unzutreffendes streichen.</p>
        </div>

        <p className="mt-8 rounded-md border border-dashed border-muted-foreground/30 p-4 text-xs text-muted-foreground">
          Hinweis: Dieser Text orientiert sich an der gesetzlichen
          Musterbelehrung, ist jedoch ein Platzhalter und muss vor dem
          Produktivbetrieb von einer Anwältin bzw. einem Anwalt geprüft und
          freigegeben werden.
        </p>
      </section>
    </div>
  );
}
