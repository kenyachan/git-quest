/**
 * Entry point: renders the levels, level map and HUD, and handles ticking steps.
 */
import './styles/style.css';
import { LEVELS } from './levels.js';
import * as progress from './progress.js';
import { toast, initResetDialog, copyCommands } from './ui.js';

function renderStep(level, i, step, j) {
  const id = progress.stepId(i, j);
  const done = progress.isStepDone(i, j);
  const li = document.createElement('li');
  li.className = 'step' + (done ? ' done' : '');
  li.innerHTML = `
    <div class="step-top">
      <input type="checkbox" class="chk" id="c${id}" ${done ? 'checked' : ''} aria-label="Mark '${step.t.replace(/"/g, '')}' complete">
      <div class="step-body">
        <label class="step-title" for="c${id}"><span>${j + 1}. ${step.t}</span><span class="xp">+${progress.stepXP(step)} XP</span></label>
        <div class="step-desc">${step.d}</div>
        <div class="cmd"><pre>${step.c}</pre><button class="copy" type="button">COPY</button></div>
        <details class="peek"><summary>What you should see</summary><div class="peek-body">${step.e}</div></details>
      </div>
    </div>`;
  li.querySelector('.chk').addEventListener('change', (e) => toggleStep(i, j, e.target.checked));
  const copyBtn = li.querySelector('.copy');
  copyBtn.addEventListener('click', () => copyCommands(li.querySelector('pre'), copyBtn));
  return li;
}

function renderLevel(level, i) {
  const unlocked = progress.isUnlocked(i);
  const count = progress.levelCount(i);
  const section = document.createElement('section');
  section.className = 'level' + (level.boss ? ' boss' : '') + (unlocked ? '' : ' locked');
  section.id = 'level-' + i;
  section.innerHTML = `
    <div class="lvl-head">
      <div class="lvl-icon" aria-hidden="true">${unlocked ? level.icon : '🔒'}</div>
      <div><div class="lvl-num pixel">LEVEL ${i}${level.boss ? ' · BOSS' : ''}</div><h2 class="lvl-title pixel">${level.name}</h2></div>
      <div class="lvl-count pixel ${count === level.steps.length ? 'full' : ''}">${count}/${level.steps.length}</div>
    </div>`;

  if (unlocked) {
    const intro = document.createElement('div');
    intro.className = 'lvl-intro';
    intro.innerHTML = level.intro;
    section.appendChild(intro);
  } else {
    const msg = document.createElement('div');
    msg.className = 'locked-msg';
    msg.innerHTML = `<span class="pixel">CLEAR LEVEL ${i - 1} TO UNLOCK</span>`;
    const peekBtn = document.createElement('button');
    peekBtn.textContent = 'PEEK ANYWAY';
    peekBtn.addEventListener('click', () => {
      progress.peekLevel(i);
      render();
    });
    msg.appendChild(peekBtn);
    section.appendChild(msg);
  }

  const list = document.createElement('ol');
  list.className = 'steps';
  level.steps.forEach((step, j) => list.appendChild(renderStep(level, i, step, j)));
  section.appendChild(list);
  return section;
}

function renderHUD() {
  const xp = progress.earnedXP();
  const fraction = xp / progress.TOTAL_XP;
  document.getElementById('xpFill').style.width = fraction * 100 + '%';
  document.getElementById('xpText').textContent = `${xp} / ${progress.TOTAL_XP} XP`;
  document.getElementById('rankLabel').textContent = progress.rankFor(fraction);

  const current = progress.currentLevel();
  const map = document.getElementById('map');
  map.innerHTML = '';
  LEVELS.forEach((level, i) => {
    const done = progress.isLevelDone(i);
    const a = document.createElement('a');
    a.href = '#level-' + i;
    a.className = 'pixel' + (done ? ' done' : '') + (i === current ? ' current' : '') + (level.boss ? ' boss' : '');
    a.textContent = done ? '★' : progress.isUnlocked(i) ? i : '🔒';
    a.title = `Level ${i}: ${level.name}`;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('level-' + i).scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    map.appendChild(a);
  });
  document.getElementById('credits').classList.toggle('show', current === -1);
}

function render() {
  const root = document.getElementById('levels');
  root.replaceChildren(...LEVELS.map(renderLevel));
  renderHUD();
}

function toggleStep(i, j, done) {
  const wasDone = progress.isLevelDone(i);
  progress.setStepDone(i, j, done);
  const scrollY = window.scrollY;
  render();
  window.scrollTo(0, scrollY);

  if (!wasDone && progress.isLevelDone(i)) {
    const level = LEVELS[i];
    if (progress.isQuestDone()) toast('★ QUEST COMPLETE ★', 'You are a Git Wizard.');
    else if (level.boss) toast('BOSS DEFEATED!', `${level.name.replace(/^.*?: /, '')} has fallen. Level ${i + 1} unlocked.`);
    else toast('LEVEL CLEAR!', `${level.name} complete. Level ${i + 1} unlocked.`);
  }
}

initResetDialog(() => {
  progress.resetProgress();
  render();
  window.scrollTo(0, 0);
});

render();
