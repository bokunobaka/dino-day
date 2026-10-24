import { START_UNLOCKED, grantEarned } from './rewards.js';

const KEY = 'dinoDay.v1';

const defaults = () => ({
  stickers: [],          // finished day ids
  muted: false,
  volume: 1,
  outfit: { skin: 0, hat: 0 },
  unlocked: { skin: [...START_UNLOCKED.skin], hat: [...START_UNLOCKED.hat] },
  pet: null,             // { kind, name }
  plots: [null, null, null], // egg nests: { type, stage, warmed }
  daysPlayed: 0,
  hatched: 0,
  photos: [],            // small jpeg data urls, newest first
  best: { ride: 0, dance: 0 },
  tutorial: false,
  controls: 'both',      // both | tap | stick
});

export function load() {
  const d = defaults();
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    Object.assign(d, raw);
    d.outfit = { ...defaults().outfit, ...(raw.outfit || {}) };
    d.unlocked = { skin: [...(raw.unlocked?.skin || d.unlocked.skin)], hat: [...(raw.unlocked?.hat || d.unlocked.hat)] };
    d.best = { ...defaults().best, ...(raw.best || {}) };
    if (!Array.isArray(d.plots) || d.plots.length !== 3) d.plots = [null, null, null];
  } catch {
    /* broken save: start fresh */
  }
  grantEarned(d);
  return d;
}

export function save(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // private mode / storage full: progress just won't persist
  }
}

export function resetAll() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
