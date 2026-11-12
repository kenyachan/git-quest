/**
 * Small UI helpers: toast notifications, the reset confirmation dialog and copy-to-clipboard.
 */

let toastTimer;

export function toast(title, message) {
  const el = document.getElementById('toast');
  document.getElementById('toastT1').textContent = title;
  document.getElementById('toastT2').textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
}

/** Wires up the RESET button and its in-page confirm dialog. */
export function initResetDialog(onConfirm) {
  const backdrop = document.getElementById('modalBg');
  const close = () => backdrop.classList.remove('show');
  document.getElementById('resetBtn').addEventListener('click', () => backdrop.classList.add('show'));
  document.getElementById('cancelReset').addEventListener('click', close);
  document.getElementById('confirmReset').addEventListener('click', () => {
    close();
    onConfirm();
  });
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
}

function selectContents(el) {
  const range = document.createRange();
  range.selectNodeContents(el);
  const sel = getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

/** Copies a <pre>'s commands (minus "#" comment lines); falls back to selecting the text. */
export function copyCommands(pre, button) {
  const text = pre.innerText
    .split('\n')
    .filter((line) => !line.trim().startsWith('#'))
    .join('\n');
  const done = () => {
    button.textContent = 'COPIED';
    setTimeout(() => (button.textContent = 'COPY'), 1200);
  };
  try {
    navigator.clipboard.writeText(text).then(done, () => selectContents(pre));
  } catch {
    selectContents(pre);
  }
}
