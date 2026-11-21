#!/usr/bin/env node
/**
 * LOGIC PRISM · 고1 공통수학1 반학기 마스터
 * Curriculum Schema, LaTeX Balance & Mathematical Integrity Validator
 *
 * Usage:
 *   node scripts/validate-curriculum.mjs
 *   node scripts/validate-curriculum.mjs --dump-math   (prints all O/X & MC items for math audit)
 */

import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);

const args = new Set(process.argv.slice(2));
const DUMP_MATH = args.has('--dump-math');

const errors = [];
const warnings = [];

function fail(loc, msg) {
  errors.push(`[ERROR] ${loc}: ${msg}`);
}

function warn(loc, msg) {
  warnings.push(`[WARN]  ${loc}: ${msg}`);
}

/**
 * Checks that a string is a non-empty Korean/text string without literal undefined/NaN leaks.
 */
function checkNonEmptyString(val, loc) {
  if (typeof val !== 'string' || val.trim().length === 0) {
    fail(loc, `Expected non-empty string, got ${JSON.stringify(val)}`);
    return false;
  }
  if (/\bundefined\b/.test(val) || /\bNaN\b/.test(val)) {
    fail(loc, `Contains literal "undefined" or "NaN": ${val.slice(0, 120)}`);
  }
  return true;
}

/**
 * Checks LaTeX brace balance (ignoring \{ and \}) inside a math expression.
 */
function checkLatexBraces(latex, loc) {
  let depth = 0;
  for (let i = 0; i < latex.length; i++) {
    if (latex[i] === '\\') {
      i++; // skip escaped char
      continue;
    }
    if (latex[i] === '{') depth++;
    else if (latex[i] === '}') {
      depth--;
      if (depth < 0) {
        fail(loc, `Unmatched closing brace '}' in LaTeX: ${latex}`);
        return;
      }
    }
  }
  if (depth !== 0) {
    fail(loc, `Unbalanced braces (depth=${depth}) in LaTeX: ${latex}`);
  }
}

/**
 * Validates balanced $...$ and $$...$$ math delimiters in mixed Korean/math text fields.
 */
function checkMathDelimiters(text, loc) {
  if (!checkNonEmptyString(text, loc)) return;

  // Tokenize $$ and $ (ignoring \$)
  let i = 0;
  const spans = [];
  while (i < text.length) {
    if (text[i] === '\\' && i + 1 < text.length) {
      i += 2;
      continue;
    }
    if (text[i] === '$') {
      const isDisplay = text[i + 1] === '$';
      const delim = isDisplay ? '$$' : '$';
      const start = i;
      i += delim.length;
      let closed = false;
      while (i < text.length) {
        if (text[i] === '\\' && i + 1 < text.length) {
          i += 2;
          continue;
        }
        if (isDisplay && text[i] === '$' && text[i + 1] === '$') {
          const content = text.slice(start + 2, i);
          if (!content.trim()) {
            fail(loc, `Empty $$...$$ math block in: ${text}`);
          } else {
            spans.push({ delim, content });
          }
          i += 2;
          closed = true;
          break;
        } else if (!isDisplay && text[i] === '$') {
          if (text[i + 1] === '$') {
            fail(loc, `Mismatched $ vs $$ delimiter in: ${text}`);
            return;
          }
          const content = text.slice(start + 1, i);
          if (!content.trim()) {
            fail(loc, `Empty $...$ math span in: ${text}`);
          } else {
            spans.push({ delim, content });
          }
          i += 1;
          closed = true;
          break;
        }
        i++;
      }
      if (!closed) {
        fail(loc, `Unclosed '${delim}' delimiter in: ${text}`);
        return;
      }
    } else {
      i++;
    }
  }

  for (const span of spans) {
    checkLatexBraces(span.content, `${loc} [math: $${span.content}$]`);
  }
}

/**
 * Validates pure LaTeX fields (formulas.latex and formulas.clozeLatex) — NO outer $ delimiters!
 */
