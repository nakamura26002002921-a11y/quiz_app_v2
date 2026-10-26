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

// CSVテキスト -> questions配列
function loadQuestionsFromCsv(rawText) {
  const text = stripBom(rawText || '');
  const rows = parseCsv(text);
  if (rows.length === 0) return [];
  let startIndex = 0;
  const hasHeader = rows[0].join('').includes('問題') || /question/i.test(rows[0].join(''));
  if (hasHeader) startIndex = 1;

  // 列構成：4列以上 = 問題, ヒント, 解答, 解説 ／ 3列 = 問題, 解答, 解説（旧形式・ヒントなし）
  // ヘッダー行があればその列数、なければ全行の最大列数で判定
  const colCount = hasHeader
    ? rows[0].length
    : Math.max(...rows.map(r => r.length));
  const hasHintCol = colCount >= 4;

  const questions = [];
  for (let i = startIndex; i < rows.length; i++) {
    const row = rows[i];
    const question = (row[0] || '').trim();
    const hint = hasHintCol ? (row[1] || '').trim() : '';
    const answer = ((hasHintCol ? row[2] : row[1]) || '').trim();
    const explanation = ((hasHintCol ? row[3] : row[2]) || '').trim();
    questions.push({ question, hint, answer, explanation });
  }
  return questions;
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
