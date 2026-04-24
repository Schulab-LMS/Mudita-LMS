import {
  Document,
  Font,
  Page,
  renderToBuffer,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

// Disable hyphenation — certificate body is short, hyphenated names look
// worse than a single long line that might overflow (which we guard with
// maxWidth instead).
Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#f8f9fa",
    padding: 18,
    fontFamily: "Helvetica",
  },
  frame: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderWidth: 3,
    borderColor: "#1a365d",
    borderRadius: 4,
    padding: 6,
  },
  innerFrame: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#bee3f8",
    borderRadius: 2,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: {
    fontSize: 14,
    color: "#2b6cb0",
    letterSpacing: 6,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    marginBottom: 12,
  },
  title: {
    fontSize: 38,
    color: "#1a365d",
    marginBottom: 6,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 11,
    color: "#718096",
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 36,
  },
  presentedTo: {
    fontSize: 10,
    color: "#a0aec0",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 10,
  },
  studentName: {
    fontSize: 32,
    color: "#2d3748",
    fontStyle: "italic",
    paddingBottom: 8,
    marginBottom: 28,
    borderBottomWidth: 2,
    borderBottomColor: "#bee3f8",
    minWidth: 360,
    textAlign: "center",
  },
  courseLabel: {
    fontSize: 10,
    color: "#a0aec0",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 8,
  },
  courseName: {
    fontSize: 20,
    color: "#2b6cb0",
    fontFamily: "Helvetica-Bold",
    marginBottom: 36,
    maxWidth: 540,
    textAlign: "center",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    maxWidth: 640,
    marginTop: 8,
  },
  footerItem: { alignItems: "center", minWidth: 180 },
  footerValue: { fontSize: 12, color: "#4a5568", marginBottom: 4 },
  footerLine: {
    borderTopWidth: 1,
    borderTopColor: "#cbd5e0",
    width: 180,
    marginBottom: 6,
  },
  footerLabel: {
    fontSize: 9,
    color: "#a0aec0",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  verification: {
    position: "absolute",
    bottom: 26,
    right: 40,
    fontSize: 8,
    color: "#a0aec0",
    fontFamily: "Courier",
  },
});

export type CertificatePdfProps = {
  studentName: string;
  courseTitle: string;
  issuedAt: Date;
  code: string;
  verificationUrl: string;
  dateLocale?: string;
};

// Landscape A4 certificate. Kept in a .tsx module so the PDF template is
// reviewable as JSX in diffs, but avoid JSX-in-text to minimise renderer
// surprises — the react-pdf renderer uses its own element set, not HTML.
export function CertificatePdf(props: CertificatePdfProps) {
  const formattedDate = new Intl.DateTimeFormat(props.dateLocale ?? "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(props.issuedAt);

  return (
    <Document
      title={`Certificate — ${props.courseTitle}`}
      author="Schulab"
      subject="Certificate of Completion"
    >
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.frame}>
          <View style={styles.innerFrame}>
            <Text style={styles.brand}>Schulab</Text>
            <Text style={styles.title}>Certificate of Completion</Text>
            <Text style={styles.subtitle}>This is to certify that</Text>
            <Text style={styles.presentedTo}>Presented to</Text>
            <Text style={styles.studentName}>{props.studentName}</Text>
            <Text style={styles.courseLabel}>Has successfully completed</Text>
            <Text style={styles.courseName}>{props.courseTitle}</Text>
            <View style={styles.footerRow}>
              <View style={styles.footerItem}>
                <Text style={styles.footerValue}>{formattedDate}</Text>
                <View style={styles.footerLine} />
                <Text style={styles.footerLabel}>Date of Completion</Text>
              </View>
              <View style={styles.footerItem}>
                <Text style={styles.footerValue}>{props.code}</Text>
                <View style={styles.footerLine} />
                <Text style={styles.footerLabel}>Certificate ID</Text>
              </View>
            </View>
          </View>
        </View>
        <Text style={styles.verification}>Verify at {props.verificationUrl}</Text>
      </Page>
    </Document>
  );
}

// Convenience wrapper so API route handlers (which cannot be .tsx files
// in Next.js App Router) can render the certificate without embedding JSX.
export function renderCertificateBuffer(props: CertificatePdfProps) {
  return renderToBuffer(<CertificatePdf {...props} />);
}
