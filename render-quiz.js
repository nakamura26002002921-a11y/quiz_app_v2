/* ------------------------------ 描画：クイズ ------------------------------ */
function renderQuiz() {
  const { questions, answers, index } = state.quiz;
  const total = questions.length;
  const current = questions[index];
  const selected = answers[index];
  const answered = selected !== null;
  const isCorrect = selected === current.data.answer;

  const app = document.getElementById('app');
  app.innerHTML = `
    ${headerHtml(t('quizTitle', index + 1, total), { onBack: true, showEdit: true })}
    <div class="progress-wrap">
      <div class="progress-track"><div class="progress-fill" style="width:${((index) / total) * 100}%;"></div></div>
      <div class="progress-caption"><span>${escapeHtml(t('progress'))}</span><span>${index + 1} / ${total}</span></div>
    </div>

    <div class="quiz-scroll page" id="quizScroll" style="padding-top:0;">
      <div class="question-card">
        <span class="question-tab">Q${index + 1}</span>
        <div class="question-text selectable-text">${escapeHtml(current.data.question)}</div>
      </div>

      <div class="choices" id="choicesWrap">
        ${current.choices.map((choice, ci) => {
          let cls = 'choice-btn';
          let mark = String.fromCharCode(65 + ci);
          if (answered) {
            cls += ' disabled';
            if (choice === current.data.answer) { cls += ' correct'; mark = '✓'; }
            else if (choice === selected) { cls += ' wrong'; mark = '✕'; }
          }
          return `
            <button class="${cls}" data-choice="${escapeHtml(choice)}" ${answered ? 'disabled' : ''}>
              <span class="choice-mark">${mark}</span>
              <span class="selectable-text">${escapeHtml(choice)}</span>
            </button>`;
        }).join('')}
      </div>

      ${answered ? `
        <div class="explain-card ${isCorrect ? 'is-correct' : 'is-wrong'}">
          <div class="explain-title ${isCorrect ? 'is-correct' : 'is-wrong'}">
            <span>${escapeHtml(isCorrect ? t('correctBadge') : t('wrongBadge'))}</span>
          </div>
          <div class="explain-body selectable-text">
            <p><span class="explain-label">${escapeHtml(t('qLabel'))}</span>${escapeHtml(current.data.question)}</p>
            <p><span class="explain-label">${escapeHtml(t('aLabel'))}</span>${escapeHtml(current.data.answer)}</p>
            ${current.data.explanation ? `<p><span class="explain-label">${escapeHtml(t('eLabel'))}</span>${escapeHtmlWithBreaks(current.data.explanation)}</p>` : ''}
          </div>
        </div>
      ` : ''}
    </div>

    <div class="quiz-nav" style="padding-left:18px; padding-right:18px;">
      <button class="btn btn-outline nav-btn" id="prevBtn" ${index === 0 ? 'disabled' : ''}>${escapeHtml(t('prev'))}</button>
      <button class="btn btn-primary nav-btn" id="nextBtn" ${answered ? '' : 'disabled'}>
        ${escapeHtml(index === total - 1 ? t('seeResult') : t('next'))}
      </button>
    </div>
  `;

  bindHeaderCommon();
  document.getElementById('editQuestionBtn').onclick = openEditQuestionSheet;
  document.getElementById('headerBack').onclick = () => {
    if (confirm(t('quizExitConfirm'))) {
      state.quiz = null;
      state.route = 'home';
      render();
    }
  };

  if (!answered) {
    document.querySelectorAll('#choicesWrap .choice-btn').forEach(btn => {
      btn.onclick = () => {
        state.quiz.answers[index] = btn.getAttribute('data-choice');
        renderQuiz();
      };
    });
  }

  document.getElementById('prevBtn').onclick = () => {
    if (state.quiz.index > 0) {
      state.quiz.index -= 1;
      renderQuiz();
      scrollQuizToTop();
    }
  };
  document.getElementById('nextBtn').onclick = () => {
    if (!answered) return;
    if (state.quiz.index === total - 1) {
      state.route = 'result';
      render();
    } else {
      state.quiz.index += 1;
      renderQuiz();
      scrollQuizToTop();
    }
  };

  scrollQuizToTop();
}

function scrollQuizToTop() {
  const scroller = document.getElementById('quizScroll');
  if (scroller) scroller.scrollTop = 0;
  window.scrollTo({ top: 0, behavior: 'auto' });
}

/* ------------------------------ 出題中の問題編集シート ------------------------------ */
function openEditQuestionSheet() {
  const { questions, index } = state.quiz;
  const current = questions[index];

  const layer = document.getElementById('sheetLayer');
  const backdrop = document.createElement('div');
  backdrop.className = 'sheet-backdrop';
  backdrop.innerHTML = `
    <div class="sheet">
      <div class="sheet-handle"></div>
      <h2 class="sheet-title">${escapeHtml(t('editQuestionTitle'))}</h2>
      <p class="editor-hint">${escapeHtml(t('editHint'))}</p>

      <div class="stack">
        <div>
          <label class="field-label" for="editQuestionText">${escapeHtml(t('questionField'))}</label>
          <textarea id="editQuestionText" class="editor-textarea selectable-text" style="min-height:80px;">${escapeHtml(current.data.question)}</textarea>
        </div>
        <div>
          <label class="field-label" for="editAnswerText">${escapeHtml(t('answerField'))}</label>
          <textarea id="editAnswerText" class="editor-textarea selectable-text" style="min-height:48px;">${escapeHtml(current.data.answer)}</textarea>
        </div>
        <div>
          <label class="field-label" for="editExplanationText">${escapeHtml(t('explanationField'))}</label>
          <textarea id="editExplanationText" class="editor-textarea selectable-text" style="min-height:100px;">${escapeHtml(current.data.explanation)}</textarea>
        </div>
      </div>

      <div id="editQuestionError"></div>

      <div class="btn-row" style="margin-top:16px;">
        <button class="btn btn-outline" id="cancelEditQuestionBtn">${escapeHtml(t('cancel'))}</button>
        <button class="btn btn-primary" id="saveEditQuestionBtn">${escapeHtml(t('save'))}</button>
      </div>
    </div>
  `;
  layer.appendChild(backdrop);

  backdrop.onclick = (e) => { if (e.target === backdrop) backdrop.remove(); };
  document.getElementById('cancelEditQuestionBtn').onclick = () => backdrop.remove();

  document.getElementById('saveEditQuestionBtn').onclick = () => {
    const q = document.getElementById('editQuestionText').value.trim();
    const a = document.getElementById('editAnswerText').value.trim();
    const ex = document.getElementById('editExplanationText').value.trim();

    if (!q || !a) {
      document.getElementById('editQuestionError').innerHTML =
        `<div class="editor-errors">${escapeHtml(t('fieldRequired'))}</div>`;
      return;
    }

    // 元データを直接更新（同一オブジェクト参照）
    current.data.question = q;
    current.data.answer = a;
    current.data.explanation = ex;

    // 選択肢を再生成（回答済みの状態はリセットして再解答できるようにする）
    const uniqueAnswers = Array.from(new Set(state.quiz.sourceQuestions.map(x => x.answer)));
    current.choices = buildChoicesFor(current.data, uniqueAnswers, state.choiceCount);
    state.quiz.answers[index] = null;

    backdrop.remove();
    showToast(t('editSaved'));
    renderQuiz();
  };
}
