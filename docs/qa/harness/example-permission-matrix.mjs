// Role × protected-URL matrix — checks direct-URL restrictions per role.
// Requires save-states.mjs to have run first.
// Usage: NODE_PATH=$(npm root -g) node docs/qa/harness/example-permission-matrix.mjs
import { chromium } from 'playwright';
import { BASE, STATE } from './harness.mjs';

const URLS = [
  ['/en/admin', 'ADMIN'], ['/en/admin/users', 'ADMIN'], ['/en/admin/settings', 'ADMIN'],
  ['/en/tutor', 'TUTOR'], ['/en/tutor/students', 'TUTOR'],
  ['/en/parent', 'PARENT'], ['/en/parent/children', 'PARENT'],
  ['/en/student', 'STUDENT'], ['/en/student/certificates', 'STUDENT'],
];
const ROLES = { admin: 'ADMIN', tutor: 'TUTOR', aisha: 'STUDENT', sara: 'PARENT' };

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
for (const [who, role] of Object.entries(ROLES)) {
  const ctx = await browser.newContext({ storageState: `${STATE}/${who}.json`, viewport: { width: 1200, height: 800 } });
  const page = await ctx.newPage();
  console.log(`\n### ${who} (${role})`);
  for (const [url, owner] of URLS) {
    const resp = await page.goto(`${BASE}${url}`, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => null);
    await page.waitForTimeout(300);
    const finalUrl = page.url().replace(BASE, '');
    const denied = finalUrl.includes('/login') || finalUrl !== url.replace('', '');
    const expect = role === owner ? 'ALLOW' : 'DENY';
    console.log(`  ${String(resp?.status()).padEnd(4)} ${url.padEnd(30)} -> ${finalUrl.padEnd(24)} [expect ${expect}]`);
  }
  await ctx.close();
}
await browser.close();
