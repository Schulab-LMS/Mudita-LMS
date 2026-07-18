// Log in as each seeded role and persist an authenticated storageState to QA_OUT/state.
// Usage: NODE_PATH=$(npm root -g) node docs/qa/harness/save-states.mjs
import { makeSession, wirePage, login, ACCOUNTS, STATE } from './harness.mjs';

for (const who of Object.keys(ACCOUNTS)) {
  const { browser, context, events } = await makeSession();
  const page = await context.newPage();
  wirePage(page, events);
  const url = await login(page, events, who);
  await context.storageState({ path: `${STATE}/${who}.json` });
  console.log(`${who.padEnd(6)} ${url.includes('/login') ? 'LOGIN FAILED' : 'OK'} -> ${url}`);
  await browser.close();
}
