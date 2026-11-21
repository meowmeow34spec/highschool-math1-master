/**
 * LOGIC PRISM · 고1 공통수학1 반학기 마스터
 * VisualLab — 4 Interactive HiDPI Visual Math Laboratories
 *
 * Tabs (matching curriculum `recommendedLabTab`):
 *  1. 'poly-sim'           — 🧩 곱셈공식 기하 블록 & 대칭 구조 실험실
 *  2. 'synthetic-div'      — 🎯 조립제법 스텝 시뮬레이터 & ax+b 몫 함정 해부기
 *  3. 'complex-plane'      — 🌀 복소평면 iⁿ 회전기 & 켤레복소수 실험실
 *  4. 'quadratic-explorer' — 📈 이차함수 판별식 D · 직선 교점 · 제한된 범위 최대·최소 실험실
 */
(function (root) {
  'use strict';

  const VALID_TABS = ['poly-sim', 'synthetic-div', 'complex-plane', 'quadratic-explorer'];

  const TAB_META = [
    {
      id: 'poly-sim',
      icon: '🧩',
      shortLabel: '곱셈공식 기하 블록',
      unitBadge: 'Ⅰ-1 · Ⅰ-3 다항식·인수분해',
      title: '곱셈공식 기하 블록 & 대칭 구조 실험실',
      subtitle: '공식을 무작정 외우지 마세요! 넓이와 3D 부피 블록을 직접 쪼개고 붙여보면 왜 2ab와 3ab(a+b)가 생기는지 한눈에 보입니다.'
    },
    {
      id: 'synthetic-div',
      icon: '🎯',
      shortLabel: '조립제법 & 몫 함정',
      unitBadge: 'Ⅰ-2 항등식과 나머지정리',
      title: '조립제법 스텝 시뮬레이터 & ax+b 몫 함정 해부기',
      subtitle: '내려쓰고 → α 곱해 올리고 → 더하는 조립제법 전 과정을 스텝별로 해부하고, 일차항 계수가 1이 아닐 때 몫이 왜 1/d배가 되는지 증명합니다.'
    },
    {
      id: 'complex-plane',
      icon: '🌀',
      shortLabel: '복소평면 iⁿ 회전기',
      unitBadge: 'Ⅱ-1 복소수와 이차방정식',
      title: '복소평면 iⁿ 90° 회전기 & 켤레복소수 실험실',
      subtitle: '허수단위 i를 곱하는 것은 복소평면에서 정확히 반시계 방향 90° 회전입니다! 왜 i² = -1이고 연속한 네 거듭제곱의 합이 0인지 눈으로 확인하세요.'
    },
    {
      id: 'quadratic-explorer',
      icon: '📈',
      shortLabel: '이차함수 D & 최대·최소',
      unitBadge: 'Ⅱ-2 이차방정식과 이차함수',
      title: '이차함수 판별식 D · 직선 교점 · 제한된 범위 최대·최소 실험실',
      subtitle: '포물선과 직선의 위치 관계를 판별식 D로 판독하고, 대칭축 x = p와 제한 구간 [α, β]의 위치 케이스별 최대·최소 원리를 정복합니다.'
    }
  ];

  // =========================================================================
  // Safe MathRender Delegation + Zero-Dollar-Leak Fallback
  // =========================================================================

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function miniFallbackLatex(latex, isBlock) {
    const cleaned = String(latex || '')
      .trim()
      .replace(/^\$\$|\$\$$/g, '')
      .replace(/^\$|\$$/g, '');
    const html = escapeHtml(cleaned)
      .replace(/\\iff/g, ' ⟺ ')
      .replace(/\\implies|\\Rightarrow/g, ' ⇒ ')
      .replace(/\\to\b|\\rightarrow/g, ' → ')
      .replace(/\\le\b|\\leq\b/g, ' ≤ ')
      .replace(/\\ge\b|\\geq\b/g, ' ≥ ')
      .replace(/\\neq\b|\\ne\b/g, ' ≠ ')
      .replace(/\\pm\b/g, ' ± ')
      .replace(/\\times\b/g, ' × ')
      .replace(/\\div\b/g, ' ÷ ')
      .replace(/\\cdot\b/g, ' · ')
      .replace(/\\alpha\b/g, 'α')
      .replace(/\\beta\b/g, 'β')
      .replace(/\\overline\{([^}]+)\}/g, '$1\u0304')
      .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
      .replace(/\\text\{([^}]+)\}/g, '$1')
      .replace(/\^\{([^}]+)\}/g, '<sup>$1</sup>')
      .replace(/\^([0-9a-zA-Z+\-]+)/g, '<sup>$1</sup>')
      .replace(/_\{([^}]+)\}/g, '<sub>$1</sub>')
      .replace(/_([0-9a-zA-Z+\-]+)/g, '<sub>$1</sub>');
    return isBlock
      ? '<div class="math-block math-fallback">' + html + '</div>'
      : '<span class="math-inline math-fallback">' + html + '</span>';
  }

  function mInline(latex) {
    if (root && root.MathRender && typeof root.MathRender.inline === 'function') {
      return root.MathRender.inline(latex);
    }
    return miniFallbackLatex(latex, false);
  }

  function mBlock(latex) {
    if (root && root.MathRender && typeof root.MathRender.block === 'function') {
      return root.MathRender.block(latex);
    }
    return miniFallbackLatex(latex, true);
  }

  function mText(str) {
    if (root && root.MathRender && typeof root.MathRender.formatText === 'function') {
      return root.MathRender.formatText(str);
    }
    const raw = String(str || '');
    const tokens = [];
    let working = raw.replace(/\$\$([\s\S]+?)\$\$/g, function (_m, ex) {
      const idx = tokens.length;
      tokens.push({ block: true, ex: ex });
      return '\uE000M' + idx + '\uE001';
    });
    working = working.replace(/\$([^\$]+?)\$/g, function (_m, ex) {
      const idx = tokens.length;
      tokens.push({ block: false, ex: ex });
      return '\uE000M' + idx + '\uE001';
    });
    let safe = escapeHtml(working)
      .replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\r?\n/g, '<br>');
    return safe.replace(/\uE000M(\d+)\uE001/g, function (_m, id) {
      const t = tokens[Number(id)];
      return t ? miniFallbackLatex(t.ex, t.block) : '';
    });
  }

  function playClickSound() {
    try {
      if (root && root.SoundFX && typeof root.SoundFX.click === 'function') {
        root.SoundFX.click();
      }
    } catch (_e) {
      // ignore audio errors
    }
  }

  // =========================================================================
  // Exact Number & Rational Polynomial Formatting Helpers
  // =========================================================================

  function gcd(a, b) {
    let x = Math.abs(Math.round(a));
    let y = Math.abs(Math.round(b));
    while (y !== 0) {
      const t = x % y;
      x = y;
      y = t;
    }
    return x || 1;
  }

  function cleanNum(val, digits) {
    const d = digits === undefined ? 2 : digits;
    const rounded = Math.round(val * 10000) / 10000;
    if (Math.abs(rounded) < 1e-7) return 0;
    if (Math.abs(rounded - Math.round(rounded)) < 1e-6) return Math.round(rounded);
    return Number(rounded.toFixed(d));
  }

  function fmtPlain(val, digits) {
    return String(cleanNum(val, digits));
  }

  /**
   * Converts decimal to exact reduced fraction { sign, num, den, isInt } when denominator <= 12
   */
  function toRational(val) {
    if (Math.abs(val) < 1e-7) return { sign: 1, num: 0, den: 1, isInt: true };
    const sign = val < 0 ? -1 : 1;
    const abs = Math.abs(val);
    if (Math.abs(abs - Math.round(abs)) < 1e-5) {
      return { sign: sign, num: Math.round(abs), den: 1, isInt: true };
    }
    const candidateDens = [2, 3, 4, 5, 6, 8, 10, 12];
    for (let i = 0; i < candidateDens.length; i++) {
      const den = candidateDens[i];
      const nearNum = Math.round(abs * den);
      if (Math.abs(abs - nearNum / den) < 1e-4) {
        const g = gcd(nearNum, den);
        const rNum = nearNum / g;
        const rDen = den / g;
        return { sign: sign, num: rNum, den: rDen, isInt: rDen === 1 };
      }
    }
    return null;
  }

  function numToLatex(val) {
    const rat = toRational(val);
    if (rat) {
      if (rat.num === 0) return '0';
      const prefix = rat.sign < 0 ? '-' : '';
      if (rat.isInt) return prefix + rat.num;
      return prefix + '\\frac{' + rat.num + '}{' + rat.den + '}';
    }
    return fmtPlain(val, 2);
  }

  function numToCanvas(val) {
    const rat = toRational(val);
    if (rat) {
      if (rat.num === 0) return '0';
      const prefix = rat.sign < 0 ? '-' : '';
      if (rat.isInt) return prefix + rat.num;
      return prefix + rat.num + '/' + rat.den;
    }
    return fmtPlain(val, 2);
  }

  /**
   * Formats polynomial [{ c, exp }] into clean LaTeX (e.g. `2x^3 - x^2 + \frac{1}{2}x - 3`)
   */
  function polyToLatex(terms, varName) {
    const v = varName || 'x';
    const nonZero = terms.filter(function (t) {
      return Math.abs(t.c) > 1e-7;
    });
    if (nonZero.length === 0) return '0';
    let out = '';
    for (let i = 0; i < nonZero.length; i++) {
      const c = nonZero[i].c;
      const exp = nonZero[i].exp;
      const isNeg = c < 0;
      const absVal = Math.abs(c);
      if (i === 0) {
        if (isNeg) out += '-';
      } else {
        out += isNeg ? ' - ' : ' + ';
      }

      let coeffStr = '';
      if (exp === 0 || Math.abs(absVal - 1) > 1e-6) {
        coeffStr = numToLatex(absVal);
      }
      let varStr = '';
      if (exp === 1) varStr = v;
      else if (exp > 1) varStr = v + '^' + exp;

      out += coeffStr + varStr;
    }
    return out;
  }

  function polyToCanvas(terms, varName) {
    const v = varName || 'x';
    const supMap = { 2: '²', 3: '³', 4: '⁴' };
    const nonZero = terms.filter(function (t) {
      return Math.abs(t.c) > 1e-7;
    });
    if (nonZero.length === 0) return '0';
    let out = '';
    for (let i = 0; i < nonZero.length; i++) {
      const c = nonZero[i].c;
      const exp = nonZero[i].exp;
      const isNeg = c < 0;
      const absVal = Math.abs(c);
      if (i === 0) {
        if (isNeg) out += '-';
      } else {
        out += isNeg ? ' - ' : ' + ';
      }
      let coeffStr = '';
      if (exp === 0 || Math.abs(absVal - 1) > 1e-6) {
        coeffStr = numToCanvas(absVal);
      }
      let varStr = '';
      if (exp === 1) varStr = v;
      else if (exp > 1) varStr = v + (supMap[exp] || '^' + exp);
      out += coeffStr + varStr;
    }
    return out;
  }

  function complexToLatex(re, im) {
    const r = cleanNum(re, 2);
    const m = cleanNum(im, 2);
    if (r === 0 && m === 0) return '0';
    if (m === 0) return numToLatex(r);
    const absM = Math.abs(m);
    const imPart = (Math.abs(absM - 1) < 1e-6 ? '' : numToLatex(absM)) + 'i';
    if (r === 0) return (m < 0 ? '-' : '') + imPart;
    return numToLatex(r) + (m < 0 ? ' - ' : ' + ') + imPart;
  }

  function complexToCanvas(re, im) {
    const r = cleanNum(re, 2);
    const m = cleanNum(im, 2);
    if (r === 0 && m === 0) return '0';
    if (m === 0) return numToCanvas(r);
    const absM = Math.abs(m);
    const imPart = (Math.abs(absM - 1) < 1e-6 ? '' : numToCanvas(absM)) + 'i';
    if (r === 0) return (m < 0 ? '-' : '') + imPart;
    return numToCanvas(r) + (m < 0 ? ' - ' : ' + ') + imPart;
  }

  // =========================================================================
  // Theme Palette & Scoped Supplemental Styles
  // =========================================================================

  function isDarkTheme() {
    if (typeof document === 'undefined' || !document.documentElement) return false;
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  function getPalette() {
    const dark = isDarkTheme();
    if (dark) {
      return {
        dark: true,
        bgTop: '#0B1222',
        bgBottom: '#111A2E',
        gridMajor: 'rgba(148, 163, 184, 0.16)',
        gridMinor: 'rgba(148, 163, 184, 0.06)',
        axis: '#94A3B8',
        ink: '#F8FAFC',
        inkMuted: '#CBD5E1',
        inkSubtle: '#94A3B8',
        panelBg: 'rgba(15, 23, 42, 0.88)',
        panelBorder: 'rgba(148, 163, 184, 0.25)',
        indigo: '#818CF8',
        indigoStrong: '#6366F1',
        indigoFill: 'rgba(99, 102, 241, 0.34)',
        indigoSoft: 'rgba(99, 102, 241, 0.16)',
        sky: '#38BDF8',
        skyStrong: '#0EA5E9',
        skyFill: 'rgba(56, 189, 248, 0.30)',
        skySoft: 'rgba(56, 189, 248, 0.15)',
        emerald: '#34D399',
        emeraldStrong: '#10B981',
        emeraldFill: 'rgba(16, 185, 129, 0.32)',
        emeraldSoft: 'rgba(16, 185, 129, 0.15)',
        violet: '#A78BFA',
        violetFill: 'rgba(167, 139, 250, 0.28)',
        rose: '#FB7185',
        roseStrong: '#F43F5E',
        roseFill: 'rgba(244, 63, 94, 0.30)',
        amber: '#FBBF24',
        amberStrong: '#F59E0B',
        amberFill: 'rgba(251, 191, 36, 0.28)'
      };
    }
    return {
      dark: false,
      bgTop: '#FFFFFF',
      bgBottom: '#F4F7FE',
      gridMajor: 'rgba(15, 23, 42, 0.10)',
      gridMinor: 'rgba(15, 23, 42, 0.045)',
      axis: '#475569',
      ink: '#0F172A',
      inkMuted: '#334155',
      inkSubtle: '#64748B',
      panelBg: 'rgba(255, 255, 255, 0.93)',
      panelBorder: 'rgba(15, 23, 42, 0.12)',
      indigo: '#4F46E5',
      indigoStrong: '#4338CA',
      indigoFill: 'rgba(79, 70, 229, 0.20)',
      indigoSoft: 'rgba(79, 70, 229, 0.09)',
      sky: '#0284C7',
      skyStrong: '#0EA5E9',
      skyFill: 'rgba(14, 165, 233, 0.22)',
      skySoft: 'rgba(14, 165, 233, 0.10)',
      emerald: '#059669',
      emeraldStrong: '#10B981',
      emeraldFill: 'rgba(16, 185, 129, 0.22)',
      emeraldSoft: 'rgba(16, 185, 129, 0.10)',
      violet: '#7C3AED',
      violetFill: 'rgba(124, 58, 237, 0.18)',
      rose: '#E11D48',
      roseStrong: '#F43F5E',
      roseFill: 'rgba(244, 63, 94, 0.18)',
      amber: '#D97706',
      amberStrong: '#F59E0B',
      amberFill: 'rgba(245, 158, 11, 0.20)'
    };
  }

  function ensureScopedStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById('visual-lab-scoped-styles')) return;
    const style = document.createElement('style');
    style.id = 'visual-lab-scoped-styles';
    style.textContent = [
      '.vl-canvas-stage { position: relative; width: 100%; min-width: 0; max-width: 100%; overflow: hidden; border-radius: 14px; }',
      '.vl-canvas-stage canvas { display: block; width: 100% !important; max-width: 100%; touch-action: pan-y; }',
      '.vl-canvas-topbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.55rem; min-width: 0; }',
      '.vl-canvas-title-wrap { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; min-width: 0; }',
      '.vl-unit-pill { display: inline-flex; align-items: center; padding: 0.26rem 0.68rem; border-radius: 999px; font-size: 0.76rem; font-weight: 800; background: var(--tint-indigo); color: var(--text-indigo); border: 1px solid var(--border-formula); }',
      '.vl-submode-bar { display: flex; flex-wrap: wrap; gap: 0.45rem; padding: 0.35rem; border-radius: 13px; background: var(--bg-subtle); border: 1px solid var(--border-card); }',
      '.vl-submode-btn { flex: 1 1 auto; min-height: 36px; padding: 0.42rem 0.72rem; border-radius: 10px; font-size: 0.82rem; font-weight: 760; color: var(--ink-secondary); background: transparent; border: 1px solid transparent; cursor: pointer; transition: all 0.15s ease; text-align: center; }',
      '.vl-submode-btn:hover { color: var(--ink-primary); background: rgba(148, 163, 184, 0.14); }',
      '.vl-submode-btn.is-active { background: var(--bg-card-solid); color: var(--text-indigo); border-color: var(--border-formula); box-shadow: var(--shadow-xs); }',
      '.vl-action-bar { display: flex; flex-wrap: wrap; gap: 0.48rem; align-items: center; }',
      '.vl-readout-label { font-size: 0.76rem; font-weight: 740; color: var(--ink-secondary); }',
      '.vl-readout-value { font-size: 0.96rem; font-weight: 820; color: var(--ink-primary); line-height: 1.45; word-break: break-word; }',
      '.vl-compare-split { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem; min-width: 0; }',
      '.vl-compare-box { min-width: 0; padding: 0.9rem 1rem; border-radius: 14px; border: 1.5px solid var(--border-card); display: flex; flex-direction: column; gap: 0.38rem; font-size: 0.88rem; line-height: 1.62; }',
      '.vl-compare-box.is-trap { background: var(--tint-amber); border-color: rgba(245, 158, 11, 0.38); }',
      '.vl-compare-box.is-true { background: var(--tint-emerald); border-color: rgba(16, 185, 129, 0.40); }',
      '.vl-compare-title { font-size: 0.83rem; font-weight: 820; display: flex; align-items: center; gap: 0.35rem; }',
      '.vl-compare-box.is-trap .vl-compare-title { color: var(--text-amber); }',
      '.vl-compare-box.is-true .vl-compare-title { color: var(--text-emerald); }',
      '.vl-insight-note { padding: 0.85rem 1rem; border-radius: 13px; background: var(--bg-muted); border: 1px solid var(--border-card); border-left: 4px solid var(--accent-indigo); font-size: 0.88rem; line-height: 1.66; color: var(--ink-primary); }',
      '.vl-slider-val { font-variant-numeric: tabular-nums; padding: 0.12rem 0.48rem; border-radius: 7px; background: var(--tint-indigo); color: var(--text-indigo); font-size: 0.82rem; font-weight: 800; }',
      '@media (max-width: 680px) { .vl-compare-split { grid-template-columns: minmax(0, 1fr); } .vl-submode-btn { font-size: 0.78rem; padding: 0.38rem 0.55rem; } }'
    ].join('\n');
    document.head.appendChild(style);
  }

  // =========================================================================
  // Canvas Drawing Primitives (HiDPI crisp lines, rounded cards, arrows, badges)
  // =========================================================================

  function prepareCanvas(canvas, baseDesktopHeight) {
    if (!canvas) return null;
    const parent = canvas.parentElement;
    const rawW = (parent && parent.clientWidth) || canvas.clientWidth || 640;
    const cssW = Math.max(260, Math.floor(rawW));
    const cssH = cssW < 440
      ? Math.round(baseDesktopHeight * 0.84)
      : cssW < 600
      ? Math.round(baseDesktopHeight * 0.92)
      : baseDesktopHeight;
    const dpr = Math.min((typeof window !== 'undefined' && window.devicePixelRatio) || 1, 2.5);

    const targetW = Math.round(cssW * dpr);
    const targetH = Math.round(cssH * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }
    canvas.style.height = cssH + 'px';

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);
    return { ctx: ctx, w: cssW, h: cssH, dpr: dpr };
  }

  function fillCanvasBackdrop(ctx, w, h, pal, spacing) {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, pal.bgTop);
    grad.addColorStop(1, pal.bgBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    const step = spacing || 24;
    ctx.save();
    ctx.strokeStyle = pal.gridMinor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = step; x < w; x += step) {
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, h);
    }
    for (let y = step; y < h; y += step) {
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(w, y + 0.5);
    }
    ctx.stroke();
    ctx.restore();
  }

  function roundRectPath(ctx, x, y, w, h, r) {
    const radius = Math.max(0, Math.min(r, Math.min(Math.abs(w), Math.abs(h)) / 2));
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  function drawBadge(ctx, x, y, text, bg, border, fg, align) {
    ctx.save();
    ctx.font = '700 12px "Pretendard Variable", Pretendard, system-ui, sans-serif';
    const padX = 9;
    const h = 24;
    const tw = ctx.measureText(text).width;
    const bw = tw + padX * 2;
    let bx = x;
    if (align === 'center') bx = x - bw / 2;
    else if (align === 'right') bx = x - bw;
    const by = y - h / 2;
    roundRectPath(ctx, bx, by, bw, h, 8);
    ctx.fillStyle = bg;
    ctx.fill();
    if (border) {
      ctx.strokeStyle = border;
      ctx.lineWidth = 1.25;
      ctx.stroke();
    }
    ctx.fillStyle = fg;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, bx + bw / 2, by + h / 2 + 0.5);
    ctx.restore();
  }

  function drawArrow(ctx, x1, y1, x2, y2, color, lineWidth, headLen) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.hypot(dx, dy);
    if (dist < 1) return;
    const angle = Math.atan2(dy, dx);
    const hl = headLen || 8;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lineWidth || 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - hl * Math.cos(angle - Math.PI / 6), y2 - hl * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x2 - hl * Math.cos(angle + Math.PI / 6), y2 - hl * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawCurvedArrow(ctx, x1, y1, cx, cy, x2, y2, color, lineWidth) {
    const angle = Math.atan2(y2 - cy, x2 - cx);
    const hl = 8;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lineWidth || 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(cx, cy, x2, y2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - hl * Math.cos(angle - Math.PI / 6), y2 - hl * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x2 - hl * Math.cos(angle + Math.PI / 6), y2 - hl * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // =========================================================================
  // Application State for All 4 Labs
  // =========================================================================

  const state = {
    activeTab: 'poly-sim',
    containerEl: null,
    canvasEl: null,
    controlsEl: null,
    readoutEl: null,
    bannerEl: null,
    extraPanelEl: null,
    animRaf: 0,
    synTimer: 0,
    isDraggingCanvas: false,

    poly: {
      mode: 'square', // 'square' | 'diff-sq' | 'cube-sym'
      a: 4,
      b: 2,
      explode: 0, // 0..1 gap animation
      explodeTarget: 0,
      morph: 1, // for diff-sq (0 = L-shape only, 1 = full before -> after view with animated slice)
      cubeGap: 0.42 // 3D isometric slab explosion factor
    },

    syn: {
      p: 2,
      q: -4,
      r: 6,
      s: -1,
      d: 2,
      e: 2,
      step: 7 // 0..7 (starts at 7 so full synthetic division diagram & trap comparison are immediately rich)
    },

    complex: {
      a: 2,
      b: 1,
      rotSteps: 1, // 0, 1, 2, 3 -> z, iz, -z, -iz
      animAngleDeg: 90, // smoothly eases toward rotSteps * 90
      showConj: true,
      showCycle: false
    },

    quad: {
      mode: 'discriminant', // 'discriminant' | 'minmax'
      // Mode A: y = ax^2 + bx + c vs y = mx + n
      a: 1,
      b: -2,
      c: -1,
      m: 1,
      n: 3,
      // Mode B: y = a2*(x - p)^2 + q on [alpha, beta]
      a2: 1,
      p: 1,
      q: -2,
      alpha: -1,
      beta: 4
    }
  };

  let resizeObserver = null;
  let themeObserver = null;
  let windowResizeBound = false;

  function cancelActiveAnimations() {
    if (state.animRaf) {
      cancelAnimationFrame(state.animRaf);
      state.animRaf = 0;
    }
    if (state.synTimer) {
      clearInterval(state.synTimer);
      state.synTimer = 0;
    }
  }

  // =========================================================================
  // LAB 1: 'poly-sim' — 곱셈공식 기하 블록 & 대칭 구조 실험실
  // =========================================================================

  function renderPolyControls() {
    const p = state.poly;
    if (p.mode === 'diff-sq' && p.b >= p.a - 0.4) {
      p.b = Math.max(0.5, cleanNum(p.a - 0.5, 1));
    }

    const bMax = p.mode === 'diff-sq' ? Math.max(0.5, cleanNum(p.a - 0.5, 1)) : (p.mode === 'cube-sym' ? 4 : 5);
    const aMin = p.mode === 'diff-sq' ? 2 : 1;
    const aMax = p.mode === 'cube-sym' ? 5 : 7;

    let actionBtnHtml = '';
    if (p.mode === 'square') {
      const isExploded = p.explodeTarget > 0.1;
      actionBtnHtml =
        '<button type="button" class="btn btn-sm ' +
        (isExploded ? 'btn-primary' : 'btn-secondary') +
        '" data-action="poly-toggle-explode">' +
        (isExploded ? '🧩 블록 밀착 합치기' : '💥 2ab 조각 분리 해부') +
        '</button>';
    } else if (p.mode === 'diff-sq') {
      actionBtnHtml =
        '<button type="button" class="btn btn-sm btn-primary" data-action="poly-play-morph">▶ 직사각형 이동 애니메이션 재생</button>';
    } else {
      const separated = p.cubeGap > 0.15;
      actionBtnHtml =
        '<button type="button" class="btn btn-sm ' +
        (separated ? 'btn-primary' : 'btn-secondary') +
        '" data-action="poly-toggle-cube-gap">' +
        (separated ? '🧊 정육면체 (a+b)³ 결합 보기' : '💥 3ab(a+b) 기둥 분리 보기') +
        '</button>';
    }

    return (
      '<div class="vl-submode-bar" role="tablist" aria-label="곱셈공식 실험 모드">' +
        '<button type="button" class="vl-submode-btn ' + (p.mode === 'square' ? 'is-active' : '') + '" data-poly-mode="square">(a+b)² 넓이 분해</button>' +
        '<button type="button" class="vl-submode-btn ' + (p.mode === 'diff-sq' ? 'is-active' : '') + '" data-poly-mode="diff-sq">(a+b)(a-b) 합차 이동</button>' +
        '<button type="button" class="vl-submode-btn ' + (p.mode === 'cube-sym' ? 'is-active' : '') + '" data-poly-mode="cube-sym">a³+b³ 세제곱 대칭</button>' +
      '</div>' +

      '<div class="lab-control-row">' +
        '<label for="vl-poly-a"><span>길이 ' + mInline('a') + ' 조절</span><span class="vl-slider-val" id="vl-poly-a-val">a = ' + fmtPlain(p.a, 1) + '</span></label>' +
        '<input id="vl-poly-a" class="lab-slider" type="range" min="' + aMin + '" max="' + aMax + '" step="0.5" value="' + p.a + '" data-slider="poly-a">' +
      '</div>' +

      '<div class="lab-control-row">' +
        '<label for="vl-poly-b"><span>길이 ' + mInline('b') + ' 조절</span><span class="vl-slider-val" id="vl-poly-b-val">b = ' + fmtPlain(p.b, 1) + '</span></label>' +
        '<input id="vl-poly-b" class="lab-slider" type="range" min="0.5" max="' + bMax + '" step="0.5" value="' + Math.min(p.b, bMax) + '" data-slider="poly-b">' +
      '</div>' +

      '<div class="vl-action-bar">' + actionBtnHtml + '</div>' +

      '<div>' +
        '<div class="vl-readout-label" style="margin-bottom:0.4rem;">⚡ 추천 실험 프리셋</div>' +
        '<div class="lab-presets">' +
          '<button type="button" class="chip" data-poly-preset="4,2,square">기본 정석 (a=4, b=2)</button>' +
          '<button type="button" class="chip" data-poly-preset="3,3,square">대칭 등호 (a=3, b=3)</button>' +
          '<button type="button" class="chip" data-poly-preset="5,2,diff-sq">합차 절단 (5² - 2² = 21)</button>' +
          '<button type="button" class="chip" data-poly-preset="3,2,cube-sym">세제곱 해부 (3³ + 2³ = 35)</button>' +
        '</div>' +
      '</div>' +

      '<div class="vl-insight-note" id="vl-poly-note">' + getPolyInsightHtml() + '</div>'
    );
  }

  function getPolyInsightHtml() {
    const p = state.poly;
    const a = p.a;
    const b = p.b;
    if (p.mode === 'square') {
      const twoAb = cleanNum(2 * a * b, 2);
      return mText(
        '**내신 단골 오개념 격파!** 흔히 $(a+b)^2 = a^2 + b^2$이라고 착각하기 쉽지만, 정사각형 가로·세로를 모두 늘리면 모서리 양쪽에 직사각형 조각 $ab$가 **2개($2ab = ' +
          twoAb +
          '$)** 반드시 태어납니다! 반대로 제곱의 합만 구할 때는 전체에서 이 두 조각을 덜어내어 $a^2 + b^2 = (a+b)^2 - 2ab$가 됩니다.'
      );
    }
    if (p.mode === 'diff-sq') {
      return mText(
        '**합차공식 도형 증명!** 큰 정사각형 $a^2$에서 구석의 작은 정사각형 $b^2$을 잘라낸 **ㄴ자 도형($a^2 - b^2$)**의 오른쪽 날개 조각 $b(a-b)$를 잘라 옆에 붙이면, 가로 $(a+b)$ · 세로 $(a-b)$인 완벽한 직사각형이 됩니다!'
      );
    }
    const slab3 = cleanNum(3 * a * b * (a + b), 2);
    return mText(
      '**세제곱 대칭 변형의 핵심!** 한 모서리가 $(a+b)$인 정육면체 부피 $(a+b)^3$에서 순수 정육면체 $a^3$과 $b^3$만 남기려면, 나머지 직육면체 기둥 3묶음 $3ab(a+b) = ' +
        slab3 +
        '$을 빼내면 됩니다: **$a^3 + b^3 = (a+b)^3 - 3ab(a+b)$**!'
    );
  }

  function updatePolyReadoutsAndBanner() {
    if (!state.readoutEl || !state.bannerEl) return;
    const p = state.poly;
    const a = p.a;
    const b = p.b;

    const noteEl = state.controlsEl && state.controlsEl.querySelector('#vl-poly-note');
    if (noteEl) noteEl.innerHTML = getPolyInsightHtml();

    if (p.mode === 'square') {
      const total = cleanNum((a + b) * (a + b), 2);
      const a2 = cleanNum(a * a, 2);
      const b2 = cleanNum(b * b, 2);
      const sumSq = cleanNum(a2 + b2, 2);
      const twoAb = cleanNum(2 * a * b, 2);

      state.bannerEl.innerHTML = mText(
        '$$(a+b)^2 = a^2 + 2ab + b^2 \\implies (' +
          fmtPlain(a) + '+' + fmtPlain(b) + ')^2 = ' +
          a2 + ' + ' + twoAb + ' + ' + b2 + ' = ' + total + '$$' +
        '변형 공식 확인: $a^2 + b^2 = (a+b)^2 - 2ab = ' + total + ' - ' + twoAb + ' = ' + sumSq + '$'
      );

      state.readoutEl.innerHTML =
        readoutCard('전체 넓이 (a+b)²', fmtPlain(total) + ' (' + fmtPlain(a + b) + '²)', 'indigo') +
        readoutCard('정사각형 합 a² + b²', fmtPlain(a2) + ' + ' + fmtPlain(b2) + ' = ' + fmtPlain(sumSq), 'emerald') +
        readoutCard('직사각형 2개 (2ab)', '2 × ' + fmtPlain(cleanNum(a * b, 2)) + ' = ' + fmtPlain(twoAb), 'sky') +
        readoutCard('(a+b)² vs a²+b² 차이', '+' + fmtPlain(twoAb) + ' (2ab 조각!)', 'rose');
      return;
    }

    if (p.mode === 'diff-sq') {
      const a2 = cleanNum(a * a, 2);
      const b2 = cleanNum(b * b, 2);
      const diff = cleanNum(a2 - b2, 2);
      const sum = cleanNum(a + b, 2);
      const sub = cleanNum(a - b, 2);

      state.bannerEl.innerHTML = mText(
        '$$a^2 - b^2 = (a+b)(a-b) \\implies ' +
          fmtPlain(a) + '^2 - ' + fmtPlain(b) + '^2 = (' + fmtPlain(sum) + ')\\times(' + fmtPlain(sub) + ') = ' + fmtPlain(diff) + '$$'
      );

      state.readoutEl.innerHTML =
        readoutCard('절단 후 넓이 a² - b²', fmtPlain(a2) + ' - ' + fmtPlain(b2) + ' = ' + fmtPlain(diff), 'indigo') +
        readoutCard('새 직사각형 가로 (a+b)', fmtPlain(a) + ' + ' + fmtPlain(b) + ' = ' + fmtPlain(sum), 'sky') +
        readoutCard('새 직사각형 세로 (a-b)', fmtPlain(a) + ' - ' + fmtPlain(b) + ' = ' + fmtPlain(sub), 'emerald') +
        readoutCard('직사각형 넓이 (a+b)(a-b)', fmtPlain(sum) + ' × ' + fmtPlain(sub) + ' = ' + fmtPlain(diff), 'emerald');
      return;
    }

    // cube-sym
    const sum = cleanNum(a + b, 2);
    const totalCube = cleanNum(Math.pow(a + b, 3), 2);
    const a3 = cleanNum(Math.pow(a, 3), 2);
    const b3 = cleanNum(Math.pow(b, 3), 2);
    const sumCubes = cleanNum(a3 + b3, 2);
    const threeAbSum = cleanNum(3 * a * b * (a + b), 2);

    state.bannerEl.innerHTML = mText(
      '$$a^3 + b^3 = (a+b)^3 - 3ab(a+b) \\implies ' +
        fmtPlain(a3) + ' + ' + fmtPlain(b3) + ' = ' + fmtPlain(totalCube) + ' - ' + fmtPlain(threeAbSum) + ' = ' + fmtPlain(sumCubes) + '$$'
    );

    state.readoutEl.innerHTML =
      readoutCard('전체 부피 (a+b)³', fmtPlain(sum) + '³ = ' + fmtPlain(totalCube), 'indigo') +
      readoutCard('빠져나간 기둥 3ab(a+b)', '3×' + fmtPlain(cleanNum(a * b, 2)) + '×' + fmtPlain(sum) + ' = ' + fmtPlain(threeAbSum), 'sky') +
      readoutCard('남은 부피 a³ + b³', fmtPlain(a3) + ' + ' + fmtPlain(b3) + ' = ' + fmtPlain(sumCubes), 'emerald') +
      readoutCard('인수분해 검증 (a+b)(a²-ab+b²)', fmtPlain(sum) + ' × ' + fmtPlain(cleanNum(a * a - a * b + b * b, 2)) + ' = ' + fmtPlain(sumCubes), 'indigo');
  }

  function readoutCard(label, valueHtml, accentKey) {
    const colorMap = {
      indigo: 'var(--text-indigo)',
      sky: 'var(--text-sky)',
      emerald: 'var(--text-emerald)',
      rose: 'var(--text-rose)',
      amber: 'var(--text-amber)'
    };
    const col = colorMap[accentKey] || 'var(--ink-primary)';
    return (
      '<div class="lab-readout-item">' +
        '<span class="vl-readout-label">' + escapeHtml(label) + '</span>' +
        '<span class="vl-readout-value" style="color:' + col + ';">' + escapeHtml(valueHtml) + '</span>' +
      '</div>'
    );
  }

  function drawPolyCanvas() {
    const prep = prepareCanvas(state.canvasEl, 410);
    if (!prep) return;
    const ctx = prep.ctx;
    const w = prep.w;
    const h = prep.h;
    const pal = getPalette();
    fillCanvasBackdrop(ctx, w, h, pal, 24);

    if (state.poly.mode === 'square') {
      drawPolySquareMode(ctx, w, h, pal);
    } else if (state.poly.mode === 'diff-sq') {
      drawPolyDiffSqMode(ctx, w, h, pal);
    } else {
      drawPolyCubeSymMode(ctx, w, h, pal);
    }
  }

  function drawPolySquareMode(ctx, w, h, pal) {
    const a = state.poly.a;
    const b = state.poly.b;
    const totalLen = a + b;
    const gap = state.poly.explode * 12;

    const wide = w >= 540;
    const sqAreaW = wide ? w * 0.57 : w - 28;
    const sqAreaH = wide ? h - 72 : h * 0.62;
    const maxPx = Math.max(110, Math.min(sqAreaW - 56 - gap, sqAreaH - 46 - gap));
    const scale = maxPx / totalLen;
    const aPx = a * scale;
    const bPx = b * scale;
    const fullPx = aPx + bPx + gap;

    const startX = wide ? Math.max(46, (sqAreaW - fullPx) / 2 + 12) : (w - fullPx) / 2;
    const startY = wide ? Math.max(54, (h - fullPx) / 2 + 12) : 48;

    drawBadge(ctx, 14, 22, '기하 넓이 분해: (a + b)² = a² + 2ab + b²', pal.indigoSoft, pal.indigo, pal.ink, 'left');

    // Dimension labels along top & left
    ctx.save();
    ctx.font = '700 12.5px "Pretendard Variable", Pretendard, sans-serif';
    ctx.fillStyle = pal.inkMuted;
    ctx.textAlign = 'center';
    ctx.fillText('a = ' + fmtPlain(a), startX + aPx / 2, startY - 12);
    ctx.fillText('b = ' + fmtPlain(b), startX + aPx + gap + bPx / 2, startY - 12);

    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText('a=' + fmtPlain(a), startX - 8, startY + aPx / 2);
    ctx.fillText('b=' + fmtPlain(b), startX - 8, startY + aPx + gap + bPx / 2);
    ctx.restore();

    // 4 geometric blocks: a^2 (Indigo), ab (Sky) x2, b^2 (Emerald)
    drawBlockTile(ctx, startX, startY, aPx, aPx, pal.indigoFill, pal.indigo, 'a²', fmtPlain(cleanNum(a * a, 2)), pal.ink);
    drawBlockTile(ctx, startX + aPx + gap, startY, bPx, aPx, pal.skyFill, pal.sky, 'ab', fmtPlain(cleanNum(a * b, 2)), pal.ink);
    drawBlockTile(ctx, startX, startY + aPx + gap, aPx, bPx, pal.skyFill, pal.sky, 'ab', fmtPlain(cleanNum(a * b, 2)), pal.ink);
    drawBlockTile(ctx, startX + aPx + gap, startY + aPx + gap, bPx, bPx, pal.emeraldFill, pal.emerald, 'b²', fmtPlain(cleanNum(b * b, 2)), pal.ink);

    // Right (or bottom) Live Comparison Panel: (a+b)^2 vs a^2 + b^2
    const compX = wide ? sqAreaW + 14 : 18;
    const compY = wide ? 56 : startY + fullPx + 18;
    const compW = wide ? w - compX - 18 : w - 36;
    const compH = wide ? h - 76 : Math.max(92, h - compY - 12);

    roundRectPath(ctx, compX, compY, compW, compH, 14);
    ctx.fillStyle = pal.panelBg;
    ctx.fill();
    ctx.strokeStyle = pal.panelBorder;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    const totalVal = (a + b) * (a + b);
    const a2Val = a * a;
    const b2Val = b * b;
    const twoAbVal = 2 * a * b;

    ctx.save();
    ctx.fillStyle = pal.ink;
    ctx.font = '800 13px "Pretendard Variable", Pretendard, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('왜 (a+b)² ≠ a² + b² 일까?', compX + 14, compY + 24);

    const barMaxW = Math.max(80, compW - 28);
    const bar1Y = compY + (wide ? 54 : 38);
    const barH = wide ? 30 : 20;

    // Bar 1: Full (a+b)^2
    ctx.font = '700 11.5px "Pretendard Variable", Pretendard, sans-serif';
    ctx.fillStyle = pal.inkMuted;
    ctx.fillText('진짜 넓이 (a+b)² = ' + fmtPlain(cleanNum(totalVal, 2)), compX + 14, bar1Y - 7);

    const wA2 = (a2Val / totalVal) * barMaxW;
    const w2Ab = (twoAbVal / totalVal) * barMaxW;
    const wB2 = (b2Val / totalVal) * barMaxW;

    ctx.fillStyle = pal.indigoStrong;
    ctx.fillRect(compX + 14, bar1Y, wA2, barH);
    ctx.fillStyle = pal.skyStrong;
    ctx.fillRect(compX + 14 + wA2, bar1Y, w2Ab, barH);
    ctx.fillStyle = pal.emeraldStrong;
    ctx.fillRect(compX + 14 + wA2 + w2Ab, bar1Y, wB2, barH);

    // Labels inside Bar 1
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 11px "Pretendard Variable", Pretendard, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (wA2 > 26) ctx.fillText('a²', compX + 14 + wA2 / 2, bar1Y + barH / 2);
    if (w2Ab > 32) ctx.fillText('2ab', compX + 14 + wA2 + w2Ab / 2, bar1Y + barH / 2);
    if (wB2 > 22) ctx.fillText('b²', compX + 14 + wA2 + w2Ab + wB2 / 2, bar1Y + barH / 2);

    // Bar 2: Only a^2 + b^2 + dashed missing 2ab!
    const bar2Y = bar1Y + barH + (wide ? 38 : 24);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = pal.inkMuted;
    ctx.font = '700 11.5px "Pretendard Variable", Pretendard, sans-serif';
    ctx.fillText('착각하기 쉬운 a² + b² = ' + fmtPlain(cleanNum(a2Val + b2Val, 2)), compX + 14, bar2Y - 7);

    ctx.fillStyle = pal.indigoStrong;
    ctx.fillRect(compX + 14, bar2Y, wA2, barH);
    ctx.fillStyle = pal.emeraldStrong;
    ctx.fillRect(compX + 14 + wA2, bar2Y, wB2, barH);

    // Missing 2ab dashed zone!
    const missX = compX + 14 + wA2 + wB2;
    ctx.save();
    ctx.fillStyle = pal.roseFill;
    ctx.fillRect(missX, bar2Y, w2Ab, barH);
    ctx.setLineDash([4, 3]);
    ctx.strokeStyle = pal.rose;
    ctx.lineWidth = 1.6;
    ctx.strokeRect(missX, bar2Y, w2Ab, barH);
    ctx.restore();

    ctx.fillStyle = pal.rose;
    ctx.font = '800 11px "Pretendard Variable", Pretendard, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (w2Ab > 48) {
      ctx.fillText('빠진 2ab=' + fmtPlain(cleanNum(twoAbVal, 2)), missX + w2Ab / 2, bar2Y + barH / 2);
    }

    if (wide && compH > 210) {
      const tipY = bar2Y + barH + 28;
      roundRectPath(ctx, compX + 14, tipY, barMaxW, compH - (tipY - compY) - 14, 10);
      ctx.fillStyle = pal.skySoft;
      ctx.fill();
      ctx.strokeStyle = pal.sky;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = pal.ink;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.font = '700 12px "Pretendard Variable", Pretendard, sans-serif';
      ctx.fillText('핵심 대칭 공식 암기 원리:', compX + 24, tipY + 12);
      ctx.font = '600 11.5px "Pretendard Variable", Pretendard, sans-serif';
      ctx.fillStyle = pal.inkMuted;
      ctx.fillText('• (a+b)² = a² + b² + 2ab', compX + 24, tipY + 33);
      ctx.fillText('• a² + b² = (a+b)² - 2ab', compX + 24, tipY + 52);
      ctx.fillText('• (a-b)² = (a+b)² - 4ab', compX + 24, tipY + 71);
    }
    ctx.restore();
  }

  function drawBlockTile(ctx, x, y, w, h, fill, stroke, symLabel, numLabel, textColor) {
    if (w <= 1 || h <= 1) return;
    roundRectPath(ctx, x, y, w, h, Math.min(8, w / 4, h / 4));
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();

    if (w >= 30 && h >= 26) {
      ctx.save();
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (w >= 54 && h >= 48) {
        ctx.font = '800 15px "Pretendard Variable", Pretendard, sans-serif';
        ctx.fillText(symLabel, x + w / 2, y + h / 2 - 8);
        ctx.font = '700 12px "Pretendard Variable", Pretendard, sans-serif';
        ctx.fillStyle = stroke;
        ctx.fillText('= ' + numLabel, x + w / 2, y + h / 2 + 10);
      } else {
        ctx.font = '800 12px "Pretendard Variable", Pretendard, sans-serif';
        ctx.fillText(symLabel, x + w / 2, y + h / 2);
      }
      ctx.restore();
    }
  }

  function drawPolyDiffSqMode(ctx, w, h, pal) {
    const a = state.poly.a;
    const b = Math.min(state.poly.b, a - 0.5);
    const t = state.poly.morph; // 0..1

    drawBadge(ctx, 14, 22, '합차공식 도형 절단·이동: a² - b² = (a + b)(a - b)', pal.indigoSoft, pal.indigo, pal.ink, 'left');

    const wide = w >= 520;
    const maxUnitW = wide ? (w * 0.42) / a : (w * 0.68) / (a + b);
    const maxUnitH = wide ? (h - 96) / a : (h * 0.36) / a;
    const scale = Math.max(16, Math.min(maxUnitW, maxUnitH));

    const aPx = a * scale;
    const bPx = b * scale;
    const diffPx = (a - b) * scale;

    // Left diagram: a^2 with b^2 corner removed
    const leftX = wide ? 34 : (w - (a + b) * scale) / 2;
    const leftY = wide ? Math.max(60, (h - aPx) / 2 + 10) : 52;

    // Draw full dashed b^2 corner cutout
    ctx.save();
    roundRectPath(ctx, leftX + diffPx, leftY + diffPx, bPx, bPx, 6);
    ctx.fillStyle = pal.roseFill;
    ctx.fill();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = pal.rose;
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.restore();

    if (bPx > 28) {
      ctx.save();
      ctx.fillStyle = pal.rose;
      ctx.font = '800 12px "Pretendard Variable", Pretendard, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('-b²', leftX + diffPx + bPx / 2, leftY + diffPx + bPx / 2);
      ctx.restore();
    }

    // Main top horizontal block: width a, height (a - b)
    drawBlockTile(
      ctx,
      leftX,
      leftY,
      aPx,
      diffPx,
      pal.indigoFill,
      pal.indigo,
      'a(a-b)',
      fmtPlain(cleanNum(a * (a - b), 2)),
      pal.ink
    );

    // Bottom-left strip before moving: width (a - b), height b
    ctx.save();
    ctx.globalAlpha = wide ? 0.38 : Math.max(0.25, 1 - t * 0.7);
    drawBlockTile(
      ctx,
      leftX,
      leftY + diffPx,
      diffPx,
      bPx,
      pal.skyFill,
      pal.sky,
      'b(a-b)',
      fmtPlain(cleanNum(b * (a - b), 2)),
      pal.ink
    );
    ctx.restore();

    ctx.save();
    ctx.fillStyle = pal.inkMuted;
    ctx.font = '700 12px "Pretendard Variable", Pretendard, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('① 절단 직후: a² - b² = ' + fmtPlain(cleanNum(a * a - b * b, 2)), leftX + aPx / 2, leftY + aPx + 20);
    ctx.restore();

    // Right (or bottom) diagram: Transformed rectangle (a+b) x (a-b)
    const rightX = wide ? Math.max(leftX + aPx + 54, w * 0.48) : leftX;
    const rightY = wide ? leftY + (aPx - diffPx) / 2 : leftY + aPx + 42;
    const rightScale = wide ? Math.min(scale, (w - rightX - 24) / (a + b)) : scale;
    const rAPx = a * rightScale;
    const rBPx = b * rightScale;
    const rDiffPx = (a - b) * rightScale;

    if (wide) {
      drawArrow(ctx, leftX + aPx + 12, leftY + aPx / 2, rightX - 14, rightY + rDiffPx / 2, pal.emerald, 2.5, 9);
    }

    drawBlockTile(
      ctx,
      rightX,
      rightY,
      rAPx,
      rDiffPx,
      pal.indigoFill,
      pal.indigo,
      'a(a-b)',
      fmtPlain(cleanNum(a * (a - b), 2)),
      pal.ink
    );

    // Animated moving slice (interpolates from below left block to right side of new rectangle!)
    const srcSliceX = rightX;
    const srcSliceY = rightY + rDiffPx + 14;
    const dstSliceX = rightX + rAPx;
    const dstSliceY = rightY;
    const curX = srcSliceX + (dstSliceX - srcSliceX) * t;
    const curY = srcSliceY + (dstSliceY - srcSliceY) * t;
    const curW = rDiffPx + (rBPx - rDiffPx) * t;
    const curH = rBPx + (rDiffPx - rBPx) * t;

    drawBlockTile(
      ctx,
      curX,
      curY,
      curW,
      curH,
      pal.skyFill,
      pal.sky,
      'b(a-b)',
      fmtPlain(cleanNum(b * (a - b), 2)),
      pal.ink
    );

    // Dimension labels on final (a+b)(a-b) rectangle
    ctx.save();
    ctx.fillStyle = pal.emerald;
    ctx.font = '800 12.5px "Pretendard Variable", Pretendard, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('가로 (a + b) = ' + fmtPlain(a + b), rightX + (rAPx + rBPx) / 2, rightY - 10);
    ctx.fillStyle = pal.inkMuted;
    ctx.fillText('세로 (a - b) = ' + fmtPlain(a - b) + '  ⇒  넓이 = ' + fmtPlain(cleanNum((a + b) * (a - b), 2)), rightX + (rAPx + rBPx) / 2, rightY + rDiffPx + 22);
    ctx.restore();
  }

  function drawPolyCubeSymMode(ctx, w, h, pal) {
    const a = state.poly.a;
    const b = state.poly.b;
    const sum = a + b;
    const gapFactor = state.poly.cubeGap;

    drawBadge(ctx, 14, 22, '3D 세제곱 대칭 해부: a³ + b³ = (a+b)³ - 3ab(a+b)', pal.indigoSoft, pal.indigo, pal.ink, 'left');

    const wide = w >= 540;
    const isoCenterX = wide ? w * 0.31 : w * 0.5;
    const isoCenterY = wide ? h * 0.57 : h * 0.40;
    const unit = (wide ? Math.min(w * 0.48, h * 0.72) : Math.min(w * 0.72, h * 0.48)) / (sum * 2.15 + gapFactor * 1.8);

    const cos30 = Math.cos(Math.PI / 6);
    const sin30 = 0.5;
    function iso(x, y, z) {
      return {
        px: isoCenterX + (x - y) * cos30 * unit,
        py: isoCenterY + (x + y) * sin30 * unit - z * unit
      };
    }

    const g = gapFactor * Math.min(a, b) * 0.55;
    const splits = [
      { idx: 0, p0: 0, len: a },
      { idx: 1, p0: a, len: b }
    ];

    const subBoxes = [];
    for (let ix = 0; ix < 2; ix++) {
      for (let iy = 0; iy < 2; iy++) {
        for (let iz = 0; iz < 2; iz++) {
          const isA3 = ix === 0 && iy === 0 && iz === 0;
          const isB3 = ix === 1 && iy === 1 && iz === 1;
          // Push the 6 mixed prisms outward slightly more so a^3 and b^3 stand out clearly!
          const extraPush = isA3 ? 0 : isB3 ? g * 0.65 : g * 1.35;
          const x0 = splits[ix].p0 + ix * g + (ix === 1 && !isB3 ? extraPush * 0.4 : 0);
          const y0 = splits[iy].p0 + iy * g + (iy === 1 && !isB3 ? extraPush * 0.4 : 0);
          const z0 = splits[iz].p0 + iz * g + (iz === 1 && !isB3 ? extraPush * 0.4 : 0);

          let kind = 'slab';
          if (isA3) kind = 'a3';
          else if (isB3) kind = 'b3';

          subBoxes.push({
            x0: x0 - sum / 2,
            y0: y0 - sum / 2,
            z0: z0 - sum / 2,
            dx: splits[ix].len,
            dy: splits[iy].len,
            dz: splits[iz].len,
            kind: kind,
            depth: x0 + y0 + z0
          });
        }
      }
    }

    // Painter's algorithm sort (back to front: smallest x+y+z drawn first)
    subBoxes.sort(function (u, v) {
      return u.depth - v.depth;
    });

    for (let i = 0; i < subBoxes.length; i++) {
      const box = subBoxes[i];
      drawIsoPrism(ctx, iso, box, pal);
    }

    // Legend tags beneath 3D cube
    ctx.save();
    ctx.font = '700 12px "Pretendard Variable", Pretendard, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = pal.inkMuted;
    ctx.fillText(
      '남색: a³ (' + fmtPlain(cleanNum(a * a * a, 2)) + ')  ·  초록: b³ (' + fmtPlain(cleanNum(b * b * b, 2)) + ')  ·  하늘색 6조각 합 = 3ab(a+b)',
      isoCenterX,
      wide ? h - 18 : h * 0.67
    );
    ctx.restore();

    // Right (or bottom) Volume Bar Comparison
    const panelX = wide ? w * 0.59 : 18;
    const panelY = wide ? 56 : h * 0.71;
    const panelW = wide ? w - panelX - 18 : w - 36;
    const panelH = wide ? h - 76 : h - panelY - 12;

    roundRectPath(ctx, panelX, panelY, panelW, panelH, 14);
    ctx.fillStyle = pal.panelBg;
    ctx.fill();
    ctx.strokeStyle = pal.panelBorder;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    const totalV = Math.pow(a + b, 3);
    const a3V = Math.pow(a, 3);
    const b3V = Math.pow(b, 3);
    const slabV = 3 * a * b * (a + b);

    ctx.save();
    ctx.fillStyle = pal.ink;
    ctx.font = '800 13px "Pretendard Variable", Pretendard, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('부피 블록 분해 대조표', panelX + 14, panelY + 24);

    const barW = Math.max(80, panelW - 28);
    const barY = panelY + (wide ? 48 : 34);
    const barH = wide ? 30 : 20;

    const wA3 = (a3V / totalV) * barW;
    const wB3 = (b3V / totalV) * barW;
    const wSlab = (slabV / totalV) * barW;

    ctx.fillStyle = pal.indigoStrong;
    ctx.fillRect(panelX + 14, barY, wA3, barH);
    ctx.fillStyle = pal.emeraldStrong;
    ctx.fillRect(panelX + 14 + wA3, barY, wB3, barH);
    ctx.fillStyle = pal.skyStrong;
    ctx.fillRect(panelX + 14 + wA3 + wB3, barY, wSlab, barH);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 11px "Pretendard Variable", Pretendard, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (wA3 > 24) ctx.fillText('a³', panelX + 14 + wA3 / 2, barY + barH / 2);
    if (wB3 > 20) ctx.fillText('b³', panelX + 14 + wA3 + wB3 / 2, barY + barH / 2);
    if (wSlab > 65) ctx.fillText('3ab(a+b)', panelX + 14 + wA3 + wB3 + wSlab / 2, barY + barH / 2);

    if (wide) {
      const listY = barY + barH + 22;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.font = '700 12px "Pretendard Variable", Pretendard, sans-serif';
      ctx.fillStyle = pal.ink;
      ctx.fillText('① 전체 정육면체 (a+b)³ = ' + fmtPlain(cleanNum(totalV, 2)), panelX + 14, listY);
      ctx.fillStyle = pal.sky;
      ctx.fillText('② 덜어낼 3기둥 3ab(a+b) = -' + fmtPlain(cleanNum(slabV, 2)), panelX + 14, listY + 24);
      ctx.fillStyle = pal.emerald;
      ctx.fillText('③ 순수 세제곱 합 a³ + b³ = ' + fmtPlain(cleanNum(a3V + b3V, 2)), panelX + 14, listY + 48);

      const boxY = listY + 80;
      if (boxY + 56 < panelY + panelH) {
        roundRectPath(ctx, panelX + 14, boxY, barW, panelY + panelH - boxY - 14, 10);
        ctx.fillStyle = pal.indigoSoft;
        ctx.fill();
        ctx.fillStyle = pal.ink;
        ctx.font = '700 11.5px "Pretendard Variable", Pretendard, sans-serif';
        ctx.fillText('부호만 바꾸면 차 공식도 자동 완성!', panelX + 22, boxY + 12);
        ctx.fillStyle = pal.inkMuted;
        ctx.font = '600 11.5px "Pretendard Variable", Pretendard, sans-serif';
        ctx.fillText('a³ - b³ = (a-b)³ + 3ab(a-b)', panelX + 22, boxY + 32);
      }
    }
    ctx.restore();
  }

  function drawIsoPrism(ctx, iso, box, pal) {
    const x0 = box.x0;
    const x1 = box.x0 + box.dx;
    const y0 = box.y0;
    const y1 = box.y0 + box.dy;
    const z0 = box.z0;
    const z1 = box.z0 + box.dz;

    let topColor, rightColor, leftColor, strokeColor;
    if (box.kind === 'a3') {
      topColor = '#818CF8';
      leftColor = '#6366F1';
      rightColor = '#4338CA';
      strokeColor = pal.dark ? '#E0E7FF' : '#312E81';
    } else if (box.kind === 'b3') {
      topColor = '#34D399';
      leftColor = '#10B981';
      rightColor = '#047857';
      strokeColor = pal.dark ? '#D1FAE5' : '#064E3B';
    } else {
      topColor = pal.dark ? 'rgba(56, 189, 248, 0.72)' : 'rgba(56, 189, 248, 0.78)';
      leftColor = pal.dark ? 'rgba(14, 165, 233, 0.62)' : 'rgba(14, 165, 233, 0.68)';
      rightColor = pal.dark ? 'rgba(2, 132, 199, 0.56)' : 'rgba(2, 132, 199, 0.60)';
      strokeColor = pal.dark ? 'rgba(186, 230, 253, 0.65)' : 'rgba(3, 105, 161, 0.65)';
    }

    // Top face (z = z1)
    const t0 = iso(x0, y0, z1);
    const t1 = iso(x1, y0, z1);
    const t2 = iso(x1, y1, z1);
    const t3 = iso(x0, y1, z1);

    // Front-right face (x = x1)
    const r0 = iso(x1, y0, z0);
    const r1 = iso(x1, y1, z0);

    // Front-left face (y = y1)
    const l0 = iso(x0, y1, z0);

    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineWidth = 1.15;
    ctx.strokeStyle = strokeColor;

    // Left visible face (y = y1)
    ctx.beginPath();
    ctx.moveTo(t3.px, t3.py);
    ctx.lineTo(t2.px, t2.py);
    ctx.lineTo(r1.px, r1.py);
    ctx.lineTo(l0.px, l0.py);
    ctx.closePath();
    ctx.fillStyle = leftColor;
    ctx.fill();
    ctx.stroke();

    // Right visible face (x = x1)
    ctx.beginPath();
    ctx.moveTo(t1.px, t1.py);
    ctx.lineTo(r0.px, r0.py);
    ctx.lineTo(r1.px, r1.py);
    ctx.lineTo(t2.px, t2.py);
    ctx.closePath();
    ctx.fillStyle = rightColor;
    ctx.fill();
    ctx.stroke();

    // Top face (z = z1)
    ctx.beginPath();
    ctx.moveTo(t0.px, t0.py);
    ctx.lineTo(t1.px, t1.py);
    ctx.lineTo(t2.px, t2.py);
    ctx.lineTo(t3.px, t3.py);
    ctx.closePath();
    ctx.fillStyle = topColor;
    ctx.fill();
    ctx.stroke();

    if (box.kind === 'a3' || box.kind === 'b3') {
      const cx = (t0.px + t2.px) / 2;
      const cy = (t0.py + t2.py) / 2;
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '800 12px "Pretendard Variable", Pretendard, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(box.kind === 'a3' ? 'a³' : 'b³', cx, cy);
    }
    ctx.restore();
  }

  function animatePolyValue(prop, fromVal, toVal, durationMs) {
    cancelActiveAnimations();
    const start = performance.now();
    state.poly[prop] = fromVal;
    function tick(now) {
      const p = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      state.poly[prop] = fromVal + (toVal - fromVal) * eased;
      drawPolyCanvas();
      if (p < 1) {
        state.animRaf = requestAnimationFrame(tick);
      } else {
        state.animRaf = 0;
      }
    }
    state.animRaf = requestAnimationFrame(tick);
  }

  // =========================================================================
  // LAB 2: 'synthetic-div' — 조립제법 스텝 시뮬레이터 & ax+b 몫 함정 해부기
  // =========================================================================

  function computeSyntheticData() {
    const s = state.syn;
    const d = s.d === 0 ? 1 : s.d;
    const alpha = s.e / d;
    const b2 = s.p;
    const m1 = b2 * alpha;
    const b1 = s.q + m1;
    const m2 = b1 * alpha;
    const b0 = s.r + m2;
    const m3 = b0 * alpha;
    const rem = s.s + m3;

    return {
      p: s.p,
      q: s.q,
      r: s.r,
      s: s.s,
      d: d,
      e: s.e,
      alpha: alpha,
      b2: b2,
      m1: m1,
      b1: b1,
      m2: m2,
      b0: b0,
      m3: m3,
      rem: rem,
      q2: b2 / d,
      q1: b1 / d,
      q0: b0 / d
    };
  }

  function getSyntheticStepMessage(step, data) {
    const alphaStr = numToLatex(data.alpha);
    switch (step) {
      case 0:
        return '준비 완료: $P(x)$의 계수 $(' + data.p + ', ' + data.q + ', ' + data.r + ', ' + data.s + ')$와 나누는 식이 $0$이 되는 값 $\\alpha = ' + alphaStr + '$을 왼쪽에 적습니다.';
      case 1:
        return '**Step 1/7 [내려쓰기]**: 삼차항 최고차 계수 $' + data.p + '$을 보드 아래 첫 칸으로 그대로 내려씁니다 ($b_2 = ' + numToLatex(data.b2) + '$).';
      case 2:
        return '**Step 2/7 [곱해서 올리기]**: 내려온 $' + numToLatex(data.b2) + '$에 $\\alpha = ' + alphaStr + '$을 곱한 값 $' + numToLatex(data.m1) + '$을 대각선 위 칸에 올립니다.';
      case 3:
        return '**Step 3/7 [위아래 더하기]**: $' + data.q + ' + (' + numToLatex(data.m1) + ') = ' + numToLatex(data.b1) + '$! (빼기가 아니라 **더하기**입니다!)';
      case 4:
        return '**Step 4/7 [곱해서 올리기]**: $' + numToLatex(data.b1) + ' \\times (' + alphaStr + ') = ' + numToLatex(data.m2) + '$을 다음 열 대각선 위로 올립니다.';
      case 5:
        return '**Step 5/7 [위아래 더하기]**: $' + data.r + ' + (' + numToLatex(data.m2) + ') = ' + numToLatex(data.b0) + '$을 아래로 내려 적습니다.';
      case 6:
        return '**Step 6/7 [마지막 곱하기]**: $' + numToLatex(data.b0) + ' \\times (' + alphaStr + ') = ' + numToLatex(data.m3) + '$을 상수항 아래 칸에 올립니다.';
      default:
        if (data.d !== 1) {
          return '**Step 7/7 [나머지 확정 & 몫 보정 필수!]**: 나머지 $R = ' + numToLatex(data.rem) + '$ 확정! 단, 조립제법은 항상 $(x - \\alpha)$ 기준이므로 **$' + polyToLatex([{ c: data.d, exp: 1 }, { c: -data.e, exp: 0 }], 'x') + '$으로 나눈 진짜 몫은 $\\frac{1}{' + data.d + '}$배** 해야 합니다!';
        }
        return '**Step 7/7 [완성!]**: 상수항 합 $R = ' + numToLatex(data.rem) + '$이 나머지, 앞의 세 수가 몫 $Q(x) = ' + polyToLatex([{ c: data.b2, exp: 2 }, { c: data.b1, exp: 1 }, { c: data.b0, exp: 0 }], 'x') + '$의 계수입니다!';
    }
  }

  function renderSyntheticControls() {
    const s = state.syn;
    const divLatex = polyToLatex([{ c: s.d, exp: 1 }, { c: -s.e, exp: 0 }], 'x');

    return (
      '<div class="vl-action-bar">' +
        '<button type="button" class="btn btn-sm btn-primary" data-action="syn-next">다음 스텝 ▶</button>' +
        '<button type="button" class="btn btn-sm btn-secondary" data-action="syn-all">한 번에 실행 ⏩</button>' +
        '<button type="button" class="btn btn-sm btn-ghost" data-action="syn-reset">초기화 ↺</button>' +
      '</div>' +

      '<div>' +
        '<div class="vl-readout-label" style="margin-bottom:0.4rem;">🎯 핵심 유형 프리셋 (클릭 즉시 세팅)</div>' +
        '<div class="lab-presets">' +
          '<button type="button" class="chip" data-syn-preset="2,-4,6,-1,2,2">🔥 내신 1위 함정: ÷(2x-2)</button>' +
          '<button type="button" class="chip" data-syn-preset="1,-2,-5,6,1,3">인수정리(R=0): ÷(x-3)</button>' +
          '<button type="button" class="chip" data-syn-preset="2,3,-1,2,2,-1">분수 α=-1/2: ÷(2x+1)</button>' +
          '<button type="button" class="chip" data-syn-preset="1,2,-1,-5,1,-2">음수 근 α=-2: ÷(x+2)</button>' +
        '</div>' +
      '</div>' +

      '<div class="lab-control-row">' +
        '<label for="vl-syn-p"><span>삼차항 계수 ' + mInline('p') + ' (' + mInline('px^3') + ')</span><span class="vl-slider-val" id="vl-syn-p-val">' + s.p + '</span></label>' +
        '<input id="vl-syn-p" class="lab-slider" type="range" min="-4" max="4" step="1" value="' + s.p + '" data-slider="syn-p">' +
      '</div>' +
      '<div class="lab-control-row">' +
        '<label for="vl-syn-q"><span>이차항 계수 ' + mInline('q') + ' (' + mInline('qx^2') + ')</span><span class="vl-slider-val" id="vl-syn-q-val">' + s.q + '</span></label>' +
        '<input id="vl-syn-q" class="lab-slider" type="range" min="-6" max="6" step="1" value="' + s.q + '" data-slider="syn-q">' +
      '</div>' +
      '<div class="lab-control-row">' +
        '<label for="vl-syn-r"><span>일차항 계수 ' + mInline('r') + ' (' + mInline('rx') + ')</span><span class="vl-slider-val" id="vl-syn-r-val">' + s.r + '</span></label>' +
        '<input id="vl-syn-r" class="lab-slider" type="range" min="-6" max="6" step="1" value="' + s.r + '" data-slider="syn-r">' +
      '</div>' +
      '<div class="lab-control-row">' +
        '<label for="vl-syn-s"><span>상수항 ' + mInline('s') + '</span><span class="vl-slider-val" id="vl-syn-s-val">' + s.s + '</span></label>' +
        '<input id="vl-syn-s" class="lab-slider" type="range" min="-8" max="8" step="1" value="' + s.s + '" data-slider="syn-s">' +
      '</div>' +

      '<div class="lab-control-row">' +
        '<label for="vl-syn-d"><span>일차식 계수 ' + mInline('d') + ' (나누는 식: ' + mInline(divLatex) + ')</span><span class="vl-slider-val" id="vl-syn-d-val">d = ' + s.d + '</span></label>' +
        '<input id="vl-syn-d" class="lab-slider" type="range" min="1" max="3" step="1" value="' + s.d + '" data-slider="syn-d">' +
      '</div>' +
      '<div class="lab-control-row">' +
        '<label for="vl-syn-e"><span>상수 ' + mInline('e') + ' (' + mInline('dx - e = 0 \\Rightarrow \\alpha = e/d') + ')</span><span class="vl-slider-val" id="vl-syn-e-val">e = ' + s.e + '</span></label>' +
        '<input id="vl-syn-e" class="lab-slider" type="range" min="-4" max="4" step="1" value="' + s.e + '" data-slider="syn-e">' +
      '</div>'
    );
  }

  function updateSyntheticReadoutsAndBanner() {
    if (!state.readoutEl || !state.bannerEl || !state.extraPanelEl) return;
    const data = computeSyntheticData();
    const step = state.syn.step;

    const pLatex = polyToLatex(
      [
        { c: data.p, exp: 3 },
        { c: data.q, exp: 2 },
        { c: data.r, exp: 1 },
        { c: data.s, exp: 0 }
      ],
      'x'
    );
    const monicDivLatex = polyToLatex([{ c: 1, exp: 1 }, { c: -data.alpha, exp: 0 }], 'x');
    const realDivLatex = polyToLatex([{ c: data.d, exp: 1 }, { c: -data.e, exp: 0 }], 'x');
    const q1Latex = polyToLatex(
      [
        { c: data.b2, exp: 2 },
        { c: data.b1, exp: 1 },
        { c: data.b0, exp: 0 }
      ],
      'x'
    );
    const realQLatex = polyToLatex(
      [
        { c: data.q2, exp: 2 },
        { c: data.q1, exp: 1 },
        { c: data.q0, exp: 0 }
      ],
      'x'
    );
    const remLatex = numToLatex(data.rem);

    // Update divisor label inside controls if mounted
    if (state.controlsEl) {
      const dLabel = state.controlsEl.querySelector('label[for="vl-syn-d"] span:first-child');
      if (dLabel) {
        dLabel.innerHTML = '일차식 계수 ' + mInline('d') + ' (나누는 식: ' + mInline(realDivLatex) + ')';
      }
    }

    state.bannerEl.innerHTML =
      '<div style="margin-bottom:0.45rem;">' + mText(getSyntheticStepMessage(step, data)) + '</div>' +
      mBlock('(' + pLatex + ') = (' + realDivLatex + ')(' + realQLatex + ') + ' + (data.rem < 0 ? '(' + remLatex + ')' : remLatex));

    state.readoutEl.innerHTML =
      readoutCard('진행 단계', 'Step ' + step + ' / 7', 'indigo') +
      readoutCard('대입 스위치 α', 'α = ' + numToCanvas(data.alpha), 'sky') +
      readoutCard('진짜 몫 Q(x)', polyToCanvas([{ c: data.q2, exp: 2 }, { c: data.q1, exp: 1 }, { c: data.q0, exp: 0 }], 'x'), 'emerald') +
      readoutCard('나머지 R = P(α)', numToCanvas(data.rem) + (Math.abs(data.rem) < 1e-7 ? ' (인수!)' : ''), 'rose');

    // Side-by-Side Comparison Box for d != 1 vs d == 1!
    if (data.d !== 1) {
      state.extraPanelEl.hidden = false;
      state.extraPanelEl.innerHTML =
        '<div class="vl-compare-split">' +
          '<div class="vl-compare-box is-trap">' +
            '<div class="vl-compare-title">⚠️ 조립제법 직후 겉보기 식 (' + mInline('x - \\alpha') + ' 기준)</div>' +
            '<div>' + mText('$P(x) = (' + monicDivLatex + ')\\cdot(' + q1Latex + ') + (' + remLatex + ')$') + '</div>' +
            '<div>' + mText('조립제법 아랫줄 계수 그대로 읽은 몫: $Q_1(x) = ' + q1Latex + '$') + '</div>' +
          '</div>' +
          '<div class="vl-compare-box is-true">' +
            '<div class="vl-compare-title">✅ ' + mInline(realDivLatex + ' = ' + data.d + '(' + monicDivLatex + ')') + '로 나눈 진짜 몫!</div>' +
            '<div>' + mText('$P(x) = ' + data.d + '(' + monicDivLatex + ') \\cdot \\frac{1}{' + data.d + '}(' + q1Latex + ') + (' + remLatex + ')$') + '</div>' +
            '<div>' + mText('**진짜 몫 $Q(x) = \\frac{1}{' + data.d + '}Q_1(x) = ' + realQLatex + '$** · **나머지 $R = ' + remLatex + '$ (불변!)**') + '</div>' +
          '</div>' +
        '</div>';
    } else {
      state.extraPanelEl.hidden = false;
      state.extraPanelEl.innerHTML =
        '<div class="vl-insight-note" style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:0.6rem;">' +
          '<span>' +
            mText(
              '현재 나누는 식 **$' + realDivLatex + '$**의 일차항 계수가 $d = 1$이므로 조립제법 몫 $Q_1(x) = ' + q1Latex + '$이 곧 진짜 몫입니다! 일차항 계수가 $2$일 때 몫이 어떻게 변하는지 확인해 볼까요?'
            ) +
          '</span>' +
          '<button type="button" class="btn btn-sm btn-accent" data-action="syn-demo-d2">⚡ d = 2 함정 비교 켜기</button>' +
        '</div>';
    }
  }

  function drawSyntheticCanvas() {
    const data = computeSyntheticData();
    const extraH = data.d !== 1 ? 430 : 380;
    const prep = prepareCanvas(state.canvasEl, extraH);
    if (!prep) return;
    const ctx = prep.ctx;
    const w = prep.w;
    const h = prep.h;
    const pal = getPalette();
    const step = state.syn.step;

    fillCanvasBackdrop(ctx, w, h, pal, 24);

    const divStr = polyToCanvas([{ c: data.d, exp: 1 }, { c: -data.e, exp: 0 }], 'x');
    drawBadge(
      ctx,
      14,
      22,
      '조립제법 보드: (' + polyToCanvas([{ c: data.p, exp: 3 }, { c: data.q, exp: 2 }, { c: data.r, exp: 1 }, { c: data.s, exp: 0 }], 'x') + ') ÷ (' + divStr + ')',
      pal.indigoSoft,
      pal.indigo,
      pal.ink,
      'left'
    );

    const leftPad = Math.max(18, w * 0.06);
    const alphaBoxX = leftPad + 28;
    const boardLeft = leftPad + 72;
    const boardRight = w - Math.max(20, w * 0.05);
    const colSpan = (boardRight - boardLeft) / 4;
    const cols = [
      boardLeft + colSpan * 0.5,
      boardLeft + colSpan * 1.5,
      boardLeft + colSpan * 2.5,
      boardLeft + colSpan * 3.5
    ];

    const headerY = 66;
    const rowTopY = 108;
    const rowMidY = 166;
    const barY = 198;
    const rowBotY = 236;

    // Column Degree Headers
    const colTitles = ['삼차 (x³)', '이차 (x²)', '일차 (x)', '상수항'];
    ctx.save();
    ctx.font = '700 12px "Pretendard Variable", Pretendard, sans-serif';
    ctx.fillStyle = pal.inkSubtle;
    ctx.textAlign = 'center';
    for (let i = 0; i < 4; i++) {
      ctx.fillText(colTitles[i], cols[i], headerY);
    }
    ctx.restore();

    // Alpha switch badge on the left
    roundRectPath(ctx, alphaBoxX - 28, rowTopY - 22, 56, 44, 11);
    ctx.fillStyle = pal.skyFill;
    ctx.fill();
    ctx.strokeStyle = pal.sky;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.save();
    ctx.fillStyle = pal.sky;
    ctx.font = '700 10.5px "Pretendard Variable", Pretendard, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('α = e/d', alphaBoxX, rowTopY - 30);
    ctx.fillStyle = pal.ink;
    ctx.font = '800 16px "Pretendard Variable", Pretendard, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(numToCanvas(data.alpha), alphaBoxX, rowTopY);
    ctx.restore();

    // L-bar of Synthetic Division
    ctx.save();
    ctx.strokeStyle = pal.ink;
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(boardLeft - 8, rowTopY - 20);
    ctx.lineTo(boardLeft - 8, barY);
    ctx.lineTo(boardRight, barY);
    ctx.stroke();
    ctx.restore();

    // Top row coefficients (always visible)
    const topVals = [data.p, data.q, data.r, data.s];
    for (let i = 0; i < 4; i++) {
      drawSynCell(ctx, cols[i], rowTopY, numToCanvas(topVals[i]), false, false, pal);
    }

    // Step 1: Drop down b2 = p
    if (step >= 1) {
      drawArrow(ctx, cols[0], rowTopY + 20, cols[0], rowBotY - 22, step === 1 ? pal.indigo : pal.inkSubtle, step === 1 ? 2.6 : 1.6, 7);
      drawSynCell(ctx, cols[0], rowBotY, numToCanvas(data.b2), step === 1, false, pal);
    }

    // Step 2: Multiply b2 * alpha -> m1
    if (step >= 2) {
      drawCurvedArrow(
        ctx,
        cols[0] + 18,
        rowBotY - 12,
        (cols[0] + cols[1]) / 2,
        rowBotY - 28,
        cols[1] - 16,
        rowMidY + 14,
        step === 2 ? pal.sky : pal.inkSubtle,
        step === 2 ? 2.5 : 1.5
      );
      drawSynCell(ctx, cols[1], rowMidY, numToCanvas(data.m1), step === 2, false, pal);
    }

    // Step 3: Add q + m1 -> b1
    if (step >= 3) {
      drawPlusHint(ctx, cols[1] - Math.min(34, colSpan * 0.34), (rowTopY + rowMidY) / 2, step === 3, pal);
      drawSynCell(ctx, cols[1], rowBotY, numToCanvas(data.b1), step === 3, false, pal);
    }

    // Step 4: Multiply b1 * alpha -> m2
    if (step >= 4) {
      drawCurvedArrow(
        ctx,
        cols[1] + 18,
        rowBotY - 12,
        (cols[1] + cols[2]) / 2,
        rowBotY - 28,
        cols[2] - 16,
        rowMidY + 14,
        step === 4 ? pal.sky : pal.inkSubtle,
        step === 4 ? 2.5 : 1.5
      );
      drawSynCell(ctx, cols[2], rowMidY, numToCanvas(data.m2), step === 4, false, pal);
    }

    // Step 5: Add r + m2 -> b0
    if (step >= 5) {
      drawPlusHint(ctx, cols[2] - Math.min(34, colSpan * 0.34), (rowTopY + rowMidY) / 2, step === 5, pal);
      drawSynCell(ctx, cols[2], rowBotY, numToCanvas(data.b0), step === 5, false, pal);
    }

    // Step 6: Multiply b0 * alpha -> m3
    if (step >= 6) {
      drawCurvedArrow(
        ctx,
        cols[2] + 18,
        rowBotY - 12,
        (cols[2] + cols[3]) / 2,
        rowBotY - 28,
        cols[3] - 16,
        rowMidY + 14,
        step === 6 ? pal.sky : pal.inkSubtle,
        step === 6 ? 2.5 : 1.5
      );
      drawSynCell(ctx, cols[3], rowMidY, numToCanvas(data.m3), step === 6, false, pal);
    }

    // Step 7: Remainder box!
    if (step >= 7) {
      drawPlusHint(ctx, cols[3] - Math.min(34, colSpan * 0.34), (rowTopY + rowMidY) / 2, false, pal);

      // L-shaped remainder separator
      const remSepX = (cols[2] + cols[3]) / 2;
      ctx.save();
      ctx.strokeStyle = pal.rose;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(remSepX, barY + 2);
      ctx.lineTo(remSepX, rowBotY + 24);
      ctx.lineTo(boardRight - 4, rowBotY + 24);
      ctx.stroke();
      ctx.restore();

      drawSynCell(ctx, cols[3], rowBotY, numToCanvas(data.rem), true, true, pal);

      ctx.save();
      ctx.font = '800 12px "Pretendard Variable", Pretendard, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = pal.rose;
      ctx.fillText('나머지 R (불변!)', cols[3], rowBotY + 42);

      ctx.fillStyle = data.d !== 1 ? pal.amber : pal.emerald;
      ctx.fillText(
        data.d !== 1
          ? '(x - ' + (data.alpha < 0 ? '(' + numToCanvas(data.alpha) + ')' : numToCanvas(data.alpha)) + ') 기준 겉보기 몫 Q₁(x) 계수'
          : '진짜 몫 Q(x) = ' + polyToCanvas([{ c: data.b2, exp: 2 }, { c: data.b1, exp: 1 }, { c: data.b0, exp: 0 }], 'x'),
        cols[1],
        rowBotY + 42
      );
      ctx.restore();

      // If d != 1, draw the dramatic ÷ d transformation row right on canvas!
      if (data.d !== 1) {
        const trueRowY = rowBotY + 106;
        for (let j = 0; j < 3; j++) {
          drawArrow(ctx, cols[j], rowBotY + 52, cols[j], trueRowY - 24, pal.emerald, 2.2, 7);
          drawBadge(ctx, cols[j] + 22, (rowBotY + 52 + trueRowY - 24) / 2, '÷' + data.d, pal.emeraldSoft, pal.emerald, pal.emerald, 'left');
        }
        const realCoeffs = [data.q2, data.q1, data.q0];
        for (let j = 0; j < 3; j++) {
          roundRectPath(ctx, cols[j] - 28, trueRowY - 19, 56, 38, 10);
          ctx.fillStyle = pal.emeraldFill;
          ctx.fill();
          ctx.strokeStyle = pal.emerald;
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.save();
          ctx.fillStyle = pal.ink;
          ctx.font = '800 15px "Pretendard Variable", Pretendard, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(numToCanvas(realCoeffs[j]), cols[j], trueRowY);
          ctx.restore();
        }
        ctx.save();
        ctx.fillStyle = pal.emerald;
        ctx.font = '800 13px "Pretendard Variable", Pretendard, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          '✅ (' + divStr + ')로 나눈 진짜 몫 Q(x) = ' + polyToCanvas([{ c: data.q2, exp: 2 }, { c: data.q1, exp: 1 }, { c: data.q0, exp: 0 }], 'x'),
          cols[1],
          trueRowY + 34
        );
        ctx.restore();
      }
    } else {
      // Guide hint at bottom when stepping manually
      ctx.save();
      ctx.fillStyle = pal.inkMuted;
      ctx.font = '700 13px "Pretendard Variable", Pretendard, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('▶ [다음 스텝] 버튼을 눌러 화살표 순서(내려쓰기 → ×α 올리기 → 더하기)를 따라가 보세요!', w / 2, rowBotY + 58);
      ctx.restore();
    }
  }

  function drawSynCell(ctx, x, y, text, isActive, isRemainder, pal) {
    const bw = 54;
    const bh = 36;
    roundRectPath(ctx, x - bw / 2, y - bh / 2, bw, bh, 10);
    if (isRemainder) {
      ctx.fillStyle = pal.roseFill;
      ctx.fill();
      ctx.strokeStyle = pal.rose;
      ctx.lineWidth = 2.2;
      ctx.stroke();
    } else if (isActive) {
      ctx.fillStyle = pal.indigoFill;
      ctx.fill();
      ctx.strokeStyle = pal.indigo;
      ctx.lineWidth = 2.2;
      ctx.stroke();
    } else {
      ctx.fillStyle = pal.panelBg;
      ctx.fill();
      ctx.strokeStyle = pal.panelBorder;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
    ctx.save();
    ctx.fillStyle = pal.ink;
    ctx.font = '800 15px "Pretendard Variable", Pretendard, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y + 0.5);
    ctx.restore();
  }

  function drawPlusHint(ctx, x, y, active, pal) {
    ctx.save();
    ctx.fillStyle = active ? pal.emerald : pal.inkSubtle;
    ctx.font = '800 14px "Pretendard Variable", Pretendard, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('+', x, y);
    ctx.restore();
  }

  // =========================================================================
  // LAB 3: 'complex-plane' — 복소평면 iⁿ 회전기 & 켤레복소수 실험실
  // =========================================================================

  function rotateVec90(re, im, times) {
    const k = ((times % 4) + 4) % 4;
    if (k === 0) return { re: re, im: im };
    if (k === 1) return { re: -im, im: re };
    if (k === 2) return { re: -re, im: -im };
    return { re: im, im: -re };
  }

  function renderComplexControls() {
    const c = state.complex;
    return (
      '<div class="vl-action-bar">' +
        '<button type="button" class="btn btn-sm btn-primary" data-action="cp-rot-i">× i (90° 반시계 회전!)</button>' +
        '<button type="button" class="btn btn-sm ' + (c.showConj ? 'btn-accent' : 'btn-secondary') + '" data-action="cp-toggle-conj">켤레복소수 z̄ 보기</button>' +
        '<button type="button" class="btn btn-sm ' + (c.showCycle ? 'btn-primary' : 'btn-secondary') + '" data-action="cp-toggle-cycle">iⁿ 4주기 연속 합 확인</button>' +
      '</div>' +

      '<div class="lab-control-row">' +
        '<label for="vl-cp-a"><span>실수부 ' + mInline('a = \\text{Re}(z)') + '</span><span class="vl-slider-val" id="vl-cp-a-val">a = ' + fmtPlain(c.a, 1) + '</span></label>' +
        '<input id="vl-cp-a" class="lab-slider" type="range" min="-4" max="4" step="0.5" value="' + c.a + '" data-slider="cp-a">' +
      '</div>' +

      '<div class="lab-control-row">' +
        '<label for="vl-cp-b"><span>허수부 ' + mInline('b = \\text{Im}(z)') + '</span><span class="vl-slider-val" id="vl-cp-b-val">b = ' + fmtPlain(c.b, 1) + '</span></label>' +
        '<input id="vl-cp-b" class="lab-slider" type="range" min="-4" max="4" step="0.5" value="' + c.b + '" data-slider="cp-b">' +
      '</div>' +

      '<div>' +
        '<div class="vl-readout-label" style="margin-bottom:0.4rem;">🌀 원클릭 실험 프리셋 (평면 위를 직접 클릭·드래그해도 이동!)</div>' +
        '<div class="lab-presets">' +
          '<button type="button" class="chip" data-cp-preset="1,0,2">z = 1 → i² = -1 증명!</button>' +
          '<button type="button" class="chip" data-cp-preset="2,1,1">기본 벡터 z = 2 + i</button>' +
          '<button type="button" class="chip" data-cp-preset="0,1,4">순허수 z = i (4주기 루프)</button>' +
          '<button type="button" class="chip" data-cp-preset="3,-2,0">켤레 대칭 z = 3 - 2i</button>' +
        '</div>' +
      '</div>' +

      '<div class="vl-insight-note" id="vl-cp-note">' + getComplexInsightHtml() + '</div>'
    );
  }

  function getComplexInsightHtml() {
    const c = state.complex;
    if (c.showCycle) {
      return mText(
        '**4주기 합 = 0의 기하학적 비밀!** $z, iz, i^2z, i^3z$ 네 벡터를 꼬리에 꼬리를 물고 이어 그리면 정확히 **$90^\\circ$씩 꺾이는 정사각형 폐곡선**을 그리며 원점 $(0, 0)$으로 되돌아옵니다! 그래서 $i + i^2 + i^3 + i^4 = 0$이며, 연속하는 4개의 거듭제곱 합은 무조건 $0$입니다.'
      );
    }
    return mText(
      '**왜 $i^2 = -1$일까요?** 실수축 위의 $+1$에 $i$를 한 번 곱하면 $90^\\circ$ 회전해 허수축 $+i$가 되고, 한 번 더 $i$를 곱하면 총 **$180^\\circ$ 반전되어 정확히 $-1$에 착륙**하기 때문입니다! 또한 $z + \\overline{z} = 2a$는 허수부가 서로 상쇄되어 항상 **실수축 위**에 놓입니다.'
    );
  }

  function updateComplexReadoutsAndBanner() {
    if (!state.readoutEl || !state.bannerEl) return;
    const c = state.complex;
    const rot = rotateVec90(c.a, c.b, c.rotSteps);
    const powLabels = ['z', 'iz', 'i^2 z = -z', 'i^3 z = -iz'];
    const powCanvasLabels = ['z (0°)', 'iz (90°)', 'i²z = -z (180°)', 'i³z = -iz (270°)'];
    const modSq = cleanNum(c.a * c.a + c.b * c.b, 2);
    const sumConj = cleanNum(2 * c.a, 2);

    if (state.controlsEl) {
      const note = state.controlsEl.querySelector('#vl-cp-note');
      if (note) note.innerHTML = getComplexInsightHtml();
      const conjBtn = state.controlsEl.querySelector('[data-action="cp-toggle-conj"]');
      if (conjBtn) {
        conjBtn.className = 'btn btn-sm ' + (c.showConj ? 'btn-accent' : 'btn-secondary');
      }
      const cycBtn = state.controlsEl.querySelector('[data-action="cp-toggle-cycle"]');
      if (cycBtn) {
        cycBtn.className = 'btn btn-sm ' + (c.showCycle ? 'btn-primary' : 'btn-secondary');
      }
    }

    state.bannerEl.innerHTML = mText(
      '$$z = ' +
        complexToLatex(c.a, c.b) +
        ' \\xrightarrow{\\times i^{' + c.rotSteps + '} \\;(' + (c.rotSteps * 90) + '^\\circ)} ' +
        powLabels[c.rotSteps] + ' = ' + complexToLatex(rot.re, rot.im) + '$$' +
      '켤레 성질: $z + \\overline{z} = ' + numToLatex(sumConj) + ' \\in \\mathbb{R}$, $\\quad z\\overline{z} = a^2 + b^2 = ' + numToLatex(modSq) + '$, $\\quad i + i^2 + i^3 + i^4 = 0$'
    );

    state.readoutEl.innerHTML =
      readoutCard('현재 복소수 z', complexToCanvas(c.a, c.b), 'indigo') +
      readoutCard('회전 벡터 ' + powCanvasLabels[c.rotSteps], complexToCanvas(rot.re, rot.im), 'sky') +
      readoutCard('켤레복소수 z̄ & 합 z+z̄', 'z̄ = ' + complexToCanvas(c.a, -c.b) + ' / 합 = ' + fmtPlain(sumConj), 'emerald') +
      readoutCard('켤레 곱 z·z̄ = |z|²', fmtPlain(cleanNum(c.a * c.a, 2)) + ' + ' + fmtPlain(cleanNum(c.b * c.b, 2)) + ' = ' + fmtPlain(modSq), 'rose');
  }

  function getComplexCoordTransform(w, h) {
    const cx = Math.round(w * 0.5);
    const cy = Math.round(h * 0.52);
    const maxRange = 5.4;
    const unit = Math.min(w - 56, h - 72) / (maxRange * 2);
    return {
      cx: cx,
      cy: cy,
      unit: unit,
      toPx: function (re, im) {
        return { x: cx + re * unit, y: cy - im * unit };
      },
      toMath: function (px, py) {
        return { re: (px - cx) / unit, im: (cy - py) / unit };
      }
    };
  }

  function drawComplexCanvas() {
    const prep = prepareCanvas(state.canvasEl, 430);
    if (!prep) return;
    const ctx = prep.ctx;
    const w = prep.w;
    const h = prep.h;
    const pal = getPalette();
    const c = state.complex;
    const tr = getComplexCoordTransform(w, h);

    // Subtle background
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, pal.bgTop);
    grad.addColorStop(1, pal.bgBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Coordinate grid (-5..5)
    ctx.save();
    ctx.lineWidth = 1;
    for (let k = -6; k <= 6; k++) {
      const pX = tr.cx + k * tr.unit;
      const pY = tr.cy - k * tr.unit;
      ctx.strokeStyle = k === 0 ? pal.axis : pal.gridMajor;
      ctx.lineWidth = k === 0 ? 1.8 : 1;
      if (pX >= 10 && pX <= w - 10) {
        ctx.beginPath();
        ctx.moveTo(pX, 38);
        ctx.lineTo(pX, h - 14);
        ctx.stroke();
      }
      if (pY >= 38 && pY <= h - 14) {
        ctx.beginPath();
        ctx.moveTo(14, pY);
        ctx.lineTo(w - 14, pY);
        ctx.stroke();
      }
    }

    // Axis ticks & Re/Im labels
    ctx.fillStyle = pal.inkSubtle;
    ctx.font = '600 11px "Pretendard Variable", Pretendard, sans-serif';
    for (let k = -5; k <= 5; k++) {
      if (k === 0) continue;
      const pX = tr.cx + k * tr.unit;
      const pY = tr.cy - k * tr.unit;
      if (pX > 28 && pX < w - 28) {
        ctx.textAlign = 'center';
        ctx.fillText(String(k), pX, tr.cy + 15);
      }
      if (pY > 52 && pY < h - 24) {
        ctx.textAlign = 'right';
        ctx.fillText(k + 'i', tr.cx - 7, pY + 4);
      }
    }
    ctx.font = '800 12px "Pretendard Variable", Pretendard, sans-serif';
    ctx.fillStyle = pal.ink;
    ctx.textAlign = 'right';
    ctx.fillText('Re (실수축)', w - 18, tr.cy - 8);
    ctx.textAlign = 'left';
    ctx.fillText('Im (허수축)', tr.cx + 8, 50);
    ctx.restore();

    drawBadge(ctx, 14, 20, '복소평면: z = ' + complexToCanvas(c.a, c.b) + '  (드래그하여 이동 가능)', pal.indigoSoft, pal.indigo, pal.ink, 'left');

    // Dashed Unit Circle |z| = 1 + Modulus Circle |z|
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = pal.gridMajor;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(tr.cx, tr.cy, tr.unit, 0, Math.PI * 2);
    ctx.stroke();

    const rMod = Math.hypot(c.a, c.b);
    if (rMod > 0.2 && Math.abs(rMod - 1) > 0.05) {
      ctx.strokeStyle = pal.indigoSoft;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(tr.cx, tr.cy, rMod * tr.unit, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    const origin = { x: tr.cx, y: tr.cy };
    const zPt = tr.toPx(c.a, c.b);

    // 1) Conjugate z̄ & Real-axis vector sum z + z̄ = 2a
    if (c.showConj && (Math.abs(c.a) > 0.01 || Math.abs(c.b) > 0.01)) {
      const conjPt = tr.toPx(c.a, -c.b);
      const sumRe = 2 * c.a;
      const sumPt = tr.toPx(sumRe, 0);

      // Dashed reflection segment across Real axis
      ctx.save();
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = pal.emerald;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(zPt.x, zPt.y);
      ctx.lineTo(conjPt.x, conjPt.y);
      ctx.stroke();

      // Parallelogram dashed lines to z + z̄ = 2a (if within reasonable bounds)
      if (Math.abs(sumRe) <= 5.4 && Math.abs(c.b) > 0.01) {
        ctx.strokeStyle = pal.emeraldSoft;
        ctx.beginPath();
        ctx.moveTo(zPt.x, zPt.y);
        ctx.lineTo(sumPt.x, sumPt.y);
        ctx.lineTo(conjPt.x, conjPt.y);
        ctx.stroke();
      }
      ctx.restore();

      // Conjugate vector z̄
      drawArrow(ctx, origin.x, origin.y, conjPt.x, conjPt.y, pal.emerald, 2.4, 9);
      drawPointDot(ctx, conjPt.x, conjPt.y, 5.5, pal.emeraldStrong, '#FFFFFF');
      drawBadge(
        ctx,
        conjPt.x + (c.a >= 0 ? 10 : -10),
        conjPt.y + (c.b >= 0 ? 16 : -16),
        'z̄ = ' + complexToCanvas(c.a, -c.b),
        pal.panelBg,
        pal.emerald,
        pal.emerald,
        c.a >= 0 ? 'left' : 'right'
      );

      // Vector sum z + z̄ = 2a on Real Axis!
      if (Math.abs(sumRe) > 0.01 && Math.abs(sumRe) <= 5.4) {
        drawArrow(ctx, origin.x, origin.y, sumPt.x, sumPt.y, pal.amber, 3, 9);
        drawPointDot(ctx, sumPt.x, sumPt.y, 5, pal.amberStrong, '#FFFFFF');
        drawBadge(ctx, sumPt.x, sumPt.y - 18, 'z+z̄ = ' + fmtPlain(sumRe) + ' (실수!)', pal.panelBg, pal.amber, pal.amber, 'center');
      }
    }

    // 2) 4-Period Closed Square Loop (z + iz + i²z + i³z = 0)
    if (c.showCycle) {
      const baseRe = Math.abs(c.a) < 0.01 && Math.abs(c.b) < 0.01 ? 0 : c.a;
      const baseIm = Math.abs(c.a) < 0.01 && Math.abs(c.b) < 0.01 ? 1 : c.b;
      // Scale loop gently if |z| is huge so all 4 sides stay clearly inside the viewport
      const loopScale = Math.hypot(baseRe, baseIm) > 2.4 ? 2.0 / Math.hypot(baseRe, baseIm) : 1;
      let curRe = 0;
      let curIm = 0;
      const loopColors = [pal.indigo, pal.sky, pal.rose, pal.amber];
      const stepNames = ['+z', '+iz', '+i²z', '+i³z → 원점 0 복귀!'];

      for (let stepIdx = 0; stepIdx < 4; stepIdx++) {
        const dVec = rotateVec90(baseRe * loopScale, baseIm * loopScale, stepIdx);
        const nextRe = curRe + dVec.re;
        const nextIm = curIm + dVec.im;
        const p1 = tr.toPx(curRe, curIm);
        const p2 = tr.toPx(nextRe, nextIm);
        drawArrow(ctx, p1.x, p1.y, p2.x, p2.y, loopColors[stepIdx], 3.2, 10);
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        drawBadge(ctx, midX, midY, stepNames[stepIdx], pal.panelBg, loopColors[stepIdx], loopColors[stepIdx], 'center');
        curRe = nextRe;
        curIm = nextIm;
      }
    }

    // 3) Base Vector z & Animated Rotated Vector i^k z with 90°*k Angle Arc!
    if (rMod > 0.01) {
      // Base z vector (Indigo)
      drawArrow(ctx, origin.x, origin.y, zPt.x, zPt.y, pal.indigo, 3, 10);
      drawPointDot(ctx, zPt.x, zPt.y, 6, pal.indigoStrong, '#FFFFFF');
      drawBadge(
        ctx,
        zPt.x + (c.a >= 0 ? 10 : -10),
        zPt.y - 16,
        'z = ' + complexToCanvas(c.a, c.b),
        pal.panelBg,
        pal.indigo,
        pal.indigo,
        c.a >= 0 ? 'left' : 'right'
      );

      // Rotated vector at current animated angle (radians counter-clockwise in math coords)
      const baseMathAngle = Math.atan2(c.b, c.a);
      const rotRad = (c.animAngleDeg * Math.PI) / 180;
      if (c.rotSteps > 0 || Math.abs(c.animAngleDeg) > 1) {
        const curAngle = baseMathAngle + rotRad;
        const rotRe = rMod * Math.cos(curAngle);
        const rotIm = rMod * Math.sin(curAngle);
        const rotPt = tr.toPx(rotRe, rotIm);

        // Angle sweep arc on canvas (canvas angles are clockwise, so math angle θ -> -θ)
        const arcR = Math.min(46, Math.max(22, rMod * tr.unit * 0.44));
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.arc(origin.x, origin.y, arcR, -baseMathAngle, -(baseMathAngle + rotRad), true);
        ctx.closePath();
        ctx.fillStyle = pal.roseFill;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(origin.x, origin.y, arcR, -baseMathAngle, -(baseMathAngle + rotRad), true);
        ctx.strokeStyle = pal.rose;
        ctx.lineWidth = 2.2;
        ctx.stroke();
        ctx.restore();

        const midAng = baseMathAngle + rotRad / 2;
        const labelR = arcR + 18;
        drawBadge(
          ctx,
          origin.x + labelR * Math.cos(midAng),
          origin.y - labelR * Math.sin(midAng),
          '+' + Math.round(c.animAngleDeg) + '°',
          pal.panelBg,
          pal.rose,
          pal.rose,
          'center'
        );

        drawArrow(ctx, origin.x, origin.y, rotPt.x, rotPt.y, pal.rose, 3.2, 10);
        drawPointDot(ctx, rotPt.x, rotPt.y, 6.5, pal.roseStrong, '#FFFFFF');

        const exactRot = rotateVec90(c.a, c.b, c.rotSteps);
        const prefix = ['', 'iz = ', 'i²z = ', 'i³z = '][c.rotSteps] || '';
        drawBadge(
          ctx,
          rotPt.x + (rotRe >= 0 ? 10 : -10),
          rotPt.y + (rotIm >= 0 ? -16 : 16),
          prefix + complexToCanvas(exactRot.re, exactRot.im),
          pal.panelBg,
          pal.rose,
          pal.rose,
          rotRe >= 0 ? 'left' : 'right'
        );
      }
    }
  }

  function drawPointDot(ctx, x, y, r, fill, stroke) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  function animateComplexRotation(fromDeg, toDeg) {
    cancelActiveAnimations();
    const start = performance.now();
    const dur = 380;
    function stepFrame(now) {
      const p = Math.min(1, (now - start) / dur);
      const ease = 1 - Math.pow(1 - p, 3);
      state.complex.animAngleDeg = fromDeg + (toDeg - fromDeg) * ease;
      drawComplexCanvas();
      if (p < 1) {
        state.animRaf = requestAnimationFrame(stepFrame);
      } else {
        state.complex.animAngleDeg = toDeg % 360;
        state.animRaf = 0;
        drawComplexCanvas();
      }
    }
    state.animRaf = requestAnimationFrame(stepFrame);
  }

  // =========================================================================
  // LAB 4: 'quadratic-explorer' — 판별식 D · 직선 교점 · 제한된 범위 최대·최소
  // =========================================================================

  function renderQuadraticControls() {
    const q = state.quad;
    const switcher =
      '<div class="vl-submode-bar" role="tablist" aria-label="이차함수 실험 모드">' +
        '<button type="button" class="vl-submode-btn ' + (q.mode === 'discriminant' ? 'is-active' : '') + '" data-quad-mode="discriminant">Mode A: 포물선·직선 교점 & 판별식 D</button>' +
        '<button type="button" class="vl-submode-btn ' + (q.mode === 'minmax' ? 'is-active' : '') + '" data-quad-mode="minmax">Mode B: 제한된 범위 α≤x≤β 최대·최소</button>' +
      '</div>';

    if (q.mode === 'discriminant') {
      return (
        switcher +
        '<div>' +
          '<div class="vl-readout-label" style="margin-bottom:0.4rem;">🎯 판별식 위치 관계 프리셋</div>' +
          '<div class="lab-presets">' +
            '<button type="button" class="chip" data-quad-d-preset="1,-2,-1,1,3">두 점에서 만남 (D &gt; 0)</button>' +
            '<button type="button" class="chip" data-quad-d-preset="1,-2,2,2,-2">한 점에서 접함 (D = 0)</button>' +
            '<button type="button" class="chip" data-quad-d-preset="1,-2,3,0.5,-1">만나지 않음 (D &lt; 0)</button>' +
            '<button type="button" class="chip" data-quad-d-preset="-1,2,1,-2,5">위로 볼록 접선 (D = 0)</button>' +
          '</div>' +
        '</div>' +

        '<div class="lab-control-row">' +
          '<label for="vl-qd-a"><span>이차항 계수 ' + mInline('a') + ' (' + mInline('a \\neq 0') + ')</span><span class="vl-slider-val" id="vl-qd-a-val">a = ' + fmtPlain(q.a, 2) + '</span></label>' +
          '<input id="vl-qd-a" class="lab-slider" type="range" min="-2" max="2" step="0.25" value="' + q.a + '" data-slider="qd-a">' +
        '</div>' +
        '<div class="lab-control-row">' +
          '<label for="vl-qd-b"><span>일차항 계수 ' + mInline('b') + '</span><span class="vl-slider-val" id="vl-qd-b-val">b = ' + fmtPlain(q.b, 1) + '</span></label>' +
          '<input id="vl-qd-b" class="lab-slider" type="range" min="-5" max="5" step="0.5" value="' + q.b + '" data-slider="qd-b">' +
        '</div>' +
        '<div class="lab-control-row">' +
          '<label for="vl-qd-c"><span>상수항 ' + mInline('c') + '</span><span class="vl-slider-val" id="vl-qd-c-val">c = ' + fmtPlain(q.c, 1) + '</span></label>' +
          '<input id="vl-qd-c" class="lab-slider" type="range" min="-5" max="5" step="0.5" value="' + q.c + '" data-slider="qd-c">' +
        '</div>' +
        '<div class="lab-control-row">' +
          '<label for="vl-qd-m"><span>직선 기울기 ' + mInline('m') + ' (' + mInline('y = mx + n') + ')</span><span class="vl-slider-val" id="vl-qd-m-val">m = ' + fmtPlain(q.m, 1) + '</span></label>' +
          '<input id="vl-qd-m" class="lab-slider" type="range" min="-4" max="4" step="0.5" value="' + q.m + '" data-slider="qd-m">' +
        '</div>' +
        '<div class="lab-control-row">' +
          '<label for="vl-qd-n"><span>직선 y절편 ' + mInline('n') + '</span><span class="vl-slider-val" id="vl-qd-n-val">n = ' + fmtPlain(q.n, 1) + '</span></label>' +
          '<input id="vl-qd-n" class="lab-slider" type="range" min="-5" max="5" step="0.5" value="' + q.n + '" data-slider="qd-n">' +
        '</div>' +

        '<div class="vl-insight-note" id="vl-quad-note">' + getQuadraticInsightHtml() + '</div>'
      );
    }

    // Mode B: Restricted Interval Min/Max
    return (
      switcher +
      '<div>' +
        '<div class="vl-readout-label" style="margin-bottom:0.4rem;">🔥 대칭축 x = p 위치 3대 케이스 (2022 개정 핵심!)</div>' +
        '<div class="lab-presets">' +
          '<button type="button" class="chip" data-quad-m-preset="1,-2,-3,0,3">Case 1: 축이 왼쪽 (p &lt; α)</button>' +
          '<button type="button" class="chip" data-quad-m-preset="1,1,-2,-1,4">Case 2: 축이 구간 내부 (α ≤ p ≤ β)</button>' +
          '<button type="button" class="chip" data-quad-m-preset="1,4,-3,-1,2">Case 3: 축이 오른쪽 (p &gt; β)</button>' +
        '</div>' +
      '</div>' +

      '<div class="vl-action-bar">' +
        '<button type="button" class="btn btn-sm btn-secondary" data-action="quad-flip-a2">↕ 볼록 방향 뒤집기 (a 부호 반전)</button>' +
      '</div>' +

      '<div class="lab-control-row">' +
        '<label for="vl-qm-a2"><span>최고차항 계수 ' + mInline('a') + ' (' + mInline('y = a(x-p)^2 + q') + ')</span><span class="vl-slider-val" id="vl-qm-a2-val">a = ' + fmtPlain(q.a2, 2) + '</span></label>' +
        '<input id="vl-qm-a2" class="lab-slider" type="range" min="-2" max="2" step="0.25" value="' + q.a2 + '" data-slider="qm-a2">' +
      '</div>' +
      '<div class="lab-control-row">' +
        '<label for="vl-qm-p"><span>대칭축(꼭짓점 x좌표) ' + mInline('p') + '</span><span class="vl-slider-val" id="vl-qm-p-val">p = ' + fmtPlain(q.p, 1) + '</span></label>' +
        '<input id="vl-qm-p" class="lab-slider" type="range" min="-4" max="4" step="0.5" value="' + q.p + '" data-slider="qm-p">' +
      '</div>' +
      '<div class="lab-control-row">' +
        '<label for="vl-qm-q"><span>꼭짓점 y좌표 ' + mInline('q') + '</span><span class="vl-slider-val" id="vl-qm-q-val">q = ' + fmtPlain(q.q, 1) + '</span></label>' +
        '<input id="vl-qm-q" class="lab-slider" type="range" min="-5" max="5" step="0.5" value="' + q.q + '" data-slider="qm-q">' +
      '</div>' +
      '<div class="lab-control-row">' +
        '<label for="vl-qm-alpha"><span>제한 구간 시작 ' + mInline('\\alpha') + '</span><span class="vl-slider-val" id="vl-qm-alpha-val">α = ' + fmtPlain(q.alpha, 1) + '</span></label>' +
        '<input id="vl-qm-alpha" class="lab-slider" type="range" min="-5" max="3.5" step="0.5" value="' + q.alpha + '" data-slider="qm-alpha">' +
      '</div>' +
      '<div class="lab-control-row">' +
        '<label for="vl-qm-beta"><span>제한 구간 끝 ' + mInline('\\beta') + '</span><span class="vl-slider-val" id="vl-qm-beta-val">β = ' + fmtPlain(q.beta, 1) + '</span></label>' +
        '<input id="vl-qm-beta" class="lab-slider" type="range" min="-3.5" max="5" step="0.5" value="' + q.beta + '" data-slider="qm-beta">' +
      '</div>' +

      '<div class="vl-insight-note" id="vl-quad-note">' + getQuadraticInsightHtml() + '</div>'
    );
  }

  function computeMinMaxAnalysis() {
    const q = state.quad;
    const a = Math.abs(q.a2) < 1e-6 ? 1 : q.a2;
    const p = q.p;
    const vq = q.q;
    const alpha = Math.min(q.alpha, q.beta - 0.5);
    const beta = Math.max(q.beta, alpha + 0.5);
    const evalF = function (x) {
      return a * (x - p) * (x - p) + vq;
    };

    const candidates = [
      { x: alpha, y: evalF(alpha), tag: '구간 왼쪽 끝 x = α' },
      { x: beta, y: evalF(beta), tag: '구간 오른쪽 끝 x = β' }
    ];
    let caseId = 2;
    let caseTitle = 'Case 2: 대칭축이 구간 내부 (α ≤ p ≤ β)';
    if (p < alpha) {
      caseId = 1;
      caseTitle = 'Case 1: 대칭축이 구간 왼쪽 밖 (p < α)';
    } else if (p > beta) {
      caseId = 3;
      caseTitle = 'Case 3: 대칭축이 구간 오른쪽 밖 (p > β)';
    } else {
      candidates.push({ x: p, y: vq, tag: '꼭짓점 x = p' });
    }

    let maxPt = candidates[0];
    let minPt = candidates[0];
    for (let i = 1; i < candidates.length; i++) {
      if (candidates[i].y > maxPt.y) maxPt = candidates[i];
      if (candidates[i].y < minPt.y) minPt = candidates[i];
    }

    let logicReason = '';
    if (caseId === 2) {
      if (a > 0) {
        logicReason =
          '아래로 볼록($a > 0$)이고 **대칭축 $x = ' + fmtPlain(p) + '$이 구간 $[' + fmtPlain(alpha) + ', ' + fmtPlain(beta) + ']$ 안에 포함**되므로, 꼭짓점 $x = ' +
          fmtPlain(p) + '$에서 **최솟값 $m = ' + fmtPlain(cleanNum(minPt.y, 2)) + '$**을 갖습니다! 반대로 최댓값은 대칭축에서 **더 멀리 떨어진 끝점 $x = ' +
          fmtPlain(maxPt.x) + '$**에서 **$M = ' + fmtPlain(cleanNum(maxPt.y, 2)) + '$**이 됩니다.';
      } else {
        logicReason =
          '위로 볼록($a < 0$)이고 **대칭축 $x = ' + fmtPlain(p) + '$이 구간 $[' + fmtPlain(alpha) + ', ' + fmtPlain(beta) + ']$ 안에 포함**되므로, 꼭짓점 $x = ' +
          fmtPlain(p) + '$에서 **최댓값 $M = ' + fmtPlain(cleanNum(maxPt.y, 2)) + '$**을 갖습니다! 최솟값은 대칭축에서 **더 멀리 떨어진 끝점 $x = ' +
          fmtPlain(minPt.x) + '$**에서 **$m = ' + fmtPlain(cleanNum(minPt.y, 2)) + '$**이 됩니다.';
      }
    } else if (caseId === 1) {
      logicReason =
        '**함정 주의!** 꼭짓점 $x = ' + fmtPlain(p) + '$이 구간 왼쪽 밖($p < \\alpha$)에 있으므로 꼭짓점은 제한 범위에 포함되지 않습니다! 구간 $[' +
        fmtPlain(alpha) + ', ' + fmtPlain(beta) + ']$에서 함수는 단조 ' + (a > 0 ? '증가' : '감소') + '하므로 양 끝점 $f(' + fmtPlain(alpha) + '), f(' + fmtPlain(beta) + ')$에서만 최대·최소가 결정됩니다.';
    } else {
      logicReason =
        '**함정 주의!** 꼭짓점 $x = ' + fmtPlain(p) + '$이 구간 오른쪽 밖($p > \\beta$)에 있으므로 꼭짓점은 제한 범위에 포함되지 않습니다! 구간 $[' +
        fmtPlain(alpha) + ', ' + fmtPlain(beta) + ']$에서 함수는 단조 ' + (a > 0 ? '감소' : '증가') + '하므로 양 끝점 $f(' + fmtPlain(alpha) + '), f(' + fmtPlain(beta) + ')$에서만 최대·최소가 결정됩니다.';
    }

    return {
      a: a,
      p: p,
      q: vq,
      alpha: alpha,
      beta: beta,
      evalF: evalF,
      caseId: caseId,
      caseTitle: caseTitle,
      maxPt: maxPt,
      minPt: minPt,
      logicReason: logicReason
    };
  }

  function getQuadraticInsightHtml() {
    if (state.quad.mode === 'discriminant') {
      const q = state.quad;
      const B = q.b - q.m;
      const C = q.c - q.n;
      const D = cleanNum(B * B - 4 * q.a * C, 3);
      if (Math.abs(D) < 1e-6) {
        return mText(
          '**판별식 $D = 0$ (접선 탄생!)**: 연립방정식 $ax^2 + (b-m)x + (c-n) = 0$이 **중근**을 가지므로 포물선과 직선이 정확히 **한 점에서 접합니다**.'
        );
      }
      if (D > 0) {
        return mText(
          '**판별식 $D = ' + fmtPlain(D, 2) + ' > 0$**: 연립방정식이 **서로 다른 두 실근**을 가지며, 두 실근이 곧 포물선과 직선의 **두 교점의 $x$좌표**와 일치합니다!'
        );
      }
      return mText(
        '**판별식 $D = ' + fmtPlain(D, 2) + ' < 0$**: 연립방정식이 실근을 갖지 않고 **서로 다른 두 허근**을 가지므로 좌표평면 위에서 두 그래프는 **만나지 않습니다**.'
      );
    }
    return mText(computeMinMaxAnalysis().logicReason);
  }

  function updateQuadraticReadoutsAndBanner() {
    if (!state.readoutEl || !state.bannerEl) return;
    const q = state.quad;

    if (state.controlsEl) {
      const note = state.controlsEl.querySelector('#vl-quad-note');
      if (note) note.innerHTML = getQuadraticInsightHtml();
    }

    if (q.mode === 'discriminant') {
      const a = q.a;
      const B = cleanNum(q.b - q.m, 3);
      const C = cleanNum(q.c - q.n, 3);
      const D = cleanNum(B * B - 4 * a * C, 3);

      const paraLatex = polyToLatex([{ c: a, exp: 2 }, { c: q.b, exp: 1 }, { c: q.c, exp: 0 }], 'x');
      const lineLatex = polyToLatex([{ c: q.m, exp: 1 }, { c: q.n, exp: 0 }], 'x');
      const combLatex = polyToLatex([{ c: a, exp: 2 }, { c: B, exp: 1 }, { c: C, exp: 0 }], 'x');

      let relText = '';
      let ptsStr = '교점 없음 (허근 2개)';
      let badgeTone = 'rose';
      if (Math.abs(D) < 1e-6) {
        const x0 = -B / (2 * a);
        const y0 = q.m * x0 + q.n;
        relText = 'D = 0 (한 점에서 접함)';
        ptsStr = '(' + fmtPlain(x0, 2) + ', ' + fmtPlain(y0, 2) + ')';
        badgeTone = 'emerald';
      } else if (D > 0) {
        const sqrtD = Math.sqrt(D);
        const r1 = (-B - sqrtD) / (2 * a);
        const r2 = (-B + sqrtD) / (2 * a);
        const xLeft = Math.min(r1, r2);
        const xRight = Math.max(r1, r2);
        relText = 'D > 0 (서로 다른 두 점)';
        ptsStr = 'x = ' + fmtPlain(xLeft, 2) + ', ' + fmtPlain(xRight, 2);
        badgeTone = 'indigo';
      } else {
        relText = 'D < 0 (만나지 않음)';
      }

      state.bannerEl.innerHTML = mText(
        '연립방정식: $$' + combLatex + ' = 0 \\quad\\Longrightarrow\\quad D = (' + numToLatex(B) + ')^2 - 4(' + numToLatex(a) + ')(' + numToLatex(C) + ') = ' + fmtPlain(D, 2) + '$$' +
        '포물선 $y = ' + paraLatex + '$ 와 직선 $y = ' + lineLatex + '$ 의 교점 $x$좌표는 연립방정식의 실근과 같습니다.'
      );

      state.readoutEl.innerHTML =
        readoutCard('판별식 D 값', 'D = ' + fmtPlain(D, 2), badgeTone) +
        readoutCard('위치 관계 판정', relText, 'sky') +
        readoutCard('교점 (실근)', ptsStr, 'emerald') +
        readoutCard('포물선 꼭짓점', '(' + fmtPlain(-q.b / (2 * a), 2) + ', ' + fmtPlain(q.c - (q.b * q.b) / (4 * a), 2) + ')', 'indigo');
      return;
    }

    // Mode B Readouts & Banner
    const mm = computeMinMaxAnalysis();
    const pSign = mm.p >= 0 ? '- ' + numToLatex(mm.p) : '+ ' + numToLatex(-mm.p);
    const qSign = mm.q >= 0 ? '+ ' + numToLatex(mm.q) : '- ' + numToLatex(-mm.q);
    const aCoeff = Math.abs(mm.a - 1) < 1e-6 ? '' : Math.abs(mm.a + 1) < 1e-6 ? '-' : numToLatex(mm.a);

    state.bannerEl.innerHTML = mText(
      '$$y = ' + aCoeff + '(x ' + pSign + ')^2 ' + qSign + ' \\quad (' + numToLatex(mm.alpha) + ' \\le x \\le ' + numToLatex(mm.beta) + ')$$' +
      mm.logicReason
    );

    state.readoutEl.innerHTML =
      readoutCard('현재 케이스', mm.caseTitle.split(':')[0] + ' (' + (mm.caseId === 1 ? 'p < α' : mm.caseId === 2 ? 'α ≤ p ≤ β' : 'p > β') + ')', 'indigo') +
      readoutCard('대칭축 & 꼭짓점', 'x = ' + fmtPlain(mm.p) + ' / (' + fmtPlain(mm.p) + ', ' + fmtPlain(mm.q) + ')', 'sky') +
      readoutCard('최댓값 M (x=' + fmtPlain(mm.maxPt.x) + ')', 'M = ' + fmtPlain(cleanNum(mm.maxPt.y, 2)), 'rose') +
      readoutCard('최솟값 m (x=' + fmtPlain(mm.minPt.x) + ')', 'm = ' + fmtPlain(cleanNum(mm.minPt.y, 2)), 'emerald');
  }

  function drawQuadraticCanvas() {
    const prep = prepareCanvas(state.canvasEl, 430);
    if (!prep) return;
    const ctx = prep.ctx;
    const w = prep.w;
    const h = prep.h;
    const pal = getPalette();

    if (state.quad.mode === 'discriminant') {
      drawQuadraticDiscriminantCanvas(ctx, w, h, pal);
    } else {
      drawQuadraticMinMaxCanvas(ctx, w, h, pal);
    }
  }

  function createPlotViewport(w, h, xMin, xMax, yMin, yMax) {
    const padL = 42;
    const padR = 20;
    const padT = 44;
    const padB = 26;
    const plotW = Math.max(120, w - padL - padR);
    const plotH = Math.max(120, h - padT - padB);
    return {
      padL: padL,
      padT: padT,
      plotW: plotW,
      plotH: plotH,
      xMin: xMin,
      xMax: xMax,
      yMin: yMin,
      yMax: yMax,
      toPx: function (x, y) {
        return {
          x: padL + ((x - xMin) / (xMax - xMin)) * plotW,
          y: padT + ((yMax - y) / (yMax - yMin)) * plotH
        };
      }
    };
  }

  function drawCartesianGrid(ctx, w, h, vp, pal) {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, pal.bgTop);
    grad.addColorStop(1, pal.bgBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.beginPath();
    ctx.rect(vp.padL, vp.padT, vp.plotW, vp.plotH);
    ctx.clip();

    for (let gx = Math.ceil(vp.xMin); gx <= Math.floor(vp.xMax); gx++) {
      const px = vp.toPx(gx, 0).x;
      ctx.strokeStyle = gx === 0 ? pal.axis : pal.gridMajor;
      ctx.lineWidth = gx === 0 ? 1.8 : 1;
      ctx.beginPath();
      ctx.moveTo(px, vp.padT);
      ctx.lineTo(px, vp.padT + vp.plotH);
      ctx.stroke();
    }
    const yStep = vp.yMax - vp.yMin > 18 ? 2 : 1;
    for (let gy = Math.ceil(vp.yMin / yStep) * yStep; gy <= Math.floor(vp.yMax); gy += yStep) {
      const py = vp.toPx(0, gy).y;
      ctx.strokeStyle = gy === 0 ? pal.axis : pal.gridMajor;
      ctx.lineWidth = gy === 0 ? 1.8 : 1;
      ctx.beginPath();
      ctx.moveTo(vp.padL, py);
      ctx.lineTo(vp.padL + vp.plotW, py);
      ctx.stroke();
    }
    ctx.restore();

    // Numeric tick labels
    ctx.save();
    ctx.fillStyle = pal.inkSubtle;
    ctx.font = '600 10.5px "Pretendard Variable", Pretendard, sans-serif';
    const zeroY = Math.min(vp.padT + vp.plotH - 4, Math.max(vp.padT + 14, vp.toPx(0, 0).y + 13));
    ctx.textAlign = 'center';
    for (let gx = Math.ceil(vp.xMin); gx <= Math.floor(vp.xMax); gx += 2) {
      if (gx === 0) continue;
      const px = vp.toPx(gx, 0).x;
      ctx.fillText(String(gx), px, zeroY);
    }
    ctx.textAlign = 'right';
    for (let gy = Math.ceil(vp.yMin / 2) * 2; gy <= Math.floor(vp.yMax); gy += 2) {
      if (gy === 0) continue;
      const py = vp.toPx(0, gy).y;
      ctx.fillText(String(gy), vp.padL - 6, py + 4);
    }
    ctx.restore();
  }

  function drawQuadraticDiscriminantCanvas(ctx, w, h, pal) {
    const q = state.quad;
    const a = Math.abs(q.a) < 1e-6 ? 1 : q.a;
    const vx = -q.b / (2 * a);
    const vy = a * vx * vx + q.b * vx + q.c;
    const B = q.b - q.m;
    const C = q.c - q.n;
    const D = cleanNum(B * B - 4 * a * C, 3);

    const centerX = Math.max(-3, Math.min(3, (-B / (2 * a) + vx) / 2));
    const centerY = Math.max(-4, Math.min(5, vy + (a > 0 ? 3 : -3)));
    const vp = createPlotViewport(w, h, centerX - 6.2, centerX + 6.2, centerY - 7.5, centerY + 8.5);
    drawCartesianGrid(ctx, w, h, vp, pal);

    const statusBadgeText =
      Math.abs(D) < 1e-6
        ? '판별식 D = 0  ⇒  접함 (교점 1개)'
        : D > 0
        ? '판별식 D = ' + fmtPlain(D, 2) + ' > 0  ⇒  서로 다른 두 점에서 만남'
        : '판별식 D = ' + fmtPlain(D, 2) + ' < 0  ⇒  만나지 않음 (교점 0개)';
    const statusBorder = Math.abs(D) < 1e-6 ? pal.emerald : D > 0 ? pal.indigo : pal.rose;
    const statusBg = Math.abs(D) < 1e-6 ? pal.emeraldSoft : D > 0 ? pal.indigoSoft : pal.roseFill;
    drawBadge(ctx, 14, 21, statusBadgeText, statusBg, statusBorder, pal.ink, 'left');

    ctx.save();
    ctx.beginPath();
    ctx.rect(vp.padL, vp.padT, vp.plotW, vp.plotH);
    ctx.clip();

    // Draw Line y = mx + n
    const lx1 = vp.xMin;
    const lx2 = vp.xMax;
    const lp1 = vp.toPx(lx1, q.m * lx1 + q.n);
    const lp2 = vp.toPx(lx2, q.m * lx2 + q.n);
    ctx.strokeStyle = pal.sky;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(lp1.x, lp1.y);
    ctx.lineTo(lp2.x, lp2.y);
    ctx.stroke();

    // Draw Parabola y = ax^2 + bx + c
    ctx.strokeStyle = pal.indigo;
    ctx.lineWidth = 3;
    ctx.beginPath();
    const samples = 160;
    for (let i = 0; i <= samples; i++) {
      const x = vp.xMin + ((vp.xMax - vp.xMin) * i) / samples;
      const y = a * x * x + q.b * x + q.c;
      const pt = vp.toPx(x, y);
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();

    // Highlight Intersection Points (or closest gap if D < 0)
    const xAxisY = vp.toPx(0, 0).y;
    if (D >= -1e-6) {
      const safeD = Math.max(0, D);
      const roots =
        safeD < 1e-6
          ? [-B / (2 * a)]
          : [(-B - Math.sqrt(safeD)) / (2 * a), (-B + Math.sqrt(safeD)) / (2 * a)];

      for (let rIdx = 0; rIdx < roots.length; rIdx++) {
        const rx = roots[rIdx];
        const ry = q.m * rx + q.n;
        const pPt = vp.toPx(rx, ry);

        // Dashed vertical drop line to x-axis showing real root!
        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = safeD < 1e-6 ? pal.emerald : pal.rose;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(pPt.x, pPt.y);
        ctx.lineTo(pPt.x, xAxisY);
        ctx.stroke();
        ctx.restore();

        // Outer neon halo
        ctx.beginPath();
        ctx.arc(pPt.x, pPt.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = safeD < 1e-6 ? pal.emeraldFill : pal.roseFill;
        ctx.fill();

        drawPointDot(ctx, pPt.x, pPt.y, 6, safeD < 1e-6 ? pal.emeraldStrong : pal.roseStrong, '#FFFFFF');
        drawBadge(
          ctx,
          pPt.x,
          pPt.y - 20,
          (safeD < 1e-6 ? '접점 ' : '교점 ') + '(' + fmtPlain(rx, 2) + ', ' + fmtPlain(ry, 2) + ')',
          pal.panelBg,
          safeD < 1e-6 ? pal.emerald : pal.rose,
          safeD < 1e-6 ? pal.emerald : pal.rose,
          'center'
        );
      }
    } else {
      // Show vertical gap at x = -B / (2a) where |parabola - line| is minimal!
      const xClosest = -B / (2 * a);
      const yPara = a * xClosest * xClosest + q.b * xClosest + q.c;
      const yLine = q.m * xClosest + q.n;
      const ptPara = vp.toPx(xClosest, yPara);
      const ptLine = vp.toPx(xClosest, yLine);

      ctx.save();
      ctx.setLineDash([4, 3]);
      ctx.strokeStyle = pal.amber;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ptPara.x, ptPara.y);
      ctx.lineTo(ptLine.x, ptLine.y);
      ctx.stroke();
      ctx.restore();

      drawBadge(
        ctx,
        ptPara.x + 10,
        (ptPara.y + ptLine.y) / 2,
        '최소 간격 = ' + fmtPlain(Math.abs(yPara - yLine), 2) + ' (만나지 않음)',
        pal.panelBg,
        pal.amber,
        pal.amber,
        'left'
      );
    }

    ctx.restore();
  }

  function drawQuadraticMinMaxCanvas(ctx, w, h, pal) {
    const mm = computeMinMaxAnalysis();
    const yCandidates = [mm.q, mm.maxPt.y, mm.minPt.y, 0];
    const minYVal = Math.min.apply(null, yCandidates);
    const maxYVal = Math.max.apply(null, yCandidates);
    const padY = Math.max(3, (maxYVal - minYVal) * 0.34);

    const vp = createPlotViewport(w, h, -6.2, 6.2, minYVal - padY, maxYVal + padY);
    drawCartesianGrid(ctx, w, h, vp, pal);

    drawBadge(ctx, 14, 21, mm.caseTitle, pal.indigoSoft, pal.indigo, pal.ink, 'left');

    ctx.save();
    ctx.beginPath();
    ctx.rect(vp.padL, vp.padT, vp.plotW, vp.plotH);
    ctx.clip();

    // 1) Shaded Restricted Interval Band [alpha, beta]
    const xAlphaPx = vp.toPx(mm.alpha, 0).x;
    const xBetaPx = vp.toPx(mm.beta, 0).x;
    ctx.fillStyle = pal.indigoSoft;
    ctx.fillRect(xAlphaPx, vp.padT, xBetaPx - xAlphaPx, vp.plotH);

    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = pal.indigo;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(xAlphaPx, vp.padT);
    ctx.lineTo(xAlphaPx, vp.padT + vp.plotH);
    ctx.moveTo(xBetaPx, vp.padT);
    ctx.lineTo(xBetaPx, vp.padT + vp.plotH);
    ctx.stroke();
    ctx.restore();

    // 2) Vertical Axis of Symmetry Line x = p
    const xAxisSymPx = vp.toPx(mm.p, 0).x;
    ctx.save();
    ctx.setLineDash([7, 4]);
    ctx.strokeStyle = pal.amber;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(xAxisSymPx, vp.padT);
    ctx.lineTo(xAxisSymPx, vp.padT + vp.plotH);
    ctx.stroke();
    ctx.restore();

    drawBadge(ctx, xAxisSymPx, vp.padT + 18, '대칭축 x = ' + fmtPlain(mm.p), pal.panelBg, pal.amber, pal.amber, 'center');

    // 3) Full Parabola as Dashed Faint Curve outside [alpha, beta]
    ctx.save();
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = pal.dark ? 'rgba(148, 163, 184, 0.42)' : 'rgba(100, 116, 139, 0.42)';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    const totalSamples = 160;
    for (let i = 0; i <= totalSamples; i++) {
      const x = vp.xMin + ((vp.xMax - vp.xMin) * i) / totalSamples;
      const pt = vp.toPx(x, mm.evalF(x));
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();
    ctx.restore();

    // 4) Restricted Interval [alpha, beta] Highlighted in Bold Neon Stroke!
    ctx.save();
    ctx.strokeStyle = pal.indigoFill;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const segSamples = 90;
    for (let i = 0; i <= segSamples; i++) {
      const x = mm.alpha + ((mm.beta - mm.alpha) * i) / segSamples;
      const pt = vp.toPx(x, mm.evalF(x));
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();

    ctx.strokeStyle = pal.indigo;
    ctx.lineWidth = 3.8;
    ctx.stroke();
    ctx.restore();

    // If vertex is outside [alpha, beta], mark ghost vertex so student sees why it's excluded!
    if (mm.caseId !== 2) {
      const vGhost = vp.toPx(mm.p, mm.q);
      drawPointDot(ctx, vGhost.x, vGhost.y, 5, pal.panelBg, pal.amber);
      drawBadge(ctx, vGhost.x, vGhost.y + (mm.a > 0 ? 20 : -20), '꼭짓점 (구간 밖 제외!)', pal.panelBg, pal.amber, pal.amber, 'center');
    }

    // 5) Maximum Point M (Rose Badge) & Minimum Point m (Sky/Blue Badge)
    const pMax = vp.toPx(mm.maxPt.x, mm.maxPt.y);
    const pMin = vp.toPx(mm.minPt.x, mm.minPt.y);

    // Glow & dot for Min m (Blue/Sky)
    ctx.beginPath();
    ctx.arc(pMin.x, pMin.y, 12, 0, Math.PI * 2);
    ctx.fillStyle = pal.skyFill;
    ctx.fill();
    drawPointDot(ctx, pMin.x, pMin.y, 6.5, pal.skyStrong, '#FFFFFF');

    // Glow & dot for Max M (Rose)
    ctx.beginPath();
    ctx.arc(pMax.x, pMax.y, 12, 0, Math.PI * 2);
    ctx.fillStyle = pal.roseFill;
    ctx.fill();
    drawPointDot(ctx, pMax.x, pMax.y, 6.5, pal.roseStrong, '#FFFFFF');

    ctx.restore();

    // Draw crisp M & m badges unclipped so text near edges is always 100% readable
    const clampX = function (px) {
      return Math.max(92, Math.min(w - 92, px));
    };
    const clampY = function (py) {
      return Math.max(58, Math.min(h - 22, py));
    };

    drawBadge(
      ctx,
      clampX(pMax.x),
      clampY(pMax.y - 22),
      '최댓값 M = ' + fmtPlain(cleanNum(mm.maxPt.y, 2)) + ' (x=' + fmtPlain(mm.maxPt.x) + ')',
      pal.roseStrong,
      null,
      '#FFFFFF',
      'center'
    );

    drawBadge(
      ctx,
      clampX(pMin.x),
      clampY(pMin.y + 22),
      '최솟값 m = ' + fmtPlain(cleanNum(mm.minPt.y, 2)) + ' (x=' + fmtPlain(mm.minPt.x) + ')',
      pal.skyStrong,
      null,
      '#FFFFFF',
      'center'
    );

    // Interval label at bottom of shaded band
    drawBadge(
      ctx,
      clampX((xAlphaPx + xBetaPx) / 2),
      h - 16,
      '제한 구간 [' + fmtPlain(mm.alpha) + ', ' + fmtPlain(mm.beta) + ']',
      pal.panelBg,
      pal.indigo,
      pal.indigo,
      'center'
    );
  }

  // =========================================================================
  // Master Tab Rendering & Event Handling (Zero Duplicate Listeners!)
  // =========================================================================

  function renderActiveCanvas() {
    if (!state.canvasEl) return;
    if (state.activeTab === 'poly-sim') drawPolyCanvas();
    else if (state.activeTab === 'synthetic-div') drawSyntheticCanvas();
    else if (state.activeTab === 'complex-plane') drawComplexCanvas();
    else drawQuadraticCanvas();
  }

  function updateActiveReadouts() {
    if (state.activeTab === 'poly-sim') updatePolyReadoutsAndBanner();
    else if (state.activeTab === 'synthetic-div') updateSyntheticReadoutsAndBanner();
    else if (state.activeTab === 'complex-plane') updateComplexReadoutsAndBanner();
    else updateQuadraticReadoutsAndBanner();
  }

  function renderControlsForActiveTab() {
    if (!state.controlsEl) return;
    if (state.activeTab === 'poly-sim') {
      state.controlsEl.innerHTML = renderPolyControls();
    } else if (state.activeTab === 'synthetic-div') {
      state.controlsEl.innerHTML = renderSyntheticControls();
    } else if (state.activeTab === 'complex-plane') {
      state.controlsEl.innerHTML = renderComplexControls();
    } else {
      state.controlsEl.innerHTML = renderQuadraticControls();
    }
  }

  function refreshActiveTabFull() {
    if (!state.containerEl) return;
    const meta = TAB_META.find(function (t) {
      return t.id === state.activeTab;
    }) || TAB_META[0];

    // Update active tab button classes
    const tabBtns = state.containerEl.querySelectorAll('.lab-tab');
    for (let i = 0; i < tabBtns.length; i++) {
      const btn = tabBtns[i];
      const active = btn.getAttribute('data-tab') === state.activeTab;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    }

    const titleEl = state.containerEl.querySelector('#vl-active-title');
    const subEl = state.containerEl.querySelector('#vl-active-subtitle');
    const pillEl = state.containerEl.querySelector('#vl-active-unit');
    if (titleEl) titleEl.textContent = meta.icon + ' ' + meta.title;
    if (subEl) subEl.textContent = meta.subtitle;
    if (pillEl) pillEl.textContent = meta.unitBadge;

    if (state.extraPanelEl && state.activeTab !== 'synthetic-div') {
      state.extraPanelEl.hidden = true;
      state.extraPanelEl.innerHTML = '';
    }

    renderControlsForActiveTab();
    updateActiveReadouts();
    renderActiveCanvas();
  }

  function buildShellDOM(container) {
    ensureScopedStyles();

    const tabsHtml = TAB_META.map(function (t) {
      const active = t.id === state.activeTab;
      return (
        '<button type="button" role="tab" class="lab-tab ' +
        (active ? 'is-active' : '') +
        '" data-tab="' + t.id + '" data-lab-tab="' + t.id + '" aria-selected="' + (active ? 'true' : 'false') + '">' +
        '<span>' + t.icon + '</span><span>' + escapeHtml(t.shortLabel) + '</span>' +
        '</button>'
      );
    }).join('');

    container.innerHTML =
      '<div class="lab-shell">' +
        '<div class="lab-header">' +
          '<div style="min-width:0;">' +
            '<div class="vl-canvas-title-wrap" style="margin-bottom:0.35rem;">' +
              '<span class="vl-unit-pill" id="vl-active-unit"></span>' +
            '</div>' +
            '<h2 id="vl-active-title" style="margin:0 0 0.3rem 0;font-size:clamp(1.2rem,2vw,1.5rem);font-weight:850;color:var(--ink-primary);"></h2>' +
            '<p id="vl-active-subtitle" style="margin:0;"></p>' +
          '</div>' +
        '</div>' +

        '<div class="lab-tabs" role="tablist" aria-label="시각 수학 실험실 탭">' +
          tabsHtml +
        '</div>' +

        '<div class="lab-grid">' +
          '<div class="lab-canvas-card">' +
            '<div class="vl-canvas-stage">' +
              '<canvas id="vl-main-canvas" aria-label="인터랙티브 수학 시각화 캔버스"></canvas>' +
            '</div>' +
            '<div id="vl-extra-panel" hidden></div>' +
            '<div class="lab-formula-banner" id="vl-formula-banner"></div>' +
            '<div class="lab-readout-grid" id="vl-readout-grid"></div>' +
          '</div>' +

          '<div class="lab-controls-card" id="vl-controls-card"></div>' +
        '</div>' +
      '</div>';

    state.canvasEl = container.querySelector('#vl-main-canvas');
    state.controlsEl = container.querySelector('#vl-controls-card');
    state.readoutEl = container.querySelector('#vl-readout-grid');
    state.bannerEl = container.querySelector('#vl-formula-banner');
    state.extraPanelEl = container.querySelector('#vl-extra-panel');

    bindShellEvents(container);
  }

  function bindShellEvents(container) {
    if (container.__vlBound) return;
    container.__vlBound = true;

    // Delegated clicks for tabs, submodes, presets, and action buttons
    container.addEventListener('click', function (ev) {
      const btn = ev.target && ev.target.closest ? ev.target.closest('button') : null;
      if (!btn || !container.contains(btn)) return;

      // 1) Top-level Lab Tabs
      const tabId = btn.getAttribute('data-tab') || btn.getAttribute('data-lab-tab');
      if (tabId && VALID_TABS.indexOf(tabId) >= 0) {
        if (state.activeTab !== tabId) {
          playClickSound();
          setTab(tabId);
        }
        return;
      }

      // 2) Poly sub-modes (preserves slider values if already on that sub-mode!)
      const polyMode = btn.getAttribute('data-poly-mode');
      if (polyMode) {
        if (state.poly.mode !== polyMode) {
          playClickSound();
          cancelActiveAnimations();
          state.poly.mode = polyMode;
          if (polyMode === 'diff-sq') {
            if (state.poly.a < 2) state.poly.a = 4;
            if (state.poly.b >= state.poly.a - 0.4) state.poly.b = Math.max(0.5, state.poly.a - 1);
            state.poly.morph = 1;
          }
          renderControlsForActiveTab();
          updateActiveReadouts();
          renderActiveCanvas();
        }
        return;
      }

      // 3) Poly presets
      const polyPreset = btn.getAttribute('data-poly-preset');
      if (polyPreset) {
        playClickSound();
        cancelActiveAnimations();
        const parts = polyPreset.split(',');
        state.poly.a = Number(parts[0]);
        state.poly.b = Number(parts[1]);
        state.poly.mode = parts[2] || state.poly.mode;
        state.poly.morph = 1;
        renderControlsForActiveTab();
        updateActiveReadouts();
        renderActiveCanvas();
        return;
      }

      // 4) Synthetic presets
      const synPreset = btn.getAttribute('data-syn-preset');
      if (synPreset) {
        playClickSound();
        cancelActiveAnimations();
        const sp = synPreset.split(',').map(Number);
        state.syn.p = sp[0];
        state.syn.q = sp[1];
        state.syn.r = sp[2];
        state.syn.s = sp[3];
        state.syn.d = sp[4];
        state.syn.e = sp[5];
        state.syn.step = 7;
        renderControlsForActiveTab();
        updateActiveReadouts();
        renderActiveCanvas();
        return;
      }

      // 5) Complex plane presets
      const cpPreset = btn.getAttribute('data-cp-preset');
      if (cpPreset) {
        playClickSound();
        cancelActiveAnimations();
        const cp = cpPreset.split(',').map(Number);
        state.complex.a = cp[0];
        state.complex.b = cp[1];
        if (cp[2] === 4) {
          state.complex.rotSteps = 1;
          state.complex.animAngleDeg = 90;
          state.complex.showCycle = true;
        } else {
          state.complex.rotSteps = cp[2] % 4;
          state.complex.animAngleDeg = state.complex.rotSteps * 90;
          state.complex.showCycle = false;
        }
        renderControlsForActiveTab();
        updateActiveReadouts();
        renderActiveCanvas();
        return;
      }

      // 6) Quadratic sub-modes (preserves slider values if already on that sub-mode!)
      const quadMode = btn.getAttribute('data-quad-mode');
      if (quadMode) {
        if (state.quad.mode !== quadMode) {
          playClickSound();
          state.quad.mode = quadMode;
          renderControlsForActiveTab();
          updateActiveReadouts();
          renderActiveCanvas();
        }
        return;
      }

      // 7) Quadratic Mode A presets
      const qdPreset = btn.getAttribute('data-quad-d-preset');
      if (qdPreset) {
        playClickSound();
        const qp = qdPreset.split(',').map(Number);
        state.quad.mode = 'discriminant';
        state.quad.a = qp[0];
        state.quad.b = qp[1];
        state.quad.c = qp[2];
        state.quad.m = qp[3];
        state.quad.n = qp[4];
        renderControlsForActiveTab();
        updateActiveReadouts();
        renderActiveCanvas();
        return;
      }

      // 8) Quadratic Mode B presets
      const qmPreset = btn.getAttribute('data-quad-m-preset');
      if (qmPreset) {
        playClickSound();
        const mp = qmPreset.split(',').map(Number);
        state.quad.mode = 'minmax';
        state.quad.a2 = mp[0];
        state.quad.p = mp[1];
        state.quad.q = mp[2];
        state.quad.alpha = mp[3];
        state.quad.beta = mp[4];
        renderControlsForActiveTab();
        updateActiveReadouts();
        renderActiveCanvas();
        return;
      }

      // 9) Named interactive actions
      const action = btn.getAttribute('data-action');
      if (!action) return;
      playClickSound();

      if (action === 'poly-toggle-explode') {
        const next = state.poly.explodeTarget > 0.1 ? 0 : 1;
        state.poly.explodeTarget = next;
        renderControlsForActiveTab();
        animatePolyValue('explode', state.poly.explode, next, 320);
      } else if (action === 'poly-play-morph') {
        animatePolyValue('morph', 0, 1, 520);
      } else if (action === 'poly-toggle-cube-gap') {
        const nextGap = state.poly.cubeGap > 0.15 ? 0 : 0.65;
        state.poly.cubeGap = nextGap;
        renderControlsForActiveTab();
        animatePolyValue('cubeGap', nextGap === 0 ? 0.65 : 0, nextGap, 380);
      } else if (action === 'syn-next') {
        cancelActiveAnimations();
        state.syn.step = state.syn.step >= 7 ? 1 : state.syn.step + 1;
        updateActiveReadouts();
        renderActiveCanvas();
      } else if (action === 'syn-reset') {
        cancelActiveAnimations();
        state.syn.step = 0;
        updateActiveReadouts();
        renderActiveCanvas();
      } else if (action === 'syn-all') {
        cancelActiveAnimations();
        if (state.syn.step >= 7) {
          state.syn.step = 0;
          updateActiveReadouts();
          renderActiveCanvas();
        }
        state.synTimer = setInterval(function () {
          if (state.syn.step < 7) {
            state.syn.step += 1;
            updateActiveReadouts();
            renderActiveCanvas();
          } else {
            clearInterval(state.synTimer);
            state.synTimer = 0;
          }
        }, 210);
      } else if (action === 'syn-demo-d2') {
        cancelActiveAnimations();
        state.syn.d = 2;
        state.syn.e = Math.max(-4, Math.min(4, state.syn.e * 2 || 2));
        state.syn.step = 7;
        renderControlsForActiveTab();
        updateActiveReadouts();
        renderActiveCanvas();
      } else if (action === 'cp-rot-i') {
        const prevSteps = state.complex.rotSteps;
        const nextSteps = (prevSteps + 1) % 4;
        state.complex.rotSteps = nextSteps;
        updateActiveReadouts();
        const fromDeg = prevSteps * 90;
        const toDeg = nextSteps === 0 ? 360 : nextSteps * 90;
        animateComplexRotation(fromDeg, toDeg);
      } else if (action === 'cp-toggle-conj') {
        state.complex.showConj = !state.complex.showConj;
        updateActiveReadouts();
        renderActiveCanvas();
      } else if (action === 'cp-toggle-cycle') {
        state.complex.showCycle = !state.complex.showCycle;
        updateActiveReadouts();
        renderActiveCanvas();
      } else if (action === 'quad-flip-a2') {
        state.quad.a2 = -state.quad.a2;
        renderControlsForActiveTab();
        updateActiveReadouts();
        renderActiveCanvas();
      }
    });

    // Delegated slider input handler
    container.addEventListener('input', function (ev) {
      const input = ev.target;
      if (!input || !input.getAttribute) return;
      const key = input.getAttribute('data-slider');
      if (!key) return;
      const val = Number(input.value);
      if (Number.isNaN(val)) return;

      if (key === 'poly-a') {
        state.poly.a = val;
        if (state.poly.mode === 'diff-sq' && state.poly.b >= state.poly.a - 0.4) {
          state.poly.b = Math.max(0.5, cleanNum(state.poly.a - 0.5, 1));
          const bInput = container.querySelector('#vl-poly-b');
          if (bInput) {
            bInput.max = String(Math.max(0.5, cleanNum(state.poly.a - 0.5, 1)));
            bInput.value = String(state.poly.b);
          }
          setLabelText(container, '#vl-poly-b-val', 'b = ' + fmtPlain(state.poly.b, 1));
        } else if (state.poly.mode === 'diff-sq') {
          const bInput = container.querySelector('#vl-poly-b');
          if (bInput) bInput.max = String(Math.max(0.5, cleanNum(state.poly.a - 0.5, 1)));
        }
        setLabelText(container, '#vl-poly-a-val', 'a = ' + fmtPlain(state.poly.a, 1));
      } else if (key === 'poly-b') {
        state.poly.b = state.poly.mode === 'diff-sq' ? Math.min(val, state.poly.a - 0.5) : val;
        setLabelText(container, '#vl-poly-b-val', 'b = ' + fmtPlain(state.poly.b, 1));
      } else if (key === 'syn-p') {
        state.syn.p = val === 0 ? (state.syn.p >= 0 ? -1 : 1) : val;
        input.value = String(state.syn.p);
        setLabelText(container, '#vl-syn-p-val', String(state.syn.p));
      } else if (key === 'syn-q') {
        state.syn.q = val;
        setLabelText(container, '#vl-syn-q-val', String(val));
      } else if (key === 'syn-r') {
        state.syn.r = val;
        setLabelText(container, '#vl-syn-r-val', String(val));
      } else if (key === 'syn-s') {
        state.syn.s = val;
        setLabelText(container, '#vl-syn-s-val', String(val));
      } else if (key === 'syn-d') {
        state.syn.d = Math.max(1, val);
        setLabelText(container, '#vl-syn-d-val', 'd = ' + state.syn.d);
      } else if (key === 'syn-e') {
        state.syn.e = val;
        setLabelText(container, '#vl-syn-e-val', 'e = ' + state.syn.e);
      } else if (key === 'cp-a') {
        state.complex.a = val;
        setLabelText(container, '#vl-cp-a-val', 'a = ' + fmtPlain(val, 1));
      } else if (key === 'cp-b') {
        state.complex.b = val;
        setLabelText(container, '#vl-cp-b-val', 'b = ' + fmtPlain(val, 1));
      } else if (key === 'qd-a') {
        state.quad.a = Math.abs(val) < 0.1 ? (state.quad.a > 0 ? -0.25 : 0.25) : val;
        input.value = String(state.quad.a);
        setLabelText(container, '#vl-qd-a-val', 'a = ' + fmtPlain(state.quad.a, 2));
      } else if (key === 'qd-b') {
        state.quad.b = val;
        setLabelText(container, '#vl-qd-b-val', 'b = ' + fmtPlain(val, 1));
      } else if (key === 'qd-c') {
        state.quad.c = val;
        setLabelText(container, '#vl-qd-c-val', 'c = ' + fmtPlain(val, 1));
      } else if (key === 'qd-m') {
        state.quad.m = val;
        setLabelText(container, '#vl-qd-m-val', 'm = ' + fmtPlain(val, 1));
      } else if (key === 'qd-n') {
        state.quad.n = val;
        setLabelText(container, '#vl-qd-n-val', 'n = ' + fmtPlain(val, 1));
      } else if (key === 'qm-a2') {
        state.quad.a2 = Math.abs(val) < 0.1 ? (state.quad.a2 > 0 ? -0.25 : 0.25) : val;
        input.value = String(state.quad.a2);
        setLabelText(container, '#vl-qm-a2-val', 'a = ' + fmtPlain(state.quad.a2, 2));
      } else if (key === 'qm-p') {
        state.quad.p = val;
        setLabelText(container, '#vl-qm-p-val', 'p = ' + fmtPlain(val, 1));
      } else if (key === 'qm-q') {
        state.quad.q = val;
        setLabelText(container, '#vl-qm-q-val', 'q = ' + fmtPlain(val, 1));
      } else if (key === 'qm-alpha') {
        state.quad.alpha = Math.min(val, state.quad.beta - 0.5);
        input.value = String(state.quad.alpha);
        setLabelText(container, '#vl-qm-alpha-val', 'α = ' + fmtPlain(state.quad.alpha, 1));
      } else if (key === 'qm-beta') {
        state.quad.beta = Math.max(val, state.quad.alpha + 0.5);
        input.value = String(state.quad.beta);
        setLabelText(container, '#vl-qm-beta-val', 'β = ' + fmtPlain(state.quad.beta, 1));
      }

      updateActiveReadouts();
      renderActiveCanvas();
    });

    // Pointer drag interaction on Complex Plane canvas
    function handleCanvasPointer(ev) {
      if (state.activeTab !== 'complex-plane' || !state.canvasEl) return;
      const rect = state.canvasEl.getBoundingClientRect();
      if (rect.width < 20 || rect.height < 20) return;
      const px = ev.clientX - rect.left;
      const py = ev.clientY - rect.top;
      const tr = getComplexCoordTransform(rect.width, rect.height);
      const m = tr.toMath(px, py);
      const snappedA = Math.max(-4, Math.min(4, Math.round(m.re * 2) / 2));
      const snappedB = Math.max(-4, Math.min(4, Math.round(m.im * 2) / 2));
      if (snappedA !== state.complex.a || snappedB !== state.complex.b) {
        state.complex.a = snappedA;
        state.complex.b = snappedB;
        const inA = container.querySelector('#vl-cp-a');
        const inB = container.querySelector('#vl-cp-b');
        if (inA) inA.value = String(snappedA);
        if (inB) inB.value = String(snappedB);
        setLabelText(container, '#vl-cp-a-val', 'a = ' + fmtPlain(snappedA, 1));
        setLabelText(container, '#vl-cp-b-val', 'b = ' + fmtPlain(snappedB, 1));
        updateActiveReadouts();
        renderActiveCanvas();
      }
    }

    container.addEventListener('pointerdown', function (ev) {
      if (ev.target === state.canvasEl && state.activeTab === 'complex-plane') {
        state.isDraggingCanvas = true;
        handleCanvasPointer(ev);
      }
    });
    container.addEventListener('pointermove', function (ev) {
      if (state.isDraggingCanvas && state.activeTab === 'complex-plane') {
        handleCanvasPointer(ev);
      }
    });
    container.addEventListener('pointerup', function () {
      state.isDraggingCanvas = false;
    });
    container.addEventListener('pointercancel', function () {
      state.isDraggingCanvas = false;
    });
  }

  function setLabelText(container, selector, text) {
    const el = container.querySelector(selector);
    if (el) el.textContent = text;
  }

  function ensureGlobalObservers(containerEl) {
    if (typeof window === 'undefined') return;

    if (!windowResizeBound) {
      windowResizeBound = true;
      window.addEventListener('resize', function () {
        if (state.containerEl) {
          renderActiveCanvas();
        }
      });
    }

    if (typeof ResizeObserver !== 'undefined') {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      resizeObserver = new ResizeObserver(function () {
        if (state.canvasEl && state.canvasEl.clientWidth > 0) {
          renderActiveCanvas();
        }
      });
      if (containerEl) {
        resizeObserver.observe(containerEl);
      }
    }

    if (typeof MutationObserver !== 'undefined' && !themeObserver && document && document.documentElement) {
      themeObserver = new MutationObserver(function () {
        refreshTheme();
      });
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
      });
    }
  }

  // =========================================================================
  // Public API: mount(containerEl, initialTab), setTab(tabId), refreshTheme()
  // =========================================================================

  function mount(containerEl, initialTab) {
    const resolvedEl =
      containerEl ||
      (typeof document !== 'undefined' ? document.getElementById('visual-lab-root') : null);
    if (!resolvedEl) return;

    if (initialTab && VALID_TABS.indexOf(initialTab) >= 0) {
      state.activeTab = initialTab;
    } else if (VALID_TABS.indexOf(state.activeTab) < 0) {
      state.activeTab = 'poly-sim';
    }

    const needsBuild =
      state.containerEl !== resolvedEl ||
      !resolvedEl.querySelector('.lab-shell') ||
      !resolvedEl.querySelector('#vl-main-canvas');

    state.containerEl = resolvedEl;
    if (needsBuild) {
      resolvedEl.__vlBound = false;
      buildShellDOM(resolvedEl);
    } else {
      state.canvasEl = resolvedEl.querySelector('#vl-main-canvas');
      state.controlsEl = resolvedEl.querySelector('#vl-controls-card');
      state.readoutEl = resolvedEl.querySelector('#vl-readout-grid');
      state.bannerEl = resolvedEl.querySelector('#vl-formula-banner');
      state.extraPanelEl = resolvedEl.querySelector('#vl-extra-panel');
    }

    ensureGlobalObservers(resolvedEl);
    refreshActiveTabFull();
  }

  function setTab(tabId) {
    if (!tabId || VALID_TABS.indexOf(tabId) < 0) return;
    cancelActiveAnimations();
    state.activeTab = tabId;
    if (state.containerEl) {
      refreshActiveTabFull();
    }
  }

  function refreshTheme() {
    if (!state.containerEl || !state.canvasEl) return;
    renderActiveCanvas();
  }

  const VisualLab = {
    mount: mount,
    setTab: setTab,
    refreshTheme: refreshTheme
  };

  if (typeof window !== 'undefined') {
    window.VisualLab = VisualLab;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.VisualLab = VisualLab;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = VisualLab;
  }
})(typeof window !== 'undefined' ? window : globalThis);
