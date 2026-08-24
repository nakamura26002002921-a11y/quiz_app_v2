/* ------------------------------ 描画：ホーム ------------------------------ */
function renderHome() {
  const app = document.getElementById('app');
  app.innerHTML = `
    ${headerHtml(t('appTitle'))}
    <div class="page center-page">
      <div class="badge-icon">?</div>
      <div class="lede">${escapeHtml(t('homeLede'))}</div>

      <div class="card stack" style="width:100%; text-align:left;">
        <div class="field-row">
          <span class="field-label">${escapeHtml(t('choiceCount'))}</span>
          <select id="choiceCountSelect" class="select-pill">
            ${[2,3,4,5,6].map(n => `<option value="${n}" ${n===state.choiceCount?'selected':''}>${escapeHtml(t('choiceUnit', n))}</option>`).join('')}
          </select>
        </div>
        <div class="field-row">
          <span class="field-label">${escapeHtml(t('shuffleOrder'))}</span>
          <label class="switch">
            <input type="checkbox" id="shuffleToggle" ${state.shuffleOrder ? 'checked' : ''}>
            <span class="slider-toggle"></span>
          </label>
        </div>
      </div>

      <div style="height:20px;"></div>

      <input type="file" id="csvFileInput" accept=".csv,text/csv" style="display:none;">
      <button class="btn btn-primary" id="pickCsvBtn">${escapeHtml(t('pickCsv'))}</button>
    </div>
  `;

  bindHeaderCommon();

  document.getElementById('choiceCountSelect').onchange = (e) => {
    state.choiceCount = parseInt(e.target.value, 10);
    localStorage.setItem(LS_KEYS.choiceCount, String(state.choiceCount));
  };
  document.getElementById('shuffleToggle').onchange = (e) => {
    state.shuffleOrder = e.target.checked;
    localStorage.setItem(LS_KEYS.shuffle, String(state.shuffleOrder));
  };

  document.getElementById('pickCsvBtn').onclick = () => {
    document.getElementById('csvFileInput').click();
  };
  document.getElementById('csvFileInput').onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    startQuizFromCsvText(text);
    e.target.value = '';
  };
}

function startQuizFromCsvText(csvText) {
  let sourceQuestions = loadQuestionsFromCsv(csvText); // 元データ（編集時に直接書き換える）
  let order = sourceQuestions.map((_, i) => i);
  if (state.shuffleOrder) order = shuffleArray(order);

  const quizQuestions = order.map(i => {
    const q = sourceQuestions[i];
    const uniqueAnswers = Array.from(new Set(sourceQuestions.map(x => x.answer)));
    return { data: q, choices: buildChoicesFor(q, uniqueAnswers, state.choiceCount) };
  });

  state.quiz = {
    sourceQuestions,
    questions: quizQuestions,
    answers: new Array(quizQuestions.length).fill(null),
    index: 0,
  };
  state.route = 'quiz';
  render();
}
