/**
 * LOGIC PRISM · 고1 공통수학1 반학기 마스터
 * Learning State, Gamification, Daily Quests, Leitner Box Engine & Web Audio SoundFX
 */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'logic_prism_math1_v1';

  var LEVEL_THRESHOLDS = [
    { level: 1, minXp: 0, title: '다항식 탐험가' },
    { level: 2, minXp: 150, title: '나머지정리 설계자' },
    { level: 3, minXp: 350, title: '인수분해 연금술사' },
    { level: 4, minXp: 650, title: '복소평면 항해사' },
    { level: 5, minXp: 1000, title: '이차함수 지배자' },
    { level: 6, minXp: 1450, title: '공통수학1 그랜드마스터' }
  ];

  var QUEST_DEFINITIONS = [
    {
      id: 'intuition',
      title: '직관&공식 1스테이지 완료',
      desc: '파인만 직관 노트와 스텔스 공식을 1회 완주하세요',
      icon: '💡',
      rewardXp: 40
    },
    {
      id: 'logic',
      title: '논리 체인 퍼즐 1회 완주',
      desc: '4단계 수학 증명 체인을 빈틈없이 조립하세요',
      icon: '🔗',
      rewardXp: 50
    },
    {
      id: 'arena',
      title: '3-Wave 배틀 1회 클리어',
      desc: 'O/X 함정부터 실전 보스전까지 7문제를 돌파하세요',
      icon: '⚔️',
      rewardXp: 60
    }
  ];

  function getLocalDateString(dateObj) {
    var d = dateObj || new Date();
    var year = d.getFullYear();
    var month = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }

  function daysBetweenDateStrings(prevStr, currStr) {
    if (!prevStr || !currStr) return null;
    var p = prevStr.split('-').map(Number);
    var c = currStr.split('-').map(Number);
    if (p.length !== 3 || c.length !== 3) return null;
    var prevUtc = Date.UTC(p[0], p[1] - 1, p[2]);
    var currUtc = Date.UTC(c[0], c[1] - 1, c[2]);
    return Math.round((currUtc - prevUtc) / 86400000);
  }

  function createFreshDailyQuests(today) {
    return {
      date: today,
      items: {
        intuition: { done: false, claimed: false },
        logic: { done: false, claimed: false },
        arena: { done: false, claimed: false }
      },
      allBonusClaimed: false
    };
  }

  function createDefaultState() {
    var today = getLocalDateString();
    return {
      xp: 0,
      streak: 1,
      lastStudyDate: today,
      theme: 'light',
      soundEnabled: true,
      stages: {},
      formulaStatus: {},
      reviewQueue: {},
      dailyQuests: createFreshDailyQuests(today)
    };
  }

  function createDefaultStageProgress() {
    return {
      intuitionDone: false,
      logicDone: false,
      arenaDone: false,
      stars: 0,
      bestAccuracy: 0
    };
  }

  function sanitizeState(raw) {
    var base = createDefaultState();
    if (!raw || typeof raw !== 'object') {
      return base;
    }

    var state = {
      xp: typeof raw.xp === 'number' && isFinite(raw.xp) && raw.xp >= 0 ? Math.floor(raw.xp) : 0,
      streak: typeof raw.streak === 'number' && isFinite(raw.streak) && raw.streak >= 1 ? Math.floor(raw.streak) : 1,
      lastStudyDate: typeof raw.lastStudyDate === 'string' ? raw.lastStudyDate : base.lastStudyDate,
      theme: raw.theme === 'dark' ? 'dark' : 'light',
      soundEnabled: typeof raw.soundEnabled === 'boolean' ? raw.soundEnabled : true,
      stages: {},
      formulaStatus: {},
      reviewQueue: {},
      dailyQuests: base.dailyQuests
    };

    if (raw.stages && typeof raw.stages === 'object') {
      Object.keys(raw.stages).forEach(function (stageId) {
        var s = raw.stages[stageId];
        if (s && typeof s === 'object') {
          state.stages[stageId] = {
            intuitionDone: Boolean(s.intuitionDone),
            logicDone: Boolean(s.logicDone),
            arenaDone: Boolean(s.arenaDone),
            stars: typeof s.stars === 'number' ? Math.max(0, Math.min(3, Math.floor(s.stars))) : 0,
            bestAccuracy: typeof s.bestAccuracy === 'number' ? Math.max(0, Math.min(100, Math.round(s.bestAccuracy))) : 0
          };
        }
      });
    }

    if (raw.formulaStatus && typeof raw.formulaStatus === 'object') {
      Object.keys(raw.formulaStatus).forEach(function (fId) {
        var val = raw.formulaStatus[fId];
        if (val === 'known' || val === 'review') {
          state.formulaStatus[fId] = val;
        }
      });
    }

    if (raw.reviewQueue && typeof raw.reviewQueue === 'object') {
      Object.keys(raw.reviewQueue).forEach(function (key) {
        var item = raw.reviewQueue[key];
        if (item && typeof item === 'object' && item.stageId && item.itemId) {
          var kind = item.kind === 'ox' ? 'ox' : 'mc';
          var itemKey = item.itemKey || (kind + ':' + item.stageId + ':' + item.itemId);
          state.reviewQueue[itemKey] = {
            itemKey: itemKey,
            kind: kind,
            stageId: String(item.stageId),
            itemId: String(item.itemId),
            box: typeof item.box === 'number' ? Math.max(0, Math.min(3, Math.floor(item.box))) : 0,
            wrongCount: typeof item.wrongCount === 'number' && item.wrongCount >= 0 ? Math.floor(item.wrongCount) : 1,
            rightStreak: typeof item.rightStreak === 'number' && item.rightStreak >= 0 ? Math.floor(item.rightStreak) : 0,
            lastReviewedAt: typeof item.lastReviewedAt === 'number' ? item.lastReviewedAt : Date.now()
          };
        }
      });
    }

    var today = getLocalDateString();
    var diffDays = daysBetweenDateStrings(state.lastStudyDate, today);
    if (diffDays === 1) {
      state.streak += 1;
      state.lastStudyDate = today;
    } else if (diffDays !== 0) {
      state.streak = 1;
      state.lastStudyDate = today;
    }

    if (
      raw.dailyQuests &&
      typeof raw.dailyQuests === 'object' &&
      raw.dailyQuests.date === today &&
      raw.dailyQuests.items &&
      typeof raw.dailyQuests.items === 'object'
    ) {
      state.dailyQuests = {
        date: today,
        items: {
          intuition: {
            done: Boolean(raw.dailyQuests.items.intuition && raw.dailyQuests.items.intuition.done),
            claimed: Boolean(raw.dailyQuests.items.intuition && raw.dailyQuests.items.intuition.claimed)
          },
          logic: {
            done: Boolean(raw.dailyQuests.items.logic && raw.dailyQuests.items.logic.done),
            claimed: Boolean(raw.dailyQuests.items.logic && raw.dailyQuests.items.logic.claimed)
          },
          arena: {
            done: Boolean(raw.dailyQuests.items.arena && raw.dailyQuests.items.arena.done),
            claimed: Boolean(raw.dailyQuests.items.arena && raw.dailyQuests.items.arena.claimed)
          }
        },
        allBonusClaimed: Boolean(raw.dailyQuests.allBonusClaimed)
      };
    } else {
      state.dailyQuests = createFreshDailyQuests(today);
    }

    return state;
  }

  var currentState = createDefaultState();
  var listeners = [];

  function loadFromStorage() {
    try {
      if (typeof global.localStorage !== 'undefined') {
        var rawStr = global.localStorage.getItem(STORAGE_KEY);
        if (rawStr) {
          var parsed = JSON.parse(rawStr);
          currentState = sanitizeState(parsed);
          saveToStorage();
          return currentState;
        }
      }
    } catch (_err) {
      // Fallback to in-memory state if storage is blocked or corrupted
    }
    currentState = createDefaultState();
    saveToStorage();
    return currentState;
  }

  function saveToStorage() {
    try {
      if (typeof global.localStorage !== 'undefined') {
        global.localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
      }
    } catch (_err) {
      // Ignore quota / privacy mode errors cleanly
    }
  }

  function notifyListeners() {
    var snapshot = currentState;
    for (var i = 0; i < listeners.length; i++) {
      try {
        listeners[i](snapshot);
      } catch (_err) {
        // Prevent one subscriber from breaking state updates
      }
    }
  }

  function touchStudyToday() {
    var today = getLocalDateString();
    if (currentState.lastStudyDate !== today) {
      var diff = daysBetweenDateStrings(currentState.lastStudyDate, today);
      if (diff === 1) {
        currentState.streak += 1;
      } else {
        currentState.streak = 1;
      }
      currentState.lastStudyDate = today;
    }
    if (!currentState.dailyQuests || currentState.dailyQuests.date !== today) {
      currentState.dailyQuests = createFreshDailyQuests(today);
    }
  }

  function ensureStageEntry(stageId) {
    if (!currentState.stages[stageId]) {
      currentState.stages[stageId] = createDefaultStageProgress();
    }
    return currentState.stages[stageId];
  }

  function getLevelInfo(xpVal) {
    var xp = typeof xpVal === 'number' ? xpVal : currentState.xp;
    var level = 1;
    var title = LEVEL_THRESHOLDS[0].title;
    var floor = 0;
    var ceil = LEVEL_THRESHOLDS[1].minXp;

    for (var i = 0; i < LEVEL_THRESHOLDS.length; i++) {
      if (xp >= LEVEL_THRESHOLDS[i].minXp) {
        level = LEVEL_THRESHOLDS[i].level;
        title = LEVEL_THRESHOLDS[i].title;
        floor = LEVEL_THRESHOLDS[i].minXp;
        if (i + 1 < LEVEL_THRESHOLDS.length) {
          ceil = LEVEL_THRESHOLDS[i + 1].minXp;
        } else {
          // Beyond Lv.6, each +500 XP advances a grandmaster level
          var extraXp = xp - LEVEL_THRESHOLDS[i].minXp;
          var extraLevels = Math.floor(extraXp / 500);
          level = LEVEL_THRESHOLDS[i].level + extraLevels;
          floor = LEVEL_THRESHOLDS[i].minXp + extraLevels * 500;
          ceil = floor + 500;
        }
      }
    }

    var span = Math.max(1, ceil - floor);
    var into = Math.max(0, xp - floor);
    var pct = Math.max(0, Math.min(100, Math.round((into / span) * 100)));

    return {
      level: level,
      title: title,
      xp: xp,
      currentLevelFloor: floor,
      nextLevelCeil: ceil,
      xpIntoLevel: into,
      xpRequiredForNext: span,
      progressPercent: pct
    };
  }

  // =========================================================================
  // SoundFX — Clean Web Audio API Synthesized Chimes
  // =========================================================================
  var audioCtx = null;

  function getAudioContext() {
    if (!currentState.soundEnabled) return null;
    try {
      var Ctx = global.AudioContext || global.webkitAudioContext;
      if (!Ctx) return null;
      if (!audioCtx) {
        audioCtx = new Ctx();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(function () {});
      }
      return audioCtx;
    } catch (_err) {
      return null;
    }
  }

  function playToneSequence(notes) {
    if (!currentState.soundEnabled) return;
    try {
      var ctx = getAudioContext();
      if (!ctx) return;
      var baseNow = ctx.currentTime;
      for (var i = 0; i < notes.length; i++) {
        var n = notes[i];
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = n.type || 'sine';
        var start = baseNow + (n.delay || 0);
        var dur = n.duration || 0.12;
        var peak = n.gain || 0.08;
        osc.frequency.setValueAtTime(n.freq, start);
        if (n.endFreq) {
          osc.frequency.exponentialRampToValueAtTime(n.endFreq, start + dur);
        }
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.linearRampToValueAtTime(peak, start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + dur + 0.02);
      }
    } catch (_err) {
      // Safe fallback in restricted audio environments
    }
  }

  var SoundFX = {
    click: function () {
      playToneSequence([
        { freq: 520, endFreq: 620, duration: 0.055, gain: 0.045, type: 'triangle' }
      ]);
    },
    reveal: function () {
      playToneSequence([
        { freq: 440, duration: 0.07, gain: 0.05, type: 'sine', delay: 0 },
        { freq: 659.25, duration: 0.11, gain: 0.06, type: 'sine', delay: 0.05 }
      ]);
    },
    snap: function () {
      playToneSequence([
        { freq: 587.33, duration: 0.07, gain: 0.065, type: 'triangle', delay: 0 },
        { freq: 880, duration: 0.13, gain: 0.075, type: 'sine', delay: 0.055 }
      ]);
    },
    correct: function () {
      playToneSequence([
        { freq: 523.25, duration: 0.09, gain: 0.07, type: 'sine', delay: 0 },
        { freq: 659.25, duration: 0.09, gain: 0.07, type: 'sine', delay: 0.07 },
        { freq: 783.99, duration: 0.16, gain: 0.08, type: 'sine', delay: 0.14 }
      ]);
    },
    wrong: function () {
      playToneSequence([
        { freq: 280, endFreq: 210, duration: 0.14, gain: 0.065, type: 'sawtooth', delay: 0 },
        { freq: 220, endFreq: 175, duration: 0.16, gain: 0.055, type: 'triangle', delay: 0.1 }
      ]);
    },
    combo: function () {
      playToneSequence([
        { freq: 587.33, duration: 0.07, gain: 0.07, type: 'sine', delay: 0 },
        { freq: 739.99, duration: 0.07, gain: 0.075, type: 'sine', delay: 0.06 },
        { freq: 880, duration: 0.08, gain: 0.08, type: 'sine', delay: 0.12 },
        { freq: 1174.66, duration: 0.18, gain: 0.085, type: 'triangle', delay: 0.18 }
      ]);
    },
    clear: function () {
      playToneSequence([
        { freq: 523.25, duration: 0.09, gain: 0.075, type: 'triangle', delay: 0 },
        { freq: 659.25, duration: 0.09, gain: 0.075, type: 'triangle', delay: 0.08 },
        { freq: 783.99, duration: 0.09, gain: 0.08, type: 'triangle', delay: 0.16 },
        { freq: 1046.5, duration: 0.26, gain: 0.095, type: 'sine', delay: 0.24 }
      ]);
    }
  };

  // =========================================================================
  // LearningState Public API
  // =========================================================================
  var LearningState = {
    STORAGE_KEY: STORAGE_KEY,
    LEVEL_THRESHOLDS: LEVEL_THRESHOLDS,
    QUEST_DEFINITIONS: QUEST_DEFINITIONS,

    init: function () {
      return loadFromStorage();
    },

    getState: function () {
      return currentState;
    },

    subscribe: function (listener) {
      if (typeof listener === 'function') {
        listeners.push(listener);
      }
      return function unsubscribe() {
        var idx = listeners.indexOf(listener);
        if (idx !== -1) listeners.splice(idx, 1);
      };
    },

    getLevelInfo: function (xpVal) {
      return getLevelInfo(xpVal);
    },

    addXp: function (amount) {
      var delta = Math.max(0, Math.floor(Number(amount) || 0));
      if (delta <= 0) return { leveledUp: false, levelInfo: getLevelInfo(), added: 0 };
      touchStudyToday();
      var prevLevel = getLevelInfo(currentState.xp).level;
      currentState.xp += delta;
      var nextInfo = getLevelInfo(currentState.xp);
      saveToStorage();
      notifyListeners();
      return {
        leveledUp: nextInfo.level > prevLevel,
        prevLevel: prevLevel,
        levelInfo: nextInfo,
        added: delta
      };
    },

    setTheme: function (theme) {
      currentState.theme = theme === 'dark' ? 'dark' : 'light';
      saveToStorage();
      notifyListeners();
      return currentState.theme;
    },

    toggleTheme: function () {
      return LearningState.setTheme(currentState.theme === 'dark' ? 'light' : 'dark');
    },

    setSoundEnabled: function (enabled) {
      currentState.soundEnabled = Boolean(enabled);
      saveToStorage();
      notifyListeners();
      return currentState.soundEnabled;
    },

    toggleSound: function () {
      var next = !currentState.soundEnabled;
      currentState.soundEnabled = next;
      saveToStorage();
      notifyListeners();
      if (next) {
        SoundFX.click();
      }
      return next;
    },

    getStageProgress: function (stageId) {
      var s = currentState.stages[stageId];
      if (!s) return createDefaultStageProgress();
      return {
        intuitionDone: s.intuitionDone,
        logicDone: s.logicDone,
        arenaDone: s.arenaDone,
        stars: s.stars,
        bestAccuracy: s.bestAccuracy
      };
    },

    isStageMastered: function (stageId) {
      var s = currentState.stages[stageId];
      if (!s) return false;
      return Boolean(s.intuitionDone && s.logicDone && s.arenaDone);
    },

    isStageInProgress: function (stageId) {
      var s = currentState.stages[stageId];
      if (!s) return false;
      if (s.intuitionDone && s.logicDone && s.arenaDone) return false;
      return Boolean(s.intuitionDone || s.logicDone || s.arenaDone || s.stars > 0);
    },

    getMasteredStageCount: function (stageIds) {
      var keys = Array.isArray(stageIds) ? stageIds : Object.keys(currentState.stages);
      var count = 0;
      for (var i = 0; i < keys.length; i++) {
        if (LearningState.isStageMastered(keys[i])) count += 1;
      }
      return count;
    },

    completeIntuition: function (stageId) {
      touchStudyToday();
      var entry = ensureStageEntry(stageId);
      var firstTime = !entry.intuitionDone;
      entry.intuitionDone = true;
      currentState.dailyQuests.items.intuition.done = true;

      var xpAward = firstTime ? 30 : 5;
      var prevLevel = getLevelInfo(currentState.xp).level;
      currentState.xp += xpAward;
      var levelInfo = getLevelInfo(currentState.xp);

      saveToStorage();
      notifyListeners();
      return {
        firstTime: firstTime,
        xpAwarded: xpAward,
        leveledUp: levelInfo.level > prevLevel,
        levelInfo: levelInfo
      };
    },

    completeLogicChain: function (stageId) {
      touchStudyToday();
      var entry = ensureStageEntry(stageId);
      var firstTime = !entry.logicDone;
      entry.logicDone = true;
      currentState.dailyQuests.items.logic.done = true;

      var xpAward = firstTime ? 50 : 10;
      var prevLevel = getLevelInfo(currentState.xp).level;
      currentState.xp += xpAward;
      var levelInfo = getLevelInfo(currentState.xp);

      saveToStorage();
      notifyListeners();
      return {
        firstTime: firstTime,
        xpAwarded: xpAward,
        leveledUp: levelInfo.level > prevLevel,
        levelInfo: levelInfo
      };
    },

    completeArena: function (stageId, accuracy, stars, extraClearXp) {
      touchStudyToday();
      var entry = ensureStageEntry(stageId);
      var firstTime = !entry.arenaDone;
      entry.arenaDone = true;
      var cleanAcc = Math.max(0, Math.min(100, Math.round(Number(accuracy) || 0)));
      var cleanStars = Math.max(1, Math.min(3, Math.floor(Number(stars) || 1)));
      if (cleanAcc > entry.bestAccuracy) entry.bestAccuracy = cleanAcc;
      if (cleanStars > entry.stars) entry.stars = cleanStars;

      currentState.dailyQuests.items.arena.done = true;

      var clearBonus = typeof extraClearXp === 'number' ? extraClearXp : (firstTime ? 40 : 15);
      var prevLevel = getLevelInfo(currentState.xp).level;
      currentState.xp += Math.max(0, clearBonus);
      var levelInfo = getLevelInfo(currentState.xp);

      saveToStorage();
      notifyListeners();
      return {
        firstTime: firstTime,
        xpAwarded: clearBonus,
        leveledUp: levelInfo.level > prevLevel,
        levelInfo: levelInfo,
        stageProgress: entry
      };
    },

    getFormulaStatus: function (formulaId) {
      return currentState.formulaStatus[formulaId] || null;
    },

    setFormulaStatus: function (formulaId, status) {
      touchStudyToday();
      if (status === 'known' || status === 'review') {
        currentState.formulaStatus[formulaId] = status;
      } else {
        delete currentState.formulaStatus[formulaId];
      }
      saveToStorage();
      notifyListeners();
      return currentState.formulaStatus[formulaId] || null;
    },

    makeReviewKey: function (kind, stageId, itemId) {
      var cleanKind = kind === 'ox' ? 'ox' : 'mc';
      return cleanKind + ':' + stageId + ':' + itemId;
    },

    recordWrongAnswer: function (params) {
      if (!params || !params.stageId || !params.itemId) return null;
      touchStudyToday();
      var kind = params.kind === 'ox' ? 'ox' : 'mc';
      var key = LearningState.makeReviewKey(kind, params.stageId, params.itemId);
      var existing = currentState.reviewQueue[key];

      if (existing) {
        existing.box = 0;
        existing.wrongCount = (existing.wrongCount || 0) + 1;
        existing.rightStreak = 0;
        existing.lastReviewedAt = Date.now();
      } else {
        currentState.reviewQueue[key] = {
          itemKey: key,
          kind: kind,
          stageId: String(params.stageId),
          itemId: String(params.itemId),
          box: 0,
          wrongCount: 1,
          rightStreak: 0,
          lastReviewedAt: Date.now()
        };
      }

      saveToStorage();
      notifyListeners();
      return currentState.reviewQueue[key];
    },

    promoteReviewItem: function (itemKey) {
      var item = currentState.reviewQueue[itemKey];
      if (!item) return null;
      touchStudyToday();
      item.box = Math.min(3, (item.box || 0) + 1);
      item.rightStreak = (item.rightStreak || 0) + 1;
      item.lastReviewedAt = Date.now();
      saveToStorage();
      notifyListeners();
      return item;
    },

    resetReviewItemToBox0: function (itemKey) {
      var item = currentState.reviewQueue[itemKey];
      if (!item) return null;
      touchStudyToday();
      item.box = 0;
      item.wrongCount = (item.wrongCount || 0) + 1;
      item.rightStreak = 0;
      item.lastReviewedAt = Date.now();
      saveToStorage();
      notifyListeners();
      return item;
    },

    getReviewStats: function () {
      var boxCounts = { 0: 0, 1: 0, 2: 0, 3: 0 };
      var activeItems = [];
      var graduatedItems = [];
      var allItems = [];

      Object.keys(currentState.reviewQueue).forEach(function (key) {
        var entry = currentState.reviewQueue[key];
        if (!entry) return;
        var b = Math.max(0, Math.min(3, entry.box || 0));
        boxCounts[b] += 1;
        allItems.push(entry);
        if (b < 3) {
          activeItems.push(entry);
        } else {
          graduatedItems.push(entry);
        }
      });

      activeItems.sort(function (a, b) {
        if (a.box !== b.box) return a.box - b.box;
        return (b.wrongCount || 0) - (a.wrongCount || 0);
      });

      allItems.sort(function (a, b) {
        if (a.box !== b.box) return a.box - b.box;
        return (b.lastReviewedAt || 0) - (a.lastReviewedAt || 0);
      });

      return {
        boxCounts: boxCounts,
        activeCount: activeItems.length,
        graduatedCount: graduatedItems.length,
        totalCount: allItems.length,
        activeItems: activeItems,
        graduatedItems: graduatedItems,
        allItems: allItems
      };
    },

    getDailyQuestsStatus: function () {
      touchStudyToday();
      var dq = currentState.dailyQuests;
      var list = QUEST_DEFINITIONS.map(function (def) {
        var st = (dq.items && dq.items[def.id]) || { done: false, claimed: false };
        return {
          id: def.id,
          title: def.title,
          desc: def.desc,
          icon: def.icon,
          rewardXp: def.rewardXp,
          done: Boolean(st.done),
          claimed: Boolean(st.claimed)
        };
      });
      var completedCount = list.filter(function (q) { return q.done; }).length;
      var allDone = completedCount === list.length;
      return {
        date: dq.date,
        quests: list,
        completedCount: completedCount,
        totalCount: list.length,
        allDone: allDone,
        allBonusClaimed: Boolean(dq.allBonusClaimed),
        allBonusXp: 80
      };
    },

    claimQuestReward: function (questId) {
      touchStudyToday();
      var dq = currentState.dailyQuests;
      if (questId === 'all_bonus') {
        var allDone = QUEST_DEFINITIONS.every(function (d) {
          return dq.items[d.id] && dq.items[d.id].done;
        });
        if (!allDone || dq.allBonusClaimed) {
          return { claimed: false, xpAwarded: 0 };
        }
        dq.allBonusClaimed = true;
        var bonusRes = LearningState.addXp(80);
        return {
          claimed: true,
          xpAwarded: 80,
          leveledUp: bonusRes.leveledUp,
          levelInfo: bonusRes.levelInfo
        };
      }

      var def = null;
      for (var i = 0; i < QUEST_DEFINITIONS.length; i++) {
        if (QUEST_DEFINITIONS[i].id === questId) {
          def = QUEST_DEFINITIONS[i];
          break;
        }
      }
      if (!def || !dq.items[questId] || !dq.items[questId].done || dq.items[questId].claimed) {
        return { claimed: false, xpAwarded: 0 };
      }
      dq.items[questId].claimed = true;
      var res = LearningState.addXp(def.rewardXp);
      return {
        claimed: true,
        xpAwarded: def.rewardXp,
        leveledUp: res.leveledUp,
        levelInfo: res.levelInfo
      };
    },

    resetAll: function () {
      currentState = createDefaultState();
      saveToStorage();
      notifyListeners();
      return currentState;
    }
  };

  // Initialize state immediately when script loads
  loadFromStorage();

  global.SoundFX = SoundFX;
  global.LearningState = LearningState;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LearningState: LearningState, SoundFX: SoundFX };
  }
})(typeof window !== 'undefined' ? window : globalThis);
