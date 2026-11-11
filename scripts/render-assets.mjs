// Renders the catalogue and hero images with the site's own 3D stage, in headless Edge or Chrome,
// and saves them to public/renders. Run `npm run dev -- -p 3100` first, then `npm run renders`.
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

const SITE = process.env.SITE ?? 'http://localhost:3100';
const BROWSER = process.env.BROWSER ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const PORT = 9333;
const OUT = new URL('../public/renders/', import.meta.url);

const profile = await mkdtemp(join(tmpdir(), 'filum-render-'));
const browser = spawn(
  BROWSER,
  ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-first-run', 'about:blank'],
  { stdio: 'ignore' },
);

try {
  let ready = false;
  for (let i = 0; i < 50 && !ready; i++) {
    ready = await fetch(`http://127.0.0.1:${PORT}/json/version`).then((r) => r.ok, () => false);
    if (!ready) await sleep(200);
  }
  if (!ready) throw new Error(`no browser on port ${PORT}: set BROWSER to an Edge or Chrome executable`);

  const target = await (await fetch(`http://127.0.0.1:${PORT}/json/new?${SITE}/render`, { method: 'PUT' })).json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });
  let id = 0;
  const pending = new Map();
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    pending.get(m.id)?.(m);
    pending.delete(m.id);
  };
  const send = (method, params = {}) =>
    new Promise((resolve) => {
      pending.set(++id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });

  let renders = null;
  for (let i = 0; i < 120 && !renders; i++) {
    await sleep(500);
    const res = await send('Runtime.evaluate', { expression: 'window.__renders ?? null', returnByValue: true });
    renders = res.result?.result?.value ?? null;
  }
  if (!renders) throw new Error(`${SITE}/render never finished: is the dev server running?`);

  await mkdir(OUT, { recursive: true });
  for (const r of renders) {
    const bytes = Buffer.from(r.data.split(',')[1], 'base64');
    await writeFile(new URL(r.file, OUT), bytes);
    console.log(`${r.file}  ${Math.round(bytes.length / 1024)} KB`);
  }
  ws.close();
} finally {
  browser.kill();
  await rm(profile, { recursive: true, force: true }).catch(() => {});
}