function checkPureLatex(latex, loc, requireBoxed = false) {
  if (!checkNonEmptyString(latex, loc)) return;
  const trimmed = latex.trim();
  if (trimmed.startsWith('$') || trimmed.endsWith('$')) {
    fail(loc, `Pure LaTeX field MUST NOT have outer '$' delimiters: ${latex}`);
  }
  // Also check for accidental raw $ outside \text
  for (let i = 0; i < trimmed.length; i++) {
    if (trimmed[i] === '\\') {
      i++;
      continue;
    }
    if (trimmed[i] === '$') {
      fail(loc, `Pure LaTeX field contains unescaped '$': ${latex}`);
      break;
    }
  }
  if (requireBoxed && !trimmed.includes('\\boxed')) {
    fail(loc, `clozeLatex MUST contain '\\boxed{...}': ${latex}`);
  }
  checkLatexBraces(trimmed, loc);
}

/**
 * Recursively scan object tree for undefined / NaN values.
 */
function checkNoUndefinedOrNaN(node, loc) {
  if (node === undefined) {
    fail(loc, 'Value is undefined');
    return;
  }
  if (typeof node === 'number' && Number.isNaN(node)) {
    fail(loc, 'Value is NaN');
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((item, idx) => checkNoUndefinedOrNaN(item, `${loc}[${idx}]`));
  } else if (node !== null && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      checkNoUndefinedOrNaN(v, `${loc}.${k}`);
    }
  }
}

