/* ------------------------------ 描画：結果 ------------------------------ */
function renderResult() {
  const { questions, answers } = state.quiz;
  const total = questions.length;
  let correct = 0;
  answers.forEach((a, i) => { if (a === questions[i].data.answer) correct++; });
  const rate = total === 0 ? 0 : Math.round((correct / total) * 100);

  const app = document.getElementById('app');
  app.innerHTML = `
    ${headerHtml(t('resultTitle'))}
    <div class="page center-page">
      <div class="badge-icon">${rate >= 80 ? '🏆' : '📘'}</div>
      <div class="result-score">${escapeHtml(t('resultScore', correct, total))}</div>
      <div class="result-rate">${escapeHtml(t('resultRate', rate))}</div>
      <button class="btn btn-primary" id="retryBtn" style="max-width:320px;">${escapeHtml(t('retry'))}</button>
    </div>
  `;
  bindHeaderCommon();
  document.getElementById('retryBtn').onclick = () => {
    state.quiz = null;
    state.route = 'home';
    render();
  };
}
