/**
 * LOGIC PRISM · 고1 공통수학1 반학기 마스터
 * Main Application Controller across 5 Views:
 * 1. Dashboard (#view-dashboard) — Bento Hero, Daily Quests, Mastery Bars, Quick Stealth Drill & 15 Stage Cards
 * 2. Stage Mastery (#view-stage) — [1] Feynman Intuition & Stealth Cloze, [2] Logic Chain Puzzle, [3] 3-Wave Battle Arena
 * 3. Stealth Formula Deck (#view-formula-deck) — All 45 Formulas Filter/Search & Instant Cloze Drill
 * 4. Visual Math Lab (#view-lab) — Mounts window.VisualLab across 4 interactive canvas labs
 * 5. Smart Leitner Review (#view-review) — Box 0~3 Spaced Repetition Battle & 10-Question Midterm Mock Exam
 */
(function (global) {
  'use strict';

  var uiState = {
    activeView: 'dashboard',
    unitFilter: 'all',
    quickFormulaIndex: 0,
    quickFormulaRevealed: false,

    // Stage Mastery View
    activeStageId: 'ch1-s1',
    activeStageTab: 'intuition', // 'intuition' | 'logic' | 'arena'
    stageStealthOn: true,
    stageRevealedFormulas: {},
    stageWhyOpen: {},

    // Logic Chain Puzzle state
    logicPuzzle: null,

    // Stage 3-Wave Battle Arena state
    stageBattle: null,

    // Stealth Formula Deck state
    deckChapterFilter: 'all',
    deckStatusFilter: 'all',
    deckSearchQuery: '',
    deckStealthOn: true,
    deckRevealedFormulas: {},
    deckWhyOpen: {},

    // Visual Lab state
    labMounted: false,
    activeLabTab: 'poly-sim',

    // Smart Leitner Review state
    reviewMode: 'overview', // 'overview' | 'battle' | 'mock'
    reviewBoxFilter: 'all',
    reviewBattle: null
  };

  // =========================================================================
  // Safe Escaping & MathRender Wrappers (Zero Raw '$' Guarantee)
  // =========================================================================
  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function stripOuterDollars(latex) {
    var s = String(latex == null ? '' : latex).trim();
    if (s.startsWith('$$') && s.endsWith('$$') && s.length > 4) {
      return s.slice(2, -2).trim();
    }
    if (s.startsWith('$') && s.endsWith('$') && s.length > 2) {
      return s.slice(1, -1).trim();
    }
    return s;
  }

  function renderInlineMath(latex) {
    var clean = stripOuterDollars(latex);
    if (!clean) return '';
    if (global.MathRender && typeof global.MathRender.inline === 'function') {
      return global.MathRender.inline(clean);
    }
    if (global.katex && typeof global.katex.renderToString === 'function') {
      return global.katex.renderToString(clean, { throwOnError: false, strict: false, displayMode: false });
    }
    return '<span class="math-inline math-fallback">' + escapeHtml(clean) + '</span>';
  }

  function renderBlockMath(latex) {
    var clean = stripOuterDollars(latex);
    if (!clean) return '';
    if (global.MathRender && typeof global.MathRender.block === 'function') {
      return global.MathRender.block(clean);
    }
    if (global.katex && typeof global.katex.renderToString === 'function') {
      return '<div class="math-block">' + global.katex.renderToString(clean, { throwOnError: false, strict: false, displayMode: true }) + '</div>';
    }
    return '<div class="math-block math-fallback">' + escapeHtml(clean) + '</div>';
  }

  function fmt(text) {
    var raw = String(text == null ? '' : text);
    if (!raw) return '';
    if (global.MathRender && typeof global.MathRender.formatText === 'function') {
      return global.MathRender.formatText(raw);
    }
    // Safe fallback parser if MathRender hasn't loaded
    var tokens = [];
    var replaced = raw.replace(/\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g, function (_m, blockTex, inlineTex) {
      var idx = tokens.length;
      if (blockTex != null) {
        tokens.push(renderBlockMath(blockTex));
      } else {
        tokens.push(renderInlineMath(inlineTex));
      }
      return '@@MATH_TOKEN_' + idx + '@@';
    });
    var safe = escapeHtml(replaced)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
    return safe.replace(/@@MATH_TOKEN_(\d+)@@/g, function (_m, idxStr) {
      return tokens[Number(idxStr)] || '';
    });
  }

  function renderClozeFormula(formula, isHidden) {
    var fullTex = stripOuterDollars(formula && formula.latex);
    var clozeTex = stripOuterDollars((formula && formula.clozeLatex) || fullTex);
    if (global.MathRender && typeof global.MathRender.renderCloze === 'function') {
      return global.MathRender.renderCloze(fullTex, clozeTex, Boolean(isHidden));
    }
    return renderBlockMath(isHidden ? clozeTex : fullTex);
  }

  function renderSmartClozeAnswer(ans) {
    var raw = String(ans == null ? '' : ans).trim();
    if (!raw) return '';
    if (raw.indexOf('$') !== -1) {
      return fmt(raw);
    }
    var hasHangul = /[가-힣]/.test(raw);
    var looksLatex = /[\\^_{}=+\-*/()<>]/.test(raw) || /^[0-9a-zA-Z\s.,+\-*/^_()<>\\]+$/.test(raw);
    if (raw.indexOf('\\') !== -1 || (!hasHangul && looksLatex)) {
      return renderInlineMath(raw);
    }
    return fmt(raw);
  }

  function renderStars(starsCount) {
    var s = Math.max(0, Math.min(3, Number(starsCount) || 0));
    var out = '';
    for (var i = 1; i <= 3; i++) {
      out += i <= s ? '★' : '☆';
    }
    return out;
  }

  // =========================================================================
  // Enriched Curriculum Access Helpers
  // =========================================================================
  var cachedData = null;

  function getCurriculumData() {
    var api = global.MATH1_CURRICULUM;
    var chapters = [];
    if (api && typeof api.getChapters === 'function') {
      chapters = api.getChapters() || [];
    } else {
      chapters = [].concat(global.MATH1_ALG_CHAPTERS || [], global.MATH1_EQ_CHAPTERS || []);
    }
    if (cachedData && cachedData.chapters.length === chapters.length && cachedData.stages.length > 0) {
      return cachedData;
    }

    var stages = [];
    var stageMap = {};
    var formulas = [];
    var quizLookup = {};
    var allQuizList = [];

    chapters.forEach(function (ch) {
      var chStages = Array.isArray(ch.stages) ? ch.stages : [];
      chStages.forEach(function (st) {
        var enrichedStage = Object.assign({}, st, {
          chapterId: st.chapterId || ch.id,
          chapterNumber: ch.number,
          unitTitle: ch.unitTitle,
          chapterTitle: st.chapterTitle || ch.title,
          chapterAccent: st.chapterAccent || ch.accent || '#4F46E5',
          chapterIcon: ch.icon || '📐',
          recommendedLabTab: st.recommendedLabTab || ch.recommendedLabTab || 'poly-sim'
        });
        stages.push(enrichedStage);
        stageMap[enrichedStage.id] = enrichedStage;

        (enrichedStage.formulas || []).forEach(function (f) {
          formulas.push(Object.assign({}, f, {
            stageId: enrichedStage.id,
            stageCode: enrichedStage.code,
            stageTitle: enrichedStage.title,
            chapterId: ch.id,
            chapterNumber: ch.number,
            unitTitle: ch.unitTitle,
            chapterTitle: ch.title,
            accent: ch.accent || '#4F46E5'
          }));
        });

        (enrichedStage.oxQuizzes || []).forEach(function (ox) {
          var qObj = {
            kind: 'ox',
            wave: 1,
            id: ox.id,
            stageId: enrichedStage.id,
            stageCode: enrichedStage.code,
            stageTitle: enrichedStage.title,
            chapterId: ch.id,
            chapterNumber: ch.number,
            chapterTitle: ch.title,
            unitTitle: ch.unitTitle,
            typeTag: 'O/X 개념 함정 판별',
            difficulty: 1,
            statement: ox.statement,
            answer: Boolean(ox.answer),
            explanation: ox.explanation
          };
          quizLookup['ox:' + enrichedStage.id + ':' + ox.id] = qObj;
          quizLookup['ox:' + ox.id] = qObj;
          allQuizList.push(qObj);
        });

        (enrichedStage.problems || []).forEach(function (p) {
          var pObj = {
            kind: 'mc',
            wave: p.wave || 2,
            id: p.id,
            stageId: enrichedStage.id,
            stageCode: enrichedStage.code,
            stageTitle: enrichedStage.title,
            chapterId: ch.id,
            chapterNumber: ch.number,
            chapterTitle: ch.title,
            unitTitle: ch.unitTitle,
            typeTag: p.typeTag || (p.wave === 3 ? '내신 실전 보스' : '핵심 유형 변형'),
            difficulty: p.difficulty || (p.wave === 3 ? 3 : 2),
            question: p.question,
            choices: Array.isArray(p.choices) ? p.choices : [],
            answerIndex: typeof p.answerIndex === 'number' ? p.answerIndex : 0,
            hint: p.hint || '',
            explanation: p.explanation || ''
          };
          quizLookup['mc:' + enrichedStage.id + ':' + p.id] = pObj;
          quizLookup['mc:' + p.id] = pObj;
          allQuizList.push(pObj);
        });
      });
    });

    stages.sort(function (a, b) {
      return (a.order || 0) - (b.order || 0);
    });

    if (stages.length > 0) {
      cachedData = {
        chapters: chapters,
        stages: stages,
        stageMap: stageMap,
        formulas: formulas,
        quizLookup: quizLookup,
        allQuizList: allQuizList
      };
    }

    return {
      chapters: chapters,
      stages: stages,
      stageMap: stageMap,
      formulas: formulas,
      quizLookup: quizLookup,
      allQuizList: allQuizList
    };
  }

  function findNextRecommendedStage() {
    var data = getCurriculumData();
    var stages = data.stages;
    if (!stages.length) return null;
    for (var i = 0; i < stages.length; i++) {
      if (!global.LearningState.isStageMastered(stages[i].id)) {
        return stages[i];
      }
    }
    return stages[0];
  }

  // =========================================================================
  // Toast & Modal Helpers
  // =========================================================================
  function showToast(htmlMessage, variant) {
    var container = document.getElementById('toast-container');
    if (!container) return;
    while (container.children.length >= 3) {
      container.removeChild(container.firstElementChild);
    }
    var toast = document.createElement('div');
    toast.className = 'toast' + (variant ? ' is-' + variant : '');
    toast.innerHTML = htmlMessage;
    container.appendChild(toast);

    setTimeout(function () {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 2900);
  }

  function openModal(titleHtml, bodyHtml) {
    var modal = document.getElementById('modal-container');
    if (!modal) return;
    modal.innerHTML =
      '<div class="modal-backdrop" data-action="close-modal"></div>' +
      '<div class="modal-dialog" role="dialog" aria-modal="true">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px;">' +
          '<h3 style="font-size:1.15rem;">' + titleHtml + '</h3>' +
          '<button type="button" class="btn btn-ghost btn-sm" data-action="close-modal" aria-label="닫기">✕ 닫기</button>' +
        '</div>' +
        '<div>' + bodyHtml + '</div>' +
      '</div>';
    modal.hidden = false;
  }

  function closeModal() {
    var modal = document.getElementById('modal-container');
    if (!modal) return;
    modal.hidden = true;
    modal.innerHTML = '';
  }

  // =========================================================================
  // Header & Theme Synchronization
  // =========================================================================
  function applyThemeToDom(theme) {
    var cleanTheme = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', cleanTheme);
    var themeBtn = document.getElementById('btn-theme-toggle');
    if (themeBtn) {
      themeBtn.textContent = cleanTheme === 'dark' ? '☀️' : '🌙';
      themeBtn.setAttribute('title', cleanTheme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환');
      themeBtn.setAttribute('aria-label', cleanTheme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환');
    }
  }

  function syncHeader() {
    if (!global.LearningState) return;
    var st = global.LearningState.getState();
    var lv = global.LearningState.getLevelInfo(st.xp);
    var data = getCurriculumData();
    var stageIds = data.stages.map(function (s) { return s.id; });
    var mastered = global.LearningState.getMasteredStageCount(stageIds);
    var totalStages = stageIds.length || 15;
    var reviewStats = global.LearningState.getReviewStats();

    var streakEl = document.getElementById('stat-streak');
    if (streakEl) {
      streakEl.textContent = '🔥 ' + st.streak + '일';
    }

    var xpEl = document.getElementById('stat-xp');
    if (xpEl) {
      xpEl.textContent = '⚡ Lv.' + lv.level + ' · ' + st.xp + ' XP';
      xpEl.setAttribute('title', lv.title + ' (' + st.xp + ' XP)');
    }

    var masteryEl = document.getElementById('stat-mastery');
    if (masteryEl) {
      masteryEl.textContent = '🏆 ' + mastered + ' / ' + totalStages;
    }

    var soundBtn = document.getElementById('btn-sound-toggle');
    if (soundBtn) {
      soundBtn.textContent = st.soundEnabled ? '🔊' : '🔇';
      soundBtn.setAttribute('aria-pressed', String(st.soundEnabled));
      soundBtn.setAttribute('title', st.soundEnabled ? '효과음 켜짐 (클릭하여 끄기)' : '효과음 꺼짐 (클릭하여 켜기)');
    }

    var badgeEl = document.getElementById('review-badge');
    if (badgeEl) {
      if (reviewStats.activeCount > 0) {
        badgeEl.textContent = String(reviewStats.activeCount);
        badgeEl.hidden = false;
      } else {
        badgeEl.textContent = '0';
        badgeEl.hidden = true;
      }
    }

    applyThemeToDom(st.theme);
  }

  // =========================================================================
  // View Navigation Router
  // =========================================================================
  function navigateTo(viewName, options) {
    var opts = options || {};
    var validViews = ['dashboard', 'stage', 'formula-deck', 'lab', 'review'];
    if (validViews.indexOf(viewName) === -1) {
      viewName = 'dashboard';
    }
    uiState.activeView = viewName;

    // Update top nav active states
    var navHighlight = viewName === 'stage' ? 'dashboard' : viewName;
    var navBtns = document.querySelectorAll('.nav-tab[data-nav]');
    for (var i = 0; i < navBtns.length; i++) {
      var btn = navBtns[i];
      var isMatch = btn.getAttribute('data-nav') === navHighlight;
      btn.classList.toggle('is-active', isMatch);
      if (isMatch) {
        btn.setAttribute('aria-current', 'page');
      } else {
        btn.removeAttribute('aria-current');
      }
    }

    // Show target section BEFORE mounting/rendering so canvases have real layout width
    var viewSections = document.querySelectorAll('.app-view[data-view]');
    for (var j = 0; j < viewSections.length; j++) {
      var sec = viewSections[j];
      var active = sec.getAttribute('data-view') === viewName;
      sec.hidden = !active;
      sec.classList.toggle('is-active', active);
    }

    if (viewName === 'dashboard') {
      renderDashboardView();
    } else if (viewName === 'stage') {
      if (opts.stageId) {
        openStageInternal(opts.stageId, opts.tab || 'intuition');
      } else {
        renderStageView();
      }
    } else if (viewName === 'formula-deck') {
      renderFormulaDeckView();
    } else if (viewName === 'lab') {
      mountOrSwitchVisualLab(opts.labTab);
    } else if (viewName === 'review') {
      if (opts.resetMode) {
        uiState.reviewMode = 'overview';
        uiState.reviewBattle = null;
      }
      renderReviewView();
    }

    if (!opts.preserveScroll) {
      try {
        global.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (_e) {
        global.scrollTo(0, 0);
      }
    }
  }

  // =========================================================================
  // VIEW 1: Dashboard (#view-dashboard)
  // =========================================================================
  function computeUnitStats(stages, targetUnitTitle) {
    var unitStages = stages.filter(function (s) {
      return s.unitTitle === targetUnitTitle;
    });
    var totalStages = unitStages.length;
    var masteredStages = 0;
    var completedSteps = 0;
    var totalSteps = Math.max(1, totalStages * 3);

    unitStages.forEach(function (s) {
      var p = global.LearningState.getStageProgress(s.id);
      if (p.intuitionDone) completedSteps += 1;
      if (p.logicDone) completedSteps += 1;
      if (p.arenaDone) completedSteps += 1;
      if (p.intuitionDone && p.logicDone && p.arenaDone) {
        masteredStages += 1;
      }
    });

    return {
      masteredStages: masteredStages,
      totalStages: totalStages,
      percent: Math.round((completedSteps / totalSteps) * 100)
    };
  }

  function pickQuickDrillFormula(formulas) {
    if (!formulas.length) return null;
    var idx = ((uiState.quickFormulaIndex % formulas.length) + formulas.length) % formulas.length;
    return formulas[idx];
  }

  function renderDashboardView() {
    var root = document.getElementById('view-dashboard');
    if (!root) return;

    var data = getCurriculumData();
    var st = global.LearningState.getState();
    var lv = global.LearningState.getLevelInfo(st.xp);
    var questStatus = global.LearningState.getDailyQuestsStatus();
    var nextStage = findNextRecommendedStage() || data.stages[0];
    var stageIds = data.stages.map(function (s) { return s.id; });
    var masteredCount = global.LearningState.getMasteredStageCount(stageIds);
    var totalStars = 0;
    data.stages.forEach(function (s) {
      totalStars += global.LearningState.getStageProgress(s.id).stars || 0;
    });

    var algStats = computeUnitStats(data.stages, 'Ⅰ. 다항식');
    var eqStats = computeUnitStats(data.stages, 'Ⅱ. 방정식과 부등식');
    var quickFormula = pickQuickDrillFormula(data.formulas);
    var reviewStats = global.LearningState.getReviewStats();

    var questsHtml = questStatus.quests.map(function (q) {
      var rightBadge = '';
      if (q.done && !q.claimed) {
        rightBadge =
          '<button type="button" class="btn btn-accent btn-sm" data-action="claim-quest" data-quest-id="' + q.id + '">' +
            '🎁 +' + q.rewardXp + ' XP 받기' +
          '</button>';
      } else if (q.claimed) {
        rightBadge = '<span class="pill-badge" style="background:var(--tint-emerald);color:var(--text-emerald);">수령 완료 ✓</span>';
      } else {
        rightBadge = '<span class="pill-badge">+' + q.rewardXp + ' XP</span>';
      }

      return (
        '<div class="quest-item' + (q.done ? ' is-done' : '') + '" style="display:flex;align-items:center;justify-content:space-between;gap:10px;">' +
          '<div style="display:flex;align-items:center;gap:10px;min-width:0;">' +
            '<span aria-hidden="true" style="font-size:1.1rem;">' + (q.done ? '✅' : q.icon) + '</span>' +
            '<div style="min-width:0;">' +
              '<div style="font-weight:700;font-size:0.9rem;color:var(--ink-primary);">' + escapeHtml(q.title) + '</div>' +
              '<div style="font-size:0.78rem;color:var(--ink-secondary);">' + escapeHtml(q.desc) + '</div>' +
            '</div>' +
          '</div>' +
          '<div style="flex-shrink:0;">' + rightBadge + '</div>' +
        '</div>'
      );
    }).join('');

    var allQuestBonusHtml = '';
    if (questStatus.allDone && !questStatus.allBonusClaimed) {
      allQuestBonusHtml =
        '<button type="button" class="btn btn-primary btn-sm" style="width:100%;margin-top:10px;" data-action="claim-quest" data-quest-id="all_bonus">' +
          '🎉 오늘의 3대 퀘스트 올클리어 보너스 +' + questStatus.allBonusXp + ' XP 받기!' +
        '</button>';
    } else if (questStatus.allBonusClaimed) {
      allQuestBonusHtml =
        '<div style="margin-top:10px;font-size:0.8rem;font-weight:700;color:var(--text-emerald);text-align:center;">' +
          '✨ 오늘의 올클리어 보너스 XP 수령 완료! 완벽한 학습 페이스예요.' +
        '</div>';
    }

    var quickDrillHtml = '';
    if (quickFormula) {
      var qHidden = !uiState.quickFormulaRevealed;
      quickDrillHtml =
        '<div class="bento-card bento-stat-card">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:8px;">' +
            '<span class="pill-badge" style="background:var(--tint-violet);color:var(--text-violet);">🕵️ 10초 스텔스 공식 퀵 드릴</span>' +
            '<button type="button" class="btn btn-ghost btn-sm" data-action="next-quick-formula">🎲 다음 공식</button>' +
          '</div>' +
          '<div style="font-size:0.88rem;font-weight:750;color:var(--ink-primary);margin-bottom:6px;">' +
            escapeHtml(quickFormula.stageCode) + ' · ' + fmt(quickFormula.name) +
          '</div>' +
          '<div class="formula-display-box" data-action="toggle-quick-cloze" role="button" tabindex="0" title="클릭하여 빈칸 정답 확인/가리기" style="cursor:pointer;flex-direction:column;">' +
            renderClozeFormula(quickFormula, qHidden) +
            (!qHidden && quickFormula.clozeAnswer
              ? '<div style="margin-top:6px;font-size:0.82rem;font-weight:700;color:var(--text-emerald);text-align:center;">🎯 핵심 빈칸: ' + renderSmartClozeAnswer(quickFormula.clozeAnswer) + '</div>'
              : '') +
          '</div>' +
          '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:10px;flex-wrap:wrap;">' +
            '<button type="button" class="btn btn-secondary btn-sm cloze-toggle-btn" data-action="toggle-quick-cloze">' +
              (qHidden ? '🔓 빈칸 정답 확인' : '🙈 다시 빈칸 가리기') +
            '</button>' +
            '<button type="button" class="btn btn-ghost btn-sm" data-action="go-formula-deck">전체 45개 공식장 →</button>' +
          '</div>' +
        '</div>';
    }

    var heroTitleText = nextStage
      ? (masteredCount === data.stages.length
          ? '축하합니다! 고1 공통수학1 반학기 15스테이지를 모두 정복했습니다 🏆'
          : '공식을 무작정 외우지 말고, 논리 체인으로 직접 조립해 보세요!')
      : '고1 공통수학1 반학기 마스터 로드맵';

    var nextCtaLabel = nextStage
      ? '🚀 이어서 마스터하기 (' + escapeHtml(nextStage.code) + ' · ' + fmt(nextStage.title) + ')'
      : '🚀 첫 스테이지 시작하기';

    // Filter chapters by unit
    var visibleChapters = data.chapters.filter(function (ch) {
      if (uiState.unitFilter === 'all') return true;
      return ch.unitTitle === uiState.unitFilter;
    });

    var chaptersHtml = visibleChapters.map(function (ch) {
      var cardsHtml = (ch.stages || []).map(function (rawStage) {
        var stage = data.stageMap[rawStage.id] || rawStage;
        var prog = global.LearningState.getStageProgress(stage.id);
        var isCompleted = global.LearningState.isStageMastered(stage.id);
        var isInProgress = global.LearningState.isStageInProgress(stage.id);
        var stateClass = isCompleted ? ' is-completed' : (isInProgress ? ' is-in-progress' : '');

        return (
          '<article class="stage-card' + stateClass + '" data-action="open-stage" data-stage-id="' + escapeHtml(stage.id) + '" role="button" tabindex="0" style="--chapter-accent:' + escapeHtml(ch.accent || '#4F46E5') + ';cursor:pointer;">' +
            '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;flex-wrap:wrap;">' +
              '<span class="pill-badge">' + escapeHtml(stage.code) + '</span>' +
              '<div style="display:flex;align-items:center;gap:8px;font-size:0.8rem;font-weight:700;color:var(--ink-secondary);">' +
                '<span>⏱ ' + (stage.estimatedMinutes || 7) + '분</span>' +
                '<span style="color:var(--text-amber);letter-spacing:1px;" aria-label="별점 ' + (prog.stars || 0) + '점">' + renderStars(prog.stars) + '</span>' +
              '</div>' +
            '</div>' +
            '<h3 style="font-size:1.06rem;margin-bottom:4px;">' + fmt(stage.title) + '</h3>' +
            '<p style="font-size:0.86rem;color:var(--ink-secondary);margin-bottom:10px;line-height:1.55;">' + fmt(stage.tagline) + '</p>' +
            '<div class="stage-step-dots">' +
              '<span class="stage-step-dot' + (prog.intuitionDone ? ' is-done' : '') + '">💡직관' + (prog.intuitionDone ? ' ✓' : '') + '</span>' +
              '<span class="stage-step-dot' + (prog.logicDone ? ' is-done' : '') + '">🔗논리' + (prog.logicDone ? ' ✓' : '') + '</span>' +
              '<span class="stage-step-dot' + (prog.arenaDone ? ' is-done' : '') + '">⚔️배틀' + (prog.arenaDone ? ' ✓' : '') + '</span>' +
              '<span style="margin-left:auto;background:transparent;padding-right:0;font-size:0.8rem;font-weight:800;color:var(--text-indigo);">입장 →</span>' +
            '</div>' +
          '</article>'
        );
      }).join('');

      return (
        '<section class="chapter-section" data-chapter-id="' + escapeHtml(ch.id) + '" style="--chapter-accent:' + escapeHtml(ch.accent || '#4F46E5') + ';margin-top:24px;">' +
          '<div class="chapter-header" style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:14px;">' +
            '<div>' +
              '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:4px;">' +
                '<span style="font-size:1.35rem;" aria-hidden="true">' + escapeHtml(ch.icon || '📐') + '</span>' +
                '<span class="pill-badge">' + escapeHtml(ch.number) + ' · ' + escapeHtml(ch.unitTitle) + '</span>' +
              '</div>' +
              '<h2 style="font-size:1.3rem;margin-bottom:3px;">' + fmt(ch.title) + '</h2>' +
              '<p style="font-size:0.88rem;color:var(--ink-secondary);">' + fmt(ch.subtitle) + '</p>' +
            '</div>' +
            '<button type="button" class="btn btn-secondary btn-sm" data-action="open-lab" data-lab-tab="' + escapeHtml(ch.recommendedLabTab || 'poly-sim') + '">' +
              '🔬 단원 시각 실험실' +
            '</button>' +
          '</div>' +
          '<div class="stage-grid">' + cardsHtml + '</div>' +
        '</section>'
      );
    }).join('');

    root.innerHTML =
      '<div class="bento-grid">' +
        '<div class="bento-card bento-hero" style="display:flex;flex-direction:column;justify-content:space-between;gap:18px;">' +
          '<div>' +
            '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:12px;">' +
              '<span class="pill-badge" style="background:var(--tint-indigo);color:var(--text-indigo);">✨ 2022 개정 공통수학1 · 1학기 중간고사 완벽 대비</span>' +
              '<span class="pill-badge" style="background:var(--tint-amber);color:var(--text-amber);">🏅 Lv.' + lv.level + ' ' + escapeHtml(lv.title) + '</span>' +
            '</div>' +
            '<h1 style="font-size:clamp(1.38rem, 2.6vw, 1.95rem);margin-bottom:10px;">' + heroTitleText + '</h1>' +
            '<p style="font-size:0.95rem;color:var(--ink-secondary);line-height:1.68;max-width:64ch;">' +
              '<strong>파인만 직관 노트</strong>로 원리를 깨치고, <strong>스텔스 빈칸 공식</strong>과 <strong>4단계 논리 체인 퍼즐</strong>로 유도를 손끝에 각인한 뒤, <strong>3-Wave 실전 배틀</strong>과 <strong>라이트너 오답노트</strong>로 내신 함정까지 완벽히 정복하세요.' +
            '</p>' +
          '</div>' +

          '<div style="padding:14px 16px;border-radius:var(--radius-md);background:var(--bg-subtle);border:1px solid var(--border-card);">' +
            '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:8px;font-size:0.84rem;font-weight:750;">' +
              '<span>⚡ 현재 칭호: Lv.' + lv.level + ' ' + escapeHtml(lv.title) + ' (' + lv.xp + ' XP)</span>' +
              '<span style="color:var(--text-indigo);">다음 레벨까지 ' + Math.max(0, lv.nextLevelCeil - lv.xp) + ' XP</span>' +
            '</div>' +
            '<div class="progress-track" aria-label="레벨 경험치 진행률">' +
              '<div class="progress-fill" style="width:' + lv.progressPercent + '%;"></div>' +
            '</div>' +
          '</div>' +

          '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">' +
            (nextStage
              ? '<button type="button" id="btn-hero-continue" class="btn btn-primary btn-lg" style="white-space:normal;max-width:100%;" data-action="open-stage" data-stage-id="' + escapeHtml(nextStage.id) + '">' + nextCtaLabel + '</button>'
              : '') +
            '<button type="button" id="btn-hero-lab" class="btn btn-secondary btn-lg" style="white-space:normal;max-width:100%;" data-action="open-lab" data-lab-tab="' + escapeHtml((nextStage && nextStage.recommendedLabTab) || 'poly-sim') + '">' +
              '🔬 시각 수학 실험실' +
            '</button>' +
            (reviewStats.activeCount > 0
              ? '<button type="button" class="btn btn-accent" style="white-space:normal;max-width:100%;" data-action="go-review">🧠 긴급 오답 ' + reviewStats.activeCount + '문항 격파</button>'
              : '') +
          '</div>' +
        '</div>' +

        '<div style="display:flex;flex-direction:column;gap:14px;min-width:0;">' +
          '<div class="bento-card bento-stat-card">' +
            '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px;">' +
              '<h2 style="font-size:1rem;">🎯 오늘의 3대 학습 퀘스트</h2>' +
              '<span class="pill-badge">' + questStatus.completedCount + ' / ' + questStatus.totalCount + ' 완료</span>' +
            '</div>' +
            '<div class="quest-list" style="display:flex;flex-direction:column;gap:8px;">' + questsHtml + '</div>' +
            allQuestBonusHtml +
          '</div>' +

          '<div class="bento-card bento-stat-card">' +
            '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:10px;">' +
              '<h2 style="font-size:1rem;">📊 반학기 마스터리 현황</h2>' +
              '<span class="pill-badge" style="background:var(--tint-indigo);color:var(--text-indigo);">' + masteredCount + ' / ' + data.stages.length + ' 스테이지 · ★ ' + totalStars + '</span>' +
            '</div>' +
            '<div style="display:flex;flex-direction:column;gap:10px;">' +
              '<div>' +
                '<div style="display:flex;justify-content:space-between;font-size:0.82rem;font-weight:700;margin-bottom:4px;">' +
                  '<span>🧩 Ⅰ. 다항식 (Ch 1~3)</span>' +
                  '<span>' + algStats.masteredStages + ' / ' + algStats.totalStages + ' 완료 (' + algStats.percent + '%)</span>' +
                '</div>' +
                '<div class="progress-track"><div class="progress-fill" style="width:' + algStats.percent + '%;"></div></div>' +
              '</div>' +
              '<div>' +
                '<div style="display:flex;justify-content:space-between;font-size:0.82rem;font-weight:700;margin-bottom:4px;">' +
                  '<span>📈 Ⅱ. 방정식과 부등식 (Ch 4~5)</span>' +
                  '<span>' + eqStats.masteredStages + ' / ' + eqStats.totalStages + ' 완료 (' + eqStats.percent + '%)</span>' +
                '</div>' +
                '<div class="progress-track"><div class="progress-fill" style="width:' + eqStats.percent + '%;"></div></div>' +
              '</div>' +
            '</div>' +
          '</div>' +

          quickDrillHtml +
        '</div>' +
      '</div>' +

      '<div style="margin-top:28px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">' +
        '<div>' +
          '<h2 style="font-size:1.25rem;">🗺️ 반학기 15 스테이지 정복 로드맵</h2>' +
          '<p style="font-size:0.86rem;color:var(--ink-secondary);">모든 스테이지가 즉시 열려 있습니다. 원하는 단원부터 자유롭게 공략하세요!</p>' +
        '</div>' +
        '<div class="filter-chips" role="tablist" aria-label="대단원 필터">' +
          '<button type="button" class="chip' + (uiState.unitFilter === 'all' ? ' is-active' : '') + '" data-action="filter-unit" data-unit="all">전체 (15)</button>' +
          '<button type="button" class="chip' + (uiState.unitFilter === 'Ⅰ. 다항식' ? ' is-active' : '') + '" data-action="filter-unit" data-unit="Ⅰ. 다항식">Ⅰ. 다항식 (9)</button>' +
          '<button type="button" class="chip' + (uiState.unitFilter === 'Ⅱ. 방정식과 부등식' ? ' is-active' : '') + '" data-action="filter-unit" data-unit="Ⅱ. 방정식과 부등식">Ⅱ. 방정식과 부등식 (6)</button>' +
        '</div>' +
      '</div>' +

      chaptersHtml;
  }

  // =========================================================================
  // VIEW 2: Stage Mastery View (#view-stage)
  // =========================================================================
  function createShuffledLogicPool(steps) {
    var copy = (steps || []).slice();
    // Fisher-Yates shuffle
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    // Deterministically guarantee shuffled order !== [1, 2, 3, 4]
    var isIdentity = copy.length === 4 && copy.every(function (st, idx) {
      return st.stepNo === idx + 1;
    });
    if (isIdentity) {
      copy = [copy[2], copy[0], copy[3], copy[1]];
    }
    return copy;
  }

  function initLogicPuzzleForStage(stage) {
    var chain = stage.logicChain || { title: '', goalStatement: '', steps: [] };
    uiState.logicPuzzle = {
      stageId: stage.id,
      nextStepNo: 1,
      pool: createShuffledLogicPool(chain.steps || []),
      wrongStepNo: null,
      feedbackHtml: '',
      showHint: false,
      completed: false,
      earnedXp: 0
    };
  }

  function buildStageBattleQuestions(stage) {
    var list = [];
    var oxList = (stage.oxQuizzes || []).slice(0, 3);
    oxList.forEach(function (ox) {
      list.push({
        kind: 'ox',
        wave: 1,
        id: ox.id,
        stageId: stage.id,
        stageCode: stage.code,
        stageTitle: stage.title,
        typeTag: 'O/X 개념 함정 브레이커',
        difficulty: 1,
        statement: ox.statement,
        answer: Boolean(ox.answer),
        explanation: ox.explanation
      });
    });

    var probs = stage.problems || [];
    var wave2 = probs.filter(function (p) { return p.wave === 2; }).slice(0, 3);
    if (wave2.length < 3) {
      wave2 = probs.slice(0, 3);
    }
    wave2.forEach(function (p) {
      list.push({
        kind: 'mc',
        wave: 2,
        id: p.id,
        stageId: stage.id,
        stageCode: stage.code,
        stageTitle: stage.title,
        typeTag: p.typeTag || '개념·공식 변형 드릴',
        difficulty: p.difficulty || 2,
        question: p.question,
        choices: p.choices || [],
        answerIndex: p.answerIndex,
        hint: p.hint || '',
        explanation: p.explanation || ''
      });
    });

    var boss = probs.find(function (p) { return p.wave === 3; }) || probs[3];
    if (boss) {
      list.push({
        kind: 'mc',
        wave: 3,
        id: boss.id,
        stageId: stage.id,
        stageCode: stage.code,
        stageTitle: stage.title,
        typeTag: boss.typeTag || '내신 실전 보스전',
        difficulty: boss.difficulty || 3,
        question: boss.question,
        choices: boss.choices || [],
        answerIndex: boss.answerIndex,
        hint: boss.hint || '',
        explanation: boss.explanation || ''
      });
    }
    return list;
  }

  function createBattleSession(mode, questions, stageId) {
    return {
      mode: mode, // 'stage' | 'review' | 'mock'
      stageId: stageId || null,
      questions: questions,
      currentIndex: 0,
      answered: false,
      userChoice: null,
      isLastCorrect: false,
      lastEarnedXp: 0,
      lastPromotionNote: '',
      showHint: false,
      combo: 0,
      maxCombo: 0,
      correctCount: 0,
      wrongItemsInSession: 0,
      totalEarnedXp: 0,
      finished: false,
      starsEarned: 0,
      accuracy: 0
    };
  }

  function openStageInternal(stageId, initialTab) {
    var data = getCurriculumData();
    var stage = data.stageMap[stageId] || data.stages[0];
    if (!stage) return;

    var stageChanged = uiState.activeStageId !== stage.id;
    uiState.activeStageId = stage.id;
    uiState.activeStageTab = initialTab || 'intuition';

    if (stageChanged || !uiState.logicPuzzle || uiState.logicPuzzle.stageId !== stage.id) {
      initLogicPuzzleForStage(stage);
    }
    if (stageChanged || !uiState.stageBattle || uiState.stageBattle.stageId !== stage.id) {
      uiState.stageBattle = createBattleSession('stage', buildStageBattleQuestions(stage), stage.id);
    }

    renderStageView();
  }

  function renderStageIntuitionTab(stage, prog) {
    var feynman = stage.feynman || {};
    var trap = feynman.trapAlert || {};
    var formulas = stage.formulas || [];

    var formulaCardsHtml = formulas.map(function (f, idx) {
      var isRevealed = Boolean(uiState.stageRevealedFormulas[f.id]);
      var isHidden = uiState.stageStealthOn && !isRevealed;
      var status = global.LearningState.getFormulaStatus(f.id);
      var whyOpen = uiState.stageWhyOpen[f.id] !== false; // Open by default on Stage Tab 1 for rich learning

      var statusClass = status === 'known' ? ' is-known' : (status === 'review' ? ' is-review' : '');
      return (
        '<div class="formula-card' + statusClass + '" data-formula-id="' + escapeHtml(f.id) + '">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:8px;">' +
            '<span class="pill-badge">공식 0' + (idx + 1) + '</span>' +
            (status === 'known'
              ? '<span class="pill-badge is-emerald">완벽 암기 ✓</span>'
              : (status === 'review'
                  ? '<span class="pill-badge is-rose">집중 복습 📌</span>'
                  : '<span style="font-size:0.76rem;color:var(--ink-tertiary);">자가 점검 대기</span>')) +
          '</div>' +
          '<h4 style="font-size:1rem;margin-bottom:10px;">' + fmt(f.name) + '</h4>' +
          '<div class="formula-display-box' + (!isHidden ? ' is-revealed' : '') + '" data-action="toggle-stage-formula-cloze" data-formula-id="' + escapeHtml(f.id) + '" role="button" tabindex="0" style="cursor:pointer;flex-direction:column;" title="클릭하여 빈칸 정답 확인 또는 다시 가리기">' +
            renderClozeFormula(f, isHidden) +
            (!isHidden && uiState.stageStealthOn && f.clozeAnswer
              ? '<div style="margin-top:8px;font-size:0.84rem;font-weight:750;color:var(--text-emerald);text-align:center;">🎯 빈칸 핵심: ' + renderSmartClozeAnswer(f.clozeAnswer) + '</div>'
              : '') +
          '</div>' +

          '<div style="display:flex;align-items:center;justify-content:space-between;gap:6px;flex-wrap:wrap;margin-top:10px;">' +
            (uiState.stageStealthOn
              ? '<button type="button" class="btn btn-secondary btn-sm cloze-toggle-btn" data-action="toggle-stage-formula-cloze" data-formula-id="' + escapeHtml(f.id) + '">' +
                  (isHidden ? '🔓 정답 확인' : '🙈 다시 가리기') +
                '</button>'
              : '<span style="font-size:0.78rem;color:var(--ink-tertiary);">전체 수식 표시 중</span>') +
            '<div style="display:flex;align-items:center;gap:6px;">' +
              '<button type="button" class="btn ' + (status === 'known' ? 'btn-primary' : 'btn-ghost') + ' btn-sm" data-action="set-formula-status" data-formula-id="' + escapeHtml(f.id) + '" data-status="known">알아요 ✓</button>' +
              '<button type="button" class="btn ' + (status === 'review' ? 'btn-accent' : 'btn-ghost') + ' btn-sm" data-action="set-formula-status" data-formula-id="' + escapeHtml(f.id) + '" data-status="review">헷갈려요 📌</button>' +
            '</div>' +
          '</div>' +

          '<details class="formula-meta" data-formula-id="' + escapeHtml(f.id) + '"' + (whyOpen ? ' open' : '') + ' style="margin-top:12px;">' +
            '<summary style="cursor:pointer;font-size:0.84rem;font-weight:750;color:var(--text-indigo);padding:6px 0;">📖 왜 성립할까? (논리 유도) &amp; 암기 팁</summary>' +
            '<div style="padding-top:8px;font-size:0.87rem;line-height:1.68;color:var(--ink-secondary);display:flex;flex-direction:column;gap:8px;">' +
              '<div><strong style="color:var(--ink-primary);">🔍 논리 유도:</strong> ' + fmt(f.whyItWorks) + '</div>' +
              '<div style="padding:8px 10px;border-radius:var(--radius-xs);background:var(--bg-subtle);"><strong style="color:var(--text-indigo);">💡 암기 팁:</strong> ' + fmt(f.memoryTip) + '</div>' +
            '</div>' +
          '</details>' +
        '</div>'
      );
    }).join('');

    return (
      '<div style="display:flex;flex-direction:column;gap:20px;">' +
        '<div class="feynman-hero-card">' +
          '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px;">' +
            '<span class="pill-badge" style="background:var(--tint-indigo);color:var(--text-indigo);">💡 파인만 직관 스토리</span>' +
            '<span style="font-size:0.82rem;color:var(--ink-secondary);">외우기 전에 "왜 그럴 수밖에 없는지" 직관부터 잡으세요!</span>' +
          '</div>' +
          '<div class="hook-question" style="font-size:1.15rem;font-weight:800;margin-bottom:12px;line-height:1.5;">' +
            '🤔 ' + fmt(feynman.hookQuestion) +
          '</div>' +
          '<div class="intuition-body" style="font-size:0.97rem;line-height:1.76;color:var(--ink-primary);margin-bottom:16px;">' +
            fmt(feynman.intuition) +
          '</div>' +
          '<div class="insight-callout">' +
            '<div style="font-size:0.82rem;font-weight:800;color:var(--text-indigo);margin-bottom:4px;">🎯 한 줄 핵심 통찰 (Key Insight)</div>' +
            '<div style="font-size:0.95rem;font-weight:700;line-height:1.65;">' + fmt(feynman.keyInsight) + '</div>' +
          '</div>' +
        '</div>' +

        (trap.title || trap.description
          ? '<div class="trap-alert-card">' +
              '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;font-weight:800;font-size:0.98rem;color:var(--text-rose);">' +
                '<span>🚨 내신 함정 주의보 · ' + fmt(trap.title) + '</span>' +
              '</div>' +
              '<div style="font-size:0.92rem;line-height:1.7;color:var(--ink-primary);">' + fmt(trap.description) + '</div>' +
            '</div>'
          : '') +

        '<div class="bento-card">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:16px;">' +
            '<div>' +
              '<h3 style="font-size:1.15rem;">🕵️ 핵심 공식 스텔스 빈칸 훈련 (' + formulas.length + '개)</h3>' +
              '<p style="font-size:0.85rem;color:var(--ink-secondary);">머릿속으로 빈칸 <span class="math-cloze-box">?</span> 을 먼저 떠올린 뒤 클릭해서 맞춰보세요!</p>' +
            '</div>' +
            '<button type="button" id="btn-stage-stealth-toggle" class="btn ' + (uiState.stageStealthOn ? 'btn-accent' : 'btn-secondary') + ' cloze-toggle-btn" data-action="toggle-stage-stealth" aria-pressed="' + String(uiState.stageStealthOn) + '">' +
              '🕵️ 스텔스 빈칸 암기 모드 ' + (uiState.stageStealthOn ? 'ON' : 'OFF') +
            '</button>' +
          '</div>' +
          '<div class="formula-grid">' + formulaCardsHtml + '</div>' +
        '</div>' +

        '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:16px 20px;border-radius:var(--radius-bento);background:var(--bg-card);border:1px solid var(--border-card);">' +
          '<div style="font-size:0.9rem;color:var(--ink-secondary);">' +
            (prog.intuitionDone
              ? '✅ 이미 1단계 직관&amp;공식을 완료한 스테이지입니다. 바로 2단계 논리 체인 퍼즐로 넘어가 보세요!'
              : '✨ 직관과 공식을 눈에 익혔다면 1단계를 완료하고 <strong>+30 XP</strong>를 획득하세요!') +
          '</div>' +
          '<button type="button" id="btn-complete-intuition" class="btn btn-primary btn-lg" data-action="complete-intuition">' +
            '1단계 완료 · 논리 퍼즐로 이동 → ' + (prog.intuitionDone ? '(+5 XP)' : '(+30 XP)') +
          '</button>' +
        '</div>' +
      '</div>'
    );
  }

  function renderStageLogicTab(stage) {
    if (!uiState.logicPuzzle || uiState.logicPuzzle.stageId !== stage.id) {
      initLogicPuzzleForStage(stage);
    }
    var pz = uiState.logicPuzzle;
    var chain = stage.logicChain || { title: '', goalStatement: '', steps: [] };
    var orderedSteps = (chain.steps || []).slice().sort(function (a, b) {
      return a.stepNo - b.stepNo;
    });

    var slotsHtml = orderedSteps.map(function (stepObj) {
      var n = stepObj.stepNo;
      if (n < pz.nextStepNo) {
        return (
          '<div class="logic-slot is-filled" data-slot-step="' + n + '">' +
            '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:6px;">' +
              '<span class="pill-badge" style="background:var(--tint-emerald);color:var(--text-emerald);">STEP ' + n + ' ✓ · ' + fmt(stepObj.badge) + '</span>' +
            '</div>' +
            '<div style="font-size:0.96rem;font-weight:700;line-height:1.65;margin-bottom:8px;">' + fmt(stepObj.statement) + '</div>' +
            '<div class="logic-reason-note">💡 <strong>왜 이 논리가 이어지는가:</strong> ' + fmt(stepObj.reason) + '</div>' +
          '</div>'
        );
      }
      if (n === pz.nextStepNo && !pz.completed) {
        return (
          '<div class="logic-slot is-active-target" data-slot-step="' + n + '" style="border-style:dashed;border-color:var(--accent-indigo);">' +
            '<div style="display:flex;align-items:center;gap:8px;font-weight:750;color:var(--text-indigo);">' +
              '<span class="pill-badge" style="background:var(--tint-indigo);color:var(--text-indigo);">STEP ' + n + '</span>' +
              '<span>아래 보기 카드 중 <strong>' + n + '번째 논리 단계</strong>를 클릭하거나 숫자키 [1]~[4]를 누르세요!</span>' +
            '</div>' +
          '</div>'
        );
      }
      return (
        '<div class="logic-slot" data-slot-step="' + n + '" style="opacity:0.72;">' +
          '<span class="pill-badge">STEP ' + n + '</span> <span style="font-size:0.86rem;color:var(--ink-tertiary);margin-left:6px;">이전 논리 단계 완성 후 열립니다</span>' +
        '</div>'
      );
    }).join('');

    var expectedStep = orderedSteps.find(function (s) { return s.stepNo === pz.nextStepNo; });

    var poolHtml = pz.pool.map(function (opt, idx) {
      var isUsed = opt.stepNo < pz.nextStepNo || pz.completed;
      var isShaking = pz.wrongStepNo === opt.stepNo;
      return (
        '<button type="button" class="logic-option-card' + (isUsed ? ' is-used' : '') + (isShaking ? ' is-wrong-shake' : '') + '" ' +
          'data-action="pick-logic-step" data-step-no="' + opt.stepNo + '" data-pool-index="' + idx + '"' +
          (isUsed ? ' disabled' : '') + ' style="text-align:left;">' +
          '<div style="display:flex;align-items:flex-start;gap:10px;">' +
            '<span class="pill-badge" style="flex-shrink:0;">[' + (idx + 1) + ']</span>' +
            '<div style="font-size:0.93rem;line-height:1.65;min-width:0;">' + fmt(opt.statement) + '</div>' +
          '</div>' +
        '</button>'
      );
    }).join('');

    var coachingHtml = '';
    if (!pz.completed) {
      coachingHtml =
        '<div style="display:flex;flex-direction:column;gap:10px;margin:14px 0;">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">' +
            '<div style="font-size:0.9rem;font-weight:700;color:' + (pz.feedbackHtml ? 'var(--text-amber)' : 'var(--ink-secondary)') + ';">' +
              (pz.feedbackHtml || ('🧩 현재 조립 순서: STEP ' + pz.nextStepNo + ' / 4 선택 차례입니다.')) +
            '</div>' +
            '<button type="button" id="btn-logic-hint" class="btn btn-ghost btn-sm" data-action="toggle-logic-hint">' +
              (pz.showHint ? '🙈 힌트 접기' : '💡 다음 단계 힌트 보기') +
            '</button>' +
          '</div>' +
          (pz.showHint && expectedStep
            ? '<div class="hint-box">' +
                '<strong>💡 STEP ' + expectedStep.stepNo + ' 힌트 (' + fmt(expectedStep.badge) + '):</strong> ' + fmt(expectedStep.reason) +
              '</div>'
            : '') +
        '</div>';
    } else {
      coachingHtml =
        '<div class="result-summary-card" style="margin-top:18px;text-align:center;">' +
          '<div style="font-size:1.5rem;margin-bottom:6px;">🎉 Q.E.D. 4단계 논리 체인 조립 완성!</div>' +
          '<p style="font-size:0.94rem;color:var(--ink-secondary);margin-bottom:14px;">' +
            '무작정 외우는 공식이 아니라, Step 1부터 Step 4까지 왜 필연적으로 이어지는지 스스로 증명해 냈습니다! <strong>(+' + (pz.earnedXp || 50) + ' XP 획득)</strong>' +
          '</p>' +
          '<div style="display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;">' +
            '<button type="button" id="btn-logic-reset" class="btn btn-secondary" data-action="reset-logic-chain">🔀 다시 조립해보기</button>' +
            '<button type="button" id="btn-go-arena" class="btn btn-primary btn-lg" data-action="go-arena">3단계: 3-Wave 배틀 출격! ⚔️</button>' +
          '</div>' +
        '</div>';
    }

    return (
      '<div class="logic-board">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:12px;">' +
          '<div>' +
            '<span class="pill-badge" style="background:var(--tint-indigo);color:var(--text-indigo);margin-bottom:6px;">🔗 핵심 논리 유도 &amp; 증명 조립 게임</span>' +
            '<h3 style="font-size:1.2rem;">' + fmt(chain.title) + '</h3>' +
          '</div>' +
          '<button type="button" class="btn btn-ghost btn-sm" data-action="reset-logic-chain">↺ 순서 다시 섞기</button>' +
        '</div>' +

        '<div class="logic-goal-banner">' +
          '<div style="font-size:0.8rem;font-weight:800;color:var(--text-indigo);margin-bottom:4px;">🎯 증명·유도 목표 (Goal)</div>' +
          '<div style="font-size:0.98rem;font-weight:750;line-height:1.62;">' + fmt(chain.goalStatement) + '</div>' +
        '</div>' +

        '<div class="logic-chain-slots" style="display:flex;flex-direction:column;gap:10px;margin-top:16px;">' +
          slotsHtml +
        '</div>' +

        coachingHtml +

        (!pz.completed
          ? '<div style="margin-top:14px;">' +
              '<div style="font-size:0.84rem;font-weight:750;color:var(--ink-secondary);margin-bottom:8px;">👇 섞여 있는 4개의 논리 조각 (순서대로 선택하세요)</div>' +
              '<div class="logic-pool-grid">' + poolHtml + '</div>' +
            '</div>'
          : '') +
      '</div>'
    );
  }

  // =========================================================================
  // Shared Battle Renderer (Stage 3-Wave Battle, Leitner Review Battle, Mock Exam)
  // =========================================================================
  function getWaveBadgeLabel(battle, q) {
    if (battle.mode === 'review') {
      return '🔥 라이트너 오답 격파 배틀 · ' + escapeHtml(q.stageCode || '');
    }
    if (battle.mode === 'mock') {
      return '🎲 반학기 실전 모의고사 · ' + escapeHtml(q.chapterNumber || '') + ' ' + escapeHtml(q.stageCode || '');
    }
    if (q.wave === 1) return '🌊 WAVE 1 · O/X 개념 함정 브레이커';
    if (q.wave === 3) return '👾 WAVE 3 · 내신 실전 보스전!';
    return '⚡ WAVE 2 · 개념·공식 변형 드릴';
  }

  function renderBattleSessionHtml(battle, contextOpts) {
    var opts = contextOpts || {};
    var total = battle.questions.length;

    if (!total) {
      return '<div class="bento-card"><p>출제할 문항이 없습니다.</p></div>';
    }

    if (battle.finished) {
      var starIcons = renderStars(battle.starsEarned);
      var nextStageObj = null;
      if (battle.mode === 'stage' && battle.stageId) {
        var allStages = getCurriculumData().stages;
        var currIdx = allStages.findIndex(function (s) { return s.id === battle.stageId; });
        if (currIdx !== -1 && currIdx + 1 < allStages.length) {
          nextStageObj = allStages[currIdx + 1];
        }
      }
      var activeReviewCount = global.LearningState.getReviewStats().activeCount;

      var summaryTitle = battle.mode === 'review'
        ? '🔥 오답 격파 복습 배틀 완료!'
        : (battle.mode === 'mock' ? '🎓 반학기 랜덤 실전 모의고사 10제 결과!' : '🏆 3-Wave 논리 배틀 결과 리포트');

      var actionButtonsHtml = '';
      if (battle.mode === 'stage') {
        actionButtonsHtml =
          '<button type="button" class="btn btn-secondary" data-action="restart-stage-arena">🔄 다시 배틀 도전</button>' +
          '<button type="button" id="btn-result-review" class="btn btn-accent" data-action="go-review">🧠 틀린 문제 오답노트 확인 (' + activeReviewCount + ')</button>' +
          (nextStageObj
            ? '<button type="button" id="btn-result-next-stage" class="btn btn-primary btn-lg" data-action="open-stage" data-stage-id="' + escapeHtml(nextStageObj.id) + '">다음 스테이지로 이동 (' + escapeHtml(nextStageObj.code) + ') →</button>'
            : '<button type="button" id="btn-result-next-stage" class="btn btn-primary btn-lg" data-action="back-dashboard">🗺️ 전 스테이지 완료 · 로드맵으로 →</button>');
      } else if (battle.mode === 'review') {
        actionButtonsHtml =
          '<button type="button" class="btn btn-primary btn-lg" data-action="exit-review-quiz">📋 오답노트 현황으로 돌아가기</button>' +
          '<button type="button" class="btn btn-accent" data-action="start-mock-exam">🎲 랜덤 실전 모의고사 10제 도전</button>';
      } else {
        actionButtonsHtml =
          '<button type="button" class="btn btn-secondary" data-action="start-mock-exam">🎲 새 10문제 다시 뽑기</button>' +
          '<button type="button" class="btn btn-primary btn-lg" data-action="exit-review-quiz">🧠 오답노트 현황 확인 (' + activeReviewCount + ')</button>';
      }

      return (
        '<div class="result-summary-card" style="text-align:center;">' +
          '<div style="font-size:2.1rem;color:var(--text-amber);letter-spacing:4px;margin-bottom:6px;">' + starIcons + '</div>' +
          '<h3 style="font-size:1.45rem;margin-bottom:8px;">' + summaryTitle + '</h3>' +
          '<p style="font-size:0.95rem;color:var(--ink-secondary);margin-bottom:18px;">' +
            (battle.accuracy >= 85
              ? '완벽에 가까운 논리력입니다! 내신 1등급 함정 방어력이 확실히 갖춰졌어요.'
              : (battle.accuracy >= 60
                  ? '좋은 흐름입니다! 아깝게 틀린 문제는 라이트너 Box 0에서 바로 복습해 보세요.'
                  : '틀린 문제는 곧 내 점수가 오를 보물입니다! 오답노트 해설로 개념 고리를 다시 연결해 봐요.')) +
          '</p>' +
          '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;margin-bottom:22px;">' +
            '<div style="padding:14px;border-radius:var(--radius-md);background:var(--bg-subtle);">' +
              '<div style="font-size:0.78rem;color:var(--ink-secondary);">정답률</div>' +
              '<div style="font-size:1.4rem;font-weight:850;color:var(--text-indigo);">' + battle.accuracy + '%</div>' +
              '<div style="font-size:0.78rem;color:var(--ink-tertiary);">' + battle.correctCount + ' / ' + total + ' 정답</div>' +
            '</div>' +
            '<div style="padding:14px;border-radius:var(--radius-md);background:var(--bg-subtle);">' +
              '<div style="font-size:0.78rem;color:var(--ink-secondary);">최대 연속 콤보</div>' +
              '<div style="font-size:1.4rem;font-weight:850;color:var(--text-amber);">' + battle.maxCombo + '연속 🔥</div>' +
            '</div>' +
            '<div style="padding:14px;border-radius:var(--radius-md);background:var(--bg-subtle);">' +
              '<div style="font-size:0.78rem;color:var(--ink-secondary);">획득 경험치</div>' +
              '<div style="font-size:1.4rem;font-weight:850;color:var(--text-emerald);">+' + battle.totalEarnedXp + ' XP</div>' +
            '</div>' +
          '</div>' +
          '<div style="display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;">' +
            actionButtonsHtml +
          '</div>' +
        '</div>'
      );
    }

    var q = battle.questions[battle.currentIndex];
    var progressPct = Math.round(((battle.currentIndex + (battle.answered ? 1 : 0)) / total) * 100);
    var isLast = battle.currentIndex + 1 >= total;

    var bossBannerHtml = q.wave === 3
      ? '<div style="padding:10px 14px;border-radius:var(--radius-sm);background:var(--tint-rose);color:var(--text-rose);font-weight:800;font-size:0.88rem;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">' +
          '<span>👾 BOSS STAGE · 내신 실전 킬러 문항 출현!</span>' +
          '<span>정답 시 보너스 +30 XP ⚡</span>' +
        '</div>'
      : '';

    var interactionHtml = '';
    if (q.kind === 'ox') {
      var oExtra = '';
      var xExtra = '';
      if (battle.answered) {
        if (q.answer === true) oExtra += ' is-correct';
        if (q.answer === false) xExtra += ' is-correct';
        if (battle.userChoice === true && q.answer !== true) oExtra += ' is-wrong is-selected';
        if (battle.userChoice === false && q.answer !== false) xExtra += ' is-wrong is-selected';
        if (battle.userChoice === true && q.answer === true) oExtra += ' is-selected';
        if (battle.userChoice === false && q.answer === false) xExtra += ' is-selected';
      }
      interactionHtml =
        '<div class="ox-grid">' +
          '<button type="button" class="ox-card-btn is-o' + oExtra + '" data-action="battle-answer-ox" data-battle-scope="' + escapeHtml(opts.scope || 'stage') + '" data-ox="true"' + (battle.answered ? ' disabled' : '') + '>' +
            '<span style="font-size:1.5rem;">⭕</span> <span>참 (O)</span>' +
          '</button>' +
          '<button type="button" class="ox-card-btn is-x' + xExtra + '" data-action="battle-answer-ox" data-battle-scope="' + escapeHtml(opts.scope || 'stage') + '" data-ox="false"' + (battle.answered ? ' disabled' : '') + '>' +
            '<span style="font-size:1.5rem;">❌</span> <span>거짓 (X)</span>' +
          '</button>' +
        '</div>';
    } else {
      var circledNums = ['①', '②', '③', '④'];
      var choicesHtml = (q.choices || []).map(function (cText, cIdx) {
        var cls = 'choice-card-btn';
        if (battle.answered) {
          if (cIdx === q.answerIndex) cls += ' is-correct';
          if (cIdx === battle.userChoice) {
            cls += ' is-selected';
            if (cIdx !== q.answerIndex) cls += ' is-wrong';
          }
        }
        return (
          '<button type="button" class="' + cls + '" data-action="battle-answer-mc" data-battle-scope="' + escapeHtml(opts.scope || 'stage') + '" data-choice-index="' + cIdx + '"' + (battle.answered ? ' disabled' : '') + '>' +
            '<span class="pill-badge" style="flex-shrink:0;">' + (circledNums[cIdx] || (cIdx + 1)) + '</span>' +
            '<span style="min-width:0;text-align:left;line-height:1.6;">' + fmt(cText) + '</span>' +
          '</button>'
        );
      }).join('');

      interactionHtml =
        (q.hint
          ? '<div style="margin-bottom:12px;">' +
              '<button type="button" id="btn-arena-hint" class="btn btn-ghost btn-sm" data-action="toggle-battle-hint" data-battle-scope="' + escapeHtml(opts.scope || 'stage') + '">' +
                '💡 논리 힌트 ' + (battle.showHint ? '접기' : '보기') +
              '</button>' +
              (battle.showHint
                ? '<div class="hint-box" style="margin-top:8px;"><strong>💡 논리 힌트:</strong> ' + fmt(q.hint) + '</div>'
                : '') +
            '</div>'
          : '') +
        '<div class="choices-list">' + choicesHtml + '</div>';
    }

    var explanationHtml = '';
    if (battle.answered) {
      var correctAnswerLabel = q.kind === 'ox'
        ? (q.answer ? '⭕ 참 (O)' : '❌ 거짓 (X)')
        : (['①', '②', '③', '④'][q.answerIndex] + ' ' + fmt((q.choices || [])[q.answerIndex] || ''));

      explanationHtml =
        '<div class="explanation-box ' + (battle.isLastCorrect ? 'is-correct' : 'is-wrong') + '" style="margin-top:18px;">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:8px;">' +
            '<strong style="font-size:1rem;color:' + (battle.isLastCorrect ? 'var(--text-emerald)' : 'var(--text-rose)') + ';">' +
              (battle.isLastCorrect
                ? '🎉 정답입니다! (+' + battle.lastEarnedXp + ' XP)'
                : '💡 함정 포착! 라이트너 오답노트 Box 0에 자동 등록되었습니다') +
            '</strong>' +
            '<span class="pill-badge" style="white-space:normal;max-width:100%;">정답: ' + correctAnswerLabel + '</span>' +
          '</div>' +
          (battle.lastPromotionNote
            ? '<div style="margin-bottom:8px;font-size:0.84rem;font-weight:750;color:var(--text-indigo);">' + escapeHtml(battle.lastPromotionNote) + '</div>'
            : '') +
          '<div style="font-size:0.94rem;line-height:1.74;color:var(--ink-primary);margin-bottom:14px;">' +
            '<strong>🧠 Hypercorrection 논리 해설:</strong><br>' + fmt(q.explanation) +
          '</div>' +
          '<div style="display:flex;justify-content:flex-end;">' +
            '<button type="button" id="btn-arena-next" class="btn btn-primary btn-lg" data-action="battle-next" data-battle-scope="' + escapeHtml(opts.scope || 'stage') + '">' +
              (isLast ? '🏆 배틀 결과 확인 →' : '다음 문제 →') +
            '</button>' +
          '</div>' +
        '</div>';
    }

    return (
      '<div class="arena-card">' +
        '<div class="arena-hud" style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:12px;">' +
          '<span class="wave-pill">' + getWaveBadgeLabel(battle, q) + '</span>' +
          '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">' +
            '<span class="combo-pill">' + (battle.combo >= 2 ? (battle.combo + '연속 정답 🔥') : (battle.combo === 1 ? '1연속 정답 ✨' : '콤보 도전 ⚡')) + '</span>' +
            '<span class="pill-badge" style="font-weight:800;">' + (battle.currentIndex + 1) + ' / ' + total + '</span>' +
          '</div>' +
        '</div>' +

        '<div class="progress-track" style="margin-bottom:16px;" aria-label="배틀 진행률">' +
          '<div class="progress-fill" style="width:' + progressPct + '%;"></div>' +
        '</div>' +

        bossBannerHtml +

        '<div class="question-box" style="margin-bottom:16px;">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:8px;">' +
            '<span class="pill-badge">' + fmt(q.typeTag || '핵심 유형') + '</span>' +
            '<span style="font-size:0.8rem;color:var(--ink-tertiary);">난이도 ' + '★'.repeat(Math.max(1, Math.min(3, q.difficulty || 1))) + '</span>' +
          '</div>' +
          '<div style="font-size:1.05rem;font-weight:750;line-height:1.72;">' +
            fmt(q.kind === 'ox' ? q.statement : q.question) +
          '</div>' +
        '</div>' +

        interactionHtml +
        explanationHtml +
      '</div>'
    );
  }

  function handleBattleAnswer(battle, rawAnswer, scope) {
    if (!battle || battle.finished || battle.answered) return;
    var q = battle.questions[battle.currentIndex];
    if (!q) return;

    battle.answered = true;
    battle.userChoice = rawAnswer;
    battle.lastPromotionNote = '';

    var isCorrect = q.kind === 'ox'
      ? Boolean(rawAnswer) === Boolean(q.answer)
      : Number(rawAnswer) === Number(q.answerIndex);

    battle.isLastCorrect = isCorrect;

    if (isCorrect) {
      battle.correctCount += 1;
      battle.combo += 1;
      if (battle.combo > battle.maxCombo) {
        battle.maxCombo = battle.combo;
      }
      var baseXp = q.wave === 3 ? 30 : 15;
      var comboBonus = battle.combo >= 2 ? Math.min(20, (battle.combo - 1) * 5) : 0;
      var gained = baseXp + comboBonus;
      battle.lastEarnedXp = gained;
      battle.totalEarnedXp += gained;
      global.LearningState.addXp(gained);

      if (battle.mode === 'review' && q.reviewItemKey) {
        var prevBox = typeof q.reviewBox === 'number' ? q.reviewBox : 0;
        var promoted = global.LearningState.promoteReviewItem(q.reviewItemKey);
        if (promoted) {
          battle.lastPromotionNote = promoted.box >= 3
            ? '🎓 라이트너 Box ' + prevBox + ' → Box 3 졸업 완료! 완벽히 극복했습니다!'
            : '🆙 라이트너 Box ' + prevBox + ' → Box ' + promoted.box + ' 승급 완료!';
        }
      }

      if (battle.combo >= 2) {
        global.SoundFX.combo();
      } else {
        global.SoundFX.correct();
      }
    } else {
      battle.combo = 0;
      battle.lastEarnedXp = 0;
      battle.wrongItemsInSession += 1;
      global.LearningState.recordWrongAnswer({
        kind: q.kind,
        stageId: q.stageId,
        itemId: q.id
      });
      if (battle.mode === 'review') {
        battle.lastPromotionNote = '🔄 다시 헷갈린 개념! 확실한 정복을 위해 Box 0(긴급 복습)에 재배치되었습니다.';
      }
      global.SoundFX.wrong();
    }

    if (scope === 'review') {
      renderReviewView();
    } else {
      renderStageView();
    }
  }

  function advanceBattleNext(battle, scope) {
    if (!battle || !battle.answered || battle.finished) return;
    if (battle.currentIndex + 1 < battle.questions.length) {
      battle.currentIndex += 1;
      battle.answered = false;
      battle.userChoice = null;
      battle.showHint = false;
      battle.lastPromotionNote = '';
      global.SoundFX.click();
    } else {
      battle.finished = true;
      var total = Math.max(1, battle.questions.length);
      var acc = Math.round((battle.correctCount / total) * 100);
      var stars = acc >= 85 ? 3 : (acc >= 60 ? 2 : 1);
      battle.accuracy = acc;
      battle.starsEarned = stars;

      if (battle.mode === 'stage' && battle.stageId) {
        var clearRes = global.LearningState.completeArena(battle.stageId, acc, stars);
        battle.totalEarnedXp += clearRes.xpAwarded || 0;
        showToast('🏆 ' + escapeHtml(battle.stageId.toUpperCase()) + ' 3-Wave 배틀 클리어! (' + renderStars(stars) + ')', 'success');
      } else if (battle.mode === 'mock') {
        var mockBonus = stars * 20;
        global.LearningState.addXp(mockBonus);
        battle.totalEarnedXp += mockBonus;
        showToast('🎓 반학기 모의고사 완주! 보너스 +' + mockBonus + ' XP', 'success');
      } else {
        showToast('🔥 오답 격파 복습 세션 완료!', 'success');
      }
      global.SoundFX.clear();
    }

    if (scope === 'review') {
      renderReviewView();
    } else {
      renderStageView();
    }
  }

  function renderStageView() {
    var root = document.getElementById('view-stage');
    if (!root) return;

    var data = getCurriculumData();
    var stage = data.stageMap[uiState.activeStageId] || data.stages[0];
    if (!stage) return;

    var idx = data.stages.findIndex(function (s) { return s.id === stage.id; });
    var prevStage = idx > 0 ? data.stages[idx - 1] : null;
    var nextStage = idx !== -1 && idx + 1 < data.stages.length ? data.stages[idx + 1] : null;
    var prog = global.LearningState.getStageProgress(stage.id);

    var tabContentHtml = '';
    if (uiState.activeStageTab === 'intuition') {
      tabContentHtml = renderStageIntuitionTab(stage, prog);
    } else if (uiState.activeStageTab === 'logic') {
      tabContentHtml = renderStageLogicTab(stage);
    } else {
      if (!uiState.stageBattle || uiState.stageBattle.stageId !== stage.id) {
        uiState.stageBattle = createBattleSession('stage', buildStageBattleQuestions(stage), stage.id);
      }
      tabContentHtml = renderBattleSessionHtml(uiState.stageBattle, { scope: 'stage' });
    }

    root.innerHTML =
      '<div class="stage-topbar" style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:16px;">' +
        '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;min-width:0;">' +
          '<button type="button" id="btn-back-dashboard" class="btn btn-ghost btn-sm" data-action="back-dashboard">← 로드맵으로</button>' +
          '<span class="pill-badge">' + escapeHtml(stage.code) + ' · ' + fmt(stage.chapterTitle || '') + '</span>' +
          '<h2 style="font-size:1.22rem;">' + fmt(stage.title) + '</h2>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
          '<button type="button" id="btn-stage-open-lab" class="btn btn-secondary btn-sm" data-action="open-lab" data-lab-tab="' + escapeHtml(stage.recommendedLabTab || 'poly-sim') + '">' +
            '🔬 단원 맞춤 실험실 열기' +
          '</button>' +
          '<button type="button" id="btn-prev-stage" class="btn btn-ghost btn-sm" data-action="open-stage" data-stage-id="' + (prevStage ? escapeHtml(prevStage.id) : '') + '"' + (!prevStage ? ' disabled' : '') + '>◀ 이전</button>' +
          '<button type="button" id="btn-next-stage" class="btn btn-ghost btn-sm" data-action="open-stage" data-stage-id="' + (nextStage ? escapeHtml(nextStage.id) : '') + '"' + (!nextStage ? ' disabled' : '') + '>다음 ▶</button>' +
        '</div>' +
      '</div>' +

      '<div class="mode-stepper" role="tablist" aria-label="스테이지 3단계 학습 모드" style="margin-bottom:20px;">' +
        '<button type="button" class="mode-step-btn' + (uiState.activeStageTab === 'intuition' ? ' is-active' : '') + (prog.intuitionDone ? ' is-done' : '') + '" data-action="switch-stage-tab" data-stage-tab="intuition">' +
          '[1] 💡 파인만 직관 &amp; 스텔스 공식' + (prog.intuitionDone ? ' ✓' : '') +
        '</button>' +
        '<button type="button" class="mode-step-btn' + (uiState.activeStageTab === 'logic' ? ' is-active' : '') + (prog.logicDone ? ' is-done' : '') + '" data-action="switch-stage-tab" data-stage-tab="logic">' +
          '[2] 🔗 논리 체인 조립 퍼즐' + (prog.logicDone ? ' ✓' : '') +
        '</button>' +
        '<button type="button" class="mode-step-btn' + (uiState.activeStageTab === 'arena' ? ' is-active' : '') + (prog.arenaDone ? ' is-done' : '') + '" data-action="switch-stage-tab" data-stage-tab="arena">' +
          '[3] ⚔️ 3-Wave 논리 배틀' + (prog.arenaDone ? ' ✓' : '') +
        '</button>' +
      '</div>' +

      tabContentHtml;
  }

  // =========================================================================
  // VIEW 3: Stealth Formula Deck (#view-formula-deck)
  // =========================================================================
  function getFilteredDeckFormulas() {
    var data = getCurriculumData();
    var q = uiState.deckSearchQuery.trim().toLowerCase();

    return data.formulas.filter(function (f) {
      if (uiState.deckChapterFilter !== 'all' && f.chapterId !== uiState.deckChapterFilter) {
        return false;
      }
      var st = global.LearningState.getFormulaStatus(f.id);
      if (uiState.deckStatusFilter === 'review' && st !== 'review') return false;
      if (uiState.deckStatusFilter === 'known' && st !== 'known') return false;

      if (q) {
        var hay = [f.name, f.chapterTitle, f.stageTitle, f.stageCode, f.whyItWorks, f.memoryTip, f.latex]
          .join(' ')
          .toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function buildFormulaDeckCardsHtml() {
    var filtered = getFilteredDeckFormulas();
    if (!filtered.length) {
      return (
        '<div class="bento-card" style="text-align:center;padding:32px 20px;">' +
          '<div style="font-size:1.5rem;margin-bottom:8px;">🔍 조건에 맞는 공식이 없습니다</div>' +
          '<p style="color:var(--ink-secondary);margin-bottom:14px;">필터를 전체로 변경하거나 다른 검색어를 입력해 보세요.</p>' +
          '<button type="button" class="btn btn-secondary btn-sm" data-action="reset-deck-filters">필터 초기화</button>' +
        '</div>'
      );
    }

    var cards = filtered.map(function (f) {
      var isRevealed = Boolean(uiState.deckRevealedFormulas[f.id]);
      var isHidden = uiState.deckStealthOn && !isRevealed;
      var status = global.LearningState.getFormulaStatus(f.id);
      var whyOpen = Boolean(uiState.deckWhyOpen[f.id]);

      var statusClass = status === 'known' ? ' is-known' : (status === 'review' ? ' is-review' : '');
      return (
        '<article class="formula-card' + statusClass + '" data-formula-id="' + escapeHtml(f.id) + '">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:8px;">' +
            '<button type="button" class="pill-badge" data-action="open-stage" data-stage-id="' + escapeHtml(f.stageId) + '" title="해당 스테이지 열기" style="cursor:pointer;white-space:normal;max-width:100%;text-align:left;">' +
              escapeHtml(f.stageCode) + ' · ' + fmt(f.chapterTitle) + ' ↗' +
            '</button>' +
            (status === 'known'
              ? '<span class="pill-badge is-emerald">완벽 암기 ✓</span>'
              : (status === 'review'
                  ? '<span class="pill-badge is-rose">헷갈리는 공식 📌</span>'
                  : '')) +
          '</div>' +
          '<h3 style="font-size:1rem;margin-bottom:10px;">' + fmt(f.name) + '</h3>' +

          '<div class="formula-display-box' + (!isHidden ? ' is-revealed' : '') + '" data-action="toggle-deck-formula-cloze" data-formula-id="' + escapeHtml(f.id) + '" role="button" tabindex="0" style="cursor:pointer;flex-direction:column;">' +
            renderClozeFormula(f, isHidden) +
            (!isHidden && uiState.deckStealthOn && f.clozeAnswer
              ? '<div style="margin-top:8px;font-size:0.83rem;font-weight:750;color:var(--text-emerald);text-align:center;">🎯 빈칸 정답: ' + renderSmartClozeAnswer(f.clozeAnswer) + '</div>'
              : '') +
          '</div>' +

          '<div style="display:flex;align-items:center;justify-content:space-between;gap:6px;flex-wrap:wrap;margin-top:10px;">' +
            (uiState.deckStealthOn
              ? '<button type="button" class="btn btn-secondary btn-sm cloze-toggle-btn" data-action="toggle-deck-formula-cloze" data-formula-id="' + escapeHtml(f.id) + '">' +
                  (isHidden ? '🔓 정답 확인' : '🙈 다시 가리기') +
                '</button>'
              : '<span style="font-size:0.78rem;color:var(--ink-tertiary);">전체 공개 상태</span>') +
            '<div style="display:flex;align-items:center;gap:6px;">' +
              '<button type="button" class="btn ' + (status === 'known' ? 'btn-primary' : 'btn-ghost') + ' btn-sm" data-action="set-formula-status" data-formula-id="' + escapeHtml(f.id) + '" data-status="known">알아요 ✓</button>' +
              '<button type="button" class="btn ' + (status === 'review' ? 'btn-accent' : 'btn-ghost') + ' btn-sm" data-action="set-formula-status" data-formula-id="' + escapeHtml(f.id) + '" data-status="review">헷갈려요 📌</button>' +
            '</div>' +
          '</div>' +

          '<details class="formula-meta" data-deck-formula-id="' + escapeHtml(f.id) + '"' + (whyOpen ? ' open' : '') + ' style="margin-top:10px;">' +
            '<summary style="cursor:pointer;font-size:0.83rem;font-weight:750;color:var(--text-indigo);padding:4px 0;">📖 유도 논리 &amp; 암기 팁 보기</summary>' +
            '<div style="padding-top:8px;font-size:0.86rem;line-height:1.68;color:var(--ink-secondary);display:flex;flex-direction:column;gap:6px;">' +
              '<div><strong style="color:var(--ink-primary);">🔍 왜 성립할까:</strong> ' + fmt(f.whyItWorks) + '</div>' +
              '<div><strong style="color:var(--text-indigo);">💡 암기 팁:</strong> ' + fmt(f.memoryTip) + '</div>' +
            '</div>' +
          '</details>' +
        '</article>'
      );
    }).join('');

    return '<div class="formula-grid">' + cards + '</div>';
  }

  function renderFormulaDeckView(onlyUpdateGrid) {
    var root = document.getElementById('view-formula-deck');
    if (!root) return;

    var data = getCurriculumData();
    var knownCount = 0;
    var reviewCount = 0;
    data.formulas.forEach(function (f) {
      var st = global.LearningState.getFormulaStatus(f.id);
      if (st === 'known') knownCount += 1;
      if (st === 'review') reviewCount += 1;
    });

    if (onlyUpdateGrid) {
      var gridHost = document.getElementById('formula-deck-results');
      var countEl = document.getElementById('formula-deck-count');
      if (gridHost) {
        gridHost.innerHTML = buildFormulaDeckCardsHtml();
      }
      if (countEl) {
        countEl.textContent = '표시 중: ' + getFilteredDeckFormulas().length + ' / ' + data.formulas.length + '개';
      }
      return;
    }

    var chapterChipsHtml =
      '<button type="button" class="chip' + (uiState.deckChapterFilter === 'all' ? ' is-active' : '') + '" data-action="filter-deck-chapter" data-chapter="all">전체 (' + data.formulas.length + ')</button>' +
      data.chapters.map(function (ch, idx) {
        return (
          '<button type="button" class="chip' + (uiState.deckChapterFilter === ch.id ? ' is-active' : '') + '" data-action="filter-deck-chapter" data-chapter="' + escapeHtml(ch.id) + '">' +
            'Ch' + (idx + 1) + ' ' + fmt(ch.title) +
          '</button>'
        );
      }).join('');

    root.innerHTML =
      '<div class="bento-card" style="margin-bottom:20px;">' +
        '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-bottom:16px;">' +
          '<div>' +
            '<span class="pill-badge" style="background:var(--tint-indigo);color:var(--text-indigo);margin-bottom:6px;">🃏 Active Recall · 3분 스피드 총정리</span>' +
            '<h1 style="font-size:1.45rem;margin-bottom:4px;">스텔스 빈칸 공식 암기장 (' + data.formulas.length + '개 전체)</h1>' +
            '<p style="font-size:0.9rem;color:var(--ink-secondary);">빈칸 <span class="math-cloze-box">?</span> 을 눈으로 먼저 채운 뒤 카드를 눌러 즉시 검증하세요!</p>' +
          '</div>' +
          '<button type="button" id="btn-deck-stealth-toggle" class="btn ' + (uiState.deckStealthOn ? 'btn-accent' : 'btn-secondary') + ' btn-lg cloze-toggle-btn" data-action="toggle-deck-stealth" aria-pressed="' + String(uiState.deckStealthOn) + '">' +
            '🕵️ 스텔스 빈칸 일괄 ' + (uiState.deckStealthOn ? 'ON' : 'OFF') +
          '</button>' +
        '</div>' +

        '<div style="display:flex;flex-direction:column;gap:12px;">' +
          '<div class="filter-chips" role="tablist" aria-label="단원별 공식 필터">' + chapterChipsHtml + '</div>' +
          '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">' +
            '<div class="filter-chips" role="tablist" aria-label="암기 상태 필터">' +
              '<button type="button" class="chip' + (uiState.deckStatusFilter === 'all' ? ' is-active' : '') + '" data-action="filter-deck-status" data-status="all">전체 상태</button>' +
              '<button type="button" class="chip' + (uiState.deckStatusFilter === 'review' ? ' is-active' : '') + '" data-action="filter-deck-status" data-status="review">헷갈리는 공식 📌 (' + reviewCount + ')</button>' +
              '<button type="button" class="chip' + (uiState.deckStatusFilter === 'known' ? ' is-active' : '') + '" data-action="filter-deck-status" data-status="known">완벽 암기 ✓ (' + knownCount + ')</button>' +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:10px;flex:1 1 240px;max-width:400px;">' +
              '<input type="search" id="formula-search-input" value="' + escapeHtml(uiState.deckSearchQuery) + '" placeholder="공식명·키워드 검색 (예: 나머지정리, 판별식)..." aria-label="공식 검색" style="width:100%;padding:0.55rem 0.9rem;border-radius:var(--radius-pill);border:1px solid var(--border-strong);background:var(--bg-subtle);color:var(--ink-primary);" />' +
            '</div>' +
          '</div>' +
          '<div id="formula-deck-count" style="font-size:0.82rem;font-weight:700;color:var(--ink-tertiary);">표시 중: ' + getFilteredDeckFormulas().length + ' / ' + data.formulas.length + '개</div>' +
        '</div>' +
      '</div>' +

      '<div id="formula-deck-results">' + buildFormulaDeckCardsHtml() + '</div>';
  }

  // =========================================================================
  // VIEW 4: Visual Math Lab (#view-lab)
  // =========================================================================
  function mountOrSwitchVisualLab(requestedTab) {
    var tabToUse = requestedTab || uiState.activeLabTab || 'poly-sim';
    uiState.activeLabTab = tabToUse;
    var rootEl = document.getElementById('visual-lab-root');
    if (!rootEl) return;

    if (global.VisualLab && typeof global.VisualLab.mount === 'function') {
      if (!uiState.labMounted || !rootEl.children.length) {
        global.VisualLab.mount(rootEl, tabToUse);
        uiState.labMounted = true;
      } else if (typeof global.VisualLab.setTab === 'function') {
        global.VisualLab.setTab(tabToUse);
        if (typeof global.VisualLab.refreshTheme === 'function') {
          global.VisualLab.refreshTheme();
        }
      } else {
        global.VisualLab.mount(rootEl, tabToUse);
      }
    } else {
      rootEl.innerHTML =
        '<div class="bento-card" style="text-align:center;padding:32px;">' +
          '<h2>🔬 시각 수학 실험실을 불러오는 중입니다...</h2>' +
        '</div>';
    }
  }

  // =========================================================================
  // VIEW 5: Smart Leitner Review & 10-Question Midterm Mock Exam (#view-review)
  // =========================================================================
  function resolveReviewItemQuestion(entry) {
    var data = getCurriculumData();
    var directKey = entry.kind + ':' + entry.stageId + ':' + entry.itemId;
    var fallbackKey = entry.kind + ':' + entry.itemId;
    return data.quizLookup[directKey] || data.quizLookup[fallbackKey] || null;
  }

  function startLeitnerReviewBattle() {
    var stats = global.LearningState.getReviewStats();
    var pool = stats.activeItems.length > 0 ? stats.activeItems : stats.allItems;
    var questions = [];

    pool.slice(0, 10).forEach(function (entry) {
      var baseQ = resolveReviewItemQuestion(entry);
      if (baseQ) {
        questions.push(Object.assign({}, baseQ, {
          reviewItemKey: entry.itemKey,
          reviewBox: entry.box
        }));
      }
    });

    if (!questions.length) {
      showToast('✨ 현재 복습할 오답 문항이 없습니다! 랜덤 실전 모의고사를 추천해요.', 'info');
      return;
    }

    uiState.reviewMode = 'battle';
    uiState.reviewBattle = createBattleSession('review', questions, null);
    global.SoundFX.click();
    renderReviewView();
  }

  function startRandomMockExam10() {
    var data = getCurriculumData();
    var selected = [];

    // Balanced sampling: pick 2 questions from each of the 5 chapters (10 questions total!)
    data.chapters.forEach(function (ch) {
      var chQuestions = data.allQuizList.filter(function (q) {
        return q.chapterId === ch.id;
      });
      var copy = chQuestions.slice();
      for (var i = copy.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = copy[i];
        copy[i] = copy[j];
        copy[j] = t;
      }
      selected.push.apply(selected, copy.slice(0, 2));
    });

    // Fallback if chapters had fewer than expected
    if (selected.length < 10 && data.allQuizList.length > selected.length) {
      var usedIds = {};
      selected.forEach(function (s) { usedIds[s.kind + ':' + s.id] = true; });
      var rest = data.allQuizList.filter(function (q) { return !usedIds[q.kind + ':' + q.id]; });
      while (selected.length < 10 && rest.length > 0) {
        var pickIdx = Math.floor(Math.random() * rest.length);
        selected.push(rest.splice(pickIdx, 1)[0]);
      }
    }

    uiState.reviewMode = 'mock';
    uiState.reviewBattle = createBattleSession('mock', selected.slice(0, 10), null);
    global.SoundFX.click();
    renderReviewView();
  }

  function renderReviewView() {
    var root = document.getElementById('view-review');
    if (!root) return;

    if ((uiState.reviewMode === 'battle' || uiState.reviewMode === 'mock') && uiState.reviewBattle) {
      var modeBannerTitle = uiState.reviewMode === 'battle'
        ? '🔥 라이트너 오답 격파 복습 배틀'
        : '🎲 고1 공통수학1 반학기 랜덤 실전 모의고사 10제';

      root.innerHTML =
        '<div class="stage-topbar" style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:16px;">' +
          '<button type="button" class="btn btn-ghost btn-sm" data-action="exit-review-quiz">← 오답노트 홈으로 돌아가기</button>' +
          '<h2 style="font-size:1.18rem;">' + modeBannerTitle + '</h2>' +
          '<span class="pill-badge" style="background:var(--tint-indigo);color:var(--text-indigo);">맞히면 라이트너 Box 승급!</span>' +
        '</div>' +
        renderBattleSessionHtml(uiState.reviewBattle, { scope: 'review' });
      return;
    }

    var stats = global.LearningState.getReviewStats();
    var boxMeta = [
      { box: 0, title: 'Box 0 · 긴급 복습 🚨', desc: '방금 틀렸거나 다시 헷갈린 핵심 약점', tint: 'var(--tint-rose)', text: 'var(--text-rose)' },
      { box: 1, title: 'Box 1 · 1차 교정 🔨', desc: '복습 배틀 1회 정답 통과', tint: 'var(--tint-amber)', text: 'var(--text-amber)' },
      { box: 2, title: 'Box 2 · 2차 숙달 ⚡', desc: '장기 기억 정착 직전 단계', tint: 'var(--tint-indigo)', text: 'var(--text-indigo)' },
      { box: 3, title: 'Box 3 · 졸업 완료 🎓', desc: '3회 연속 정답으로 완벽 체화', tint: 'var(--tint-emerald)', text: 'var(--text-emerald)' }
    ];

    var boxesHtml = boxMeta.map(function (bm) {
      var cnt = stats.boxCounts[bm.box] || 0;
      return (
        '<div class="bento-card" style="padding:16px;">' +
          '<span class="pill-badge" style="background:' + bm.tint + ';color:' + bm.text + ';margin-bottom:8px;">' + bm.title + '</span>' +
          '<div style="font-size:1.75rem;font-weight:850;margin-bottom:4px;">' + cnt + '<span style="font-size:0.9rem;font-weight:700;color:var(--ink-secondary);"> 문항</span></div>' +
          '<p style="font-size:0.8rem;color:var(--ink-secondary);">' + bm.desc + '</p>' +
        '</div>'
      );
    }).join('');

    var filteredEntries = stats.allItems.filter(function (entry) {
      if (uiState.reviewBoxFilter === 'all') return true;
      return String(entry.box) === String(uiState.reviewBoxFilter);
    });

    var savedListHtml = '';
    if (!filteredEntries.length) {
      savedListHtml =
        '<div class="bento-card" style="text-align:center;padding:32px 20px;">' +
          '<div style="font-size:1.8rem;margin-bottom:8px;">✨</div>' +
          '<h3 style="font-size:1.12rem;margin-bottom:6px;">' +
            (stats.totalCount === 0 ? '현재 저장된 오답 문항이 없습니다!' : '선택한 Box에 해당하는 문항이 없습니다.') +
          '</h3>' +
          '<p style="font-size:0.9rem;color:var(--ink-secondary);margin-bottom:16px;">' +
            '스테이지 배틀에서 틀린 문항은 이곳에 자동으로 모입니다. 지금 바로 <strong>반학기 랜덤 실전 모의고사 10제</strong>로 내신 실전 감각을 테스트해 보세요!' +
          '</p>' +
          '<button type="button" class="btn btn-accent btn-lg" data-action="start-mock-exam">🎲 반학기 랜덤 실전 모의고사 10제 시작</button>' +
        '</div>';
    } else {
      savedListHtml = filteredEntries.map(function (entry) {
        var q = resolveReviewItemQuestion(entry);
        if (!q) return '';
        var correctText = q.kind === 'ox'
          ? (q.answer ? '⭕ 참 (O)' : '❌ 거짓 (X)')
          : (['①', '②', '③', '④'][q.answerIndex] + ' ' + fmt((q.choices || [])[q.answerIndex] || ''));

        return (
          '<article class="bento-card" data-review-key="' + escapeHtml(entry.itemKey) + '" style="display:flex;flex-direction:column;gap:10px;">' +
            '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">' +
              '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
                '<span class="pill-badge" style="' + (entry.box === 0 ? 'background:var(--tint-rose);color:var(--text-rose);' : (entry.box === 3 ? 'background:var(--tint-emerald);color:var(--text-emerald);' : 'background:var(--tint-indigo);color:var(--text-indigo);')) + '">' +
                  'Box ' + entry.box + (entry.box === 0 ? ' 긴급 복습' : (entry.box === 3 ? ' 졸업 완료' : ' 복습 중')) +
                '</span>' +
                '<button type="button" class="pill-badge" data-action="open-stage" data-stage-id="' + escapeHtml(entry.stageId) + '" style="cursor:pointer;white-space:normal;max-width:100%;text-align:left;">' +
                  escapeHtml(q.stageCode) + ' · ' + fmt(q.stageTitle) + ' ↗' +
                '</button>' +
              '</div>' +
              '<span style="font-size:0.78rem;color:var(--ink-tertiary);">오답 ' + entry.wrongCount + '회 · 연속 정답 ' + entry.rightStreak + '회</span>' +
            '</div>' +

            '<div style="font-size:0.98rem;font-weight:750;line-height:1.68;">' +
              fmt(q.kind === 'ox' ? q.statement : q.question) +
            '</div>' +

            '<div style="padding:12px 14px;border-radius:var(--radius-sm);background:var(--bg-subtle);font-size:0.88rem;line-height:1.7;">' +
              '<div style="font-weight:800;color:var(--text-indigo);margin-bottom:4px;">✅ 정답: ' + correctText + '</div>' +
              '<div style="color:var(--ink-secondary);">' + fmt(q.explanation) + '</div>' +
            '</div>' +
          '</article>'
        );
      }).join('');
    }

    root.innerHTML =
      '<div class="bento-card" style="margin-bottom:20px;">' +
        '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;">' +
          '<div style="max-width:62ch;">' +
            '<span class="pill-badge" style="background:var(--tint-rose);color:var(--text-rose);margin-bottom:8px;">🧠 Leitner Spaced Repetition · 약점 완전 제거</span>' +
            '<h1 style="font-size:1.45rem;margin-bottom:6px;">스마트 라이트너 오답 격파 &amp; 실전 모의고사</h1>' +
            '<p style="font-size:0.9rem;color:var(--ink-secondary);line-height:1.65;">' +
              '배틀에서 한 번이라도 틀린 문항은 <strong>Box 0 (긴급 복습)</strong>에 자동 수집됩니다. 복습 배틀에서 맞힐 때마다 한 단계씩 승급하며 <strong>Box 3</strong>에 도달하면 완벽 졸업합니다!' +
            '</p>' +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">' +
            '<button type="button" id="btn-start-review-battle" class="btn btn-primary btn-lg" data-action="start-review-battle"' + (stats.totalCount === 0 ? ' disabled' : '') + '>' +
              '🔥 오답 격파 복습 배틀 시작' + (stats.activeCount > 0 ? ' (' + stats.activeCount + '문항)' : '') +
            '</button>' +
            '<button type="button" id="btn-start-mock-exam" class="btn btn-accent btn-lg" data-action="start-mock-exam">' +
              '🎲 반학기 랜덤 실전 모의고사 10제' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin-bottom:24px;">' +
        boxesHtml +
      '</div>' +

      '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:14px;">' +
        '<h2 style="font-size:1.18rem;">📝 수집된 오답 노트 &amp; 논리 해설 (' + stats.totalCount + '문항)</h2>' +
        '<div class="filter-chips" role="tablist" aria-label="라이트너 박스 필터">' +
          '<button type="button" class="chip' + (uiState.reviewBoxFilter === 'all' ? ' is-active' : '') + '" data-action="filter-review-box" data-box="all">전체 (' + stats.totalCount + ')</button>' +
          '<button type="button" class="chip' + (uiState.reviewBoxFilter === '0' ? ' is-active' : '') + '" data-action="filter-review-box" data-box="0">Box 0 긴급 (' + stats.boxCounts[0] + ')</button>' +
          '<button type="button" class="chip' + (uiState.reviewBoxFilter === '1' ? ' is-active' : '') + '" data-action="filter-review-box" data-box="1">Box 1 (' + stats.boxCounts[1] + ')</button>' +
          '<button type="button" class="chip' + (uiState.reviewBoxFilter === '2' ? ' is-active' : '') + '" data-action="filter-review-box" data-box="2">Box 2 (' + stats.boxCounts[2] + ')</button>' +
          '<button type="button" class="chip' + (uiState.reviewBoxFilter === '3' ? ' is-active' : '') + '" data-action="filter-review-box" data-box="3">Box 3 졸업 (' + stats.boxCounts[3] + ')</button>' +
        '</div>' +
      '</div>' +

      '<div style="display:flex;flex-direction:column;gap:14px;">' + savedListHtml + '</div>';
  }

  // =========================================================================
  // Logic Chain Step Pick Handler
  // =========================================================================
  function handlePickLogicStep(pickedStepNo) {
    var data = getCurriculumData();
    var stage = data.stageMap[uiState.activeStageId];
    if (!stage || !uiState.logicPuzzle || uiState.logicPuzzle.completed) return;

    var pz = uiState.logicPuzzle;
    if (pickedStepNo === pz.nextStepNo) {
      pz.wrongStepNo = null;
      pz.showHint = false;
      pz.nextStepNo += 1;

      if (pz.nextStepNo > 4) {
        pz.completed = true;
        var res = global.LearningState.completeLogicChain(stage.id);
        pz.earnedXp = res.xpAwarded;
        global.SoundFX.clear();
        showToast('🔗 4단계 논리 체인 완성! +' + res.xpAwarded + ' XP', 'success');
      } else {
        pz.feedbackHtml = '✅ 정확합니다! 논리 고리가 착! 맞물렸어요. 이제 STEP ' + pz.nextStepNo + '을 선택하세요.';
        global.SoundFX.snap();
      }
      renderStageView();
    } else {
      pz.wrongStepNo = pickedStepNo;
      pz.feedbackHtml = '🤔 잠깐! 그 단계가 나오려면 먼저 <strong>STEP ' + pz.nextStepNo + '</strong>의 전제나 식 변형이 먼저 등장해야 해요. 필요하면 오른쪽 [💡 힌트 보기]를 눌러보세요!';
      global.SoundFX.wrong();
      renderStageView();

      setTimeout(function () {
        if (uiState.logicPuzzle && uiState.logicPuzzle.wrongStepNo === pickedStepNo) {
          uiState.logicPuzzle.wrongStepNo = null;
          var shakingEl = document.querySelector('.logic-option-card.is-wrong-shake');
          if (shakingEl) shakingEl.classList.remove('is-wrong-shake');
        }
      }, 460);
    }
  }

  // =========================================================================
  // Delegated Event Listeners & Keyboard Shortcuts
  // =========================================================================
  function handleActionElement(actionEl) {
    var action = actionEl.getAttribute('data-action');
    if (!action) return;

    if (action === 'open-stage') {
      var stageId = actionEl.getAttribute('data-stage-id');
      if (!stageId) return;
      global.SoundFX.click();
      navigateTo('stage', { stageId: stageId, tab: 'intuition' });
      return;
    }

    if (action === 'open-lab') {
      var labTab = actionEl.getAttribute('data-lab-tab') || 'poly-sim';
      global.SoundFX.click();
      navigateTo('lab', { labTab: labTab });
      return;
    }

    if (action === 'back-dashboard') {
      global.SoundFX.click();
      navigateTo('dashboard');
      return;
    }

    if (action === 'go-formula-deck') {
      global.SoundFX.click();
      navigateTo('formula-deck');
      return;
    }

    if (action === 'go-review') {
      global.SoundFX.click();
      navigateTo('review', { resetMode: true });
      return;
    }

    if (action === 'filter-unit') {
      uiState.unitFilter = actionEl.getAttribute('data-unit') || 'all';
      global.SoundFX.click();
      renderDashboardView();
      return;
    }

    if (action === 'claim-quest') {
      var questId = actionEl.getAttribute('data-quest-id');
      var claimRes = global.LearningState.claimQuestReward(questId);
      if (claimRes.claimed) {
        global.SoundFX.clear();
        showToast('🎁 퀘스트 보상 +' + claimRes.xpAwarded + ' XP 획득!', 'success');
        renderDashboardView();
      }
      return;
    }

    if (action === 'next-quick-formula') {
      uiState.quickFormulaIndex += 1;
      uiState.quickFormulaRevealed = false;
      global.SoundFX.click();
      renderDashboardView();
      return;
    }

    if (action === 'toggle-quick-cloze') {
      uiState.quickFormulaRevealed = !uiState.quickFormulaRevealed;
      global.SoundFX.reveal();
      renderDashboardView();
      return;
    }

    if (action === 'switch-stage-tab') {
      var nextTab = actionEl.getAttribute('data-stage-tab') || 'intuition';
      uiState.activeStageTab = nextTab;
      global.SoundFX.click();
      renderStageView();
      return;
    }

    if (action === 'toggle-stage-stealth') {
      uiState.stageStealthOn = !uiState.stageStealthOn;
      uiState.stageRevealedFormulas = {};
      global.SoundFX.reveal();
      renderStageView();
      return;
    }

    if (action === 'toggle-stage-formula-cloze') {
      if (!uiState.stageStealthOn) return;
      var fId = actionEl.getAttribute('data-formula-id');
      if (!fId) return;
      uiState.stageRevealedFormulas[fId] = !uiState.stageRevealedFormulas[fId];
      global.SoundFX.reveal();
      renderStageView();
      return;
    }

    if (action === 'set-formula-status') {
      var formulaId = actionEl.getAttribute('data-formula-id');
      var desired = actionEl.getAttribute('data-status');
      var current = global.LearningState.getFormulaStatus(formulaId);
      var nextStatus = current === desired ? null : desired;
      global.LearningState.setFormulaStatus(formulaId, nextStatus);
      global.SoundFX.click();
      if (uiState.activeView === 'stage') {
        renderStageView();
      } else if (uiState.activeView === 'formula-deck') {
        renderFormulaDeckView();
      }
      return;
    }

    if (action === 'complete-intuition') {
      var res = global.LearningState.completeIntuition(uiState.activeStageId);
      global.SoundFX.clear();
      showToast('💡 1단계 직관 & 공식 완료! +' + res.xpAwarded + ' XP', 'success');
      uiState.activeStageTab = 'logic';
      renderStageView();
      try { global.scrollTo({ top: 0, behavior: 'smooth' }); } catch (_e) {}
      return;
    }

    if (action === 'pick-logic-step') {
      var pickedNo = Number(actionEl.getAttribute('data-step-no'));
      if (pickedNo) {
        handlePickLogicStep(pickedNo);
      }
      return;
    }

    if (action === 'toggle-logic-hint') {
      if (uiState.logicPuzzle) {
        uiState.logicPuzzle.showHint = !uiState.logicPuzzle.showHint;
        global.SoundFX.click();
        renderStageView();
      }
      return;
    }

    if (action === 'reset-logic-chain') {
      var currStage = getCurriculumData().stageMap[uiState.activeStageId];
      if (currStage) {
        initLogicPuzzleForStage(currStage);
        global.SoundFX.click();
        renderStageView();
      }
      return;
    }

    if (action === 'go-arena') {
      uiState.activeStageTab = 'arena';
      global.SoundFX.click();
      renderStageView();
      try { global.scrollTo({ top: 0, behavior: 'smooth' }); } catch (_e) {}
      return;
    }

    if (action === 'battle-answer-ox') {
      var oxScope = actionEl.getAttribute('data-battle-scope');
      var oxVal = actionEl.getAttribute('data-ox') === 'true';
      var oxBattle = oxScope === 'review' ? uiState.reviewBattle : uiState.stageBattle;
      handleBattleAnswer(oxBattle, oxVal, oxScope);
      return;
    }

    if (action === 'battle-answer-mc') {
      var mcScope = actionEl.getAttribute('data-battle-scope');
      var cIdx = Number(actionEl.getAttribute('data-choice-index'));
      var mcBattle = mcScope === 'review' ? uiState.reviewBattle : uiState.stageBattle;
      handleBattleAnswer(mcBattle, cIdx, mcScope);
      return;
    }

    if (action === 'toggle-battle-hint') {
      var hScope = actionEl.getAttribute('data-battle-scope');
      var hBattle = hScope === 'review' ? uiState.reviewBattle : uiState.stageBattle;
      if (hBattle) {
        hBattle.showHint = !hBattle.showHint;
        global.SoundFX.click();
        if (hScope === 'review') renderReviewView();
        else renderStageView();
      }
      return;
    }

    if (action === 'battle-next') {
      var nScope = actionEl.getAttribute('data-battle-scope');
      var nBattle = nScope === 'review' ? uiState.reviewBattle : uiState.stageBattle;
      advanceBattleNext(nBattle, nScope);
      return;
    }

    if (action === 'restart-stage-arena') {
      var stg = getCurriculumData().stageMap[uiState.activeStageId];
      if (stg) {
        uiState.stageBattle = createBattleSession('stage', buildStageBattleQuestions(stg), stg.id);
        global.SoundFX.click();
        renderStageView();
      }
      return;
    }

    if (action === 'toggle-deck-stealth') {
      uiState.deckStealthOn = !uiState.deckStealthOn;
      uiState.deckRevealedFormulas = {};
      global.SoundFX.reveal();
      renderFormulaDeckView();
      return;
    }

    if (action === 'toggle-deck-formula-cloze') {
      if (!uiState.deckStealthOn) return;
      var dfId = actionEl.getAttribute('data-formula-id');
      if (!dfId) return;
      uiState.deckRevealedFormulas[dfId] = !uiState.deckRevealedFormulas[dfId];
      global.SoundFX.reveal();
      renderFormulaDeckView(true);
      return;
    }

    if (action === 'filter-deck-chapter') {
      uiState.deckChapterFilter = actionEl.getAttribute('data-chapter') || 'all';
      global.SoundFX.click();
      renderFormulaDeckView();
      return;
    }

    if (action === 'filter-deck-status') {
      uiState.deckStatusFilter = actionEl.getAttribute('data-status') || 'all';
      global.SoundFX.click();
      renderFormulaDeckView();
      return;
    }

    if (action === 'reset-deck-filters') {
      uiState.deckChapterFilter = 'all';
      uiState.deckStatusFilter = 'all';
      uiState.deckSearchQuery = '';
      global.SoundFX.click();
      renderFormulaDeckView();
      return;
    }

    if (action === 'start-review-battle') {
      startLeitnerReviewBattle();
      return;
    }

    if (action === 'start-mock-exam') {
      startRandomMockExam10();
      return;
    }

    if (action === 'exit-review-quiz') {
      uiState.reviewMode = 'overview';
      uiState.reviewBattle = null;
      global.SoundFX.click();
      renderReviewView();
      return;
    }

    if (action === 'filter-review-box') {
      uiState.reviewBoxFilter = actionEl.getAttribute('data-box') || 'all';
      global.SoundFX.click();
      renderReviewView();
      return;
    }

    if (action === 'close-modal') {
      closeModal();
    }
  }

  function bindGlobalEvents() {
    document.addEventListener('click', function (ev) {
      var target = ev.target;
      if (!target || typeof target.closest !== 'function') return;

      // Ignore clicks inside native <summary> so <details> toggles cleanly while tracking open state
      var summaryEl = target.closest('summary');
      if (summaryEl) {
        var detailsEl = summaryEl.parentElement;
        if (detailsEl && detailsEl.tagName === 'DETAILS') {
          setTimeout(function () {
            var sfId = detailsEl.getAttribute('data-formula-id');
            var dfId = detailsEl.getAttribute('data-deck-formula-id');
            if (sfId) uiState.stageWhyOpen[sfId] = detailsEl.open;
            if (dfId) uiState.deckWhyOpen[dfId] = detailsEl.open;
          }, 0);
        }
        return;
      }

      // Header nav buttons (#btn-home and [data-nav])
      var navEl = target.closest('[data-nav]');
      if (navEl) {
        var dest = navEl.getAttribute('data-nav');
        global.SoundFX.click();
        navigateTo(dest, { resetMode: dest === 'review' });
        return;
      }

      if (target.closest('#btn-sound-toggle')) {
        var enabled = global.LearningState.toggleSound();
        showToast(enabled ? '🔊 효과음이 켜졌습니다' : '🔇 효과음이 꺼졌습니다', 'info');
        return;
      }

      if (target.closest('#btn-theme-toggle')) {
        var nextTheme = global.LearningState.toggleTheme();
        applyThemeToDom(nextTheme);
        if (global.VisualLab && typeof global.VisualLab.refreshTheme === 'function') {
          global.VisualLab.refreshTheme();
        }
        global.SoundFX.click();
        return;
      }

      var actionEl = target.closest('[data-action]');
      if (actionEl) {
        if (actionEl.hasAttribute('disabled')) return;
        handleActionElement(actionEl);
      }
    });

    // Live search input in Stealth Formula Deck (preserves Korean IME composition)
    document.addEventListener('input', function (ev) {
      if (ev.target && ev.target.id === 'formula-search-input') {
        uiState.deckSearchQuery = ev.target.value || '';
        renderFormulaDeckView(true);
      }
    });

    // Keyboard shortcuts for Logic Chain Puzzle (1~4) and Battle Arena (1~4, O/X, Enter/Space)
    document.addEventListener('keydown', function (ev) {
      var tag = ev.target && ev.target.tagName ? ev.target.tagName.toUpperCase() : '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      // Enter/Space on role="button" cards (e.g. .stage-card or .formula-display-box)
      if ((ev.key === 'Enter' || ev.key === ' ') && ev.target && ev.target.getAttribute && ev.target.getAttribute('role') === 'button') {
        var actEl = ev.target.closest('[data-action]');
        if (actEl) {
          ev.preventDefault();
          handleActionElement(actEl);
          return;
        }
      }

      // Stage Logic Chain Puzzle keys 1..4
      if (uiState.activeView === 'stage' && uiState.activeStageTab === 'logic' && uiState.logicPuzzle && !uiState.logicPuzzle.completed) {
        if (ev.key >= '1' && ev.key <= '4') {
          var poolIdx = Number(ev.key) - 1;
          var opt = uiState.logicPuzzle.pool[poolIdx];
          if (opt && opt.stepNo >= uiState.logicPuzzle.nextStepNo) {
            ev.preventDefault();
            handlePickLogicStep(opt.stepNo);
          }
          return;
        }
      }

      // Active Battle shortcuts
      var activeBattle = null;
      var activeScope = null;
      if (uiState.activeView === 'stage' && uiState.activeStageTab === 'arena') {
        activeBattle = uiState.stageBattle;
        activeScope = 'stage';
      } else if (uiState.activeView === 'review' && (uiState.reviewMode === 'battle' || uiState.reviewMode === 'mock')) {
        activeBattle = uiState.reviewBattle;
        activeScope = 'review';
      }

      if (activeBattle && !activeBattle.finished) {
        if (activeBattle.answered) {
          if (ev.key === 'Enter' || ev.key === ' ') {
            if (tag !== 'BUTTON') {
              ev.preventDefault();
              advanceBattleNext(activeBattle, activeScope);
            }
          }
          return;
        }
        var currQ = activeBattle.questions[activeBattle.currentIndex];
        if (!currQ) return;
        if (currQ.kind === 'ox') {
          if (ev.key === 'o' || ev.key === 'O' || ev.key === '1') {
            ev.preventDefault();
            handleBattleAnswer(activeBattle, true, activeScope);
          } else if (ev.key === 'x' || ev.key === 'X' || ev.key === '2') {
            ev.preventDefault();
            handleBattleAnswer(activeBattle, false, activeScope);
          }
        } else if (currQ.kind === 'mc') {
          if (ev.key >= '1' && ev.key <= '4') {
            var cIndex = Number(ev.key) - 1;
            if (cIndex < (currQ.choices || []).length) {
              ev.preventDefault();
              handleBattleAnswer(activeBattle, cIndex, activeScope);
            }
          }
        }
      }
    });
  }

  // =========================================================================
  // Initialization & Public API
  // =========================================================================
  var initialized = false;

  function init() {
    if (initialized) return;
    initialized = true;

    if (global.LearningState) {
      global.LearningState.init();
      global.LearningState.subscribe(syncHeader);
    }

    syncHeader();
    bindGlobalEvents();
    navigateTo('dashboard', { preserveScroll: true });
  }

  var AppController = {
    init: init,
    navigateTo: navigateTo,
    openStage: function (stageId, tab) {
      navigateTo('stage', { stageId: stageId, tab: tab || 'intuition' });
    },
    openLab: function (labTab) {
      navigateTo('lab', { labTab: labTab || 'poly-sim' });
    },
    showToast: showToast,
    openModal: openModal,
    closeModal: closeModal,
    refresh: function () {
      cachedData = null;
      syncHeader();
      navigateTo(uiState.activeView, { preserveScroll: true });
    }
  };

  global.AppController = AppController;

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppController;
  }
})(typeof window !== 'undefined' ? window : globalThis);
