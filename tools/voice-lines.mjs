// Prints every line the game can speak in Estonian as JSON: [{ id, text }].
// Used to record the voice clips in public/voice/et (see README, "Voice").
globalThis.location = { search: '?lang=et' };
globalThis.localStorage = { getItem: () => null, setItem() {} };
globalThis.document = {};
const { STRINGS, t } = await import('../src/i18n.js');
const { lineId } = await import('../src/hash.js');

const E = STRINGS.et;
const out = new Set();
const add = (s) => s && out.add(s);

// every spoken sentence: day / hub / pet / mini-game lines (not names, item words or templates with {slots})
const SPOKEN = /^(d\d+|hub|pet|tutorial|mg)\./;
const EXTRA = ['wardrobe.pick', 'wardrobe.locked', 'ui.newSkin', 'ui.newHat'];
for (const k of Object.keys(E)) {
  const v = E[k];
  if (!(EXTRA.includes(k) || SPOKEN.test(k))) continue;
  if (/\.name$|\.i\./.test(k)) continue;
  if (typeof v === 'string' && !v.includes('{')) add(v);
  if (Array.isArray(v)) v.forEach(add);
}
['nums', 'stirs', 'splashes', 'poses'].forEach((k) => (E[k] || []).forEach(add));

// templated lines, filled in with every combination the game can produce
for (const x of ['fern', 'berry', 'mushroom']) add(t('d3.found', { x: t('d3.i.' + x) }));
const picnic = [['tri', 'fern'], ['steg', 'berry'], ['raptor', 'fish']];
for (const [a, treat] of picnic) {
  const name = t('animal.' + a);
  add(t('d4.yes', { name }));
  add(t('d4.yum', { name }));
  add(t('d4.no', { name, want: t('treat.' + treat) }));
}
const swimmers = [['tri', 'coconut'], ['pachy', 'watermelon'], ['anky', 'juice']];
for (const [a, drink] of swimmers) {
  add(t('d4.yum', { name: t('animal.' + a) }));
  add(t('d10.no', { name: t('animal.' + a), want: t('drink.' + drink) }));
}

const lines = [...out].map((text) => ({ id: lineId(text), text }));
const ids = new Set(lines.map((l) => l.id));
if (ids.size !== lines.length) throw new Error('hash collision between voice lines');
const tooLong = lines.filter((l) => l.text.length > 300);
if (tooLong.length) throw new Error('line over 300 characters: ' + tooLong[0].text);
console.log(JSON.stringify(lines, null, 1));