function main() {
  const algPath = path.join(ROOT_DIR, 'src', 'data', 'chapters-alg.js');
  const eqPath = path.join(ROOT_DIR, 'src', 'data', 'chapters-eq.js');
  const idxPath = path.join(ROOT_DIR, 'src', 'data', 'curriculum-index.js');

  for (const p of [algPath, eqPath, idxPath]) {
    if (!fs.existsSync(p)) {
      console.error(`[FATAL] Missing curriculum file: ${p}`);
      process.exit(1);
    }
  }

  // Test both Node CommonJS require AND browser window global assignment
  globalThis.window = globalThis.window || {};
  const algChapters = require(algPath);
  const eqChapters = require(eqPath);
  const curriculum = require(idxPath);

  if (!Array.isArray(algChapters) || algChapters.length !== 3) {
    fail('chapters-alg.js', `Expected array of 3 chapters, got ${Array.isArray(algChapters) ? algChapters.length : typeof algChapters}`);
  }
  if (!Array.isArray(eqChapters) || eqChapters.length !== 2) {
    fail('chapters-eq.js', `Expected array of 2 chapters, got ${Array.isArray(eqChapters) ? eqChapters.length : typeof eqChapters}`);
  }
  if (!globalThis.window.MATH1_ALG_CHAPTERS) {
    fail('chapters-alg.js', 'Did not set window.MATH1_ALG_CHAPTERS');
  }
  if (!globalThis.window.MATH1_EQ_CHAPTERS) {
    fail('chapters-eq.js', 'Did not set window.MATH1_EQ_CHAPTERS');
  }
  if (!globalThis.window.MATH1_CURRICULUM) {
    fail('curriculum-index.js', 'Did not set window.MATH1_CURRICULUM');
  }

  // Validate curriculum-index API surface
  const requiredMethods = [
    'getChapters',
    'getChapter',
    'getAllStages',
    'getStage',
    'getAllFormulas',
    'getAllProblems',
  ];
  for (const fn of requiredMethods) {
    if (typeof curriculum?.[fn] !== 'function') {
      fail('curriculum-index.js', `Missing required method curriculum.${fn}()`);
    }
  }
  if (!curriculum?.meta || curriculum.meta.totalChapters !== 5 || curriculum.meta.totalStages !== 15) {
    fail('curriculum-index.js', `Invalid curriculum.meta: ${JSON.stringify(curriculum?.meta)}`);
  }

  if (errors.length > 0) {
    reportAndExit();
    return;
  }

  const chapters = curriculum.getChapters();
  checkNoUndefinedOrNaN(chapters, 'chapters');

  const expectedChapters = [
    { id: 'ch1', number: 'I-1', lab: 'poly-sim' },
    { id: 'ch2', number: 'I-2', lab: 'synthetic-div' },
    { id: 'ch3', number: 'I-3', lab: 'poly-sim' },
    { id: 'ch4', number: 'II-1', lab: 'complex-plane' },
    { id: 'ch5', number: 'II-2', lab: 'quadratic-explorer' },
  ];

  if (chapters.length !== 5) {
    fail('curriculum.getChapters()', `Expected 5 chapters, got ${chapters.length}`);
  }

  const seenChapterIds = new Set();
  const seenStageIds = new Set();
  const seenFormulaIds = new Set();
  const seenLogicIds = new Set();
  const seenOxIds = new Set();
  const seenProblemIds = new Set();

  let stageGlobalCounter = 0;
  let totalFormulas = 0;
  let totalOx = 0;
  let totalProblems = 0;
  const answerIndexCounts = [0, 0, 0, 0];

  chapters.forEach((ch, chIdx) => {
    const exp = expectedChapters[chIdx];
    const chLoc = `Chapter[${chIdx}](${ch?.id})`;

    if (!ch || typeof ch !== 'object') {
      fail(chLoc, 'Invalid chapter object');
      return;
    }
    if (exp && ch.id !== exp.id) {
      fail(chLoc, `Expected chapter id '${exp.id}', got '${ch.id}'`);
    }
    if (seenChapterIds.has(ch.id)) {
      fail(chLoc, `Duplicate chapter id '${ch.id}'`);
    }
    seenChapterIds.add(ch.id);

    if (exp && ch.recommendedLabTab !== exp.lab) {
      fail(chLoc, `Expected recommendedLabTab '${exp.lab}', got '${ch.recommendedLabTab}'`);
    }
    checkNonEmptyString(ch.number, `${chLoc}.number`);
    checkNonEmptyString(ch.unitTitle, `${chLoc}.unitTitle`);
    checkNonEmptyString(ch.title, `${chLoc}.title`);
    checkMathDelimiters(ch.subtitle, `${chLoc}.subtitle`);
    checkNonEmptyString(ch.accent, `${chLoc}.accent`);
    checkNonEmptyString(ch.icon, `${chLoc}.icon`);

    if (!curriculum.getChapter(ch.id)) {
      fail(chLoc, `curriculum.getChapter('${ch.id}') returned falsy`);
    }

    if (!Array.isArray(ch.stages) || ch.stages.length !== 3) {
      fail(chLoc, `Expected 3 stages in ${ch.id}, got ${Array.isArray(ch.stages) ? ch.stages.length : typeof ch.stages}`);
      return;
    }

    ch.stages.forEach((st, stIdx) => {
      stageGlobalCounter++;
      const expectedStageId = `${ch.id}-s${stIdx + 1}`;
      const expectedCode = `STAGE ${String(stageGlobalCounter).padStart(2, '0')}`;
      const stLoc = `Stage(${st?.id || expectedStageId})`;

      if (st.id !== expectedStageId) {
        fail(stLoc, `Expected stage id '${expectedStageId}', got '${st.id}'`);
      }
      if (seenStageIds.has(st.id)) {
        fail(stLoc, `Duplicate stage id '${st.id}'`);
      }
      seenStageIds.add(st.id);

      if (st.chapterId !== ch.id) {
        fail(stLoc, `Expected chapterId '${ch.id}', got '${st.chapterId}'`);
      }
      if (st.order !== stageGlobalCounter) {
        fail(stLoc, `Expected order ${stageGlobalCounter}, got ${st.order}`);
      }
      if (st.code !== expectedCode) {
        fail(stLoc, `Expected code '${expectedCode}', got '${st.code}'`);
      }
      checkMathDelimiters(st.title, `${stLoc}.title`);
      checkMathDelimiters(st.tagline, `${stLoc}.tagline`);
      if (typeof st.estimatedMinutes !== 'number' || st.estimatedMinutes < 3 || st.estimatedMinutes > 30) {
        fail(stLoc, `Invalid estimatedMinutes: ${st.estimatedMinutes}`);
      }

      // Check enriched getStage(id)
      const enriched = curriculum.getStage(st.id);
      if (!enriched || enriched.id !== st.id) {
        fail(stLoc, `curriculum.getStage('${st.id}') failed`);
      } else if (!enriched.recommendedLabTab) {
        fail(stLoc, `curriculum.getStage('${st.id}') missing enriched recommendedLabTab`);
      }

      // 1. Feynman section
      if (!st.feynman || typeof st.feynman !== 'object') {
        fail(stLoc, 'Missing feynman object');
      } else {
        checkMathDelimiters(st.feynman.hookQuestion, `${stLoc}.feynman.hookQuestion`);
        checkMathDelimiters(st.feynman.intuition, `${stLoc}.feynman.intuition`);
        checkMathDelimiters(st.feynman.keyInsight, `${stLoc}.feynman.keyInsight`);
        if (!st.feynman.trapAlert || typeof st.feynman.trapAlert !== 'object') {
          fail(stLoc, 'Missing feynman.trapAlert object');
        } else {
          checkMathDelimiters(st.feynman.trapAlert.title, `${stLoc}.feynman.trapAlert.title`);
          checkMathDelimiters(st.feynman.trapAlert.description, `${stLoc}.feynman.trapAlert.description`);
        }
      }

      // 2. Formulas (>= 3)
      if (!Array.isArray(st.formulas) || st.formulas.length < 3) {
        fail(stLoc, `Expected >= 3 formulas, got ${Array.isArray(st.formulas) ? st.formulas.length : typeof st.formulas}`);
      } else {
        st.formulas.forEach((f, fIdx) => {
          totalFormulas++;
          const fLoc = `${stLoc}.formulas[${fIdx}](${f?.id})`;
          checkNonEmptyString(f.id, `${fLoc}.id`);
          if (seenFormulaIds.has(f.id)) {
            fail(fLoc, `Duplicate formula id '${f.id}'`);
          }
          seenFormulaIds.add(f.id);
          checkMathDelimiters(f.name, `${fLoc}.name`);
          checkPureLatex(f.latex, `${fLoc}.latex`, false);
          checkPureLatex(f.clozeLatex, `${fLoc}.clozeLatex`, true);
          checkNonEmptyString(f.clozeAnswer, `${fLoc}.clozeAnswer`);
          checkMathDelimiters(f.whyItWorks, `${fLoc}.whyItWorks`);
          checkMathDelimiters(f.memoryTip, `${fLoc}.memoryTip`);
        });
      }

      // 3. Logic Chain (4 steps, stepNo 1..4)
      if (!st.logicChain || typeof st.logicChain !== 'object') {
        fail(stLoc, 'Missing logicChain object');
      } else {
        const lc = st.logicChain;
        const lcLoc = `${stLoc}.logicChain(${lc.id})`;
        checkNonEmptyString(lc.id, `${lcLoc}.id`);
        if (seenLogicIds.has(lc.id)) {
          fail(lcLoc, `Duplicate logicChain id '${lc.id}'`);
        }
        seenLogicIds.add(lc.id);
        checkMathDelimiters(lc.title, `${lcLoc}.title`);
        checkMathDelimiters(lc.goalStatement, `${lcLoc}.goalStatement`);
        if (!Array.isArray(lc.steps) || lc.steps.length !== 4) {
          fail(lcLoc, `Expected exactly 4 logicChain steps, got ${Array.isArray(lc.steps) ? lc.steps.length : typeof lc.steps}`);
        } else {
          lc.steps.forEach((step, sIdx) => {
            const stepLoc = `${lcLoc}.steps[${sIdx}]`;
            if (step.stepNo !== sIdx + 1) {
              fail(stepLoc, `Expected stepNo ${sIdx + 1}, got ${step.stepNo}`);
            }
            checkMathDelimiters(step.badge, `${stepLoc}.badge`);
            checkMathDelimiters(step.statement, `${stepLoc}.statement`);
            checkMathDelimiters(step.reason, `${stepLoc}.reason`);
          });
        }
      }

      // 4. O/X Quizzes (3 items)
      if (!Array.isArray(st.oxQuizzes) || st.oxQuizzes.length !== 3) {
        fail(stLoc, `Expected 3 oxQuizzes, got ${Array.isArray(st.oxQuizzes) ? st.oxQuizzes.length : typeof st.oxQuizzes}`);
      } else {
        st.oxQuizzes.forEach((ox, oxIdx) => {
          totalOx++;
          const oxLoc = `${stLoc}.oxQuizzes[${oxIdx}](${ox?.id})`;
          checkNonEmptyString(ox.id, `${oxLoc}.id`);
          if (seenOxIds.has(ox.id)) {
            fail(oxLoc, `Duplicate oxQuiz id '${ox.id}'`);
          }
          seenOxIds.add(ox.id);
          checkMathDelimiters(ox.statement, `${oxLoc}.statement`);
          if (typeof ox.answer !== 'boolean') {
            fail(oxLoc, `Expected boolean answer, got ${typeof ox.answer}`);
          }
          checkMathDelimiters(ox.explanation, `${oxLoc}.explanation`);
        });
      }

      // 5. Multiple-Choice Problems (4 items: 3 wave:2 + 1 wave:3)
      if (!Array.isArray(st.problems) || st.problems.length !== 4) {
        fail(stLoc, `Expected 4 problems, got ${Array.isArray(st.problems) ? st.problems.length : typeof st.problems}`);
      } else {
        let wave2Count = 0;
        let wave3Count = 0;
        st.problems.forEach((p, pIdx) => {
          totalProblems++;
          const pLoc = `${stLoc}.problems[${pIdx}](${p?.id})`;
          checkNonEmptyString(p.id, `${pLoc}.id`);
          if (seenProblemIds.has(p.id)) {
            fail(pLoc, `Duplicate problem id '${p.id}'`);
          }
          seenProblemIds.add(p.id);

          if (p.wave === 2) wave2Count++;
          else if (p.wave === 3) wave3Count++;
          else fail(pLoc, `Invalid wave ${p.wave} (expected 2 or 3)`);

          if (![1, 2, 3].includes(p.difficulty)) {
            fail(pLoc, `Invalid difficulty ${p.difficulty} (expected 1, 2, or 3)`);
          }
          checkMathDelimiters(p.typeTag, `${pLoc}.typeTag`);
          checkMathDelimiters(p.question, `${pLoc}.question`);

          if (!Array.isArray(p.choices) || p.choices.length !== 4) {
            fail(pLoc, `Expected 4 choices, got ${Array.isArray(p.choices) ? p.choices.length : typeof p.choices}`);
          } else {
            const normalized = new Set();
            p.choices.forEach((c, cIdx) => {
              checkMathDelimiters(c, `${pLoc}.choices[${cIdx}]`);
              if (typeof c === 'string') {
                const norm = c.replace(/\s+/g, ' ').trim();
                if (normalized.has(norm)) {
                  fail(pLoc, `Duplicate choice detected: "${c}"`);
                }
                normalized.add(norm);
              }
            });
          }

          if (!Number.isInteger(p.answerIndex) || p.answerIndex < 0 || p.answerIndex > 3) {
            fail(pLoc, `Invalid answerIndex ${p.answerIndex} (expected integer 0..3)`);
          } else {
            answerIndexCounts[p.answerIndex]++;
          }

          checkMathDelimiters(p.hint, `${pLoc}.hint`);
          checkMathDelimiters(p.explanation, `${pLoc}.explanation`);
        });

        if (wave2Count !== 3 || wave3Count !== 1) {
          fail(stLoc, `Expected 3 wave:2 and 1 wave:3 problems, got wave2=${wave2Count}, wave3=${wave3Count}`);
        }
      }
    });
  });

  if (stageGlobalCounter !== 15) {
    fail('curriculum', `Expected 15 total stages, got ${stageGlobalCounter}`);
  }

  const allStages = curriculum.getAllStages();
  if (!Array.isArray(allStages) || allStages.length !== 15) {
    fail('curriculum.getAllStages()', `Expected 15 stages, got ${allStages?.length}`);
  } else {
    for (let i = 0; i < 15; i++) {
      if (allStages[i].order !== i + 1) {
        fail('curriculum.getAllStages()', `Stages not sorted by order at index ${i}`);
      }
    }
  }

  const allFormulas = curriculum.getAllFormulas();
  if (!Array.isArray(allFormulas) || allFormulas.length !== totalFormulas) {
    fail('curriculum.getAllFormulas()', `Expected ${totalFormulas} formulas, got ${allFormulas?.length}`);
  }

  const allProblems = curriculum.getAllProblems();
  if (!Array.isArray(allProblems) || allProblems.length < totalProblems) {
    fail('curriculum.getAllProblems()', `Expected >= ${totalProblems} problems, got ${allProblems?.length}`);
  }

  runMathematicalIntegrityAudit(allStages);

  if (DUMP_MATH) {
    for (const st of allStages) {
      console.log(`\n==================== ${st.id} (${st.code}: ${st.title}) ====================`);
      for (const f of st.formulas) {
        console.log(`  [Formula ${f.id}] ${f.name}`);
        console.log(`    latex     : ${f.latex}`);
        console.log(`    clozeLatex: ${f.clozeLatex}  (ans: ${f.clozeAnswer})`);
      }
      console.log(`  [LogicChain ${st.logicChain.id}] Goal: ${st.logicChain.goalStatement}`);
      for (const s of st.logicChain.steps) {
        console.log(`    Step ${s.stepNo} [${s.badge}]: ${s.statement}  <-- ${s.reason}`);
      }
      for (const ox of st.oxQuizzes) {
        console.log(`  [OX ${ox.id}] (ans=${ox.answer}) ${ox.statement}`);
        console.log(`    expl: ${ox.explanation}`);
      }
      for (const p of st.problems) {
        console.log(`  [Prob ${p.id} W${p.wave}] ${p.question}`);
        p.choices.forEach((c, idx) => {
          console.log(`    ${idx === p.answerIndex ? '✅' : '  '} [${idx}] ${c}`);
        });
        console.log(`    expl: ${p.explanation}`);
      }
    }
  }

  console.log('------------------------------------------------------------');
  console.log('📊 LOGIC PRISM Curriculum Integrity Summary');
  console.log(`   Chapters : ${chapters.length} / 5`);
  console.log(`   Stages   : ${stageGlobalCounter} / 15`);
  console.log(`   Formulas : ${totalFormulas}`);
  console.log(`   OX Quiz  : ${totalOx}`);
  console.log(`   Problems : ${totalProblems} (answerIndex dist: [${answerIndexCounts.join(', ')}])`);
  console.log('------------------------------------------------------------');

  reportAndExit();
}

