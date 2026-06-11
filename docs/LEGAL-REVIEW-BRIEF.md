# Briefing für die anwaltliche Prüfung / Legal Review Brief

> Zweck: Einer auf E-Commerce-/EdTech-/Datenschutzrecht spezialisierten Kanzlei in
> kurzer Zeit alles geben, was sie für die Prüfung der Rechtstexte braucht.
> Ziel-Launch: **25. Juni 2026** (Soft Launch, Einladungs-Kohorte).
> English summary at the end.

## 1. Das Produkt in 5 Sätzen

Schulab (https://schulab.com) ist eine Lernplattform für MINT-Bildung für Kinder und
Jugendliche von 3–18 Jahren (Betreiber: Mudita IT Solutions UG, Deutschland).
Funktionen: interaktive Online-Kurse, Quizze, Zertifikate, Live-Unterricht mit Tutoren
(Audio/Video/Chat), Eltern-Dashboard, Gamification. Sprachen: Deutsch, Englisch,
Arabisch. **In der Launch-Phase ist die Nutzung vollständig kostenlos** („Early
Access"); Bezahlfunktionen (Abos über Stripe) sind technisch deaktiviert und werden
erst später eingeführt. Zielmärkte: Deutschland sowie arabischsprachige Nutzer.

## 2. Zu prüfende Dokumente (alle live auf schulab.com)

| Dokument | URL | Status |
|---|---|---|
| Impressum | /impressum | Env-gesteuert; Unternehmensdaten werden noch eingetragen |
| AGB | /agb | Deutscher Entwurf inkl. Early-Access-Klauseln (§ 2, § 4, § 6) |
| Widerrufsbelehrung | /widerruf | Orientiert an gesetzlicher Musterbelehrung, inkl. Erlöschens-Klausel für digitale Inhalte + Muster-Formular |
| Datenschutzerklärung | /privacy (de) | Neu verfasst (11.06.2026), deutsch maßgeblich, englische Fassung vorhanden |
| Terms of Service (EN) | /terms | Englische Fassung für internationale Nutzer |
| Cookie-Banner | sitewide | Kategorien: notwendig / Analyse / Marketing |

## 3. Datenverarbeitung (für die DSE-Prüfung)

**Auftragsverarbeiter / Empfänger:**

| Dienst | Zweck | Sitz / Drittland |
|---|---|---|
| Hetzner Online GmbH | Hosting (App + Datenbank + Backups) | DE/EU |
| Cloudflare, Inc. | CDN / DDoS-Schutz / TLS-Proxy | USA (DPF) |
| Resend, Inc. | Transaktions- & Marketing-E-Mails | USA |
| Mux, Inc. | Kursvideo-Streaming | USA |
| LiveKit, Inc. | Live-Unterricht (WebRTC A/V, Chat) — keine Aufzeichnung | USA |
| UploadThing (Pingdom Labs) | Datei-Uploads (Profilbilder) | USA |
| Google Ireland Ltd. | Optionaler Login („Sign in with Google") | IE/USA |
| Stripe Payments Europe | Zahlungen — **derzeit deaktiviert** | IE/USA |
| PostHog / Google Analytics 4 | Analyse — **nur nach Einwilligung, derzeit deaktiviert** | USA |

**Kinderdaten:** Schwellenwert 16 Jahre (konfiguriert, § Art. 8 DSGVO / GDPR-K).
Technisch erzwungen: Minderjährige ohne dokumentierte elterliche Einwilligung können
sich nicht einschreiben (append-only Einwilligungs-Ledger mit Zeitstempel, Version,
erteilender Person; Widerruf = neuer Ledger-Eintrag). Geburtsdatum wird bei Onboarding
erhoben; ohne Geburtsdatum kein Zugang zu Inhalten.

## 4. Konkrete Prüffragen an die Kanzlei

1. **AGB**: Reichen die Early-Access-Klauseln (unentgeltliche Phase, Ankündigung
   kostenpflichtiger Angebote) aus? Verbraucherwirksamkeit der Haftungsklausel (§ 8)?
   Minderjährige als Vertragspartner vs. Eltern als Vertragspartner — aktuelle
   Konstruktion: Konto kann durch Minderjährige mit elterlicher Einwilligung oder
   durch Eltern (Eltern-Dashboard, Kind-Konten) genutzt werden.
2. **Widerruf**: Belehrung korrekt für die kostenlose Phase? Vorbereitung der
   Checkout-Einwilligung (Erlöschen bei digitalen Inhalten) für die spätere
   Bezahlphase — Formulierungsvorschlag erbeten.
3. **Datenschutzerklärung**: Vollständigkeit der Empfängerliste und Rechtsgrundlagen;
   US-Transfers (DPF-Zertifizierungsstatus je Anbieter prüfen); Formulierung zu
   Kinderdaten; TDDDG-Verweise korrekt?
4. **Impressum**: VSBG-Hinweis (derzeit: keine Teilnahme an Verbraucherschlichtung) —
   bestätigen. OS-Plattform-Hinweis erforderlich?
5. **Cookie-Banner**: Kategorien & Einwilligungsmechanik ausreichend (Opt-in vor
   Setzen nicht-notwendiger Cookies ist technisch umgesetzt)?
6. **Marketing-E-Mails**: Double-Opt-in-Pflicht? (Derzeit: Einwilligung wird im
   Konto erfasst; E-Mail-Verifizierung des Kontos ist vorgeschaltet.)

## 5. Was NICHT zu prüfen ist (bewusst verschoben)

- Stripe-/Bezahl-Flows, Preisdarstellung, Button-Lösung („zahlungspflichtig
  bestellen") — Bezahlfunktion ist deaktiviert; Prüfung folgt vor deren Aktivierung.
- Aufzeichnung von Live-Stunden — findet nicht statt.

---

## English summary

Schulab is a German-operated STEM learning platform for ages 3–18 (DE/EN/AR),
launching June 25, 2026 as a **free early-access beta** (payments technically
disabled). Documents to review: Impressum, AGB (German ToS, incl. new early-access
clauses), Widerrufsbelehrung, the rewritten bilingual privacy policy (German
authoritative), the English ToS, and the cookie banner. Children's data: 16-year
threshold with technically enforced, audit-logged parental consent. Processor list and
specific review questions above. Payment flows are out of scope until paid offerings
are switched on.
