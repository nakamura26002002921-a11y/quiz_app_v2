/* ------------------------------ ルーター ------------------------------ */
function render() {
  if (state.route === 'home') renderHome();
  else if (state.route === 'quiz') renderQuiz();
  else if (state.route === 'result') renderResult();
}

render();

/* ------------------------------ 引っ張って更新（pull-to-refresh）の無効化 ------------------------------ */
(function preventPullToRefresh() {
  let startY = 0;
  document.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    const scroller = e.target.closest('.quiz-scroll, .sheet, #app');
    const atTop = !scroller || scroller.scrollTop <= 0;
    const pullingDown = e.touches[0].clientY - startY > 0;
    if (atTop && pullingDown) e.preventDefault();
  }, { passive: false });
})();

/* ------------------------------ Service Worker登録 ------------------------------ */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch(() => {});
  });
}
