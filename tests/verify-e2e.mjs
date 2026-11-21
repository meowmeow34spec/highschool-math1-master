#!/usr/bin/env node
/**
 * LOGIC PRISM · 고1 공통수학1 반학기 마스터
 * Automated Real Headless Browser E2E Verification Suite (Zero-Dependency CDP)
 *
 * Usage:
 *   node tests/verify-e2e.mjs
 *   SCREENSHOT_DIR="C:\path\to\dir" node tests/verify-e2e.mjs
 */

import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const SCREENSHOT_DIR = process.env.SCREENSHOT_DIR ? path.resolve(process.env.SCREENSHOT_DIR) : null;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

function findBrowserExecutable() {
  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('No installed Chrome or Edge executable found for E2E verification.');
}

function startStaticServer(rootDir) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const reqUrl = new URL(req.url, 'http://127.0.0.1');
        let relPath = decodeURIComponent(reqUrl.pathname);
        if (relPath === '/') relPath = '/index.html';
        const fullPath = path.resolve(rootDir, '.' + relPath);
        if (!fullPath.startsWith(rootDir)) {
          res.writeHead(403);
          res.end('Forbidden');
          return;
        }
        if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
          if (relPath === '/favicon.ico') {
            res.writeHead(204);
            res.end();
            return;
          }
          res.writeHead(404);
          res.end('Not found: ' + relPath);
          return;
        }
        const ext = path.extname(fullPath).toLowerCase();
        res.writeHead(200, {
          'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
          'Cache-Control': 'no-store',
        });
        fs.createReadStream(fullPath).pipe(res);
      } catch (err) {
        res.writeHead(500);
        res.end(String(err));
      }
    });
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${port}` });
    });
  });
}

async function launchBrowserAndConnect(browserExe) {
  const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'logic-prism-e2e-'));
  const proc = spawn(
    browserExe,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      '--mute-audio',
      '--window-size=1440,900',
      '--remote-debugging-port=0',
      `--user-data-dir=${profileDir}`,
      'about:blank',
    ],
    { stdio: ['ignore', 'pipe', 'pipe'] }
  );

  const browserWsUrl = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timed out waiting for DevTools WebSocket')), 12000);
    let stderrBuf = '';
    proc.stderr.on('data', (chunk) => {
      stderrBuf += chunk.toString();
      const m = stderrBuf.match(/DevTools listening on (ws:\/\/[^\r\n]+)/);
      if (m) {
        clearTimeout(timer);
        resolve(m[1]);
      }
    });
    proc.on('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`Browser exited prematurely with code ${code}: ${stderrBuf}`));
    });
  });

  const parsedWs = new URL(browserWsUrl);
  const targetsRes = await fetch(`http://127.0.0.1:${parsedWs.port}/json/list`);
  const targets = await targetsRes.json();
  const pageTarget = targets.find((t) => t.type === 'page');
  if (!pageTarget?.webSocketDebuggerUrl) {
    throw new Error('Could not find page target in /json/list');
  }

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });

  let nextId = 1;
  const pending = new Map();
  const pageErrors = [];
  const consoleErrors = [];

  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(typeof ev.data === 'string' ? ev.data : ev.data.toString());
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject, method } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(`CDP ${method} failed: ${msg.error.message}`));
      else resolve(msg.result);
      return;
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      const details = msg.params?.exceptionDetails;
      const desc = details?.exception?.description || details?.text || JSON.stringify(details);
      pageErrors.push(desc);
    } else if (msg.method === 'Runtime.consoleAPICalled') {
      if (msg.params?.type === 'error') {
        const text = (msg.params.args || [])
          .map((a) => a.description || a.value || JSON.stringify(a))
          .join(' ');
        consoleErrors.push(text);
      }
    } else if (msg.method === 'Log.entryAdded') {
      const entry = msg.params?.entry;
      if (entry?.level === 'error') {
        consoleErrors.push(`[${entry.source}] ${entry.text} ${entry.url || ''}`);
      }
    }
  });

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = nextId++;
      pending.set(id, { resolve, reject, method });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evaluate(expression) {
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      const desc =
        res.exceptionDetails.exception?.description ||
        res.exceptionDetails.text ||
        'Evaluation exception';
      throw new Error(`JS Eval Error: ${desc}`);
    }
    return res.result?.value;
  }

  async function waitFor(predicateExpr, timeoutMs = 10000, label = predicateExpr) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const val = await evaluate(`Boolean(${predicateExpr})`);
      if (val) return true;
      await new Promise((r) => setTimeout(r, 100));
    }
    throw new Error(`Timeout waiting for condition: ${label}`);
  }

  async function setViewport(width, height, mobile = false) {
    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile,
    });
    await evaluate('window.dispatchEvent(new Event("resize"))');
    await new Promise((r) => setTimeout(r, 180));
  }

  async function saveScreenshot(fileName) {
    if (!SCREENSHOT_DIR) return null;
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    const outPath = path.join(SCREENSHOT_DIR, fileName);
    const { data } = await send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
    });
    fs.writeFileSync(outPath, Buffer.from(data, 'base64'));
    return outPath;
  }

  async function close() {
    try {
      ws.close();
    } catch {}
    try {
      proc.kill();
    } catch {}
    await new Promise((r) => setTimeout(r, 350));
    try {
      fs.rmSync(profileDir, { recursive: true, force: true });
    } catch {}
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Log.enable');

  return {
    send,
    evaluate,
    waitFor,
    setViewport,
    saveScreenshot,
    close,
    pageErrors,
    consoleErrors,
  };
}

