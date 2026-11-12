/**
 * Progress tracking: which steps are done, XP, ranks and level unlocking.
 * State is saved in localStorage (per browser) and fails gracefully without it.
 */
import { LEVELS } from './levels.js';

const STORAGE_KEY = 'gitquest-v1';

const RANKS = [
  [0, 'NOVICE'],
  [0.12, 'APPRENTICE'],
  [0.3, 'BRANCH WRANGLER'],
  [0.5, 'MERGE MAGE'],
  [0.7, 'TIME BENDER'],
  [0.9, 'REMOTE RANGER'],
  [1, 'GIT WIZARD'],
];

let state = load();

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved && saved.done) return { done: saved.done, peek: saved.peek || {} };
  } catch {
    /* storage unavailable or corrupt: start fresh */
  }
  return { done: {}, peek: {} };
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore: progress just won't persist */
  }
}

/** Step IDs are position-based ("level-step"), so reordering steps shifts saved ticks. */
export const stepId = (level, step) => `${level}-${step}`;
export const stepXP = (step) => step.xp || 10;

export const TOTAL_XP = LEVELS.reduce(
  (sum, level) => sum + level.steps.reduce((s, step) => s + stepXP(step), 0),
  0,
);

export const isStepDone = (i, j) => !!state.done[stepId(i, j)];
export const levelCount = (i) => LEVELS[i].steps.filter((_, j) => isStepDone(i, j)).length;
export const isLevelDone = (i) => levelCount(i) === LEVELS[i].steps.length;
export const isUnlocked = (i) => i === 0 || isLevelDone(i - 1) || !!state.peek[i];
export const isQuestDone = () => LEVELS.every((_, i) => isLevelDone(i));
/** Index of the first unfinished level, or -1 when everything is complete. */
export const currentLevel = () => LEVELS.findIndex((_, i) => !isLevelDone(i));

export function setStepDone(i, j, done) {
  if (done) state.done[stepId(i, j)] = true;
  else delete state.done[stepId(i, j)];
  save();
}

export function peekLevel(i) {
  state.peek[i] = true;
  save();
}

export function resetProgress() {
  state = { done: {}, peek: {} };
  save();
}

export function earnedXP() {
  let xp = 0;
  LEVELS.forEach((level, i) =>
    level.steps.forEach((step, j) => {
      if (isStepDone(i, j)) xp += stepXP(step);
    }),
  );
  return xp;
}

export function rankFor(fraction) {
  let rank = RANKS[0][1];
  for (const [threshold, name] of RANKS) if (fraction >= threshold) rank = name;
  return rank;
}