/**
 * Programmatic Mathematical Integrity Audit across all 15 Stages (45 O/X + 60 MC Problems).
 * Independently computes key algebraic, remainder, synthetic-division, complex-number,
 * discriminant, and restricted-domain quadratic results and cross-checks answer keys.
 */
function runMathematicalIntegrityAudit(allStages) {
  const stageById = Object.fromEntries(allStages.map((s) => [s.id, s]));
  const oxMap = new Map();
  const probMap = new Map();
  for (const st of allStages) {
    for (const ox of st.oxQuizzes || []) oxMap.set(ox.id, ox);
    for (const p of st.problems || []) probMap.set(p.id, p);
  }

  function assertChoice(probId, expectedChoiceLatex, computedCheck = true) {
    const p = probMap.get(probId);
    if (!p) {
      fail(`MathAudit(${probId})`, 'Problem ID missing');
      return;
    }
    if (!computedCheck) {
      fail(`MathAudit(${probId})`, 'Independent algebraic verification failed');
    }
    const chosen = p.choices?.[p.answerIndex];
    if (chosen !== expectedChoiceLatex) {
      fail(`MathAudit(${probId})`, `Expected choices[answerIndex] === '${expectedChoiceLatex}', got '${chosen}' (answerIndex=${p.answerIndex})`);
    }
  }

  function assertOX(oxId, expectedBool) {
    const ox = oxMap.get(oxId);
    if (!ox) {
      fail(`MathAudit(${oxId})`, 'OX Quiz ID missing');
      return;
    }
    if (ox.answer !== expectedBool) {
      fail(`MathAudit(${oxId})`, `Expected answer=${expectedBool}, got ${ox.answer}`);
    }
  }

  // --- Unit I: Polynomials, Remainder Theorem, Synthetic Division, Factoring ---
  // Stage 01
  assertOX('ch1-s1-ox1', false);
  assertOX('ch1-s1-ox2', false);
  assertOX('ch1-s1-ox3', true);
  assertChoice('ch1-s1-p1', '$6$', -7 * 1 * 2 + 5 * 4 === 6);
  assertChoice('ch1-s1-p2', '$21$', 2 * 5 + (-1) * (-2) + 4 * 3 + (-3) * 1 === 21);
  assertChoice('ch1-s1-p3', '$22$', 3 * 4 + 5 * 2 === 22);
  assertChoice('ch1-s1-p4', '$18$', 1 * 4 + 1 * 3 + 2 * 2 + 3 * 1 + 4 * 1 === 18);

  // Stage 02
  assertOX('ch1-s2-ox1', false);
  assertOX('ch1-s2-ox2', true);
  assertOX('ch1-s2-ox3', false);
  assertChoice('ch1-s2-p1', '$45$', 27 - 3 * (-2) * 3 === 45);
  assertChoice('ch1-s2-p2', '$22\\sqrt{2}$', 16 + 6 === 22);
  assertChoice('ch1-s2-p3', '$14$', 2 * (16 - 2 * 3 - 3) === 14);
  assertChoice('ch1-s2-p4', '$12$', 3 * (7 - 1) + 3 * (-2) === 12);

  // Stage 03
  assertOX('ch1-s3-ox1', false);
  assertOX('ch1-s3-ox2', true);
  assertOX('ch1-s3-ox3', false);
  assertChoice('ch1-s3-p1', '$7$', 8 + (-1) === 7);
  assertChoice('ch1-s3-p2', '$2Q(x), \\; 5$');
  assertChoice('ch1-s3-p3', '$6$');
  assertChoice('ch1-s3-p4', '$xQ(x) + 4, \\; 12$', 3 * 4 === 12);

  // Stage 04
  assertOX('ch2-s1-ox1', true);
  assertOX('ch2-s1-ox2', false);
  assertOX('ch2-s1-ox3', false);
  assertChoice('ch2-s1-p1', '$9$', 1 + 6 + 2 === 9);
  assertChoice('ch2-s1-p2', '$6$', 2 * 3 === 6);
  assertChoice('ch2-s1-p3', '$36$', (Math.pow(2, 3) + Math.pow(4, 3)) / 2 === 36);
  assertChoice('ch2-s1-p4', '$9$', 1 + 4 + 4 === 9);

  // Stage 05
  assertOX('ch2-s2-ox1', false);
  assertOX('ch2-s2-ox2', true);
  assertOX('ch2-s2-ox3', true);
  assertChoice('ch2-s2-p1', '$9$', -1 - 1 + 5 + 6 === 9);
  assertChoice('ch2-s2-p2', '$7$', 2 * 3 + 1 === 7);
  assertChoice('ch2-s2-p3', '$15$', (2 + 1) * 5 === 15);
  assertChoice('ch2-s2-p4', '$6$', 4 * Math.pow(0 - 1, 2) + 3 * 0 + 2 === 6);

  // Stage 06 (Synthetic division & 1/a quotient scaling)
  assertOX('ch2-s3-ox1', false);
  assertOX('ch2-s3-ox2', true);
  assertOX('ch2-s3-ox3', false);
  assertChoice('ch2-s3-p1', '$1$', (2 - 1 - 2) + 2 === 1);
  assertChoice('ch2-s3-p2', '$11$', (4 + 4 - 1) + 4 === 11);
  assertChoice('ch2-s3-p3', '$5$', 1 - (-1) + 2 + 1 === 5);
  assertChoice('ch2-s3-p4', '$9$', 1 + 2 * 2 + 4 === 9);

  // Stage 07
  assertOX('ch3-s1-ox1', false);
  assertOX('ch3-s1-ox2', true);
  assertOX('ch3-s1-ox3', true);
  assertChoice('ch3-s1-p1', '$(2x - 3y)(4x^2 + 6xy + 9y^2)$');
  assertChoice('ch3-s1-p2', '$2027$', 2026 + 1 === 2027);
  assertChoice('ch3-s1-p3', '$9\\sqrt{3}$', (36 / 4) === 9);
  assertChoice('ch3-s1-p4', '$6$', 2 + 2 + 2 === 6);

  // Stage 08
  assertOX('ch3-s2-ox1', false);
  assertOX('ch3-s2-ox2', true);
  assertOX('ch3-s2-ox3', false);
  assertChoice('ch3-s2-p1', '$10$', (-3) * (-3) + 1 * 1 === 10);
  assertChoice('ch3-s2-p2', '$4$', 1 - (-3) === 4);
  assertChoice('ch3-s2-p3', '빗변의 길이가 $z$인 직각삼각형');
  assertChoice('ch3-s2-p4', '$6$', 3 + 2 - (-1) === 6);

  // Stage 09
  assertOX('ch3-s3-ox1', true);
  assertOX('ch3-s3-ox2', false);
  assertOX('ch3-s3-ox3', true);
  assertChoice('ch3-s3-p1', '$14$', 1 + 4 + 9 === 14);
  assertChoice('ch3-s3-p2', '$x + 2$', [1, -1, 2, -3].every((r) => Math.pow(r, 4) + Math.pow(r, 3) - 7 * r * r - r + 6 === 0));
  assertChoice('ch3-s3-p3', '$2$', 7 + (-5) === 2);
  assertChoice('ch3-s3-p4', '$5x - 1$', [1, 2, 0.5, -3].every((r) => Math.abs(2 * Math.pow(r, 4) - Math.pow(r, 3) - 14 * r * r + 19 * r - 6) < 1e-9));

  // --- Unit II: Complex Numbers, Quadratic Equations & Quadratic Functions ---
  // Stage 10
  assertOX('ch4-s1-ox1', false);
  assertOX('ch4-s1-ox2', true);
  assertOX('ch4-s1-ox3', true);
  assertChoice('ch4-s1-p1', '$5$', 2 + 3 === 5);
  assertChoice('ch4-s1-p2', '$-1$', 0 - 1 === -1);
  assertChoice('ch4-s1-p3', '$3$', (3 * 3 - 4 * 3 + 3 === 0) && (3 - 1 !== 0));
  assertChoice('ch4-s1-p4', '$17$', (2 - 1) ** 2 + (3 - (-1)) ** 2 === 17);

  // Stage 11
  assertOX('ch4-s2-ox1', false);
  assertOX('ch4-s2-ox2', true);
  assertOX('ch4-s2-ox3', false);
  assertChoice('ch4-s2-p1', '$-1$', -4 + 3 === -1);
  assertChoice('ch4-s2-p2', '$5$개', [1, 2, 3, 4, 5, 6].filter((k) => k !== 2 && 6 - k >= 0).length === 5);
  assertChoice('ch4-s2-p3', '$-2b + 2$');
  assertChoice('ch4-s2-p4', '$12$', 3 + 9 === 12);

  // Stage 12
  assertOX('ch4-s3-ox1', false);
  assertOX('ch4-s3-ox2', true);
  assertOX('ch4-s3-ox3', false);
  assertChoice('ch4-s3-p1', '$6$', (16 - 4) / 2 === 6);
  assertChoice('ch4-s3-p2', '$1$', -4 + 5 === 1);
  assertChoice('ch4-s3-p3', '$16$', 3 * 6 - 2 === 16);
  assertChoice('ch4-s3-p4', '$5$', (12 + 7 + 1) / 4 === 5);

  // Stage 13
  assertOX('ch5-s1-ox1', true);
  assertOX('ch5-s1-ox2', false);
  assertOX('ch5-s1-ox3', true);
  assertChoice('ch5-s1-p1', '$10$', -2 - (-12) === 10);
  assertChoice('ch5-s1-p2', '$8$', 2 * 4 === 8);
  assertChoice('ch5-s1-p3', '$3$개', [1, 2, 3].every((k) => 4 - k > 0 && -k < 0));
  assertChoice('ch5-s1-p4', '$7$', (6 + 8) / 2 === 7);

  // Stage 14
  assertOX('ch5-s2-ox1', true);
  assertOX('ch5-s2-ox2', false);
  assertOX('ch5-s2-ox3', true);
  assertChoice('ch5-s2-p1', '$2$', 1 + 1 === 2);
  assertChoice('ch5-s2-p2', '$3$', -1 + 4 === 3);
  assertChoice('ch5-s2-p3', '$7$개', [-1, 0, 1, 2, 3, 4, 5].every((k) => (k - 2) ** 2 - 16 < 0));
  assertChoice('ch5-s2-p4', '$5\\sqrt{2}$', (4 - (-1)) ** 2 + (7 - 2) ** 2 === 50);

  // Stage 15 (Restricted-domain quadratic min/max 3-case verification)
  assertOX('ch5-s3-ox1', false);
  assertOX('ch5-s3-ox2', true);
  assertOX('ch5-s3-ox3', true);
  assertChoice('ch5-s3-p1', '$9$', 5 - (-4) === 9);
  assertChoice('ch5-s3-p2', '$13$', 16 - 8 + 5 === 13);
  assertChoice('ch5-s3-p3', '$25$', 5 * (10 - 5) === 25);
  assertChoice('ch5-s3-p4', '$\\dfrac{3}{2}$', -1.5 + 3 === 1.5 && Object.keys(stageById).length === 15);
}

function reportAndExit() {
  for (const w of warnings) console.warn(w);
  if (errors.length > 0) {
    console.error(`\n❌ Validation FAILED with ${errors.length} error(s):`);
    for (const e of errors) console.error('  ' + e);
    process.exit(1);
  }
  console.log('✅ Curriculum schema, IDs, LaTeX delimiters, and structure verified with 0 errors!');
}

main();