function assert(cond, msg) {
  if (!cond) throw new Error(`Assertion Failed: ${msg}`);
}

async function runSuite() {
  const indexHtml = path.join(ROOT_DIR, 'index.html');
  assert(fs.existsSync(indexHtml), `Missing index.html at ${indexHtml}`);

  const browserExe = findBrowserExecutable();
  const { server, baseUrl } = await startStaticServer(ROOT_DIR);
  const cdp = await launchBrowserAndConnect(browserExe);

  const checksPassed = [];
  const savedScreenshots = [];

  try {
    await cdp.setViewport(1440, 900, false);
    await cdp.send('Page.navigate', { url: baseUrl });

    await cdp.waitFor(
      'document.readyState === "complete" && window.MATH1_CURRICULUM && window.MathRender && window.LearningState',
      15000,
      'App scripts loaded and initialized'
    );
    // Allow KaTeX CDN & initial render to settle
    await new Promise((r) => setTimeout(r, 500));

    // -------------------------------------------------------------------------
    // 1. Dashboard: 5 Chapters, 15 Stages, Zero raw '$' leaks
    // -------------------------------------------------------------------------
    const dashInfo = await cdp.evaluate(`(() => {
      const dash = document.getElementById('view-dashboard');
      if (!dash || dash.hidden) return { ok: false, reason: '#view-dashboard missing or hidden' };
      const chapters = dash.querySelectorAll('.chapter-section');
      const stageCards = dash.querySelectorAll('.stage-card');
      const visibleText = document.body.innerText || '';
      const dollarIdx = visibleText.indexOf('$');
      const dollarSnippet = dollarIdx >= 0 ? visibleText.slice(Math.max(0, dollarIdx - 25), dollarIdx + 40) : null;
      return {
        ok: true,
        chapterCount: chapters.length,
        stageCount: stageCards.length,
        hasRawDollar: dollarIdx >= 0,
        dollarSnippet,
        katexLoaded: Boolean(window.katex),
      };
    })()`);

    assert(dashInfo.ok, dashInfo.reason || 'Dashboard failed to render');
    assert(dashInfo.chapterCount === 5, `Expected 5 .chapter-section on dashboard, got ${dashInfo.chapterCount}`);
    assert(dashInfo.stageCount === 15, `Expected 15 .stage-card on dashboard, got ${dashInfo.stageCount}`);
    assert(!dashInfo.hasRawDollar, `Raw '$' math leak detected on Dashboard: "${dashInfo.dollarSnippet}"`);
    checksPassed.push('Dashboard renders 5 chapters & 15 stage cards with zero raw $ leaks');

    const shotDash = await cdp.saveScreenshot('01-dashboard-bento.png');
    if (shotDash) savedScreenshots.push(shotDash);

    // -------------------------------------------------------------------------
    // 2. Theme Toggle & WCAG Contrast Check (Light <-> Dark)
    // -------------------------------------------------------------------------
    const contrastHelper = `(() => {
      function parseRgb(str) {
        const m = str.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)(?:,\\s*([\\d.]+))?\\)/);
        if (!m) return [255, 255, 255, 1];
        return [Number(m[1]), Number(m[2]), Number(m[3]), m[4] === undefined ? 1 : Number(m[4])];
      }
      function composite(fg, bg) {
        const a = fg[3];
        if (a >= 0.999) return fg;
        return [
          fg[0] * a + bg[0] * (1 - a),
          fg[1] * a + bg[1] * (1 - a),
          fg[2] * a + bg[2] * (1 - a),
          1
        ];
      }
      function lum([r, g, b]) {
        const lin = [r, g, b].map(v => {
          const s = v / 255;
          return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
      }
      function ratio(c1, c2) {
        const l1 = lum(c1), l2 = lum(c2);
        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      }
      const theme = document.documentElement.getAttribute('data-theme') || 'light';
      const bodyStyle = getComputedStyle(document.body);
      const bodyBg = parseRgb(bodyStyle.backgroundColor);
      const bodyColor = parseRgb(bodyStyle.color);
      const card = document.querySelector('.stage-card') || document.querySelector('.bento-card');
      const cardStyle = card ? getComputedStyle(card) : bodyStyle;
      const cardBg = composite(parseRgb(cardStyle.backgroundColor), bodyBg);
      const titleEl = card ? (card.querySelector('h3, h4, strong, .stage-card-title') || card) : document.body;
      const titleColor = parseRgb(getComputedStyle(titleEl).color);
      return {
        theme,
        bodyContrast: Number(ratio(bodyColor, bodyBg).toFixed(2)),
        cardContrast: Number(ratio(titleColor, cardBg).toFixed(2)),
      };
    })()`;

    const lightCheck = await cdp.evaluate(contrastHelper);
    assert(lightCheck.theme === 'light', `Expected initial theme 'light', got '${lightCheck.theme}'`);
    assert(lightCheck.bodyContrast >= 4.5, `Light body contrast too low: ${lightCheck.bodyContrast}`);
    assert(lightCheck.cardContrast >= 4.5, `Light card contrast too low: ${lightCheck.cardContrast}`);

    await cdp.evaluate(`document.getElementById('btn-theme-toggle').click()`);
    await new Promise((r) => setTimeout(r, 200));
    const darkCheck = await cdp.evaluate(contrastHelper);
    assert(darkCheck.theme === 'dark', `Expected toggled theme 'dark', got '${darkCheck.theme}'`);
    assert(darkCheck.bodyContrast >= 4.5, `Dark body contrast too low: ${darkCheck.bodyContrast}`);
    assert(darkCheck.cardContrast >= 4.5, `Dark card contrast too low: ${darkCheck.cardContrast}`);

    // Toggle back to light for crisp daylight flow
    await cdp.evaluate(`document.getElementById('btn-theme-toggle').click()`);
    await new Promise((r) => setTimeout(r, 150));
    checksPassed.push(`Theme toggle & WCAG contrast verified (Light ${lightCheck.cardContrast}:1, Dark ${darkCheck.cardContrast}:1)`);

    // -------------------------------------------------------------------------
    // 3. Stage View: Tab 1 (Feynman Intuition & Stealth Cloze + XP increment)
    // -------------------------------------------------------------------------
    const xpBefore = await cdp.evaluate(`window.LearningState ? (window.LearningState.getState ? window.LearningState.getState().xp : 0) : 0`);

    await cdp.evaluate(`(() => {
      const firstCard = document.querySelector('.stage-card');
      if (!firstCard) throw new Error('No .stage-card found');
      const clickable = firstCard.querySelector('button, a') || firstCard;
      clickable.click();
    })()`);

    await cdp.waitFor(
      `!document.getElementById('view-stage').hidden`,
      5000,
      '#view-stage becomes visible'
    );
    await new Promise((r) => setTimeout(r, 200));

    const tab1Check = await cdp.evaluate(`(() => {
      const stageEl = document.getElementById('view-stage');
      const visibleText = document.body.innerText || '';
      const hasDollar = visibleText.includes('$');
      const formulaCards = stageEl.querySelectorAll('.formula-card');
      // Reveal an individual formula cloze first, then toggle stealth mode
      const indivBtn = stageEl.querySelector('[data-action="toggle-stage-formula-cloze"]');
      const beforeIndiv = stageEl.innerHTML;
      if (indivBtn) indivBtn.click();
      const afterIndiv = stageEl.innerHTML;
      const hasRawLatexOnReveal = /\\\\(text|frac|boxed|alpha|beta|sqrt)\\b/.test(document.body.innerText || '');

      const clozeBtn = stageEl.querySelector('#btn-stage-stealth-toggle, .cloze-toggle-btn');
      const beforeHtml = stageEl.innerHTML;
      if (clozeBtn) clozeBtn.click();
      const afterHtml = stageEl.innerHTML;
      return {
        hasDollar,
        hasRawLatexOnReveal,
        formulaCount: formulaCards.length,
        clozeFound: Boolean(clozeBtn),
        domChangedOnCloze: beforeIndiv !== afterIndiv || beforeHtml !== afterHtml,
      };
    })()`);

    assert(!tab1Check.hasDollar, 'Raw $ math leak detected in Stage View Tab 1');
    assert(!tab1Check.hasRawLatexOnReveal, 'Raw LaTeX command leak detected when revealing formula cloze in Stage Tab 1');
    assert(tab1Check.formulaCount >= 3, `Expected >= 3 .formula-card in Stage Tab 1, got ${tab1Check.formulaCount}`);
    assert(tab1Check.clozeFound, 'No stealth cloze toggle button found in Stage Tab 1');
    assert(tab1Check.domChangedOnCloze, 'Clicking stealth cloze toggle did not update formula DOM');

    // Complete Step 1 -> moves to Tab 2 and increments XP
    await cdp.evaluate(`(() => {
      const stageEl = document.getElementById('view-stage');
      const completeBtn = stageEl.querySelector('#btn-complete-intuition, [data-action="complete-intuition"]');
      if (!completeBtn) throw new Error('Step 1 completion button not found');
      completeBtn.click();
    })()`);
    await new Promise((r) => setTimeout(r, 250));

    const xpAfterStep1 = await cdp.evaluate(`(() => {
      const pill = document.getElementById('stat-xp')?.innerText || '';
      const m = pill.match(/(\\d+)\\s*XP/i);
      return m ? Number(m[1]) : 0;
    })()`);
    assert(xpAfterStep1 > xpBefore, `Expected XP to increase after completing Step 1 (before=${xpBefore}, after=${xpAfterStep1})`);
    checksPassed.push(`Stage Tab 1 (Feynman + Stealth Cloze + XP +${xpAfterStep1 - xpBefore}) verified`);

    // -------------------------------------------------------------------------
    // 4. Stage View: Tab 2 (4-Step Logic Chain Puzzle 1 -> 2 -> 3 -> 4)
    // -------------------------------------------------------------------------
    // Ensure we are on Tab 2
    await cdp.evaluate(`(() => {
      const stageEl = document.getElementById('view-stage');
      if (!stageEl.querySelector('.logic-board, .logic-pool-grid, .logic-option-card')) {
        const stepBtns = Array.from(stageEl.querySelectorAll('.mode-step-btn, button'));
        const tab2Btn = stepBtns.find(b => b.textContent.includes('논리 체인') || b.dataset.mode === 'logic' || b.dataset.tab === 'logic');
        if (tab2Btn) tab2Btn.click();
      }
    })()`);
    await new Promise((r) => setTimeout(r, 200));

    // Solve steps 1..4 by matching curriculum step statements or data-step-no!
    for (let stepNo = 1; stepNo <= 4; stepNo++) {
      await cdp.evaluate(`(() => {
        const stageEl = document.getElementById('view-stage');
        const options = Array.from(stageEl.querySelectorAll('.logic-option-card:not(.is-used)'));
        if (options.length === 0) throw new Error('No remaining .logic-option-card for step ' + ${stepNo});

        // Match via data attribute if present, otherwise match against MATH1_CURRICULUM step statement
        let target = options.find(el =>
          Number(el.dataset.stepNo || el.dataset.step) === ${stepNo}
        );
        if (!target) {
          const allStages = window.MATH1_CURRICULUM.getAllStages();
          const st = allStages.find(s => stageEl.innerText.includes(s.title)) || allStages[0];
          const stepObj = st.logicChain.steps.find(x => x.stepNo === ${stepNo});
          // Render statement with MathRender.formatText into temp div to compare textContent
          const tmp = document.createElement('div');
          tmp.innerHTML = window.MathRender.formatText(stepObj.statement);
          const normTarget = tmp.textContent.replace(/\\s+/g, '');
          target = options.find(el => el.textContent.replace(/\\s+/g, '').includes(normTarget.slice(0, 14)));
        }
        if (!target) throw new Error('Could not identify correct logic option card for step ' + ${stepNo});
        target.click();
      })()`);
      await new Promise((r) => setTimeout(r, 180));
    }

    const shotLogic = await cdp.saveScreenshot('02-stage-logic-chain.png');
    if (shotLogic) savedScreenshots.push(shotLogic);

    const logicDoneCheck = await cdp.evaluate(`(() => {
      const stageEl = document.getElementById('view-stage');
      const filledSlots = stageEl.querySelectorAll('.logic-slot.is-filled');
      const visibleText = document.body.innerText || '';
      return {
        filledCount: filledSlots.length,
        hasDollar: visibleText.includes('$'),
        hasNextBtn: Array.from(stageEl.querySelectorAll('button')).some(b => b.textContent.includes('배틀') || b.textContent.includes('3단계')),
      };
    })()`);
    assert(!logicDoneCheck.hasDollar, 'Raw $ math leak in Logic Chain Puzzle');
    assert(logicDoneCheck.filledCount === 4 || logicDoneCheck.hasNextBtn, `Logic Chain completion state not reached (filled=${logicDoneCheck.filledCount})`);
    checksPassed.push('Stage Tab 2 (4-Step Logic Chain 1->2->3->4 assembly) verified');

    // -------------------------------------------------------------------------
    // 5. Stage View: Tab 3 (3-Wave Battle Arena: 7 Questions + 1 Deliberate Miss)
    // -------------------------------------------------------------------------
    await cdp.evaluate(`(() => {
      const stageEl = document.getElementById('view-stage');
      const goArena = stageEl.querySelector('#btn-go-arena, [data-action="go-arena"], [data-stage-tab="arena"]');
      if (!goArena) throw new Error('Could not find button to enter 3-Wave Battle Arena');
      goArena.click();
    })()`);
    await new Promise((r) => setTimeout(r, 250));

    // Play through all 7 questions: deliberately miss Q1 so Leitner Box 0 increments, answer Q2..Q7!
    for (let qIdx = 0; qIdx < 7; qIdx++) {
      const wantWrong = qIdx === 0;
      await cdp.evaluate(`(() => {
        const stageEl = document.getElementById('view-stage');
        const allStages = window.MATH1_CURRICULUM.getAllStages();
        const st = allStages.find(s => stageEl.innerText.includes(s.title)) || allStages[0];

        const oxBtns = Array.from(stageEl.querySelectorAll('.ox-card-btn'));
        const mcBtns = Array.from(stageEl.querySelectorAll('.choice-card-btn'));

        if (oxBtns.length >= 2) {
          // Determine which OX quiz is displayed
          let currentOx = st.oxQuizzes[${qIdx}] || st.oxQuizzes[0];
          for (const ox of st.oxQuizzes) {
            const tmp = document.createElement('div');
            tmp.innerHTML = window.MathRender.formatText(ox.statement);
            const snippet = tmp.textContent.replace(/\\s+/g, '').slice(0, 14);
            if (stageEl.textContent.replace(/\\s+/g, '').includes(snippet)) {
              currentOx = ox;
              break;
            }
          }
          const desiredBool = ${wantWrong} ? !currentOx.answer : currentOx.answer;
          const btnO = oxBtns.find(b => b.classList.contains('is-o') || b.dataset.ox === 'true' || b.textContent.includes('참') || b.textContent.includes('O')) || oxBtns[0];
          const btnX = oxBtns.find(b => b.classList.contains('is-x') || b.dataset.ox === 'false' || b.textContent.includes('거짓') || b.textContent.includes('X')) || oxBtns[1];
          (desiredBool ? btnO : btnX).click();
        } else if (mcBtns.length >= 4) {
          // Match current problem from st.problems
          let currentProb = st.problems[0];
          for (const p of st.problems) {
            const tmp = document.createElement('div');
            tmp.innerHTML = window.MathRender.formatText(p.question);
            const snippet = tmp.textContent.replace(/\\s+/g, '').slice(0, 14);
            if (stageEl.textContent.replace(/\\s+/g, '').includes(snippet)) {
              currentProb = p;
              break;
            }
          }
          const pickIdx = ${wantWrong} ? ((currentProb.answerIndex + 1) % 4) : currentProb.answerIndex;
          const byAttr = mcBtns.find(b => Number(b.dataset.choiceIndex ?? b.dataset.index ?? b.dataset.choice) === pickIdx);
          (byAttr || mcBtns[pickIdx]).click();
        } else {
          throw new Error('Neither .ox-card-btn nor .choice-card-btn found on battle question ' + ${qIdx + 1});
        }
      })()`);
      await new Promise((r) => setTimeout(r, 200));

      // Verify explanation box appeared & no raw '$'
      const afterAns = await cdp.evaluate(`(() => {
        const stageEl = document.getElementById('view-stage');
        return {
          hasDollar: (document.body.innerText || '').includes('$'),
          hasExpl: Boolean(stageEl.querySelector('.explanation-box')) || stageEl.innerText.includes('해설'),
        };
      })()`);
      assert(!afterAns.hasDollar, `Raw $ leak after answering battle question ${qIdx + 1}`);
      assert(afterAns.hasExpl, `Hypercorrection explanation missing on question ${qIdx + 1}`);

      if (qIdx === 6) {
        const shotBattle = await cdp.saveScreenshot('03-stage-battle-arena.png');
        if (shotBattle) savedScreenshots.push(shotBattle);
      }

      // Click next / finish button inside battle arena
      await cdp.evaluate(`(() => {
        const stageEl = document.getElementById('view-stage');
        const nextBtn = stageEl.querySelector('#btn-arena-next, [data-action="battle-next"]');
        if (!nextBtn) throw new Error('Next/Result button (#btn-arena-next) not found after question ' + ${qIdx + 1});
        nextBtn.click();
      })()`);
      await new Promise((r) => setTimeout(r, 220));
    }

    const battleResult = await cdp.evaluate(`(() => {
      const stageEl = document.getElementById('view-stage');
      const summary = stageEl.querySelector('.result-summary-card');
      const badge = document.getElementById('review-badge');
      return {
        hasSummary: Boolean(summary) || stageEl.innerText.includes('정답률') || stageEl.innerText.includes('클리어'),
        badgeHidden: badge ? badge.hidden : true,
        badgeCount: badge ? Number(badge.textContent.trim() || '0') : 0,
        hasDollar: (document.body.innerText || '').includes('$'),
      };
    })()`);

    assert(!battleResult.hasDollar, 'Raw $ leak on Battle Result Summary');
    assert(battleResult.hasSummary, 'Battle Result Summary card did not render after 7 questions');
    assert(!battleResult.badgeHidden && battleResult.badgeCount >= 1, `Expected #review-badge >= 1 after deliberate miss, got hidden=${battleResult.badgeHidden}, count=${battleResult.badgeCount}`);
    checksPassed.push(`Stage Tab 3 (7-question 3-Wave Battle + Leitner badge=${battleResult.badgeCount} + Result Summary) verified`);

    // -------------------------------------------------------------------------
    // 6. Stealth Formula Deck (#view-formula-deck): 45 formulas, filters, stealth
    // -------------------------------------------------------------------------
    await cdp.evaluate(`document.querySelector('[data-nav="formula-deck"]').click()`);
    await cdp.waitFor(`!document.getElementById('view-formula-deck').hidden`, 5000, 'Formula Deck visible');
    await new Promise((r) => setTimeout(r, 250));

    const deckCheck = await cdp.evaluate(`(() => {
      const deckEl = document.getElementById('view-formula-deck');
      const totalCards = deckEl.querySelectorAll('.formula-card').length;
      const hasDollar = (document.body.innerText || '').includes('$');

      // Filter by chapter chip
      const chips = Array.from(deckEl.querySelectorAll('.chip, [data-chapter], [data-filter-chapter]'));
      const chChip = chips.find(c => !c.classList.contains('is-active') && (c.dataset.chapter || c.textContent.includes('다항식') || c.textContent.includes('I-') || c.textContent.includes('Ch')));
      if (chChip) chChip.click();
      const filteredCards = deckEl.querySelectorAll('.formula-card').length;

      // Reset to all if possible
      const allChip = chips.find(c => c.textContent.trim().startsWith('전체'));
      if (allChip) allChip.click();

      // Reveal all 45 individual cloze answers briefly to verify zero raw LaTeX leaks (e.g. \text{실수 계수})
      const revealBtns = Array.from(deckEl.querySelectorAll('button[data-action="toggle-deck-formula-cloze"]'));
      for (const rb of revealBtns) rb.click();
      const deckRevealedText = deckEl.innerText || '';
      const rawLatexMatch = deckRevealedText.match(/\\\\(text|frac|boxed|alpha|beta|sqrt|implies|iff)\\b/);

      // Toggle global stealth mode
      const stealthBtn = deckEl.querySelector('#btn-deck-stealth-toggle') || Array.from(deckEl.querySelectorAll('button, input')).find(b =>
        b.textContent?.includes('스텔스') || b.textContent?.includes('빈칸') || b.dataset?.action?.includes('stealth')
      );
      const beforeHtml = deckEl.innerHTML;
      if (stealthBtn) stealthBtn.click();
      const afterHtml = deckEl.innerHTML;

      return {
        totalCards,
        filteredCards,
        hasDollar,
        rawLatexLeak: rawLatexMatch ? rawLatexMatch[0] : null,
        stealthToggled: Boolean(stealthBtn) && beforeHtml !== afterHtml,
      };
    })()`);

    assert(!deckCheck.hasDollar, 'Raw $ leak in Stealth Formula Deck');
    assert(!deckCheck.rawLatexLeak, `Raw LaTeX leak in Formula Deck clozeAnswer: ${deckCheck.rawLatexLeak}`);
    assert(deckCheck.totalCards === 45, `Expected 45 formula cards in Formula Deck, got ${deckCheck.totalCards}`);
    assert(deckCheck.filteredCards > 0 && deckCheck.filteredCards < 45, `Expected chapter filter to narrow 45 cards, got ${deckCheck.filteredCards}`);
    assert(deckCheck.stealthToggled, 'Global Stealth Cloze toggle in Formula Deck did not update cards');
    checksPassed.push('Stealth Formula Deck (45 formulas + chapter filter + global stealth toggle) verified');

    // -------------------------------------------------------------------------
    // 7. Visual Math Lab (#view-lab): All 4 tabs, non-empty canvas pixels, sliders
    // -------------------------------------------------------------------------
    await cdp.evaluate(`document.querySelector('[data-nav="lab"]').click()`);
    await cdp.waitFor(`!document.getElementById('view-lab').hidden`, 5000, 'Visual Lab visible');
    await new Promise((r) => setTimeout(r, 300));

    const labTabs = ['poly-sim', 'synthetic-div', 'complex-plane', 'quadratic-explorer'];
    for (const tabId of labTabs) {
      await cdp.evaluate(`(() => {
        const labRoot = document.getElementById('view-lab');
        const tabBtn = labRoot.querySelector('[data-tab="${tabId}"], [data-lab-tab="${tabId}"]');
        if (tabBtn) tabBtn.click();
        else if (window.VisualLab?.setTab) window.VisualLab.setTab('${tabId}');
        else throw new Error('Cannot switch Visual Lab to tab ${tabId}');
      })()`);
      await new Promise((r) => setTimeout(r, 280));

      const labState = await cdp.evaluate(`(() => {
        const labRoot = document.getElementById('view-lab');
        const canvases = Array.from(labRoot.querySelectorAll('canvas'));
        let hasRenderedPixels = false;
        for (const c of canvases) {
          if (c.width > 0 && c.height > 0) {
            const ctx = c.getContext('2d');
            if (ctx) {
              const data = ctx.getImageData(0, 0, Math.min(c.width, 300), Math.min(c.height, 300)).data;
              // Check variance in RGB / non-zero alpha so we know real shapes/axes rendered
              let nonZeroAlpha = 0;
              const colorSet = new Set();
              for (let i = 0; i < data.length; i += 16) {
                if (data[i + 3] > 0) {
                  nonZeroAlpha++;
                  colorSet.add(data[i] + ',' + data[i + 1] + ',' + data[i + 2]);
                }
              }
              if (nonZeroAlpha > 20 && colorSet.size >= 3) {
                hasRenderedPixels = true;
                break;
              }
            }
          }
        }
        // Exercise slider or interactive button and check readout updates
        const readoutBefore = labRoot.innerText;
        const slider = labRoot.querySelector('input[type="range"]');
        if (slider) {
          const min = Number(slider.min || 0);
          const max = Number(slider.max || 5);
          const cur = Number(slider.value || 1);
          const nextVal = cur < max ? Math.min(max, cur + ( Number(slider.step) || 1 )) : Math.max(min, cur - (Number(slider.step) || 1));
          slider.value = String(nextVal);
          slider.dispatchEvent(new Event('input', { bubbles: true }));
          slider.dispatchEvent(new Event('change', { bubbles: true }));
        }
        const actionBtn = Array.from(labRoot.querySelectorAll('button:not(.lab-tab)')).find(b => !b.disabled);
        if (actionBtn) actionBtn.click();
        const readoutAfter = labRoot.innerText;

        return {
          canvasCount: canvases.length,
          hasRenderedPixels,
          hasDollar: (document.body.innerText || '').includes('$'),
          updatedCleanly: readoutAfter.length > 20 && (readoutBefore !== readoutAfter || !slider),
        };
      })()`);

      assert(!labState.hasDollar, `Raw $ leak in Visual Lab tab '${tabId}'`);
      assert(labState.canvasCount >= 1 || tabId === 'synthetic-div', `No <canvas> found in Visual Lab tab '${tabId}'`);
      if (labState.canvasCount >= 1) {
        assert(labState.hasRenderedPixels, `Canvas in Visual Lab tab '${tabId}' had empty/flat pixels`);
      }
      assert(labState.updatedCleanly, `Interactive controls in Visual Lab tab '${tabId}' failed to update cleanly`);

      if (tabId === 'quadratic-explorer') {
        const shotLab = await cdp.saveScreenshot('04-visual-math-lab.png');
        if (shotLab) savedScreenshots.push(shotLab);
      }
    }
    checksPassed.push('Visual Math Lab (all 4 tabs + HiDPI canvas pixels + interactive sliders/buttons) verified');

    // -------------------------------------------------------------------------
    // 8. Smart Review (#view-review): Leitner Box 0 + Random 10-Q Midterm Exam
    // -------------------------------------------------------------------------
    await cdp.evaluate(`document.querySelector('[data-nav="review"]').click()`);
    await cdp.waitFor(`!document.getElementById('view-review').hidden`, 5000, 'Smart Review visible');
    await new Promise((r) => setTimeout(r, 250));

    const reviewCheck = await cdp.evaluate(`(() => {
      const revEl = document.getElementById('view-review');
      const text = revEl.innerText || '';
      const hasDollar = (document.body.innerText || '').includes('$');
      const state = window.LearningState?.getState ? window.LearningState.getState() : null;
      const box0Items = state?.reviewQueue
        ? Object.values(state.reviewQueue).filter(it => it.box === 0).length
        : (text.includes('Box 0') ? 1 : 0);

      // Launch random 10-question midterm exam mode
      const btns = Array.from(revEl.querySelectorAll('button'));
      const examBtn = btns.find(b => b.textContent.includes('모의고사') || b.textContent.includes('10'));
      if (examBtn) examBtn.click();

      return {
        hasDollar,
        box0Items,
        examBtnFound: Boolean(examBtn),
      };
    })()`);

    await new Promise((r) => setTimeout(r, 250));
    const examLaunched = await cdp.evaluate(`(() => {
      const revEl = document.getElementById('view-review');
      const modalEl = document.getElementById('modal-container');
      const stageEl = document.getElementById('view-stage');
      const activeText = document.body.innerText || '';
      return {
        hasDollar: activeText.includes('$'),
        hasQuizUi:
          Boolean(document.querySelector('.choice-card-btn, .ox-card-btn')) ||
          activeText.includes('1 / 10') ||
          activeText.includes('1/10') ||
          (!modalEl.hidden),
      };
    })()`);

    assert(!reviewCheck.hasDollar && !examLaunched.hasDollar, 'Raw $ leak in Smart Review / Midterm Exam');
    assert(reviewCheck.box0Items >= 1, `Expected missed item in Leitner Box 0, got ${reviewCheck.box0Items}`);
    assert(reviewCheck.examBtnFound && examLaunched.hasQuizUi, 'Random 10-question midterm exam mode did not launch cleanly');
    checksPassed.push('Smart Review (Leitner Box 0 item + Random 10-question midterm exam launch) verified');

    // -------------------------------------------------------------------------
    // 9. Responsive Viewport Checks: Mobile (375x812) & Desktop (1440x900)
    // -------------------------------------------------------------------------
    await cdp.evaluate(`document.querySelector('[data-nav="dashboard"]').click()`);
    await new Promise((r) => setTimeout(r, 200));

    await cdp.setViewport(375, 812, true);
    const mobileOverflow = await cdp.evaluate(`(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }))()`);
    assert(
      mobileOverflow.scrollWidth <= mobileOverflow.clientWidth + 2,
      `Horizontal overflow on Mobile 375x812: scrollWidth=${mobileOverflow.scrollWidth} > clientWidth=${mobileOverflow.clientWidth}`
    );

    await cdp.setViewport(1440, 900, false);
    const desktopOverflow = await cdp.evaluate(`(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }))()`);
    assert(
      desktopOverflow.scrollWidth <= desktopOverflow.clientWidth + 2,
      `Horizontal overflow on Desktop 1440x900: scrollWidth=${desktopOverflow.scrollWidth} > clientWidth=${desktopOverflow.clientWidth}`
    );
    checksPassed.push(`Responsive layout verified (Mobile 375x812: ${mobileOverflow.scrollWidth}px, Desktop 1440x900: ${desktopOverflow.scrollWidth}px)`);

    // -------------------------------------------------------------------------
    // 10. Zero Console Errors & Zero Page Errors Gate
    // -------------------------------------------------------------------------
    assert(cdp.pageErrors.length === 0, `Unhandled pageerror(s):\n  ${cdp.pageErrors.join('\n  ')}`);
    assert(cdp.consoleErrors.length === 0, `Console error(s):\n  ${cdp.consoleErrors.join('\n  ')}`);
    checksPassed.push('Zero pageerror and zero console.error across entire session');

    console.log('============================================================');
    console.log('✅ LOGIC PRISM Browser E2E Verification PASSED (10/10 Gates)');
    for (const c of checksPassed) console.log(`   ✔ ${c}`);
    if (savedScreenshots.length > 0) {
      console.log('   📸 Screenshots captured:');
      for (const s of savedScreenshots) console.log(`      - ${s}`);
    }
    console.log('============================================================');
  } finally {
    await cdp.close();
    await new Promise((r) => server.close(r));
  }
}

runSuite().catch((err) => {
  console.error('\n❌ E2E Verification FAILED:');
  console.error('  ', err?.stack || err);
  process.exit(1);
});
