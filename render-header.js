/* ------------------------------ 描画：共通ヘッダー ------------------------------ */
function headerHtml(title, opts = {}) {
  const backBtn = opts.onBack
    ? `<button class="icon-btn" id="headerBack" aria-label="back">←</button>`
    : `<span style="width:38px;display:inline-block;"></span>`;
  const editBtn = opts.showEdit
    ? `<button class="icon-btn" id="editQuestionBtn" aria-label="${escapeHtml(t('editThisQuestion'))}" title="${escapeHtml(t('editThisQuestion'))}">✎</button>`
    : '';
  const titleAttr = opts.onTitleClick ? ' id="headerTitle" role="button"' : '';
  return `
    <div class="app-header">
      ${backBtn}
      <h1${titleAttr}>${escapeHtml(title)}</h1>
      <div class="header-actions">
        ${editBtn}
        <button class="icon-btn" id="openSettingsBtn" aria-label="${escapeHtml(t('settingsBtnLabel'))}">Aa</button>
      </div>
    </div>`;
}

function bindHeaderCommon() {
  const settingsBtn = document.getElementById('openSettingsBtn');
  if (settingsBtn) settingsBtn.onclick = openSettingsSheet;
}

/* ------------------------------ 問題番号ジャンプシート ------------------------------ */
function openJumpSheet() {
  const { questions, index } = state.quiz;
  const total = questions.length;

  const layer = document.getElementById('sheetLayer');
  const backdrop = document.createElement('div');
  backdrop.className = 'sheet-backdrop';
  backdrop.innerHTML = `
    <div class="sheet">
      <div class="sheet-handle"></div>
      <h2 class="sheet-title">${escapeHtml(t('jumpTitle'))}</h2>
      <div>
        <label class="field-label" for="jumpNumberInput">${escapeHtml(t('jumpLabel', total))}</label>
        <input id="jumpNumberInput" type="number" min="1" max="${total}" value="${index + 1}" class="editor-textarea">
      </div>
      <div class="btn-row" style="margin-top:16px;">
        <button class="btn btn-outline" id="cancelJumpBtn">${escapeHtml(t('cancel'))}</button>
        <button class="btn btn-primary" id="goJumpBtn">${escapeHtml(t('jumpGo'))}</button>
      </div>
    </div>
  `;
  layer.appendChild(backdrop);

  backdrop.onclick = (e) => { if (e.target === backdrop) backdrop.remove(); };
  document.getElementById('cancelJumpBtn').onclick = () => backdrop.remove();

  document.getElementById('goJumpBtn').onclick = () => {
    const n = parseInt(document.getElementById('jumpNumberInput').value, 10);
    const target = Math.min(Math.max(n, 1), total) - 1;
    backdrop.remove();
    state.quiz.index = target;
    renderQuiz();
    scrollQuizToTop();
  };
}

/* ------------------------------ 設定シート（文字サイズ・言語） ------------------------------ */
function openSettingsSheet() {
  const layer = document.getElementById('sheetLayer');
  const backdrop = document.createElement('div');
  backdrop.className = 'sheet-backdrop';
  const currentPct = Math.round(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--font-scale')) * 100);

  const langOptions = Object.keys(I18N).map(code => {
    const labels = { ja: '日本語', en: 'English', ru: 'Русский' };
    return `<option value="${code}" ${state.lang === code ? 'selected' : ''}>${labels[code] || code}</option>`;
  }).join('');

  backdrop.innerHTML = `
    <div class="sheet">
      <div class="sheet-handle"></div>
      <h2 class="sheet-title">${escapeHtml(t('settingsTitle'))}</h2>

      <div class="setting-row">
        <span class="setting-label">${escapeHtml(t('language'))}</span>
        <select id="languageSelect" class="select-pill">${langOptions}</select>
      </div>

      <div class="setting-row">
        <span class="setting-label">${escapeHtml(t('fontSize'))}</span>
        <div class="font-stepper">
          <button id="fontDown" class="stepper-btn" aria-label="-">A-</button>
          <span id="fontSizeLabel" class="stepper-value">${currentPct}%</span>
          <button id="fontUp" class="stepper-btn" aria-label="+">A+</button>
        </div>
      </div>
      <input id="fontSlider" type="range" min="80" max="180" step="10" value="${currentPct}">
      <p class="preview-text selectable-text" id="fontPreview">${escapeHtml(t('previewText'))}</p>

      <button class="sheet-close" id="closeSettings">${escapeHtml(t('close'))}</button>
    </div>
  `;
  layer.appendChild(backdrop);

  backdrop.onclick = (e) => { if (e.target === backdrop) backdrop.remove(); };
  document.getElementById('closeSettings').onclick = () => backdrop.remove();

  document.getElementById('fontDown').onclick = () => stepFont(-10);
  document.getElementById('fontUp').onclick = () => stepFont(10);
  document.getElementById('fontSlider').oninput = (e) => setFontScale(parseInt(e.target.value, 10));

  document.getElementById('languageSelect').onchange = (e) => {
    state.lang = e.target.value;
    localStorage.setItem(LS_KEYS.lang, state.lang);
    document.documentElement.lang = state.lang;
    backdrop.remove();
    render();
  };
}

function setFontScale(value) {
  const v = Math.min(180, Math.max(80, value));
  document.documentElement.style.setProperty('--font-scale', (v / 100).toFixed(2));
  localStorage.setItem(LS_KEYS.fontScale, String(v));
  const label = document.getElementById('fontSizeLabel');
  const slider = document.getElementById('fontSlider');
  if (label) label.textContent = v + '%';
  if (slider) slider.value = v;
}

function stepFont(delta) {
  const current = Math.round(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--font-scale')) * 100);
  setFontScale(current + delta);
}
