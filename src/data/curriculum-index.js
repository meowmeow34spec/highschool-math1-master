/**
 * LOGIC PRISM · 고1 공통수학1 반학기 마스터
 * Unified Curriculum Index & Query Helpers (Browser Global + Node CommonJS Dual Support)
 */
(function (root) {
  'use strict';

  const META = {
    title: 'LOGIC PRISM · 고1 공통수학1 반학기 마스터',
    curriculumStandard: '2022 개정 교육과정 공통수학1 (1학기 중간고사 범위)',
    totalChapters: 5,
    totalStages: 15
  };

  function resolveAlgChapters() {
    if (typeof window !== 'undefined' && Array.isArray(window.MATH1_ALG_CHAPTERS)) {
      return window.MATH1_ALG_CHAPTERS;
    }
    if (root && Array.isArray(root.MATH1_ALG_CHAPTERS)) {
      return root.MATH1_ALG_CHAPTERS;
    }
    if (typeof require === 'function') {
      try {
        const loaded = require('./chapters-alg.js');
        if (Array.isArray(loaded)) return loaded;
      } catch (_err) {
        // Ignore if not yet available
      }
    }
    return [];
  }

  function resolveEqChapters() {
    if (typeof window !== 'undefined' && Array.isArray(window.MATH1_EQ_CHAPTERS)) {
      return window.MATH1_EQ_CHAPTERS;
    }
    if (root && Array.isArray(root.MATH1_EQ_CHAPTERS)) {
      return root.MATH1_EQ_CHAPTERS;
    }
    if (typeof require === 'function') {
      try {
        const loaded = require('./chapters-eq.js');
        if (Array.isArray(loaded)) return loaded;
      } catch (_err) {
        // Ignore if not yet available
      }
    }
    return [];
  }

  function getFirstStageOrder(chapter) {
    if (!chapter || !Array.isArray(chapter.stages) || chapter.stages.length === 0) {
      return Number.MAX_SAFE_INTEGER;
    }
    let minOrder = Number.MAX_SAFE_INTEGER;
    for (let i = 0; i < chapter.stages.length; i++) {
      const ord = Number(chapter.stages[i] && chapter.stages[i].order);
      if (Number.isFinite(ord) && ord < minOrder) {
        minOrder = ord;
      }
    }
    return minOrder;
  }

  function enrichStage(stage, chapter) {
    if (!stage || !chapter) return null;
    return Object.assign({}, stage, {
      chapterId: stage.chapterId || chapter.id,
      chapterNumber: chapter.number,
      unitTitle: chapter.unitTitle,
      chapterTitle: chapter.title,
      chapterSubtitle: chapter.subtitle,
      chapterAccent: chapter.accent,
      accent: chapter.accent,
      chapterIcon: chapter.icon,
      recommendedLabTab: stage.recommendedLabTab || chapter.recommendedLabTab
    });
  }

  function getChapters() {
    const algChapters = resolveAlgChapters();
    const eqChapters = resolveEqChapters();
    const combined = algChapters.concat(eqChapters).map(function (ch) {
      const sortedStages = Array.isArray(ch.stages)
        ? ch.stages.slice().sort(function (a, b) {
            return (a.order || 0) - (b.order || 0);
          })
        : [];
      return Object.assign({}, ch, { stages: sortedStages });
    });

    combined.sort(function (a, b) {
      return getFirstStageOrder(a) - getFirstStageOrder(b);
    });

    return combined;
  }

  function getChapter(chapterId) {
    if (!chapterId) return null;
    const chapters = getChapters();
    for (let i = 0; i < chapters.length; i++) {
      if (chapters[i].id === chapterId) {
        return chapters[i];
      }
    }
    return null;
  }

  function getAllStages() {
    const chapters = getChapters();
    const stages = [];
    for (let i = 0; i < chapters.length; i++) {
      const ch = chapters[i];
      if (!Array.isArray(ch.stages)) continue;
      for (let j = 0; j < ch.stages.length; j++) {
        stages.push(enrichStage(ch.stages[j], ch));
      }
    }
    stages.sort(function (a, b) {
      return (a.order || 0) - (b.order || 0);
    });
    return stages;
  }

  function getStage(stageId) {
    if (!stageId) return null;
    const chapters = getChapters();
    for (let i = 0; i < chapters.length; i++) {
      const ch = chapters[i];
      if (!Array.isArray(ch.stages)) continue;
      for (let j = 0; j < ch.stages.length; j++) {
        if (ch.stages[j].id === stageId) {
          return enrichStage(ch.stages[j], ch);
        }
      }
    }
    return null;
  }

  function getAllFormulas() {
    const chapters = getChapters();
    const formulas = [];
    for (let i = 0; i < chapters.length; i++) {
      const ch = chapters[i];
      if (!Array.isArray(ch.stages)) continue;
      for (let j = 0; j < ch.stages.length; j++) {
        const st = ch.stages[j];
        if (!Array.isArray(st.formulas)) continue;
        for (let k = 0; k < st.formulas.length; k++) {
          formulas.push(
            Object.assign({}, st.formulas[k], {
              chapterId: ch.id,
              chapterNumber: ch.number,
              unitTitle: ch.unitTitle,
              chapterTitle: ch.title,
              stageId: st.id,
              stageCode: st.code,
              stageOrder: st.order,
              stageTitle: st.title,
              accent: ch.accent,
              chapterAccent: ch.accent
            })
          );
        }
      }
    }
    return formulas;
  }

  function getAllProblems() {
    const chapters = getChapters();
    const problems = [];
    for (let i = 0; i < chapters.length; i++) {
      const ch = chapters[i];
      if (!Array.isArray(ch.stages)) continue;
      for (let j = 0; j < ch.stages.length; j++) {
        const st = ch.stages[j];
        if (!Array.isArray(st.problems)) continue;
        for (let k = 0; k < st.problems.length; k++) {
          problems.push(
            Object.assign({}, st.problems[k], {
              kind: 'mc',
              chapterId: ch.id,
              chapterNumber: ch.number,
              unitTitle: ch.unitTitle,
              chapterTitle: ch.title,
              stageId: st.id,
              stageCode: st.code,
              stageOrder: st.order,
              stageTitle: st.title,
              accent: ch.accent,
              chapterAccent: ch.accent
            })
          );
        }
      }
    }
    return problems;
  }

  function getAllOXQuizzes() {
    const chapters = getChapters();
    const oxList = [];
    for (let i = 0; i < chapters.length; i++) {
      const ch = chapters[i];
      if (!Array.isArray(ch.stages)) continue;
      for (let j = 0; j < ch.stages.length; j++) {
        const st = ch.stages[j];
        if (!Array.isArray(st.oxQuizzes)) continue;
        for (let k = 0; k < st.oxQuizzes.length; k++) {
          oxList.push(
            Object.assign({}, st.oxQuizzes[k], {
              kind: 'ox',
              chapterId: ch.id,
              chapterNumber: ch.number,
              unitTitle: ch.unitTitle,
              chapterTitle: ch.title,
              stageId: st.id,
              stageCode: st.code,
              stageOrder: st.order,
              stageTitle: st.title,
              accent: ch.accent,
              chapterAccent: ch.accent
            })
          );
        }
      }
    }
    return oxList;
  }

  function findQuizItem(kind, stageId, itemId) {
    const stage = getStage(stageId);
    if (!stage) return null;
    if (kind === 'ox') {
      const list = Array.isArray(stage.oxQuizzes) ? stage.oxQuizzes : [];
      for (let i = 0; i < list.length; i++) {
        if (list[i].id === itemId) {
          return Object.assign({}, list[i], {
            kind: 'ox',
            chapterId: stage.chapterId,
            chapterTitle: stage.chapterTitle,
            stageId: stage.id,
            stageCode: stage.code,
            stageTitle: stage.title,
            accent: stage.accent
          });
        }
      }
      return null;
    }
    const probs = Array.isArray(stage.problems) ? stage.problems : [];
    for (let i = 0; i < probs.length; i++) {
      if (probs[i].id === itemId) {
        return Object.assign({}, probs[i], {
          kind: 'mc',
          chapterId: stage.chapterId,
          chapterTitle: stage.chapterTitle,
          stageId: stage.id,
          stageCode: stage.code,
          stageTitle: stage.title,
          accent: stage.accent
        });
      }
    }
    return null;
  }

  const MATH1_CURRICULUM = {
    meta: META,
    getChapters: getChapters,
    getChapter: getChapter,
    getAllStages: getAllStages,
    getStage: getStage,
    getAllFormulas: getAllFormulas,
    getAllProblems: getAllProblems,
    getAllOXQuizzes: getAllOXQuizzes,
    getAllOxQuizzes: getAllOXQuizzes,
    findQuizItem: findQuizItem
  };

  if (typeof window !== 'undefined') {
    window.MATH1_CURRICULUM = MATH1_CURRICULUM;
  }
  if (root) {
    root.MATH1_CURRICULUM = MATH1_CURRICULUM;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = MATH1_CURRICULUM;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
