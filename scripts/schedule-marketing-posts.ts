// Pushes the launch content bank (marketing/content/posts.json) into a
// self-hosted Postiz instance via its Public API, scheduling every post on its
// calendar date. Idempotency is NOT provided by the API — run --execute once;
// re-running schedules duplicates (clean up in the Postiz calendar UI).
//
// Usage:
//   POSTIZ_API_URL=https://social.example.com/api/public/v1 \
//   POSTIZ_API_KEY=... \
//   npm run marketing:schedule                  # DRY RUN (default): prints the plan
//   npm run marketing:schedule -- --execute     # actually schedules
//   npm run marketing:schedule -- --execute --limit 1   # schedule a single post to test
//   npm run marketing:schedule -- --include-gated       # include launch-day gated posts
//
// Env:
//   POSTIZ_API_URL  — Postiz BACKEND public-API base, ending in /public/v1.
//                     Single-container installs expose it under the frontend
//                     origin + /api, e.g. https://social.example.com/api/public/v1
//   POSTIZ_API_KEY  — Settings → Public API in the Postiz UI.
//
// Gated posts (launch-day P10/P11) are skipped by default on purpose: they must
// only go out after the platform is confirmed healthy on launch morning.

import { readFileSync } from "node:fs";
import { join } from "node:path";

interface BankPost {
  id: string;
  date: string;
  gated: boolean;
  channels: string[];
  localePolicy: "en-only" | "all";
  visual: string;
  content: Record<string, string>;
}

interface Bank {
  campaign: string;
  timezone: string;
  posts: BankPost[];
}

interface Integration {
  id: string;
  name?: string;
  identifier?: string;
  providerIdentifier?: string;
}

const API_URL = (process.env.POSTIZ_API_URL ?? "").replace(/\/$/, "");
const API_KEY = process.env.POSTIZ_API_KEY ?? "";
const EXECUTE = process.argv.includes("--execute");
const INCLUDE_GATED = process.argv.includes("--include-gated");
const limitIdx = process.argv.indexOf("--limit");
const LIMIT = limitIdx > -1 ? Number(process.argv[limitIdx + 1]) : Infinity;

const REGISTER_PATH: Record<string, string> = {
  en: "/register",
  de: "/de/register",
  ar: "/ar/register",
};

function utmLink(locale: string, channel: string, campaign: string): string {
  const path = REGISTER_PATH[locale] ?? REGISTER_PATH.en;
  return `https://schulab.com${path}?utm_source=${channel}&utm_medium=social&utm_campaign=${campaign}`;
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: API_KEY,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${init?.method ?? "GET"} ${path} → ${res.status} ${body.slice(0, 300)}`);
  }
  return (await res.json()) as T;
}

function matchIntegration(channel: string, integrations: Integration[]): Integration | undefined {
  const want = channel.toLowerCase();
  return integrations.find((integration) => {
    const haystack = `${integration.identifier ?? ""} ${integration.providerIdentifier ?? ""} ${integration.name ?? ""}`.toLowerCase();
    return haystack.includes(want);
  });
}

async function main() {
  if (!API_URL || !API_KEY) {
    console.error("POSTIZ_API_URL and POSTIZ_API_KEY are required. See header comment.");
    process.exit(1);
  }

  const bank: Bank = JSON.parse(
    readFileSync(join(process.cwd(), "marketing/content/posts.json"), "utf8"),
  );

  console.log(`[postiz] checking connection + connected channels at ${API_URL}`);
  const integrations = await api<Integration[]>("/integrations");
  console.log(`[postiz] ${integrations.length} connected channel(s):`);
  for (const integration of integrations) {
    console.log(`  - ${integration.name ?? "?"} (${integration.identifier ?? integration.providerIdentifier ?? "?"}) id=${integration.id}`);
  }

  const now = Date.now();
  let scheduled = 0;
  let planned = 0;

  for (const post of bank.posts) {
    if (post.gated && !INCLUDE_GATED) {
      console.log(`[skip] ${post.id} — gated (launch-day, release manually)`);
      continue;
    }
    if (new Date(post.date).getTime() <= now) {
      console.log(`[skip] ${post.id} — date ${post.date} is in the past`);
      continue;
    }

    const locales = post.localePolicy === "all" ? Object.keys(post.content) : ["en"];

    for (const [localeIndex, locale] of locales.entries()) {
      const template = post.content[locale];
      if (!template) continue;

      // Stagger locale variants by 20 min so the same channel isn't hit at
      // the exact same minute with near-identical content.
      const date = new Date(new Date(post.date).getTime() + localeIndex * 20 * 60 * 1000);

      for (const channel of post.channels) {
        const integration = matchIntegration(channel, integrations);
        if (!integration) {
          console.log(`[warn] ${post.id}/${locale} — no connected channel matches "${channel}", skipping`);
          continue;
        }

        const content = template.replaceAll("{{link}}", utmLink(locale, channel, bank.campaign));
        planned++;

        if (planned > LIMIT) continue;

        if (!EXECUTE) {
          console.log(`[plan] ${post.id}/${locale} → ${channel} @ ${date.toISOString()}`);
          continue;
        }

        await api("/posts", {
          method: "POST",
          body: JSON.stringify({
            type: "schedule",
            date: date.toISOString(),
            shortLink: false,
            tags: [],
            posts: [
              {
                integration: { id: integration.id },
                value: [{ content }],
              },
            ],
          }),
        });
        scheduled++;
        console.log(`[ok]   ${post.id}/${locale} → ${channel} @ ${date.toISOString()}`);
        // Be gentle with the API.
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }

  console.log(
    EXECUTE
      ? `\nDone — scheduled ${scheduled} post(s). Review them in the Postiz calendar.`
      : `\nDRY RUN — ${planned} post(s) would be scheduled. Re-run with --execute to schedule.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
