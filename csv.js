/* ------------------------------ CSV解析 ------------------------------ */
// 簡易CSVパーサ：ダブルクォート・フィールド内改行・エスケープ("")に対応
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  const n = text.length;

  while (i < n) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      field += c; i++; continue;
    } else {
      if (c === '"') { inQuotes = true; i++; continue; }
      if (c === ',') { row.push(field); field = ''; i++; continue; }
      if (c === '\r') { i++; continue; }
      if (c === '\n') {
        row.push(field); field = '';
        rows.push(row); row = [];
        i++; continue;
      }
      field += c; i++; continue;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter(r => !(r.length === 1 && r[0].trim() === ''));
}

function stripBom(text) {
  return text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
}

// CSVテキスト -> { questions, errorMessage }
function loadQuestionsFromCsv(rawText) {
  const text = stripBom(rawText || '');
  if (!text.trim()) return { questions: null, errorMessage: t('errorEmpty') };

  const rows = parseCsv(text);
  let startIndex = 0;
  if (rows[0].join('').includes('問題') || /question/i.test(rows[0].join(''))) startIndex = 1;

  const questions = [];
  for (let i = startIndex; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 3) continue;
    const question = (row[0] || '').trim();
    const answer = (row[1] || '').trim();
    const explanation = (row[2] || '').trim();
    if (!question || !answer) continue;
    questions.push({ question, answer, explanation });
  }

  if (questions.length === 0) return { questions: null, errorMessage: t('errorNoValid') };
  return { questions, errorMessage: null };
}

function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 問題データ配列 -> 選択肢つきクイズ問題配列
function buildQuizQuestions(allQuestions, choiceCount) {
  const uniqueAnswers = Array.from(new Set(allQuestions.map(q => q.answer)));
  return allQuestions.map(q => ({
    data: q,
    choices: buildChoicesFor(q, uniqueAnswers, choiceCount),
  }));
}

function buildChoicesFor(q, uniqueAnswers, choiceCount) {
  const pool = shuffleArray(uniqueAnswers.filter(a => a !== q.answer));
  const dummies = pool.slice(0, Math.max(choiceCount - 1, 0));
  return shuffleArray([q.answer, ...dummies]);
}
