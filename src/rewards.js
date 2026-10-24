// What each finished day (or mini-game) unlocks in the wardrobe.
// Indexes point into SKINS / HAT_ICONS in dinos.js.
export const START_UNLOCKED = { skin: [0, 1, 2], hat: [0, 1] };

export const REWARDS = {
  1: { skin: [3] },
  2: { hat: [2] },
  3: { skin: [4] },
  4: { hat: [3] },
  5: { skin: [8] },
  6: { hat: [8] },
  7: { skin: [5] },
  8: { hat: [7] },
  9: { skin: [9] },
  10: { hat: [11] },
  11: { skin: [7] },
  12: { hat: [10] },
  13: { skin: [10] },
  14: { hat: [5] },
  15: { skin: [12] },
  16: { skin: [13], hat: [9] },
};
export const MINIGAME_REWARDS = { ride: { hat: [6] }, dance: { skin: [11] } };
export const START_OF_DAY = {};

// adds the reward's items to `saved.unlocked`; returns the ones that were new
export function grant(saved, reward) {
  const fresh = [];
  for (const type of ['skin', 'hat']) {
    for (const i of (reward && reward[type]) || []) {
      if (!saved.unlocked[type].includes(i)) {
        saved.unlocked[type].push(i);
        fresh.push({ type, index: i });
      }
    }
  }
  return fresh;
}

// everything earned so far (used when loading older saves)
export function grantEarned(saved) {
  for (const id of saved.stickers) grant(saved, REWARDS[id]);
  grant(saved, { skin: [saved.outfit.skin], hat: [saved.outfit.hat] });
}
