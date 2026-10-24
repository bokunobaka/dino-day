// The little dino's pet friend: a baby dino picked once, then follows through every day.
export const PET_KINDS = [
  { id: 'rex', icon: '🦖' },
  { id: 'tri', icon: '🦕' },
  { id: 'steg', icon: '🦕' },
  { id: 'raptor', icon: '🦖' },
  { id: 'anky', icon: '🦕' },
  { id: 'pachy', icon: '🦖' },
];

// spoken name clips can be recorded for each of these
export const PET_NAMES = [
  { id: 'toomas', name: 'Toomas' },
  { id: 'rohi', name: 'Rohi' },
  { id: 'nublu', name: 'Nublu' },
  { id: 'tupsu', name: 'Tupsu' },
  { id: 'murts', name: 'Mürts' },
  { id: 'kivi', name: 'Kivi' },
];

export const petName = (id) => (PET_NAMES.find((n) => n.id === id) || PET_NAMES[0]).name;
