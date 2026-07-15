// Reusable Playwright helpers for the Schulab E2E QA harness.
// Configure via env: QA_BASE (default http://localhost:3000), QA_OUT (default ./qa-out).
// Requires `playwright` resolvable (project dep or NODE_PATH=$(npm root -g)).
import { chromium } from 'playwright';
import fs from 'node:fs';

export const BASE = process.env.QA_BASE || 'http://localhost:3000';
export const OUT = process.env.QA_OUT || './qa-out';
export const SHOTS = `${OUT}/shots`;
export const STATE = `${OUT}/state`;
fs.mkdirSync(SHOTS, { recursive: true });
fs.mkdirSync(STATE, { recursive: true });

// All seeded test accounts share password `password123`.
export const ACCOUNTS = {
  admin: { email: 'admin@schulab.com',  pw: 'password123', role: 'ADMIN'   },
  tutor: { email: 'marcus@example.com', pw: 'password123', role: 'TUTOR'   },
  aisha: { email: 'aisha@example.com',  pw: 'password123', role: 'STUDENT' },
  liam:  { email: 'liam@example.com',   pw: 'password123', role: 'STUDENT' },
  sara:  { email: 'sara@example.com',   pw: 'password123', role: 'PARENT'  },
};

export async function makeSession({ mobile = false, storageState } = {}) {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({
    ...(mobile
      ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }
      : { viewport: { width: 1300, height: 900 } }),
    ...(storageState ? { storageState } : {}),
  });
  const events = { consoleErrors: [], pageErrors: [], failedRequests: [], badResponses: [] };
  return { browser, context, events };
}

export function wirePage(page, events) {
  page.on('console', m => { if (m.type() === 'error') events.consoleErrors.push(m.text()); });
  page.on('pageerror', e => events.pageErrors.push(String(e?.message || e)));
  page.on('requestfailed', r => events.failedRequests.push(`${r.method()} ${r.url()} :: ${r.failure()?.errorText}`));
  page.on('response', r => { if (r.status() >= 500) events.badResponses.push(`${r.status()} ${r.url()}`); });
}

export async function dismissCookies(page) {
  try {
    const b = page.getByRole('button', { name: /accept all|قبول|akzeptieren/i }).first();
    if (await b.isVisible({ timeout: 1200 })) await b.click();
  } catch {}
}

export async function login(page, events, who, { email, pw } = {}) {
  const a = ACCOUNTS[who] || { email, pw };
  await page.goto(`${BASE}/en/login`, { waitUntil: 'domcontentloaded' });
  await dismissCookies(page);
  await page.fill('input[type="email"], input[name="email"]', email || a.email);
  await page.fill('input[type="password"], input[name="password"]', pw || a.pw);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2500);
  await page.waitForLoadState('networkidle').catch(() => {});
  return page.url();
}

export async function shot(page, name) {
  const p = `${SHOTS}/${name}.png`;
  await page.screenshot({ path: p }).catch(() => {});
  return p;
}

export async function probe(page) {
  return {
    url: page.url(),
    title: await page.title().catch(() => ''),
    h1: await page.locator('h1').allInnerTexts().catch(() => []),
    bodyText: (await page.locator('body').innerText().catch(() => '')).slice(0, 1200),
  };
}

export function summarize(events) {
  const u = a => [...new Set(a)].slice(0, 40);
  return {
    consoleErrors: u(events.consoleErrors), pageErrors: u(events.pageErrors),
    failedRequests: u(events.failedRequests), badResponses: u(events.badResponses),
  };
}
