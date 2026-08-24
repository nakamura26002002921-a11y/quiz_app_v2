/* ==========================================================================
   状態・定数
   ========================================================================== */

const SAMPLE_CSV =
`問題,解答,解説
日本の首都はどこ？,東京,東京都は1868年以降日本の首都機能が置かれている。
富士山がある都道府県は？（複数のうち代表的な1つ）,静岡県,富士山は静岡県と山梨県にまたがっている。
「桃太郎」に出てこない動物は？,タヌキ,桃太郎の家来はイヌ・サル・キジの3匹。
日本で一番長い川は？,信濃川,信濃川は全長約367kmで日本最長。
江戸幕府を開いたのは誰？,徳川家康,1603年に征夷大将軍に任命され江戸幕府を開いた。
`;

const LS_KEYS = {
  fontScale: 'quizapp.fontScale',
  choiceCount: 'quizapp.choiceCount',
  shuffle: 'quizapp.shuffleOrder',
  lang: 'quizapp.lang',
};

function getLang() {
  const saved = localStorage.getItem(LS_KEYS.lang);
  if (saved && I18N[saved]) return saved;
  const nav = (navigator.language || 'ja').slice(0, 2);
  if (I18N[nav]) return nav;
  return 'ja';
}

/* ---------------------------- アプリ状態 ---------------------------- */
const state = {
  lang: getLang(),
  route: 'home',          // 'home' | 'quiz' | 'result'
  choiceCount: parseInt(localStorage.getItem(LS_KEYS.choiceCount) || '4', 10),
  shuffleOrder: localStorage.getItem(LS_KEYS.shuffle) !== 'false',
  errorMessage: null,
  quiz: null,              // { questions: [...], answers: [...], index: 0 }
};

const fontScale = parseInt(localStorage.getItem(LS_KEYS.fontScale) || '100', 10);
document.documentElement.style.setProperty('--font-scale', (fontScale / 100).toFixed(2));
document.documentElement.lang = state.lang;
