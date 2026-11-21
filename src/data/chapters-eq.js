/**
 * LOGIC PRISM · 고1 공통수학1 반학기 마스터
 * Unit II. 방정식과 부등식 (1학기 중간고사 범위: 복소수와 이차방정식 · 이차방정식과 이차함수)
 * 2022 개정 교육과정 · Chapters 4~5 (STAGE 10 ~ STAGE 15)
 */
(function (root) {
  'use strict';

  const ch4 = {
    id: 'ch4',
    number: 'II-1',
    unitTitle: 'Ⅱ. 방정식과 부등식',
    title: '복소수와 이차방정식',
    subtitle: '허수단위 i의 확장부터 판별식·근과 계수의 대칭 논리까지',
    accent: '#8B5CF6',
    icon: '🌀',
    recommendedLabTab: 'complex-plane',
    stages: [
      {
        id: 'ch4-s1',
        chapterId: 'ch4',
        order: 10,
        code: 'STAGE 10',
        title: '허수단위 i와 복소수의 연산·켤레복소수',
        tagline: '90도 회전 스위치 i의 4주기와 켤레복소수 실수화의 대칭 구조',
        estimatedMinutes: 8,
        feynman: {
          hookQuestion: '어떤 실수를 제곱해도 $0$ 이상인데, 제곱해서 $-1$이 되는 수 $i$는 대체 수직선 어디에 숨어 있을까요?',
          intuition:
            '수직선 위에서 $\\times (-1)$은 원점을 기준으로 방향을 $180^\\circ$ 뒤집는 스위치입니다. 그렇다면 똑같은 조작을 **두 번** 연속해서 $180^\\circ$ 뒤집기가 되려면, 한 번 조작할 때는 몇 도를 돌리면 될까요? 바로 **$90^\\circ$ 반시계 방향 회전**입니다! 허수단위 $i$를 곱한다는 것은 수를 수직선 바깥의 복소평면으로 꺼내어 $90^\\circ$씩 회전시키는 것입니다. 그래서 네 번 곱하면 $360^\\circ$ 한 바퀴를 돌아 $i^4 = 1$ 제자리로 돌아오고, 허수부의 부호만 반대로 뒤집은 켤레복소수 $\\overline{z} = a - bi$와 더하거나 곱하면 허수 성분이 감쪽같이 사라져 순수한 실수로 돌아옵니다.',
          keyInsight:
            '복소수 $z = a + bi$ ($a, b$는 실수)에서 $i$의 거듭제곱은 **연속한 $4$개씩 묶으면 합이 무조건 $0$**이 되고, 켤레복소수와의 **합 $z + \\overline{z} = 2a$와 곱 $z\\overline{z} = a^2 + b^2$은 언제나 실수**가 됩니다.',
          trapAlert: {
            title: '복소수가 서로 같을 조건 a + bi = 0의 숨은 실수 전제 조건!',
            description:
              '$a + bi = 0 \\implies a = 0, \\; b = 0$은 반드시 **$a, b$가 실수라는 조건**이 있을 때만 성립합니다! 만약 $a, b$가 실수라는 보장이 없다면 $a = 1, b = i$일 때도 $1 + i \\cdot i = 1 - 1 = 0$이 되어 $a = 0, b = 0$이 깨집니다. 문제를 읽을 때 "두 실수 $a, b$"라는 조건에 가장 먼저 밑줄을 그으세요!'
          }
        },
        formulas: [
          {
            id: 'ch4-s1-f1',
            name: '허수단위 i의 4주기 순환과 연속 네 항의 합',
            latex: 'i^1 = i, \\; i^2 = -1, \\; i^3 = -i, \\; i^4 = 1 \\implies i^n + i^{n+1} + i^{n+2} + i^{n+3} = 0',
            clozeLatex: 'i^1 = i, \\; i^2 = -1, \\; i^3 = -i, \\; i^4 = 1 \\implies i^n + i^{n+1} + i^{n+2} + i^{n+3} = \\boxed{?}',
            clozeAnswer: '0',
            whyItWorks:
              '임의의 자연수 $n$에 대하여 $i^n(1 + i + i^2 + i^3) = i^n(1 + i - 1 - i) = i^n \\cdot 0 = 0$이므로, **어느 지수에서 출발하든 연속하는 네 거듭제곱의 합은 항상 $0$**입니다.',
            memoryTip:
              '복소평면에서 북($i$)·서($-1$)·남($-i$)·동($1$) 네 방향으로 한 칸씩 걸으면 출발점($0$)으로 돌아옵니다! 긴 거듭제곱 합은 항의 개수를 $4$로 나눈 **나머지 개수만큼만** 남기면 즉시 해결됩니다.'
          },
          {
            id: 'ch4-s1-f2',
            name: '켤레복소수의 합·곱 실수화 대칭 공식',
            latex: '\\text{실수 } a, b \\text{에 대하여 } z = a + bi \\implies z + \\overline{z} = 2a, \\quad z\\overline{z} = a^2 + b^2',
            clozeLatex: '\\text{실수 } a, b \\text{에 대하여 } z = a + bi \\implies z + \\overline{z} = 2a, \\quad z\\overline{z} = \\boxed{?}',
            clozeAnswer: 'a^2 + b^2',
            whyItWorks:
              '$(a + bi)(a - bi) = a^2 - (bi)^2 = a^2 - b^2 i^2$인데, $i^2 = -1$이므로 가운데 마이너스가 플러스로 바뀌어 $a^2 + b^2$이 됩니다.',
            memoryTip:
              '실수의 합차공식은 $a^2 - b^2$이지만, **켤레복소수의 곱은 $i^2 = -1$ 덕분에 실수부 제곱 더하기 허수부 제곱($a^2 + b^2$)**! 분모의 실수화를 1초 만에 암산하게 해주는 핵심 공식입니다.'
          },
          {
            id: 'ch4-s1-f3',
            name: '실수·순허수 판별을 위한 켤레복소수 조건',
            latex: 'z \\text{가 실수} \\iff \\overline{z} = z, \\qquad z \\text{가 순허수} \\iff \\overline{z} = -z \\; (\\text{단, } z \\neq 0)',
            clozeLatex: 'z \\text{가 실수} \\iff \\overline{z} = z, \\qquad z \\text{가 순허수} \\iff \\boxed{?} \\; (\\text{단, } z \\neq 0)',
            clozeAnswer: '\\overline{z} = -z',
            whyItWorks:
              '$z = a + bi$ ($a, b$는 실수)에서 $\\overline{z} = -z \\iff z + \\overline{z} = 2a = 0 \\iff a = 0$입니다. 이때 $b = 0$이면 $z = 0$(실수)이 되므로, 순허수가 되려면 반드시 $z \\neq 0$($b \\neq 0$)이 함께 성립해야 합니다.',
            memoryTip:
              '$\\overline{z} = -z$만 보고 무조건 순허수라고 고르면 함정에 빠집니다! **$z = 0$도 $\\overline{0} = -0$을 만족**하므로 "순허수 $\\iff \\overline{z} = -z$이고 $z \\neq 0$"을 한 묶음으로 기억하세요.'
          }
        ],
        logicChain: {
          id: 'ch4-s1-lc',
          title: '분수 꼴 복소수의 단위화와 2026제곱 초고속 계산',
          goalStatement: '켤레복소수 실수화와 $4$주기 성질을 이용하여 $\\left(\\dfrac{1+i}{1-i}\\right)^{2026}$의 값을 논리적으로 구하시오.',
          steps: [
            {
              stepNo: 1,
              badge: '분모의 실수화',
              statement: '분수 $\\dfrac{1+i}{1-i}$의 분모와 분자에 분모의 켤레복소수 $1+i$를 곱해 $\\dfrac{(1+i)^2}{(1-i)(1+i)}$으로 변형한다.',
              reason: '분모의 허수단위 $i$를 제거하기 위해 $z\\overline{z} = a^2 + b^2$ 구조를 만드는 첫 단계입니다.'
            },
            {
              stepNo: 2,
              badge: '단일 단위 압축',
              statement: '분모는 $1^2 + 1^2 = 2$, 분자는 $1 + 2i + i^2 = 2i$이므로 괄호 안의 복소수가 $\\dfrac{2i}{2} = i$로 압축된다.',
              reason: '$1 + i^2 = 0$에 의해 실수부가 소거되면서 복잡한 분수식이 단일 허수단위 $i$로 간단해집니다.'
            },
            {
              stepNo: 3,
              badge: '4주기 지수 분해',
              statement: '지수 $2026$을 주기 $4$로 나누어 $2026 = 4 \\times 506 + 2$로 몫과 나머지를 분리한다.',
              reason: '$i^4 = 1$이므로 지수에서 $4$의 배수 묶음은 몇 번을 곱해도 $1$이 되어 계산에서 사라지기 때문입니다.'
            },
            {
              stepNo: 4,
              badge: '최종 결과 확정',
              statement: '남은 식을 계산하면 $i^{2026} = (i^4)^{506} \\cdot i^2 = 1^{506} \\cdot (-1) = -1$임을 최종 확정한다.',
              reason: '나머지 지수 $2$만 유효하게 남으므로 $i^2 = -1$에 의해 값이 결정됩니다.'
            }
          ]
        },
        oxQuizzes: [
          {
            id: 'ch4-s1-ox1',
            statement: '임의의 두 복소수 $a, b$에 대하여 $a + bi = 0$이면 반드시 $a = 0$이고 $b = 0$이다.',
            answer: false,
            explanation:
              '거짓입니다! $a, b$가 **실수**일 때만 성립합니다. 반례로 $a = 1, b = i$이면 $a + bi = 1 + i^2 = 0$이지만 $a \\neq 0, b \\neq 0$입니다.'
          },
          {
            id: 'ch4-s1-ox2',
            statement: '복소수 $z$의 제곱 $z^2$이 음의 실수가 되려면 $z$는 반드시 순허수여야 한다.',
            answer: true,
            explanation:
              '참입니다! $z = a + bi$ ($a, b$는 실수)일 때 $z^2 = (a^2 - b^2) + 2abi$입니다. $z^2 < 0$이려면 허수부 $2ab = 0$이고 실수부 $a^2 - b^2 < 0$이어야 하므로 $a = 0, b \\neq 0$, 즉 $z$는 순허수일 때만 성립합니다.'
          },
          {
            id: 'ch4-s1-ox3',
            statement: '켤레복소수 연산은 두 복소수 $z_1, z_2$의 덧셈과 곱셈에 대하여 $\\overline{z_1 + z_2} = \\overline{z_1} + \\overline{z_2}$, $\\overline{z_1 z_2} = \\overline{z_1} \\cdot \\overline{z_2}$가 항상 성립한다.',
            answer: true,
            explanation:
              '참입니다! 켤레복소수 기호는 사칙연산(나눗셈은 분모가 $0$이 아닐 때)에 대하여 자유롭게 분리하거나 하나로 합칠 수 있어 인수분해형 복소수 계산의 핵심 도구가 됩니다.'
          }
        ],
        problems: [
          {
            id: 'ch4-s1-p1',
            wave: 2,
            difficulty: 1,
            typeTag: '복소수가 서로 같을 조건',
            question: '두 실수 $x, y$에 대하여 등식 $(2 + i)x + (1 - 2i)y = 7 - 4i$가 성립할 때, $x + y$의 값은?',
            choices: ['$3$', '$4$', '$5$', '$6$'],
            answerIndex: 2,
            hint: '좌변을 실수부와 허수부로 정리해 $(2x + y) + (x - 2y)i = 7 - 4i$ 꼴로 만든 뒤 연립방정식을 풀어보세요.',
            explanation:
              '좌변을 $i$에 대하여 정리하면 $(2x + y) + (x - 2y)i = 7 - 4i$입니다. $x, y$가 실수이므로 복소수가 서로 같을 조건에 의해 $2x + y = 7$, $x - 2y = -4$입니다. 두 식을 연립하면 $x = 2, y = 3$이므로 $x + y = 5$입니다.'
          },
          {
            id: 'ch4-s1-p2',
            wave: 2,
            difficulty: 2,
            typeTag: '허수단위 i의 4주기 순환 합',
            question: '거듭제곱의 합 $1 + i + i^2 + i^3 + \\cdots + i^{50}$을 계산한 결과를 $a + bi$ ($a, b$는 실수)라 할 때, $a - b$의 값은?',
            choices: ['$-1$', '$0$', '$1$', '$2$'],
            answerIndex: 0,
            hint: '$i^1$부터 $i^{48}$까지는 연속한 $4$개씩 $12$묶음이 되어 모두 $0$으로 사라집니다!',
            explanation:
              '연속하는 네 거듭제곱의 합은 항상 $0$이므로 $i^1 + i^2 + i^3 + i^4 = 0$에서 시작해 $i^{48}$까지 $12$묶음이 모두 $0$이 됩니다. 따라서 남는 항은 $1 + i^{49} + i^{50} = 1 + i + i^2 = 1 + i - 1 = i$입니다. 즉 $a = 0, b = 1$이므로 $a - b = -1$입니다.'
          },
          {
            id: 'ch4-s1-p3',
            wave: 2,
            difficulty: 2,
            typeTag: 'z^2이 음의 실수가 될 조건',
            question: '복소수 $z = (k^2 - 4k + 3) + (k - 1)i$에 대하여 $z^2$이 음의 실수가 되도록 하는 실수 $k$의 값은?',
            choices: ['$-1$', '$1$', '$2$', '$3$'],
            answerIndex: 3,
            hint: '$z^2 < 0$이려면 $z$가 순허수여야 합니다. 즉 (실수부) $= 0$이면서 동시에 (허수부) $\\neq 0$이어야 합니다!',
            explanation:
              '$z^2$이 음의 실수가 되려면 $z$는 순허수여야 하므로 실수부 $k^2 - 4k + 3 = (k - 1)(k - 3) = 0$이고 허수부 $k - 1 \\neq 0$이어야 합니다. $k = 1$이면 $z = 0$이 되어 $z^2 = 0$(음의 실수 아님)이므로 탈락하고, 조건을 만족하는 값은 $k = 3$뿐입니다.'
          },
          {
            id: 'ch4-s1-p4',
            wave: 3,
            difficulty: 3,
            typeTag: '켤레복소수 인수분해 보스전',
            question: '두 복소수 $\\alpha = 2 + 3i$, $\\beta = 1 - i$에 대하여 $\\alpha\\overline{\\alpha} - \\alpha\\overline{\\beta} - \\overline{\\alpha}\\beta + \\beta\\overline{\\beta}$의 값은?',
            choices: ['$13$', '$17$', '$21$', '$25$'],
            answerIndex: 1,
            hint: '네 항을 각각 대입해 전개하지 말고, 공통인수로 묶어 $(\\alpha - \\beta)(\\overline{\\alpha} - \\overline{\\beta})$ 꼴로 인수분해해 보세요!',
            explanation:
              '주어진 식을 두 항씩 묶어 인수분해하면 $\\alpha(\\overline{\\alpha} - \\overline{\\beta}) - \\beta(\\overline{\\alpha} - \\overline{\\beta}) = (\\alpha - \\beta)(\\overline{\\alpha} - \\overline{\\beta}) = (\\alpha - \\beta)\\overline{(\\alpha - \\beta)}$입니다. 이때 $\\alpha - \\beta = (2 + 3i) - (1 - i) = 1 + 4i$이므로 구하는 값은 $(1 + 4i)(1 - 4i) = 1^2 + 4^2 = 17$입니다.'
          }
        ]
      },
      {
        id: 'ch4-s2',
        chapterId: 'ch4',
        order: 11,
        code: 'STAGE 11',
        title: '음수의 제곱근 성질과 이차방정식의 판별식',
        tagline: '음수 제곱근의 마이너스 돌출 부호 조건과 판별식 D의 본질',
        estimatedMinutes: 8,
        feynman: {
          hookQuestion: '중학교 때는 $\\sqrt{2}\\sqrt{3} = \\sqrt{6}$이 당연했는데, 왜 $\\sqrt{-2}\\sqrt{-3}$을 $\\sqrt{(-2)(-3)} = \\sqrt{6}$으로 계산하면 즉시 오답이 될까요?',
          intuition:
            '음수의 제곱근 속에는 **허수단위 $i$라는 숨은 회전 스위치**가 들어 있기 때문입니다! 근호 안의 마이너스를 먼저 $i$로 꺼내 놓으면 $\\sqrt{-2} = \\sqrt{2}i$, $\\sqrt{-3} = \\sqrt{3}i$가 되고, 이를 곱하면 $\\sqrt{2}i \\times \\sqrt{3}i = \\sqrt{6}i^2 = -\\sqrt{6}$이 됩니다. 즉 두 수가 **모두 음수**일 때만 $i$가 두 개 충돌하여 근호 밖으로 마이너스가 튀어나옵니다! 나눗셈 $\\dfrac{\\sqrt{a}}{\\sqrt{b}}$에서는 반대로 **분모만 음수($a > 0, b < 0$)**일 때 분모의 $i$를 실수화하는 과정에서 $\\dfrac{1}{i} = -i$가 되어 마이너스가 튀어나옵니다. 한편 이차방정식의 근의 공식 $x = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$에서도 근호 안의 알맹이 $D = b^2 - 4ac$가 음수가 되는 순간 $i$가 탄생하여 허근이 됩니다!',
          keyInsight:
            '음수의 제곱근 계산은 무조건 $\\sqrt{-p} = \\sqrt{p}i$ ($p > 0$)로 고쳐서 수행하고, 실계수 이차방정식의 근의 종류는 근호 안의 **판별식 $D = b^2 - 4ac$의 부호** 하나로 완벽히 판별됩니다.',
          trapAlert: {
            title: '음수 제곱근 조건의 0 포함 예외와 이차방정식 최고차항 계수 함정!',
            description:
              '첫째, "$0$이 아닌"이라는 조건이 없을 때 $\\sqrt{a}\\sqrt{b} = -\\sqrt{ab}$가 성립하면 $a < 0, b < 0$뿐만 아니라 **$a = 0$ 또는 $b = 0$일 때도 $0 = -0$으로 성립**하므로 $a \\le 0, b \\le 0$입니다($\\dfrac{\\sqrt{a}}{\\sqrt{b}} = -\\sqrt{\\dfrac{a}{b}}$에서도 분자 $a = 0$ 가능, 분모 $b \\neq 0$!). 둘째, 문제에 "**이차방정식**"이라는 단어가 있으면 판별식과 함께 **최고차항의 계수 $\\neq 0$** 조건을 반드시 챙기세요!'
          }
        },
        formulas: [
          {
            id: 'ch4-s2-f1',
            name: '음수의 제곱근 곱셈의 부호 돌출 조건',
            latex: 'a \\neq 0, \\; b \\neq 0 \\text{인 실수 } a, b \\text{에 대하여 } \\sqrt{a}\\sqrt{b} = -\\sqrt{ab} \\iff a < 0, \\; b < 0',
            clozeLatex: 'a \\neq 0, \\; b \\neq 0 \\text{인 실수 } a, b \\text{에 대하여 } \\sqrt{a}\\sqrt{b} = -\\sqrt{ab} \\iff \\boxed{?}',
            clozeAnswer: 'a < 0, \\; b < 0',
            whyItWorks:
              '$a < 0, b < 0$이면 $\\sqrt{a}\\sqrt{b} = \\sqrt{|a|}i \\cdot \\sqrt{|b|}i = \\sqrt{|ab|}i^2 = -\\sqrt{ab}$가 됩니다. (단, $0$ 제외 조건이 없다면 $a = 0$ 또는 $b = 0$일 때도 등식이 성립합니다.)',
            memoryTip:
              '곱해서 근호 앞에 마이너스가 튀어나오면 **둘 다 음수(마·마)**! 단, 문제에 "$0$이 아닌"이라는 말이 있는지 없는지 꼭 확인해 등호($\\le 0$) 여부를 결정하세요.'
          },
          {
            id: 'ch4-s2-f2',
            name: '음수의 제곱근 나눗셈의 부호 돌출 조건',
            latex: 'a \\neq 0, \\; b \\neq 0 \\text{인 실수 } a, b \\text{에 대하여 } \\frac{\\sqrt{a}}{\\sqrt{b}} = -\\sqrt{\\frac{a}{b}} \\iff a > 0, \\; b < 0',
            clozeLatex: 'a \\neq 0, \\; b \\neq 0 \\text{인 실수 } a, b \\text{에 대하여 } \\frac{\\sqrt{a}}{\\sqrt{b}} = -\\sqrt{\\frac{a}{b}} \\iff \\boxed{?}',
            clozeAnswer: 'a > 0, \\; b < 0',
            whyItWorks:
              '$a > 0, b < 0$일 때 $\\dfrac{\\sqrt{a}}{\\sqrt{|b|}i} = \\dfrac{\\sqrt{a}i}{\\sqrt{|b|}i^2} = -\\sqrt{\\dfrac{a}{|b|}}i = -\\sqrt{\\dfrac{a}{b}}$로 마이너스가 생깁니다. ($0$ 조건이 없으면 분자만 $a \\ge 0$, 분모는 $b < 0$!)',
            memoryTip:
              '나눠서 마이너스가 튀어나오면 **분자는 양수, 분모만 음수(플/마)**! 분모에 있는 $i$를 실수화할 때만 $i^2 = -1$이 분모를 뚫고 나오기 때문입니다.'
          },
          {
            id: 'ch4-s2-f3',
            name: '실계수 이차방정식의 판별식 D와 짝수 판별식 D/4',
            latex: 'ax^2 + bx + c = 0 \\implies D = b^2 - 4ac, \\qquad ax^2 + 2b\'x + c = 0 \\implies \\frac{D}{4} = b\'^2 - ac',
            clozeLatex: 'ax^2 + bx + c = 0 \\implies D = b^2 - 4ac, \\qquad ax^2 + 2b\'x + c = 0 \\implies \\frac{D}{4} = \\boxed{?}',
            clozeAnswer: 'b\'^2 - ac',
            whyItWorks:
              '실수 계수 $a, b, c$ ($a \\neq 0$)에 대해 근의 공식 $x = \\dfrac{-b \\pm \\sqrt{D}}{2a}$에서 $D > 0$이면 서로 다른 두 실근, $D = 0$이면 중근(서로 같은 두 실근), $D < 0$이면 서로 다른 두 허근을 갖습니다.',
            memoryTip:
              '문제에서 단순히 **"실근을 가질 조건"**이라고 하면 서로 다른 두 실근($D > 0$)과 중근($D = 0$)을 모두 포함하므로 반드시 **$D \\ge 0$**을 세워야 합니다!'
          }
        ],
        logicChain: {
          id: 'ch4-s2-lc',
          title: '음수의 제곱근 부호 조건을 이용한 제곱근·절댓값 식 간단화',
          goalStatement: '$0$이 아닌 두 실수 $a, b$가 $\\dfrac{\\sqrt{a}}{\\sqrt{b}} = -\\sqrt{\\dfrac{a}{b}}$를 만족할 때, $\\sqrt{(a-b)^2} - |b| + \\sqrt{a^2}$을 간단히 하시오.',
          steps: [
            {
              stepNo: 1,
              badge: '부호 조건 번역',
              statement: '$0$이 아닌 두 실수의 제곱근 나눗셈에서 음의 부호가 튀어나왔으므로 분자 $a > 0$, 분모 $b < 0$임을 도출한다.',
              reason: '분모에만 허수단위 $i$가 있을 때 실수화 과정에서 $i^2 = -1$이 생기기 때문입니다.'
            },
            {
              stepNo: 2,
              badge: '절댓값 기호 전환',
              statement: '실수의 제곱근 성질 $\\sqrt{X^2} = |X|$를 적용하여 주어진 식을 $|a - b| - |b| + |a|$로 안전하게 바꾼다.',
              reason: '제곱과 근호를 바로 지우지 않고 절댓값 기호로 한 번 거쳐야 부호 실수를 원천 차단할 수 있습니다.'
            },
            {
              stepNo: 3,
              badge: '내부 식 부호 판정',
              statement: '각 절댓값 내부의 부호를 따지면 $a - b = (\\text{양수}) - (\\text{음수}) > 0$이고, $b < 0$, $a > 0$임을 확인한다.',
              reason: '절댓값 안이 양수이면 그대로, 음수이면 마이너스를 붙여서 벗겨야 하기 때문입니다.'
            },
            {
              stepNo: 4,
              badge: '부호 반영 및 소거',
              statement: '부호에 맞게 절댓값을 벗기면 $(a - b) - (-b) + a = a - b + b + a = 2a$로 정리된다.',
              reason: '$-|b| = -(-b) = +b$가 되면서 앞의 $-b$와 완벽히 상쇄되어 $2a$만 남습니다.'
            }
          ]
        },
        oxQuizzes: [
          {
            id: 'ch4-s2-ox1',
            statement: '음수의 제곱근의 곱 $\\sqrt{-3} \\times \\sqrt{-12}$를 계산하면 $\\sqrt{(-3) \\times (-12)} = \\sqrt{36} = 6$이다.',
            answer: false,
            explanation:
              '거짓입니다! 두 음수의 제곱근을 곱할 때는 $\\sqrt{-3}\\sqrt{-12} = \\sqrt{3}i \\times \\sqrt{12}i = \\sqrt{36}i^2 = -6$으로 근호 앞에 마이너스 부호가 붙어야 합니다.'
          },
          {
            id: 'ch4-s2-ox2',
            statement: '실수 $k$의 값에 관계없이 이차방정식 $x^2 - 2kx + k^2 + 1 = 0$은 항상 서로 다른 두 허근을 갖는다.',
            answer: true,
            explanation:
              '참입니다! 짝수 판별식을 계산하면 $\\dfrac{D}{4} = (-k)^2 - (k^2 + 1) = -1 < 0$이므로, 실수 $k$에 어떤 값을 넣어도 항상 음수가 되어 서로 다른 두 허근을 갖습니다.'
          },
          {
            id: 'ch4-s2-ox3',
            statement: '허수 계수를 포함한 이차방정식 $x^2 + 2ix - 2 = 0$은 $D = (2i)^2 - 4(1)(-2) = 4 > 0$이므로 서로 다른 두 실근을 갖는다.',
            answer: false,
            explanation:
              '거짓입니다! $D > 0, D < 0$으로 실근과 허근을 구분하는 것은 **계수가 모두 실수일 때만** 가능합니다. 실제로 근을 구하면 $x = \\pm 1 - i$로 두 근 모두 **허근**입니다!'
          }
        ],
        problems: [
          {
            id: 'ch4-s2-p1',
            wave: 2,
            difficulty: 1,
            typeTag: '음수의 제곱근 혼합 연산',
            question: '복소수 식 $\\sqrt{-2}\\sqrt{-8} + \\dfrac{\\sqrt{18}}{\\sqrt{-2}} + \\sqrt{-4}\\sqrt{9}$를 계산한 결과를 $a + bi$ ($a, b$는 실수)라 할 때, $a + b$의 값은?',
            choices: ['$-7$', '$-1$', '$1$', '$7$'],
            answerIndex: 1,
            hint: '각 근호 안의 음수를 $\\sqrt{2}i, \\sqrt{8}i, 2i$처럼 먼저 $i$로 꺼낸 뒤 차례대로 계산해 보세요.',
            explanation:
              '$\\sqrt{-2}\\sqrt{-8} = (\\sqrt{2}i)(\\sqrt{8}i) = 4i^2 = -4$, $\\dfrac{\\sqrt{18}}{\\sqrt{-2}} = \\dfrac{3\\sqrt{2}}{\\sqrt{2}i} = \\dfrac{3}{i} = -3i$, $\\sqrt{-4}\\sqrt{9} = (2i)(3) = 6i$입니다. 모두 더하면 $-4 + 3i$이므로 $a = -4, b = 3$이고 $a + b = -1$입니다.'
          },
          {
            id: 'ch4-s2-p2',
            wave: 2,
            difficulty: 2,
            typeTag: '실근 조건과 최고차항 계수 함정',
            question: '$x$에 대한 이차방정식 $(k - 2)x^2 - 2kx + k + 3 = 0$이 실근을 갖도록 하는 자연수 $k$의 개수는?',
            choices: ['$3$개', '$4$개', '$5$개', '$6$개'],
            answerIndex: 2,
            hint: '(1) "실근"이므로 $\\dfrac{D}{4} \\ge 0$이고, (2) "$x$에 대한 이차방정식"이므로 $x^2$의 계수 $k - 2 \\neq 0$이어야 합니다!',
            explanation:
              '첫째, 이차방정식이므로 최고차항의 계수 $k - 2 \\neq 0 \\implies k \\neq 2$입니다. 둘째, 실근을 가지려면 $\\dfrac{D}{4} = (-k)^2 - (k - 2)(k + 3) = k^2 - (k^2 + k - 6) = 6 - k \\ge 0$에서 $k \\le 6$입니다. 따라서 조건을 만족하는 자연수 $k$는 $1, 3, 4, 5, 6$의 $5$개입니다.'
          },
          {
            id: 'ch4-s2-p3',
            wave: 2,
            difficulty: 2,
            typeTag: '음수의 제곱근 부호 판정',
            question: '$0$이 아닌 두 실수 $a, b$가 $\\sqrt{a}\\sqrt{b} = -\\sqrt{ab}$를 만족할 때, $\\sqrt{(a+b)^2} - \\sqrt{a^2} + |b - 2|$를 간단히 하면?',
            choices: ['$-2b + 2$', '$2a - 2$', '$2b - 2$', '$-2a - 2b + 2$'],
            answerIndex: 0,
            hint: '$a < 0, b < 0$이므로 $a + b < 0$, $a < 0$, $b - 2 < 0$으로 세 절댓값 안이 모두 음수입니다!',
            explanation:
              '$0$이 아닌 두 실수에 대해 $\\sqrt{a}\\sqrt{b} = -\\sqrt{ab}$이므로 $a < 0, b < 0$입니다. 따라서 $a + b < 0, a < 0, b - 2 < 0$이므로 $|a + b| - |a| + |b - 2| = -(a + b) - (-a) - (b - 2) = -a - b + a - b + 2 = -2b + 2$입니다.'
          },
          {
            id: 'ch4-s2-p4',
            wave: 3,
            difficulty: 3,
            typeTag: '항등식과 판별식 결합 보스전',
            question: '실수 $k$의 값에 관계없이 이차방정식 $x^2 - 2(k + a)x + k^2 + 6k + b = 0$이 항상 중근을 가질 때, 두 실수 $a, b$에 대하여 $a + b$의 값은?',
            choices: ['$6$', '$9$', '$10$', '$12$'],
            answerIndex: 3,
            hint: '먼저 중근 조건 $\\dfrac{D}{4} = 0$을 세운 뒤, 그 식을 $k$에 대하여 정리해 $k$에 대한 항등식의 계수비교법을 적용하세요!',
            explanation:
              '중근을 가지므로 $\\dfrac{D}{4} = \\{-(k + a)\\}^2 - (k^2 + 6k + b) = (2a - 6)k + (a^2 - b) = 0$입니다. 이 식이 실수 $k$의 값에 관계없이 항상 성립해야 하므로 $2a - 6 = 0$, $a^2 - b = 0$에서 $a = 3, b = 9$입니다. 따라서 $a + b = 12$입니다.'
          }
        ]
      },
      {
        id: 'ch4-s3',
        chapterId: 'ch4',
        order: 12,
        code: 'STAGE 12',
        title: '이차방정식의 근과 계수의 관계',
        tagline: '근을 직접 구하지 않고 합과 곱의 대칭성으로 모든 식을 지배하는 법',
        estimatedMinutes: 9,
        feynman: {
          hookQuestion: '근의 공식으로 풀면 $\\dfrac{3 \\pm \\sqrt{29}}{2}$처럼 복잡한 무리수가 나오는 두 근 $\\alpha, \\beta$에 대해, 근을 전혀 구하지 않고도 $\\alpha^3 + \\beta^3$을 5초 만에 구하는 비결은 무엇일까요?',
          intuition:
            '비결은 **인수분해된 식과 원래 이차식이 완전히 똑같은 항등식**이라는 원리 하나뿐입니다! 최고차항의 계수가 $a$이고 두 근이 $\\alpha, \\beta$인 이차방정식은 반드시 $a(x - \\alpha)(x - \\beta) = 0$으로 인수분해됩니다. 이를 전개하면 $ax^2 - a(\\alpha + \\beta)x + a\\alpha\\beta = 0$이 되는데, 원래 방정식 $ax^2 + bx + c = 0$과 나란히 놓고 계수를 비교해 보세요! 일차항에서 **두 근의 합 $\\alpha + \\beta = -\\dfrac{b}{a}$**, 상수항에서 **두 근의 곱 $\\alpha\\beta = \\dfrac{c}{a}$**가 저절로 튀어나옵니다. 다항식 단원에서 익힌 곱셈공식의 변형과 이 두 값을 결합하면 어떤 대칭식도 순식간에 풀립니다.',
          keyInsight:
            '이차방정식 $ax^2 + bx + c = 0$의 두 근 $\\alpha, \\beta$에 대한 대칭식은 절대 근의 공식을 대입하지 말고, **합 $\\alpha + \\beta = -\\dfrac{b}{a}$와 곱 $\\alpha\\beta = \\dfrac{c}{a}$**로 변형해 계산합니다.',
          trapAlert: {
            title: '켤레근 성질은 계수가 유리수인지 실수인지 확인하지 않으면 100% 함정!',
            description:
              '첫째, 한 근이 $p + qi$ ($q \\neq 0$)일 때 다른 한 근이 $p - qi$이려면 반드시 **모든 계수가 실수**여야 합니다. 둘째, 한 근이 $p + q\\sqrt{m}$ ($q \\neq 0, \\sqrt{m}$은 무리수)일 때 다른 한 근이 $p - q\\sqrt{m}$이려면 계수가 실수인 것만으로는 부족하고 반드시 **모든 계수가 유리수**여야 합니다! 예컨대 $x^2 - \\sqrt{2}x = 0$은 실계수 방정식이지만 두 근이 $0, \\sqrt{2}$여서 $-\\sqrt{2}$를 근으로 갖지 않습니다.'
          }
        },
        formulas: [
          {
            id: 'ch4-s3-f1',
            name: '이차방정식의 근과 계수의 관계 (합·곱·차)',
            latex: '\\alpha + \\beta = -\\frac{b}{a}, \\quad \\alpha\\beta = \\frac{c}{a}, \\quad |\\alpha - \\beta| = \\frac{\\sqrt{b^2 - 4ac}}{|a|}',
            clozeLatex: '\\alpha + \\beta = \\boxed{?}, \\quad \\alpha\\beta = \\frac{c}{a}, \\quad |\\alpha - \\beta| = \\frac{\\sqrt{b^2 - 4ac}}{|a|}',
            clozeAnswer: '-\\frac{b}{a}',
            whyItWorks:
              '$ax^2 + bx + c = a(x - \\alpha)(x - \\beta) = ax^2 - a(\\alpha + \\beta)x + a\\alpha\\beta$의 양변 계수를 비교하면 성립하며, $(\\alpha - \\beta)^2 = (\\alpha + \\beta)^2 - 4\\alpha\\beta$에 대입하면 두 실근의 차 공식이 유도됩니다.',
            memoryTip:
              '부호 리듬은 **합은 마이너스($-b/a$), 곱은 플러스($+c/a$)**! $(x - \\alpha)(x - \\beta)$를 전개할 때 일차항 앞에 마이너스가 붙는 장면을 떠올리면 부호를 절대 헷갈리지 않습니다.'
          },
          {
            id: 'ch4-s3-f2',
            name: '두 수 α, β를 근으로 하는 이차방정식 작성',
            latex: 'a(x - \\alpha)(x - \\beta) = 0 \\iff a\\{x^2 - (\\alpha + \\beta)x + \\alpha\\beta\\} = 0 \\; (a \\neq 0)',
            clozeLatex: 'a(x - \\alpha)(x - \\beta) = 0 \\iff a\\{x^2 - \\boxed{?}x + \\alpha\\beta\\} = 0 \\; (a \\neq 0)',
            clozeAnswer: '(\\alpha + \\beta)',
            whyItWorks:
              '두 수의 합 $S = \\alpha + \\beta$와 곱 $P = \\alpha\\beta$를 구하면 $x^2 - Sx + P = 0$이 곧 두 수를 근으로 갖는 이차방정식이며, 양변에 $a$를 곱해도 근은 변하지 않습니다.',
            memoryTip:
              '**"$x^2 - (\\text{합})x + (\\text{곱}) = 0$"** 구구단처럼 외우되, 마지막에 문제에서 지정한 **$x^2$의 계수 $a$**를 전체에 곱했는지 꼭 점검하세요!'
          },
          {
            id: 'ch4-s3-f3',
            name: '이차방정식의 켤레근 성질과 계수 조건',
            latex: '\\text{실수 계수}: p + qi \\implies p - qi \\text{도 근} \\quad / \\quad \\text{유리수 계수}: p + q\\sqrt{m} \\implies p - q\\sqrt{m} \\text{도 근}',
            clozeLatex: '\\boxed{?}: p + qi \\implies p - qi \\text{도 근} \\quad / \\quad \\text{유리수 계수}: p + q\\sqrt{m} \\implies p - q\\sqrt{m} \\text{도 근}',
            clozeAnswer: '\\text{실수 계수}',
            whyItWorks:
              '근의 공식 $x = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$에서 계수가 실수이면 허수부 앞에만 $\\pm$가 생기고, 계수가 유리수이면 무리수 근호 앞에만 $\\pm$가 대칭으로 붙기 때문입니다.',
            memoryTip:
              '**허수 켤레근은 "실계수" 확인, 무리수 켤레근은 "유리계수" 확인!** 계수 조건만 통과하면 켤레근의 합과 곱으로 미정계수가 5초 만에 풀립니다.'
          }
        ],
        logicChain: {
          id: 'ch4-s3-lc',
          title: '항등식 비교를 통한 근과 계수의 관계 유도 및 세제곱 합 계산',
          goalStatement: '이차방정식 $2x^2 - 6x + 3 = 0$의 두 근 $\\alpha, \\beta$에 대하여, 인수분해 항등식으로부터 $\\alpha^3 + \\beta^3$의 값을 도출하시오.',
          steps: [
            {
              stepNo: 1,
              badge: '인수정리 전개',
              statement: '최고차항 계수가 $2$이고 두 근이 $\\alpha, \\beta$이므로 좌변을 $2(x - \\alpha)(x - \\beta) = 2x^2 - 2(\\alpha + \\beta)x + 2\\alpha\\beta$로 나타낸다.',
              reason: '인수정리에 의해 방정식의 두 근 $\\alpha, \\beta$는 일차인수 $(x - \\alpha), (x - \\beta)$와 동치이기 때문입니다.'
            },
            {
              stepNo: 2,
              badge: '계수 비교 유도',
              statement: '원래 식 $2x^2 - 6x + 3$과 계수를 비교하여 $\\alpha + \\beta = 3$, $\\alpha\\beta = \\dfrac{3}{2}$을 구한다.',
              reason: '두 식은 모든 $x$에 대하여 같은 항등식이므로 $-2(\\alpha + \\beta) = -6$, $2\\alpha\\beta = 3$이 성립합니다.'
            },
            {
              stepNo: 3,
              badge: '대칭식 변형',
              statement: '곱셈공식의 변형을 이용해 $\\alpha^3 + \\beta^3 = (\\alpha + \\beta)^3 - 3\\alpha\\beta(\\alpha + \\beta)$로 식을 바꾼다.',
              reason: '무리수 근을 직접 구하지 않고 이미 구한 합과 곱만으로 세제곱의 합을 표현하기 위함입니다.'
            },
            {
              stepNo: 4,
              badge: '수치 대입 완료',
              statement: '합과 곱을 대입하여 $3^3 - 3 \\times \\dfrac{3}{2} \\times 3 = 27 - \\dfrac{27}{2} = \\dfrac{27}{2}$임을 확정한다.',
              reason: '대칭식의 성질 덕분에 근호 계산 없이 정확한 유리수 값을 깔끔하게 얻습니다.'
            }
          ]
        },
        oxQuizzes: [
          {
            id: 'ch4-s3-ox1',
            statement: '두 실수 $a, b$에 대하여 이차방정식 $x^2 + ax + b = 0$의 한 근이 $1 + \\sqrt{3}$이면 다른 한 근은 반드시 $1 - \\sqrt{3}$이다.',
            answer: false,
            explanation:
              '거짓입니다! 무리수 켤레근 성질이 성립하려면 $a, b$가 실수가 아니라 **유리수**여야 합니다. 예를 들어 $x^2 - (1 + \\sqrt{3})x = 0$은 실수 계수 방정식이지만 두 근이 $0$과 $1 + \\sqrt{3}$입니다.'
          },
          {
            id: 'ch4-s3-ox2',
            statement: '이차방정식 $ax^2 + bx + c = 0$의 근과 계수의 관계는 두 근이 서로 다른 두 허근일 때도 그대로 성립한다.',
            answer: true,
            explanation:
              '참입니다! 복소수 범위에서 모든 이차식은 $a(x - \\alpha)(x - \\beta)$로 인수분해되므로, 근이 실근이든 허근이든 근과 계수의 관계는 언제나 성립합니다.'
          },
          {
            id: 'ch4-s3-ox3',
            statement: '두 수 $2$와 $-5$를 두 근으로 하고 $x^2$의 계수가 $2$인 이차방정식은 $2x^2 - 6x - 20 = 0$이다.',
            answer: false,
            explanation:
              '거짓입니다! 두 근의 합이 $-3$, 곱이 $-10$이므로 $2\\{x^2 - (-3)x + (-10)\\} = 2x^2 + 6x - 20 = 0$이 되어야 합니다. 일차항의 부호 반전을 주의하세요!'
          }
        ],
        problems: [
          {
            id: 'ch4-s3-p1',
            wave: 2,
            difficulty: 1,
            typeTag: '근과 계수의 관계와 대칭식',
            question: '방정식 $x^2 - 4x + 2 = 0$의 두 근을 $\\alpha, \\beta$라 할 때, $\\dfrac{\\beta}{\\alpha} + \\dfrac{\\alpha}{\\beta}$의 값은?',
            choices: ['$4$', '$6$', '$8$', '$12$'],
            answerIndex: 1,
            hint: '통분하면 $\\dfrac{\\alpha^2 + \\beta^2}{\\alpha\\beta} = \\dfrac{(\\alpha + \\beta)^2 - 2\\alpha\\beta}{\\alpha\\beta}$가 됩니다!',
            explanation:
              '근과 계수의 관계에 의해 $\\alpha + \\beta = 4$, $\\alpha\\beta = 2$입니다. 구하는 식을 통분하면 $\\dfrac{\\alpha^2 + \\beta^2}{\\alpha\\beta} = \\dfrac{(\\alpha + \\beta)^2 - 2\\alpha\\beta}{\\alpha\\beta} = \\dfrac{4^2 - 2 \\times 2}{2} = \\dfrac{12}{2} = 6$입니다.'
          },
          {
            id: 'ch4-s3-p2',
            wave: 2,
            difficulty: 2,
            typeTag: '실계수 이차방정식의 켤레근',
            question: '두 실수 $a, b$에 대하여 이차방정식 $x^2 + ax + b = 0$의 한 근이 $\\dfrac{5}{2 - i}$일 때, $a + b$의 값은?',
            choices: ['$-9$', '$-1$', '$1$', '$9$'],
            answerIndex: 2,
            hint: '먼저 분모를 실수화하면 $\\dfrac{5(2 + i)}{5} = 2 + i$가 됩니다. 계수 $a, b$가 실수이므로 켤레복소수도 근입니다!',
            explanation:
              '$\\dfrac{5}{2 - i} = \\dfrac{5(2 + i)}{(2 - i)(2 + i)} = 2 + i$입니다. 계수 $1, a, b$가 모두 실수이므로 다른 한 근은 $2 - i$입니다. 근과 계수의 관계에서 $(2 + i) + (2 - i) = 4 = -a \\implies a = -4$이고, $(2 + i)(2 - i) = 5 = b$이므로 $a + b = 1$입니다.'
          },
          {
            id: 'ch4-s3-p3',
            wave: 2,
            difficulty: 2,
            typeTag: '두 근의 비가 주어진 조건',
            question: '두 근의 비가 $1 : 2$인 이차방정식 $x^2 - 9x + k + 2 = 0$에서 실수 $k$의 값은?',
            choices: ['$16$', '$18$', '$20$', '$22$'],
            answerIndex: 0,
            hint: '두 근을 $\\alpha, 2\\alpha$로 놓으면 두 근의 합 $\\alpha + 2\\alpha = 9$에서 $\\alpha$가 바로 구해집니다!',
            explanation:
              '두 근을 $\\alpha, 2\\alpha$라 하면 근과 계수의 관계에 의해 합 $\\alpha + 2\\alpha = 3\\alpha = 9$이므로 $\\alpha = 3$이고, 두 근은 $3$과 $6$입니다. 두 근의 곱은 $3 \\times 6 = 18 = k + 2$이므로 $k = 16$입니다.'
          },
          {
            id: 'ch4-s3-p4',
            wave: 3,
            difficulty: 3,
            typeTag: '합성방정식 f(2x-1)=0 보스전',
            question: '이차방정식 $f(x) = 0$의 두 근의 합이 $7$, 두 근의 곱이 $12$일 때, 방정식 $f(2x - 1) = 0$의 두 근의 곱은?',
            choices: ['$2$', '$3$', '$4$', '$5$'],
            answerIndex: 3,
            hint: '$f(x) = 0$의 두 근을 $\\alpha, \\beta$라 하면 $f(2x - 1) = 0$이 성립할 조건은 $2x - 1 = \\alpha$ 또는 $2x - 1 = \\beta$입니다!',
            explanation:
              '$f(x) = 0$의 두 근을 $\\alpha, \\beta$라 하면 $\\alpha + \\beta = 7, \\alpha\\beta = 12$입니다. $f(2x - 1) = 0$에서 $2x - 1 = \\alpha$ 또는 $2x - 1 = \\beta$이므로 두 근은 $x_1 = \\dfrac{\\alpha + 1}{2}$, $x_2 = \\dfrac{\\beta + 1}{2}$입니다. 따라서 두 근의 곱은 $\\dfrac{(\\alpha + 1)(\\beta + 1)}{4} = \\dfrac{\\alpha\\beta + (\\alpha + \\beta) + 1}{4} = \\dfrac{12 + 7 + 1}{4} = 5$입니다.'
          }
        ]
      }
    ]
  };

  const ch5 = {
    id: 'ch5',
    number: 'II-2',
    unitTitle: 'Ⅱ. 방정식과 부등식',
    title: '이차방정식과 이차함수',
    subtitle: '대수(방정식)와 기하(함수 그래프)를 하나로 잇는 교점과 최대·최소 논리',
    accent: '#F43F5E',
    icon: '📈',
    recommendedLabTab: 'quadratic-explorer',
    stages: [
      {
        id: 'ch5-s1',
        chapterId: 'ch5',
        order: 13,
        code: 'STAGE 13',
        title: '이차함수의 그래프와 x축의 위치 관계',
        tagline: '방정식의 실근과 함수 그래프의 x절편이 완벽히 같은 말인 이유',
        estimatedMinutes: 7,
        feynman: {
          hookQuestion: '식으로 푸는 이차방정식 $ax^2 + bx + c = 0$과 눈으로 보는 포물선 $y = ax^2 + bx + c$는 왜 똑같은 판별식 $D$를 공유할까요?',
          intuition:
            '좌표평면에서 **$x$축의 수학적 정체가 바로 직선 $y = 0$**이기 때문입니다! 이차함수 $y = ax^2 + bx + c$의 그래프가 $x$축과 만나는 점을 찾으려고 $y = 0$을 대입하는 순간, 함수식이 곧바로 이차방정식 $ax^2 + bx + c = 0$으로 변합니다. 이때 좌표평면의 눈금은 **실수**로만 이루어져 있으므로 **허근은 그래프 위의 교점으로 나타나지 않습니다!** 따라서 서로 다른 두 실근($D > 0$)이면 포물선이 $x$축을 두 점에서 뚫고 지나가고, 중근($D = 0$)이면 $x$축에 한 점에서 스치듯 접하며, 허근($D < 0$)이면 $x$축과 만나지 않고 공중에 붕 뜨게 됩니다.',
          keyInsight:
            '이차함수 $y = ax^2 + bx + c$의 그래프와 $x$축의 **교점의 $x$좌표는 방정식 $ax^2 + bx + c = 0$의 실근**이고, **교점의 개수는 판별식 $D$의 부호에 따른 실근의 개수**와 $100\\%$ 일치합니다.',
          trapAlert: {
            title: '그래프가 "항상 x축보다 위쪽에 있다"는 조건은 D > 0이 아니라 D < 0!',
            description:
              '"이차함수 $y = x^2 + ax + b$의 그래프가 항상 $x$축보다 위쪽에 있다($y > 0$)"라는 문장에서 "위쪽"이라는 단어에 속아 $D > 0$을 쓰면 오답입니다! 항상 $x$축 위에 떠 있다는 것은 **$x$축과 만나는 교점이 $0$개**라는 뜻이므로, 아래로 볼록($a > 0$)이면서 **판별식은 반드시 $D < 0$**이어야 합니다!'
          }
        },
        formulas: [
          {
            id: 'ch5-s1-f1',
            name: '이차함수의 그래프와 x축의 교점 개수 판별',
            latex: 'D > 0 \\iff \\text{서로 다른 두 점}, \\quad D = 0 \\iff \\text{한 점(접함)}, \\quad D < 0 \\iff \\text{만나지 않음}',
            clozeLatex: 'D > 0 \\iff \\text{서로 다른 두 점}, \\quad \\boxed{?} \\iff \\text{한 점(접함)}, \\quad D < 0 \\iff \\text{만나지 않음}',
            clozeAnswer: 'D = 0',
            whyItWorks:
              '$y = ax^2 + bx + c$에 $y = 0$을 대입한 실계수 방정식 $ax^2 + bx + c = 0$의 실근의 개수가 곧 $x$축 위의 교점 개수이므로, 최고차항 계수 $a$의 부호와 무관하게 $D = b^2 - 4ac$의 부호로 결정됩니다.',
            memoryTip:
              '아래로 볼록이든 위로 볼록이든 교점 개수는 똑같이 **$D > 0$(2개), $D = 0$(1개·접함), $D < 0$(0개)**! 단, "**$x$축과 만난다**"는 두 점과 한 점을 모두 포함하므로 **$D \\ge 0$**입니다.'
          },
          {
            id: 'ch5-s1-f2',
            name: '포물선과 x축의 두 교점 사이의 거리',
            latex: '\\text{두 교점 } (\\alpha, 0), (\\beta, 0) \\text{ 사이의 거리 } = |\\alpha - \\beta| = \\frac{\\sqrt{b^2 - 4ac}}{|a|}',
            clozeLatex: '\\text{두 교점 } (\\alpha, 0), (\\beta, 0) \\text{ 사이의 거리 } = |\\alpha - \\beta| = \\boxed{?}',
            clozeAnswer: '\\frac{\\sqrt{b^2 - 4ac}}{|a|}',
            whyItWorks:
              '$x$축 위의 두 교점의 $y$좌표는 모두 $0$이므로 선분의 길이는 $|\\alpha - \\beta|$이고, $(\\alpha - \\beta)^2 = (\\alpha + \\beta)^2 - 4\\alpha\\beta$에 근과 계수의 관계를 대입하면 유도됩니다.',
            memoryTip:
              '분수 공식이 헷갈릴 때는 억지로 외우지 말고 **두 근의 합과 곱을 구한 뒤 $(\\alpha - \\beta)^2 = (\\alpha + \\beta)^2 - 4\\alpha\\beta$**에 대입하면 실수 확률이 $0\\%$가 됩니다!'
          },
          {
            id: 'ch5-s1-f3',
            name: '포물선 전체가 항상 x축 위쪽에 떠 있을 조건',
            latex: '\\text{모든 실수 } x \\text{에 대하여 } ax^2 + bx + c > 0 \\iff a > 0 \\; \\text{이고} \\; D = b^2 - 4ac < 0',
            clozeLatex: '\\text{모든 실수 } x \\text{에 대하여 } ax^2 + bx + c > 0 \\iff a > 0 \\; \\text{이고} \\; \\boxed{?}',
            clozeAnswer: 'D = b^2 - 4ac < 0',
            whyItWorks:
              '포물선이 항상 $y > 0$ 영역에만 있으려면 아래로 볼록($a > 0$)이어야 하고, $x$축($y = 0$)과 단 한 번도 닿지 않아야 하므로 실근이 없어야($D < 0$) 합니다.',
            memoryTip:
              '$x$축 위에 공중부양한 스마일 모양 포물선을 상상하세요! **스마일 모양($a > 0$) + 바닥($x$축)과 교점 없음($D < 0$)** 두 조건의 조합입니다.'
          }
        ],
        logicChain: {
          id: 'ch5-s1-lc',
          title: 'x축과의 두 교점 사이 거리 조건으로 미정계수 결정하기',
          goalStatement: '이차함수 $y = x^2 - 2kx + 2k + 3$의 그래프가 $x$축과 만나는 두 점 사이의 거리가 $2\\sqrt{5}$일 때, 양수 $k$의 값을 구하시오.',
          steps: [
            {
              stepNo: 1,
              badge: '실근으로 번역',
              statement: '$x$축($y = 0$)과 만나는 두 교점의 $x$좌표 $\\alpha, \\beta$는 방정식 $x^2 - 2kx + 2k + 3 = 0$의 두 실근과 같다.',
              reason: '기하학적인 그래프의 교점을 대수적인 이차방정식의 실근으로 바꾸는 첫걸음입니다.'
            },
            {
              stepNo: 2,
              badge: '합과 곱 추출',
              statement: '근과 계수의 관계로부터 두 실근의 합 $\\alpha + \\beta = 2k$, 두 실근의 곱 $\\alpha\\beta = 2k + 3$을 얻는다.',
              reason: '근의 공식을 쓰지 않고 두 교점 사이의 거리 $|\\alpha - \\beta|$를 $k$의 다항식으로 나타내기 위함입니다.'
            },
            {
              stepNo: 3,
              badge: '거리 제곱 등식',
              statement: '두 점 사이의 거리가 $2\\sqrt{5}$이므로 $(\\alpha - \\beta)^2 = (\\alpha + \\beta)^2 - 4\\alpha\\beta = 4k^2 - 4(2k + 3) = 20$을 세운다.',
              reason: '양변을 제곱한 곱셈공식의 변형을 이용하면 근호 없이 깔끔한 이차방정식이 만들어집니다.'
            },
            {
              stepNo: 4,
              badge: '해 도출 및 검증',
              statement: '양변을 $4$로 나누어 정리한 $k^2 - 2k - 8 = (k - 4)(k + 2) = 0$에서 양수 조건에 의해 $k = 4$를 확정한다.',
              reason: '$k = 4$일 때 판별식 $D/4 = 16 - 11 = 5 > 0$이므로 서로 다른 두 교점 존재 조건도 완벽히 만족합니다.'
            }
          ]
        },
        oxQuizzes: [
          {
            id: 'ch5-s1-ox1',
            statement: '위로 볼록한 이차함수 $y = -x^2 + 4x - 5$의 그래프는 판별식 $D = 16 - 20 = -4 < 0$이므로 $x$축과 만나지 않는다.',
            answer: true,
            explanation:
              '참입니다! 위로 볼록($a < 0$)하더라도 $x$축과의 교점 개수는 판별식 $D$의 부호로 결정됩니다. $D < 0$이므로 그래프 전체가 $x$축 아래쪽에 놓여 만나지 않습니다.'
          },
          {
            id: 'ch5-s1-ox2',
            statement: '이차함수 $y = x^2 - 6x + k$의 그래프가 $x$축에 접하려면 상수 $k > 9$이어야 한다.',
            answer: false,
            explanation:
              '거짓입니다! $x$축에 접한다는 것은 한 점에서 만난다(중근)는 뜻이므로 $\\dfrac{D}{4} = (-3)^2 - k = 9 - k = 0$, 즉 $k = 9$이어야 합니다.'
          },
          {
            id: 'ch5-s1-ox3',
            statement: '포물선 $y = ax^2 + bx + c$가 $x$축과 두 점 $(-1, 0), (5, 0)$에서 만나면 이 포물선의 대칭축은 직선 $x = 2$이다.',
            answer: true,
            explanation:
              '참입니다! 이차함수의 그래프는 대칭축에 대하여 좌우 대칭이므로, $x$축과 만나는 두 교점의 중점 $x = \\dfrac{-1 + 5}{2} = 2$가 곧 대칭축의 방정식이 됩니다.'
          }
        ],
        problems: [
          {
            id: 'ch5-s1-p1',
            wave: 2,
            difficulty: 1,
            typeTag: 'x축 교점 좌표로 계수 구하기',
            question: '포물선 $y = 2x^2 + ax + b$가 $x$축과 두 점 $(-2, 0), (3, 0)$에서 만날 때, 두 상수 $a, b$에 대하여 $a - b$의 값은?',
            choices: ['$-14$', '$-10$', '$10$', '$14$'],
            answerIndex: 2,
            hint: '$-2$와 $3$이 방정식 $2x^2 + ax + b = 0$의 두 근이므로 $2(x + 2)(x - 3)$을 전개해 계수를 비교하세요!',
            explanation:
              '$-2$와 $3$이 이차방정식 $2x^2 + ax + b = 0$의 두 실근이므로 $2(x + 2)(x - 3) = 2x^2 - 2x - 12 = 0$과 계수가 일치해야 합니다. 따라서 $a = -2, b = -12$이므로 $a - b = -2 - (-12) = 10$입니다.'
          },
          {
            id: 'ch5-s1-p2',
            wave: 2,
            difficulty: 2,
            typeTag: 'k에 관계없이 x축에 접할 조건',
            question: '실수 $k$의 값에 관계없이 이차함수 $y = x^2 + 2(k - a)x + k^2 - 4k + b$의 그래프가 항상 $x$축에 접할 때, 두 실수 $a, b$의 곱 $ab$의 값은?',
            choices: ['$4$', '$8$', '$12$', '$16$'],
            answerIndex: 1,
            hint: '$x$축에 접하므로 $\\dfrac{D}{4} = 0$을 먼저 세우고, 그 식이 모든 실수 $k$에 대해 성립하는 항등식임을 이용하세요.',
            explanation:
              '$x$축에 접하므로 $\\dfrac{D}{4} = (k - a)^2 - (k^2 - 4k + b) = (-2a + 4)k + (a^2 - b) = 0$입니다. 실수 $k$의 값에 관계없이 성립해야 하므로 $-2a + 4 = 0, a^2 - b = 0$에서 $a = 2, b = 4$이고, $ab = 8$입니다.'
          },
          {
            id: 'ch5-s1-p3',
            wave: 2,
            difficulty: 2,
            typeTag: '두 포물선의 x축 위치 관계 연립',
            question: '두 이차함수 중 $y = x^2 - 4x + k$의 그래프는 $x$축과 서로 다른 두 점에서 만나고, $y = x^2 + 2x + k + 1$의 그래프는 $x$축과 만나지 않도록 하는 정수 $k$의 개수는?',
            choices: ['$3$개', '$4$개', '$5$개', '$6$개'],
            answerIndex: 0,
            hint: '첫째 함수는 $D_1 / 4 > 0$, 둘째 함수는 $D_2 / 4 < 0$을 세워 공통 범위를 구하세요!',
            explanation:
              '첫째 함수가 서로 다른 두 점에서 만나므로 $\\dfrac{D_1}{4} = (-2)^2 - k = 4 - k > 0 \\implies k < 4$입니다. 둘째 함수가 만나지 않으므로 $\\dfrac{D_2}{4} = 1^2 - (k + 1) = -k < 0 \\implies k > 0$입니다. 공통 범위 $0 < k < 4$를 만족하는 정수 $k$는 $1, 2, 3$의 $3$개입니다.'
          },
          {
            id: 'ch5-s1-p4',
            wave: 3,
            difficulty: 3,
            typeTag: '포물선의 대칭성과 합성근 보스전',
            question: '대칭축이 직선 $x = 3$인 이차함수 $y = f(x)$의 그래프가 $x$축과 서로 다른 두 점에서 만날 때, 방정식 $f(2x - 4) = 0$의 서로 다른 두 실근의 합은?',
            choices: ['$4$', '$5$', '$6$', '$7$'],
            answerIndex: 3,
            hint: '대칭축이 $x = 3$이면 $f(x) = 0$의 두 실근 $\\alpha, \\beta$의 중점이 $3$이므로 $\\alpha + \\beta = 6$입니다!',
            explanation:
              '$y = f(x)$가 $x$축과 만나는 두 점의 $x$좌표를 $\\alpha, \\beta$라 하면, 대칭축이 $x = 3$이므로 $\\dfrac{\\alpha + \\beta}{2} = 3 \\implies \\alpha + \\beta = 6$입니다. 이제 $f(2x - 4) = 0$에서 $2x - 4 = \\alpha$ 또는 $2x - 4 = \\beta$이므로 두 실근은 $\\dfrac{\\alpha + 4}{2}, \\dfrac{\\beta + 4}{2}$이고, 그 합은 $\\dfrac{(\\alpha + \\beta) + 8}{2} = \\dfrac{6 + 8}{2} = 7$입니다.'
          }
        ]
      },
      {
        id: 'ch5-s2',
        chapterId: 'ch5',
        order: 14,
        code: 'STAGE 14',
        title: '이차함수의 그래프와 직선의 위치 관계',
        tagline: '기울어진 직선을 x축처럼 평평하게 펴는 차함수 f(x) - g(x) = 0의 마법',
        estimatedMinutes: 8,
        feynman: {
          hookQuestion: '포물선 $y = ax^2 + bx + c$와 비스듬한 직선 $y = mx + n$이 접하는지 두 점에서 만나는지, 모눈종이에 그려보지 않고도 단번에 판정하는 원리는 무엇일까요?',
          intuition:
            '교점이란 두 그래프의 **$x$좌표와 $y$좌표가 동시에 일치하는 점**입니다. 두 식의 $y$를 같다고 놓으면 $ax^2 + bx + c = mx + n$이 되고, 우변을 통째로 좌변으로 이양하면 **$ax^2 + (b - m)x + (c - n) = 0$**이라는 하나의 이차방정식(차방정식)으로 합쳐집니다! 기하학적으로 이 과정은 **비스듬히 기울어진 직선 $y = mx + n$을 수평한 $x$축($y = 0$)으로 반듯하게 펴는 변환**과 정확히 같습니다. 따라서 포물선과 직선의 교점 개수는 이양해서 만든 차방정식의 **판별식 $D = (b - m)^2 - 4a(c - n)$의 부호** 하나로 완벽히 결정됩니다!',
          keyInsight:
            '이차함수 $y = f(x)$와 직선 $y = g(x)$의 위치 관계나 교점이 등장하면, 즉시 **차방정식 $f(x) - g(x) = 0$을 만든 뒤 판별식 $D$와 근과 계수의 관계**를 적용하세요.',
          trapAlert: {
            title: '이양할 때 부호 실수와 기울어진 직선 위의 두 교점 거리 함정!',
            description:
              '첫째, 판별식은 원래 포물선이 아니라 **두 식을 연립해 한쪽으로 완전히 정리한 방정식**에 써야 합니다($c + n$이 아니라 $c - n$!). 둘째, 기울기가 $m$인 직선 위의 두 교점 $A(\\alpha, y_1), B(\\beta, y_2)$ 사이의 거리는 단순한 $|\\alpha - \\beta|$가 아니라 피타고라스 정리에 의해 **$\\sqrt{1 + m^2}|\\alpha - \\beta|$**임을 절대 잊지 마세요!'
          }
        },
        formulas: [
          {
            id: 'ch5-s2-f1',
            name: '이차함수와 직선의 차방정식 및 위치 관계 판별식',
            latex: 'ax^2 + bx + c = mx + n \\iff ax^2 + (b - m)x + (c - n) = 0, \\quad D = (b - m)^2 - 4a(c - n)',
            clozeLatex: 'ax^2 + bx + c = mx + n \\iff ax^2 + (b - m)x + (c - n) = 0, \\quad D = \\boxed{?}',
            clozeAnswer: '(b - m)^2 - 4a(c - n)',
            whyItWorks:
              '두 그래프의 교점의 $x$좌표는 연립한 이차방정식의 실근과 일치하므로 $D > 0$이면 서로 다른 두 점, $D = 0$이면 한 점(접함), $D < 0$이면 만나지 않습니다.',
            memoryTip:
              '문자 공식을 통째로 외우기보다 **"두 식 같다 놓고 좌변 이양 → 내림차순 정리 → 판별식 $D$"** 3단 콤보 손동작으로 익히면 부호 실수가 사라집니다!'
          },
          {
            id: 'ch5-s2-f2',
            name: '포물선에 접하는 직선(접선)의 판별 조건',
            latex: 'y = ax^2 + bx + c \\text{와 } y = mx + n \\text{이 접한다} \\iff D = (b - m)^2 - 4a(c - n) = 0',
            clozeLatex: 'y = ax^2 + bx + c \\text{와 } y = mx + n \\text{이 접한다} \\iff \\boxed{?}',
            clozeAnswer: 'D = (b - m)^2 - 4a(c - n) = 0',
            whyItWorks:
              '직선이 포물선에 스치듯 접할 때 두 그래프는 단 하나의 공유점(접점)을 가지며, 차방정식이 중근을 가질 때 그 중근이 곧 접점의 $x$좌표가 됩니다.',
            memoryTip:
              '기울기 $m$을 알면 $y = mx + n$으로 두고 $D = 0$, 지나는 한 점 $(x_1, y_1)$을 알면 $y = m(x - x_1) + y_1$로 두고 $D = 0$을 풀면 끝납니다!'
          },
          {
            id: 'ch5-s2-f3',
            name: '교점 x좌표로 세우는 차함수 인수정리 공식',
            latex: 'y = f(x) \\text{와 } y = mx + n \\text{의 교점 } x\\text{좌표가 } \\alpha, \\beta \\iff f(x) - (mx + n) = a(x - \\alpha)(x - \\beta)',
            clozeLatex: 'y = f(x) \\text{와 } y = mx + n \\text{의 교점 } x\\text{좌표가 } \\alpha, \\beta \\iff f(x) - (mx + n) = \\boxed{?}',
            clozeAnswer: 'a(x - \\alpha)(x - \\beta)',
            whyItWorks:
              '이차식 $f(x)$에서 일차식 $mx + n$을 빼더라도 이차항의 계수 $a$는 변하지 않으며, 방정식 $f(x) - (mx + n) = 0$의 두 근이 $\\alpha, \\beta$이므로 인수정리에 의해 즉시 성립합니다.',
            memoryTip:
              '**일차식을 빼도 최고차항 계수 $a$는 불변!** 교점의 $x$좌표 두 개가 보이면 전개식 대신 $f(x) - g(x) = a(x - \\alpha)(x - \\beta)$로 단숨에 식을 세우세요.'
          }
        ],
        logicChain: {
          id: 'ch5-s2-lc',
          title: '곡선 밖의 한 점에서 포물선에 그은 두 접선의 기울기 곱 유도',
          goalStatement: '점 $(0, -3)$에서 이차함수 $y = x^2 - 2x + 1$의 그래프에 그은 두 접선의 기울기의 곱을 구하시오.',
          steps: [
            {
              stepNo: 1,
              badge: '접선 미지수 설정',
              statement: '점 $(0, -3)$을 지나는 접선의 기울기를 $m$이라 두고 직선의 방정식을 $y = mx - 3$으로 설정한다.',
              reason: '$y$절편이 $-3$으로 주어져 있으므로 기울기 $m$ 하나만으로 직선을 완전히 표현할 수 있습니다.'
            },
            {
              stepNo: 2,
              badge: '차방정식 정리',
              statement: '포물선과 직선을 연립한 $x^2 - 2x + 1 = mx - 3$을 좌변으로 이양하여 $x^2 - (m + 2)x + 4 = 0$으로 정리한다.',
              reason: '두 그래프가 접하는 기하 조건을 이차방정식의 중근 조건으로 바꾸기 위해 내림차순 정리합니다.'
            },
            {
              stepNo: 3,
              badge: '접함 조건 D = 0',
              statement: '접선이므로 판별식 $D = \\{-(m + 2)\\}^2 - 4 \\cdot 1 \\cdot 4 = m^2 + 4m - 12 = 0$을 세운다.',
              reason: '포물선과 직선이 한 점에서 접할 필요충분조건은 차방정식의 판별식 $D = 0$이기 때문입니다.'
            },
            {
              stepNo: 4,
              badge: '기울기 곱 도출',
              statement: '$m$에 대한 이차방정식 $m^2 + 4m - 12 = 0$에 근과 계수의 관계를 적용하여 두 기울기의 곱 $m_1 m_2 = -12$를 확정한다.',
              reason: '실제로 인수분해하여 $m = 2$ 또는 $m = -6$을 구해 곱해도 $-12$로 완벽히 일치합니다.'
            }
          ]
        },
        oxQuizzes: [
          {
            id: 'ch5-s2-ox1',
            statement: '이차함수 $y = x^2 + 2x + 3$의 그래프와 직선 $y = 2x + 1$은 교점을 갖지 않는다.',
            answer: true,
            explanation:
              '참입니다! 두 식을 연립하면 $x^2 + 2x + 3 = 2x + 1 \\iff x^2 + 2 = 0$이 되어 실근이 존재하지 않으므로($D < 0$) 두 그래프는 만나지 않습니다.'
          },
          {
            id: 'ch5-s2-ox2',
            statement: '포물선 $y = ax^2 + bx + c$와 직선 $y = mx + n$이 두 점에서 만날 때, 두 교점의 $x$좌표의 합은 기울기 $m$에 관계없이 항상 일정하다.',
            answer: false,
            explanation:
              '거짓입니다! 차방정식 $ax^2 + (b - m)x + (c - n) = 0$에서 두 근의 합은 $\\dfrac{m - b}{a}$이므로 기울기 $m$이 달라지면 합도 달라집니다. ($y$절편 $n$만 변할 때 합이 일정합니다!)'
          },
          {
            id: 'ch5-s2-ox3',
            statement: '$y$축에 평행하지 않은 임의의 직선 $y = mx + k$는 적당히 $y$축 방향으로 평행이동하면 포물선 $y = x^2$에 항상 접하게 할 수 있다.',
            answer: true,
            explanation:
              '참입니다! 어떤 실수 기울기 $m$이 주어지더라도 $x^2 - mx - n = 0$에서 $D = m^2 + 4n = 0$, 즉 $y$절편을 $n = -\\dfrac{m^2}{4}$으로 옮기면 포물선 $y = x^2$에 정확히 접합니다.'
          }
        ],
        problems: [
          {
            id: 'ch5-s2-p1',
            wave: 2,
            difficulty: 1,
            typeTag: '기울기가 주어진 접선의 방정식',
            question: '직선 $y = x + 2$에 평행하고 이차함수 $y = x^2 - 3x + 5$의 그래프에 접하는 직선의 방정식을 $y = mx + n$이라 할 때, 상수 $m, n$의 합 $m + n$의 값은?',
            choices: ['$0$', '$1$', '$2$', '$3$'],
            answerIndex: 2,
            hint: '평행하므로 기울기 $m = 1$입니다. $x^2 - 3x + 5 = x + n$으로 놓고 이양한 뒤 $\\dfrac{D}{4} = 0$을 푸세요!',
            explanation:
              '직선 $y = x + 2$에 평행하므로 기울기 $m = 1$입니다. $x^2 - 3x + 5 = x + n$을 이양하면 $x^2 - 4x + (5 - n) = 0$이고, 접하므로 $\\dfrac{D}{4} = (-2)^2 - (5 - n) = n - 1 = 0$에서 $n = 1$입니다. 따라서 $m + n = 2$입니다.'
          },
          {
            id: 'ch5-s2-p2',
            wave: 2,
            difficulty: 2,
            typeTag: '직선과의 교점과 유리계수 켤레근',
            question: '두 유리수 $a, b$에 대하여 이차함수 $y = x^2 + ax + 5$의 그래프와 직선 $y = 3x + b$의 두 교점 중 한 교점의 $x$좌표가 $2 + \\sqrt{3}$일 때, $a + b$의 값은?',
            choices: ['$1$', '$3$', '$5$', '$7$'],
            answerIndex: 1,
            hint: '연립한 방정식 $x^2 + (a - 3)x + (5 - b) = 0$의 계수가 모두 유리수이므로 다른 한 근은 $2 - \\sqrt{3}$입니다!',
            explanation:
              '두 식을 연립하면 $x^2 + (a - 3)x + (5 - b) = 0$입니다. $a, b$가 유리수이므로 다른 한 근은 켤레근 $2 - \\sqrt{3}$입니다. 근과 계수의 관계에서 합 $4 = -(a - 3) \\implies a = -1$, 곱 $(2 + \\sqrt{3})(2 - \\sqrt{3}) = 1 = 5 - b \\implies b = 4$이므로 $a + b = 3$입니다.'
          },
          {
            id: 'ch5-s2-p3',
            wave: 2,
            difficulty: 2,
            typeTag: '포물선이 직선보다 항상 위쪽일 조건',
            question: '포물선 $y = x^2 + kx + 5$가 직선 $y = 2x + 1$보다 항상 위쪽에 있도록 하는 정수 $k$의 개수는?',
            choices: ['$7$개', '$8$개', '$9$개', '$10$개'],
            answerIndex: 0,
            hint: '모든 실수 $x$에 대하여 $x^2 + kx + 5 > 2x + 1 \\iff x^2 + (k - 2)x + 4 > 0$이므로 판별식 $D < 0$이어야 합니다!',
            explanation:
              '포물선이 직선보다 항상 위쪽에 있으려면 모든 실수 $x$에 대해 $x^2 + (k - 2)x + 4 > 0$이어야 합니다. 아래로 볼록하므로 교점이 없어야 해 $D = (k - 2)^2 - 16 < 0 \\iff -4 < k - 2 < 4 \\iff -2 < k < 6$입니다. 따라서 정수 $k$는 $-1, 0, 1, 2, 3, 4, 5$의 $7$개입니다.'
          },
          {
            id: 'ch5-s2-p4',
            wave: 3,
            difficulty: 3,
            typeTag: '포물선과 직선 교점 현의 길이 보스전',
            question: '두 그래프 $y = x^2 - 2x - 1$과 $y = x + 3$이 만나는 두 점을 $A, B$라 할 때, 선분 $AB$의 길이는?',
            choices: ['$5$', '$4\\sqrt{2}$', '$6$', '$5\\sqrt{2}$'],
            answerIndex: 3,
            hint: '주의! 직선이 기울어져 있으므로 두 교점의 $x$좌표 차 $|\\alpha - \\beta| = 5$가 바로 선분의 길이가 아닙니다. 두 교점의 좌표 $(x, y)$를 모두 구해 거리를 계산하세요!',
            explanation:
              '두 식을 연립하면 $x^2 - 2x - 1 = x + 3 \\iff x^2 - 3x - 4 = (x + 1)(x - 4) = 0$이므로 $x = -1$ 또는 $x = 4$입니다. 직선 $y = x + 3$에 대입하면 두 교점은 $A(-1, 2), B(4, 7)$이므로 $AB = \\sqrt{(4 - (-1))^2 + (7 - 2)^2} = \\sqrt{25 + 25} = 5\\sqrt{2}$입니다.'
          }
        ]
      },
      {
        id: 'ch5-s3',
        chapterId: 'ch5',
        order: 15,
        code: 'STAGE 15',
        title: '이차함수의 최대·최소와 제한된 범위',
        tagline: '대칭축이 구간 안에 들어왔는가 벗어났는가! 3가지 케이스 완벽 지배',
        estimatedMinutes: 9,
        feynman: {
          hookQuestion: '제한된 범위 $\\alpha \\le x \\le \\beta$에서 양 끝 값 $f(\\alpha), f(\\beta)$만 대입해 큰 값을 최댓값, 작은 값을 최솟값이라고 쓰면 왜 절반 이상 틀리게 될까요?',
          intuition:
            '일차함수의 직선은 한 방향으로만 쭉 가지만, 이차함수의 포물선은 **꼭짓점(대칭축 $x = p$)에서 진행 방향을 정반대로 꺾는 대칭 곡선**이기 때문입니다! 제한된 범위 $\\alpha \\le x \\le \\beta$라는 창문으로 그래프를 잘라낼 때 가장 먼저 던져야 할 질문은 단 하나, **"대칭축 $x = p$가 이 창문 안에 들어 있는가?"**입니다. 대칭축이 구간 안에 포함되면($\\alpha \\le p \\le \\beta$) 그래프가 구간 안에서 꺾이므로 꼭짓점이 최댓값 또는 최솟값 중 하나를 독차지하고, **대칭축에서 수평 거리가 더 먼 끝점**이 나머지 하나를 가져갑니다. 반대로 대칭축이 구간 밖으로 벗어나면($p < \\alpha$ 또는 $p > \\beta$) 구간 안에서는 꺾이지 않고 한 방향으로만 변하므로 양 끝점 $f(\\alpha), f(\\beta)$에서만 최대·최소가 나옵니다!',
          keyInsight:
            '제한된 범위 $\\alpha \\le x \\le \\beta$의 최대·최소는 **① 대칭축 $x = p$ 구하기 → ② 축이 구간 안인지 밖인지 $3$케이스($p < \\alpha$, $\\alpha \\le p \\le \\beta$, $p > \\beta$) 판정 → ③ 축으로부터의 거리 비교** 순서로 $100\\%$ 해결됩니다.',
          trapAlert: {
            title: '공통부분을 t로 치환할 때 "t의 새로운 제한 범위"를 빠뜨리면 100% 오답!',
            description:
              '$y = (x^2 - 2x)^2 - 4(x^2 - 2x) + 3$처럼 반복되는 식을 $t = x^2 - 2x$로 치환할 때, $x$가 모든 실수라고 해서 $t$도 모든 실수라고 착각하면 치명적입니다! $t = (x - 1)^2 - 1 \\ge -1$처럼 **치환하는 순간 $t$에 새로운 제한 범위가 자동으로 탄생**하므로, 반드시 $t$의 범위부터 먼저 구해 옆에 적어두세요!'
          }
        },
        formulas: [
          {
            id: 'ch5-s3-f1',
            name: '이차함수의 표준형 변형과 대칭축 방정식',
            latex: 'y = ax^2 + bx + c = a(x - p)^2 + q, \\quad \\text{대칭축 } x = p = -\\frac{b}{2a}',
            clozeLatex: 'y = ax^2 + bx + c = a(x - p)^2 + q, \\quad \\text{대칭축 } x = p = \\boxed{?}',
            clozeAnswer: '-\\frac{b}{2a}',
            whyItWorks:
              '실수 전체에서 $(x - p)^2 \\ge 0$이므로 $a > 0$이면 $x = p$에서 최솟값 $q$(최댓값 없음), $a < 0$이면 $x = p$에서 최댓값 $q$(최솟값 없음)를 갖습니다.',
            memoryTip:
              '완전제곱식을 다 만들기도 전에 **대칭축 공식 $x = -\\dfrac{b}{2a}$**를 먼저 구하는 습관을 들이면 축이 구간 안인지 밖인지 1초 만에 판단할 수 있습니다!'
          },
          {
            id: 'ch5-s3-f2',
            name: '제한된 범위 [α, β] 내부에 대칭축이 포함될 때 (α ≤ p ≤ β)',
            latex: 'a > 0, \\; \\alpha \\le p \\le \\beta \\implies \\min = f(p), \\quad \\max = \\max\\{f(\\alpha), f(\\beta)\\}',
            clozeLatex: 'a > 0, \\; \\alpha \\le p \\le \\beta \\implies \\min = \\boxed{?}, \\quad \\max = \\max\\{f(\\alpha), f(\\beta)\\}',
            clozeAnswer: 'f(p)',
            whyItWorks:
              '포물선은 $x = p$에 대해 좌우 대칭이므로 $a > 0$일 때 꼭짓점 $x = p$에서 가장 낮고, 축으로부터 거리 $|x - p|$가 멀어질수록 함숫값이 커집니다($a < 0$이면 정반대!).',
            memoryTip:
              '양 끝 값을 둘 다 계산할 필요 없습니다! **대칭축 $x = p$에서 숫자가 더 멀리 떨어진 쪽 끝점 하나만** 대입하면 반대쪽 값이 즉시 나옵니다.'
          },
          {
            id: 'ch5-s3-f3',
            name: '제한된 범위 [α, β] 바깥에 대칭축이 놓일 때 (p < α 또는 p > β)',
            latex: 'p < \\alpha \\; \\text{또는} \\; p > \\beta \\implies \\text{최댓값과 최솟값은 양 끝 함숫값 } f(\\alpha), f(\\beta) \\text{에서 결정}',
            clozeLatex: 'p < \\alpha \\; \\text{또는} \\; p > \\beta \\implies \\text{최댓값과 최솟값은 양 끝 함숫값 } \\boxed{?} \\text{에서 결정}',
            clozeAnswer: 'f(\\alpha), f(\\beta)',
            whyItWorks:
              '꼭짓점이 제한된 구간 밖에 있으므로 구간 $[\\alpha, \\beta]$ 안에서 그래프는 오직 증가만 하거나 감소만 합니다. 따라서 꼭짓점의 $y$좌표는 구간 밖의 허상입니다!',
            memoryTip:
              '대칭축이 미지수 $x = a$로 주어지면 무조건 **Case 1 ($a < \\alpha$), Case 2 ($\\alpha \\le a \\le \\beta$), Case 3 ($a > \\beta$)** 세 영역으로 나누어 풀고 구한 $a$가 각 영역 조건에 맞는지 검산하세요!'
          }
        ],
        logicChain: {
          id: 'ch5-s3-lc',
          title: '공통부분 치환과 제한된 범위 생성을 통한 4차식의 최대·최소 해법',
          goalStatement: '제한된 범위 $-1 \\le x \\le 2$에서 함수 $y = (x^2 - 2x)^2 - 4(x^2 - 2x) + 3$의 최댓값과 최솟값의 합을 구하시오.',
          steps: [
            {
              stepNo: 1,
              badge: '공통부분 치환',
              statement: '반복되는 이차식 $t = x^2 - 2x = (x - 1)^2 - 1$로 치환하여 주어진 함수를 $y = t^2 - 4t + 3$으로 바꾼다.',
              reason: '복잡한 $4$차 함수를 우리가 다룰 수 있는 $t$에 대한 이차함수로 차수를 낮추기 위함입니다.'
            },
            {
              stepNo: 2,
              badge: 't의 새 범위 확정',
              statement: '$-1 \\le x \\le 2$ 안에 축 $x = 1$이 속하므로, 꼭짓점 $x = 1$에서 $t = -1$, 더 먼 끝점 $x = -1$에서 $t = 3$을 얻어 $-1 \\le t \\le 3$을 확정한다.',
              reason: '$x$의 범위에 따라 치환한 문자 $t$가 실제로 가질 수 있는 값의 범위를 먼저 한정해야 합니다.'
            },
            {
              stepNo: 3,
              badge: '새 축 포함 확인',
              statement: '$y = t^2 - 4t + 3 = (t - 2)^2 - 1$로 변형하고, 새 대칭축 $t = 2$가 구간 $-1 \\le t \\le 3$ 내부에 포함됨을 확인한다.',
              reason: '$t$의 제한된 범위 $[-1, 3]$ 안에 꼭짓점 $t = 2$가 들어오는지 판정하는 핵심 단계입니다.'
            },
            {
              stepNo: 4,
              badge: '최대·최소 합산',
              statement: '아래로 볼록하므로 $t = 2$에서 최솟값 $m = -1$, 축에서 가장 먼 $t = -1$에서 최댓값 $M = (-1 - 2)^2 - 1 = 8$을 얻어 합 $7$을 확정한다.',
              reason: '대칭축 $t = 2$로부터 $t = 3$까지의 거리($1$)보다 $t = -1$까지의 거리($3$)가 더 멀기 때문입니다.'
            }
          ]
        },
        oxQuizzes: [
          {
            id: 'ch5-s3-ox1',
            statement: '제한된 범위 $2 \\le x \\le 5$에서 이차함수 $y = (x - 1)^2 + 3$의 최솟값은 꼭짓점의 $y$좌표인 $3$이다.',
            answer: false,
            explanation:
              '거짓입니다! 대칭축 $x = 1$이 주어진 범위 $2 \\le x \\le 5$ 바깥에 있으므로 $x = 1$에서의 값은 가질 수 없습니다. 구간 $[2, 5]$에서 최솟값은 $x = 2$일 때 $(2 - 1)^2 + 3 = 4$입니다!'
          },
          {
            id: 'ch5-s3-ox2',
            statement: '실수 전체의 집합에서 정의된 위로 볼록한 이차함수 $y = -2(x + 3)^2 + 7$은 최댓값 $7$을 갖고 최솟값은 없다.',
            answer: true,
            explanation:
              '참입니다! 모든 실수 $x$에 대하여 $-2(x + 3)^2 \\le 0$이므로 $x = -3$일 때 최댓값 $7$을 가지며, 아래로는 한없이 작아지므로 최솟값은 존재하지 않습니다.'
          },
          {
            id: 'ch5-s3-ox3',
            statement: '범위 $-1 \\le x \\le 4$에서 아래로 볼록한 이차함수 $y = (x - 1)^2 + 2$는 대칭축 $x = 1$에서 더 멀리 떨어진 $x = 4$에서 최댓값을 갖는다.',
            answer: true,
            explanation:
              '참입니다! 대칭축 $x = 1$로부터 $x = -1$까지의 거리는 $2$이고 $x = 4$까지의 거리는 $3$이므로, 축에서 더 먼 $x = 4$에서 최댓값 $(4 - 1)^2 + 2 = 11$을 갖습니다.'
          }
        ],
        problems: [
          {
            id: 'ch5-s3-p1',
            wave: 2,
            difficulty: 1,
            typeTag: '제한된 범위의 최댓값과 최솟값',
            question: '구간 $-1 \\le x \\le 3$에서 이차함수 $y = -x^2 + 4x + 1$의 최댓값을 $M$, 최솟값을 $m$이라 할 때, $M - m$의 값은?',
            choices: ['$4$', '$5$', '$8$', '$9$'],
            answerIndex: 3,
            hint: '표준형 $y = -(x - 2)^2 + 5$로 고치면 위로 볼록이고 대칭축 $x = 2$가 구간 $[-1, 3]$ 안에 포함됩니다!',
            explanation:
              '$y = -(x - 2)^2 + 5$이므로 위로 볼록하고 대칭축 $x = 2$가 $-1 \\le x \\le 3$에 포함됩니다. 따라서 $x = 2$일 때 최댓값 $M = 5$이고, 대칭축에서 더 먼 $x = -1$일 때 최솟값 $m = -(-1 - 2)^2 + 5 = -4$이므로 $M - m = 9$입니다.'
          },
          {
            id: 'ch5-s3-p2',
            wave: 2,
            difficulty: 2,
            typeTag: '대칭축이 구간 바깥에 놓인 경우',
            question: '범위 $2 \\le x \\le 4$에서 이차함수 $y = x^2 - 2x + k$의 최솟값이 $5$일 때, 같은 범위에서 이 함수의 최댓값은? (단, $k$는 상수)',
            choices: ['$11$', '$13$', '$14$', '$15$'],
            answerIndex: 1,
            hint: '대칭축이 $x = 1$이므로 주어진 구간 $2 \\le x \\le 4$ 바깥(왼쪽)에 있습니다! 따라서 최솟값은 $x = 1$이 아니라 $x = 2$에서 나옵니다.',
            explanation:
              '$y = (x - 1)^2 + k - 1$에서 대칭축 $x = 1$이 $2 \\le x \\le 4$의 왼쪽 바깥에 있고 아래로 볼록하므로, 구간 $[2, 4]$에서 함수는 계속 증가합니다. 따라서 $x = 2$일 때 최솟값 $f(2) = 4 - 4 + k = k = 5$이고, $x = 4$일 때 최댓값 $f(4) = 16 - 8 + 5 = 13$입니다.'
          },
          {
            id: 'ch5-s3-p3',
            wave: 2,
            difficulty: 2,
            typeTag: '도형에서의 이차함수 최대·최소 활용',
            question: '길이가 $20$인 철사를 남김없이 구부려 직사각형을 만들 때, 이 직사각형의 넓이의 최댓값은? (단, 철사의 두께는 무시한다.)',
            choices: ['$20$', '$24$', '$25$', '$36$'],
            answerIndex: 2,
            hint: '가로의 길이를 $x$라 하면 세로의 길이는 $10 - x$ ($0 < x < 10$)이고, 넓이는 $x(10 - x)$입니다.',
            explanation:
              '직사각형의 가로 길이를 $x$라 하면 둘레가 $20$이므로 세로 길이는 $10 - x$이고, 변의 길이 조건에서 $0 < x < 10$입니다. 넓이 $S = x(10 - x) = -x^2 + 10x = -(x - 5)^2 + 25$이므로 $x = 5$ ($0 < 5 < 10$ 만족)일 때 넓이의 최댓값은 $25$입니다.'
          },
          {
            id: 'ch5-s3-p4',
            wave: 3,
            difficulty: 3,
            typeTag: '미지수 대칭축 3케이스 분류 보스전',
            question: '제한된 범위 $0 \\le x \\le 4$에서 이차함수 $f(x) = x^2 - 2ax + 2a$의 최솟값이 $-3$이 되도록 하는 모든 실수 $a$의 값의 합은?',
            choices: ['$\\dfrac{3}{2}$', '$2$', '$3$', '$\\dfrac{9}{2}$'],
            answerIndex: 0,
            hint: '대칭축 $x = a$의 위치를 (1) $a < 0$, (2) $0 \\le a \\le 4$, (3) $a > 4$ 세 가지 케이스로 나누어 풀고, 구한 $a$가 각 범위에 속하는지 반드시 확인하세요!',
            explanation:
              '$f(x) = (x - a)^2 - a^2 + 2a$의 대칭축은 $x = a$입니다. ① $a < 0$일 때: 구간 $[0, 4]$에서 증가하므로 최솟값 $f(0) = 2a = -3 \\implies a = -\\dfrac{3}{2}$ ($a < 0$ 만족!). ② $0 \\le a \\le 4$일 때: 꼭짓점에서 최솟값 $f(a) = -a^2 + 2a = -3 \\iff (a - 3)(a + 1) = 0$이므로 범위 안의 해는 $a = 3$뿐입니다($-1$은 탈락). ③ $a > 4$일 때: 구간에서 감소하므로 최솟값 $f(4) = 16 - 6a = -3 \\implies a = \\dfrac{19}{6}$인데 $a > 4$에 모순이므로 탈락합니다. 따라서 조건을 만족하는 모든 실수 $a$의 합은 $-\\dfrac{3}{2} + 3 = \\dfrac{3}{2}$입니다.'
          }
        ]
      }
    ]
  };

  const MATH1_EQ_CHAPTERS = [ch4, ch5];

  if (typeof window !== 'undefined') {
    window.MATH1_EQ_CHAPTERS = MATH1_EQ_CHAPTERS;
  }
  if (root) {
    root.MATH1_EQ_CHAPTERS = MATH1_EQ_CHAPTERS;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = MATH1_EQ_CHAPTERS;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
