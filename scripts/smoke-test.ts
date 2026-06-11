// Production smoke test — the critical public surface that must be green before and
// after every deploy, and on launch morning. Pure HTTP, no dependencies, no auth: it
// hits the live site exactly as a visitor / crawler / payment provider would.
//
// What it canNOT cover (browser + session + camera required): the authenticated
// journey (signup → consent → enrol → learn → quiz → certificate) and live A/V.
// Those are the MANUAL checklist in docs/SMOKE-RUNBOOK.md — run them by hand.
//
// Usage:
//   npm run smoke                              # against https://schulab.com
//   BASE_URL=https://edu.mudita-solutions.de npm run smoke
//   npm run smoke -- --verbose                 # print every check
//
// Exit code 0 = all required checks passed; 1 = at least one required check failed
// (so it can gate a deploy in CI/cron).

const BASE = (process.env.BASE_URL ?? "https://schulab.com").replace(/\/$/, "");
const VERBOSE = process.argv.includes("--verbose");

type Check = {
  name: string;
  required: boolean;
  run: () => Promise<string>; // returns a short detail string; throws on failure
};

async function fetchText(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, { redirect: "manual", ...init });
  const body = await res.text().catch(() => "");
  return { res, body };
}

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

const checks: Check[] = [
  {
    name: "Health endpoint returns ok + db ok",
    required: true,
    run: async () => {
      const { res, body } = await fetchText("/api/health");
      assert(res.status === 200, `expected 200, got ${res.status}`);
      const json = JSON.parse(body);
      assert(json.status === "ok", `status=${json.status}`);
      assert(json.db === "ok", `db=${json.db}`);
      return `db ok, latency ${json.latencyMs}ms`;
    },
  },
  {
    name: "Homepage renders (200, has brand)",
    required: true,
    run: async () => {
      const { res, body } = await fetchText("/");
      assert(res.status === 200, `expected 200, got ${res.status}`);
      assert(body.includes("Schulab"), "Schulab brand not found in HTML");
      return "200, brand present";
    },
  },
  {
    name: "Security headers present (HSTS + CSP)",
    required: true,
    run: async () => {
      const { res } = await fetchText("/");
      assert(!!res.headers.get("strict-transport-security"), "HSTS missing");
      const csp =
        res.headers.get("content-security-policy") ??
        res.headers.get("content-security-policy-report-only");
      assert(!!csp, "CSP header missing");
      return res.headers.get("content-security-policy")
        ? "HSTS + CSP (enforcing)"
        : "HSTS + CSP (report-only)";
    },
  },
  {
    name: "Public pages reachable (courses, pricing, tutors)",
    required: true,
    run: async () => {
      for (const p of ["/courses", "/pricing", "/tutors"]) {
        const { res } = await fetchText(p);
        assert(res.status === 200, `${p} → ${res.status}`);
      }
      return "courses, pricing, tutors all 200";
    },
  },
  {
    name: "German legal pack live (Impressum, AGB, Widerruf, Datenschutz)",
    required: true,
    run: async () => {
      const { body } = await fetchText("/de/privacy");
      assert(body.includes("Datenschutzerklärung"), "Datenschutzerklärung not German");
      for (const p of ["/impressum", "/agb", "/widerruf"]) {
        const { res } = await fetchText(p);
        assert(res.status === 200, `${p} → ${res.status}`);
      }
      return "all legal pages 200, privacy is German on /de";
    },
  },
  {
    name: "Locale routing (de + ar prefixes, RTL on ar)",
    required: true,
    run: async () => {
      const de = await fetchText("/de");
      assert(de.res.status === 200, `/de → ${de.res.status}`);
      const ar = await fetchText("/ar");
      assert(ar.res.status === 200, `/ar → ${ar.res.status}`);
      assert(/dir="rtl"|dir='rtl'/.test(ar.body), "ar page is not RTL");
      return "de 200, ar 200 + RTL";
    },
  },
  {
    name: "SEO surface (sitemap, robots, OG image)",
    required: true,
    run: async () => {
      const sm = await fetchText("/sitemap.xml");
      assert(sm.res.status === 200 && sm.body.includes("schulab.com"), "sitemap bad");
      const rb = await fetchText("/robots.txt");
      assert(rb.res.status === 200 && /Sitemap:/i.test(rb.body), "robots bad");
      const og = await fetchText("/opengraph-image");
      assert(og.res.status === 200, `opengraph-image → ${og.res.status}`);
      return "sitemap + robots + OG image all 200";
    },
  },
  {
    name: "Auth pages reachable (login, register)",
    required: true,
    run: async () => {
      for (const p of ["/login", "/register"]) {
        const { res } = await fetchText(p);
        assert(res.status === 200, `${p} → ${res.status}`);
      }
      return "login + register 200";
    },
  },
  {
    name: "NextAuth providers endpoint responds",
    required: true,
    run: async () => {
      const { res, body } = await fetchText("/api/auth/providers");
      assert(res.status === 200, `expected 200, got ${res.status}`);
      const json = JSON.parse(body);
      assert(!!json.credentials || !!json.google, "no auth providers configured");
      return `providers: ${Object.keys(json).join(", ")}`;
    },
  },
  {
    name: "Old domain 301-redirects to schulab.com",
    required: false, // skip-friendly: only meaningful when testing the canonical domain
    run: async () => {
      const res = await fetch("https://edu.mudita-solutions.de/de/courses", {
        redirect: "manual",
      }).catch(() => null);
      if (!res) return "skipped (old domain unreachable)";
      assert([301, 308].includes(res.status), `expected 301/308, got ${res.status}`);
      const loc = res.headers.get("location") ?? "";
      assert(loc.includes("schulab.com"), `location=${loc}`);
      return `301 → ${loc}`;
    },
  },
];

async function main() {
  console.log(`\nSmoke test → ${BASE}\n${"─".repeat(48)}`);
  let failed = 0;
  let passed = 0;
  let skipped = 0;

  for (const check of checks) {
    try {
      const detail = await check.run();
      passed++;
      if (VERBOSE || true) console.log(`  ✓ ${check.name}${detail ? ` — ${detail}` : ""}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (check.required) {
        failed++;
        console.log(`  ✗ ${check.name} — ${msg}`);
      } else {
        skipped++;
        console.log(`  ⚠ ${check.name} — ${msg} (non-required)`);
      }
    }
  }

  console.log(`${"─".repeat(48)}`);
  console.log(`${passed} passed · ${failed} failed · ${skipped} non-required\n`);
  if (failed > 0) {
    console.log("FAIL — do not proceed with launch/deploy until green.\n");
    process.exit(1);
  }
  console.log("PASS — public surface healthy. Run the MANUAL authenticated journey");
  console.log("from docs/SMOKE-RUNBOOK.md before sign-off.\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
