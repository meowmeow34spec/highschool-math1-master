/**
 * LOGIC PRISM · 고1 공통수학1 반학기 마스터
 * MathRender — Safe Korean + KaTeX 0.16.11 Renderer & Interactive Stealth Cloze Engine
 */
(function (root) {
  'use strict';

  const HTML_ESCAPE_MAP = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (ch) {
      return HTML_ESCAPE_MAP[ch] || ch;
    });
  }

  function stripOuterDelimiters(rawLatex) {
    const trimmed = String(rawLatex).trim();
    if (trimmed.length > 4 && trimmed.startsWith('$$') && trimmed.endsWith('$$')) {
      return trimmed.slice(2, -2).trim();
    }
    if (
      trimmed.length > 2 &&
      trimmed.startsWith('$') &&
      trimmed.endsWith('$') &&
      !trimmed.slice(1, -1).includes('$')
    ) {
      return trimmed.slice(1, -1).trim();
    }
    return trimmed;
  }

  const FALLBACK_SYMBOL_MAP = [
    [/\\iff/g, ' ⟺ '],
    [/\\implies/g, ' ⟹ '],
    [/\\Rightarrow/g, ' ⇒ '],
    [/\\Leftarrow/g, ' ⇐ '],
    [/\\leftrightarrow/g, ' ↔ '],
    [/\\to\b|\\rightarrow/g, ' → '],
    [/\\le\b|\\leq\b/g, ' ≤ '],
    [/\\ge\b|\\geq\b/g, ' ≥ '],
    [/\\neq\b|\\ne\b/g, ' ≠ '],
    [/\\pm\b/g, ' ± '],
    [/\\mp\b/g, ' ∓ '],
    [/\\times\b/g, ' × '],
    [/\\div\b/g, ' ÷ '],
    [/\\cdot\b/g, ' · '],
    [/\\cdots\b|\\ldots\b|\\dots\b/g, '…'],
    [/\\in\b/g, ' ∈ '],
    [/\\notin\b/g, ' ∉ '],
    [/\\subset\b/g, ' ⊂ '],
    [/\\subseteq\b/g, ' ⊆ '],
    [/\\cup\b/g, ' ∪ '],
    [/\\cap\b/g, ' ∩ '],
    [/\\infty\b/g, '∞'],
    [/\\alpha\b/g, 'α'],
    [/\\beta\b/g, 'β'],
    [/\\gamma\b/g, 'γ'],
    [/\\delta\b/g, 'δ'],
    [/\\Delta\b/g, 'Δ'],
    [/\\theta\b/g, 'θ'],
    [/\\lambda\b/g, 'λ'],
    [/\\pi\b/g, 'π'],
    [/\\omega\b/g, 'ω'],
    [/\\deg\b/g, 'deg'],
    [/\\max\b/g, 'max'],
    [/\\min\b/g, 'min'],
    [/\\quad\b|\\qquad\b/g, '  '],
    [/\\,|\\;|\\:|\\!/g, ' '],
    [/\\left\s*/g, ''],
    [/\\right\s*/g, ''],
    [/\\\{/g, '{'],
    [/\\\}/g, '}']
  ];

  function extractBracedGroup(src, startIdx) {
    if (src[startIdx] !== '{') return null;
    let depth = 0;
    for (let i = startIdx; i < src.length; i++) {
      const ch = src[i];
      if (ch === '\\') {
        i++;
        continue;
      }
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) {
          return {
            content: src.slice(startIdx + 1, i),
            endIndex: i + 1
          };
        }
      }
    }
    return null;
  }

  function convertFallbackCommands(input) {
    let out = '';
    let i = 0;
    while (i < input.length) {
      if (input.startsWith('\\boxed', i)) {
        let cursor = i + 6;
        while (cursor < input.length && /\s/.test(input[cursor])) cursor++;
        const grp = extractBracedGroup(input, cursor);
        if (grp) {
          out += '<span class="math-cloze-box">' + convertFallbackCommands(grp.content) + '</span>';
          i = grp.endIndex;
          continue;
        }
      }

      if (input.startsWith('\\frac', i) || input.startsWith('\\dfrac', i) || input.startsWith('\\tfrac', i)) {
        const cmdLen = input.startsWith('\\frac', i) ? 5 : 6;
        let cursor = i + cmdLen;
        while (cursor < input.length && /\s/.test(input[cursor])) cursor++;
        const numGrp = extractBracedGroup(input, cursor);
        if (numGrp) {
          cursor = numGrp.endIndex;
          while (cursor < input.length && /\s/.test(input[cursor])) cursor++;
          const denGrp = extractBracedGroup(input, cursor);
          if (denGrp) {
            out +=
              '<span class="math-frac"><span class="math-num">' +
              convertFallbackCommands(numGrp.content) +
              '</span><span class="math-den">' +
              convertFallbackCommands(denGrp.content) +
              '</span></span>';
            i = denGrp.endIndex;
            continue;
          }
        }
      }

      if (input.startsWith('\\overline', i) || input.startsWith('\\bar', i)) {
        const cmdLen = input.startsWith('\\overline', i) ? 9 : 4;
        let cursor = i + cmdLen;
        while (cursor < input.length && /\s/.test(input[cursor])) cursor++;
        const grp = extractBracedGroup(input, cursor);
        if (grp) {
          out += '<span class="math-overline">' + convertFallbackCommands(grp.content) + '</span>';
          i = grp.endIndex;
          continue;
        }
      }

      if (input.startsWith('\\sqrt', i)) {
        let cursor = i + 5;
        while (cursor < input.length && /\s/.test(input[cursor])) cursor++;
        const grp = extractBracedGroup(input, cursor);
        if (grp) {
          out += '√(' + convertFallbackCommands(grp.content) + ')';
          i = grp.endIndex;
          continue;
        }
      }

      if (input.startsWith('\\text', i) || input.startsWith('\\mathrm', i) || input.startsWith('\\mathbf', i)) {
        const cmdMatch = input.slice(i).match(/^\\(?:text|mathrm|mathbf)\s*/);
        if (cmdMatch) {
          const grp = extractBracedGroup(input, i + cmdMatch[0].length);
          if (grp) {
            out += escapeHtml(grp.content);
            i = grp.endIndex;
            continue;
          }
        }
      }

      if ((input[i] === '^' || input[i] === '_') && i + 1 < input.length) {
        const tag = input[i] === '^' ? 'sup' : 'sub';
        if (input[i + 1] === '{') {
          const grp = extractBracedGroup(input, i + 1);
          if (grp) {
            out += '<' + tag + '>' + convertFallbackCommands(grp.content) + '</' + tag + '>';
            i = grp.endIndex;
            continue;
          }
        } else {
          const nextToken = input.slice(i + 1).match(/^(\\[a-zA-Z]+|[a-zA-Z0-9+\-])/);
          if (nextToken) {
            out += '<' + tag + '>' + convertFallbackCommands(nextToken[1]) + '</' + tag + '>';
            i += 1 + nextToken[1].length;
            continue;
          }
        }
      }

      out += escapeHtml(input[i]);
      i++;
    }
    return out;
  }

  function fallbackLatexToHtml(latex, displayMode) {
    let normalized = latex;
    for (let idx = 0; idx < FALLBACK_SYMBOL_MAP.length; idx++) {
      const pair = FALLBACK_SYMBOL_MAP[idx];
      normalized = normalized.replace(pair[0], pair[1]);
    }
    const html = convertFallbackCommands(normalized);
    if (displayMode) {
      return '<div class="math-block math-fallback">' + html + '</div>';
    }
    return '<span class="math-inline math-fallback">' + html + '</span>';
  }

  function getKatex() {
    if (typeof window !== 'undefined' && window.katex && typeof window.katex.renderToString === 'function') {
      return window.katex;
    }
    if (typeof globalThis !== 'undefined' && globalThis.katex && typeof globalThis.katex.renderToString === 'function') {
      return globalThis.katex;
    }
    return null;
  }

  function renderCore(latex, displayMode) {
    if (latex === null || latex === undefined) return '';
    const cleaned = stripOuterDelimiters(latex);
    if (!cleaned) return '';

    const katexInstance = getKatex();
    if (katexInstance) {
      try {
        const rendered = katexInstance.renderToString(cleaned, {
          throwOnError: false,
          strict: false,
          displayMode: Boolean(displayMode),
          trust: false
        });
        return displayMode
          ? '<div class="math-block">' + rendered + '</div>'
          : '<span class="math-inline">' + rendered + '</span>';
      } catch (_err) {
        return fallbackLatexToHtml(cleaned, Boolean(displayMode));
      }
    }

    return fallbackLatexToHtml(cleaned, Boolean(displayMode));
  }

  function inline(latex) {
    return renderCore(latex, false);
  }

  function block(latex) {
    return renderCore(latex, true);
  }

  /**
   * Formats Korean + Markdown + LaTeX mixed strings safely:
   * 1. Extracts $$...$$ and $...$ math segments BEFORE HTML-escaping so `<`, `>`, `&`
   *    inside equations (e.g. `$\deg(R) < \deg(B)$`) reach KaTeX intact.
   * 2. Escapes `<`, `>`, `&`, `"`, `'` on all prose outside math.
   * 3. Converts `**...**` -> `<strong>...</strong>`, `` `...` `` -> `<code>...</code>`, `\n` -> `<br>`.
   * 4. Injects rendered KaTeX / fallback HTML for each math token with zero raw `$` leaks.
   */
  function formatText(str) {
    if (str === null || str === undefined) return '';
    const raw = String(str);
    if (!raw) return '';

    const mathTokens = [];
    const ESCAPED_DOLLAR_TOKEN = '\uE000ESCDOLLAR\uE001';

    let working = raw.replace(/\\\$/g, ESCAPED_DOLLAR_TOKEN);

    // 1) Extract display math $$...$$
    working = working.replace(/\$\$([\s\S]+?)\$\$/g, function (_match, expr) {
      const id = mathTokens.length;
      mathTokens.push({ display: true, latex: expr });
      return '\uE000MATH' + id + '\uE001';
    });

    // 2) Extract inline math $...$
    working = working.replace(/\$([^\$]+?)\$/g, function (_match, expr) {
      const id = mathTokens.length;
      mathTokens.push({ display: false, latex: expr });
      return '\uE000MATH' + id + '\uE001';
    });

    // 3) Safely escape HTML characters in non-math Korean/English prose
    let safeProse = escapeHtml(working);

    // 4) Apply lightweight emphasis & line breaks
    safeProse = safeProse
      .replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`\r\n]+?)`/g, '<code>$1</code>')
      .replace(/\r?\n/g, '<br>');

    // 5) Restore escaped literal dollar signs if any
    safeProse = safeProse.split(ESCAPED_DOLLAR_TOKEN).join('&#36;');

    // 6) Restore rendered math tokens using a callback function (avoids JS $& replacement bugs)
    return safeProse.replace(/\uE000MATH(\d+)\uE001/g, function (_match, indexStr) {
      const token = mathTokens[Number(indexStr)];
      if (!token) return '';
      return token.display ? block(token.latex) : inline(token.latex);
    });
  }

  /**
   * Renders interactive Stealth Formula Cloze (`\boxed{?}` when hidden vs full `latex` when revealed).
   */
  function renderCloze(latex, clozeLatex, isHidden, displayMode) {
    const hidden = isHidden === undefined ? true : Boolean(isHidden);
    const useBlock = displayMode === undefined ? true : Boolean(displayMode);
    const activeLatex = hidden ? (clozeLatex || latex) : (latex || clozeLatex);
    const rendered = useBlock ? block(activeLatex) : inline(activeLatex);
    const stateClass = hidden ? 'is-cloze-hidden' : 'is-cloze-revealed';
    const wrapperTag = useBlock ? 'div' : 'span';
    return '<' + wrapperTag + ' class="math-cloze-wrap ' + stateClass + '">' + rendered + '</' + wrapperTag + '>';
  }

  const MathRender = {
    inline: inline,
    block: block,
    formatText: formatText,
    renderCloze: renderCloze
  };

  if (typeof window !== 'undefined') {
    window.MathRender = MathRender;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.MathRender = MathRender;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = MathRender;
  }
})(typeof window !== 'undefined' ? window : globalThis);
