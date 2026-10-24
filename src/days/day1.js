// Day 1 · Egg Day: find the three lost eggs, take them to the nest, help them hatch.
import * as THREE from 'three';
import { sfx } from '../audio.js';
import { say } from '../speech.js';
import { t } from '../i18n.js';
import { Dino } from '../dinos.js';
import { makeEgg } from '../scenery.js';
import { makeFern, makeGlow } from '../scenery.js';

const NUMBER_WORDS = t('nums');
const LOOKS = [[0xfff1d6, 0x58c26b, 'tri'], [0xe6f3ff, 0xf2a65a, 'steg'], [0xfff0f8, 0x9a7be0, 'rex']];

export default {
  id: 1,
  name: t('d1.name'),
  sticker: '🥚',
  area: 'meadow',
  intro: t('d1.intro'),
  steps: [
    { id: 'eggs', icon: '🥚', count: 3, hint: t('d1.h.eggs') },
    { id: 'nest', icon: '🏠', count: 1, hint: t('d1.h.nest') },
    { id: 'hatch', icon: '🐣', count: 3, hint: t('d1.h.hatch') },
  ],

  start(game) {
    const a = game.area;
    const bag = game.bag;
    this.hatched = 0;
    this.babies = [];

    // the lost eggs, tucked into little fern clumps
    this.eggs = a.eggSpots.slice(0, 3).map(([x, z], i) => {
      const [shell, spot] = LOOKS[i];
      const grp = new THREE.Group();
      const egg = makeEgg(shell, spot, 1.35);
      grp.add(egg);
      for (let k = 0; k < 3; k++) {
        const f = makeFern(Math.random, 0.7);
        f.position.set(Math.cos(k * 2.1 + i) * 0.65, 0, Math.sin(k * 2.1 + i) * 0.65);
        grp.add(f);
      }
      const glow = makeGlow(0xfff1a8, 2.4);
      glow.position.y = 0.6;
      grp.add(glow);
      grp.position.set(x, 0, z);
      a.group.add(grp);
      const e = { group: grp, egg, glow, pos: new THREE.Vector3(x, 0, z), taken: false };
      e.item = game.addItem({
        pos: e.pos, hitRadius: 0.9, reach: 1.2, hitY: 0.5,
        run: () => {
          if (e.taken) return;
          e.taken = true;
          e.item.enabled = false;
          sfx.pop();
          game.addToBag('egg');
          game.burst({ x, y: 0.6, z }, 14, 1, 0.4, [0xfff1a8, 0xffffff]);
          game.pickUp(egg, 1.0);
          glow.visible = false;
          if (game.step && game.step.id === 'eggs') say(NUMBER_WORDS[game.progress]);
          game.addProgress('eggs');
        },
      });
      return e;
    });
    game.hintSpots = () =>
      game.step && game.step.id === 'eggs' ? this.eggs.filter((e) => !e.taken).map((e) => ({ x: e.pos.x, y: 0.9, z: e.pos.z })) : [];

    // the nest
    this.nestItem = game.addItem({
      pos: a.nestPos, hitRadius: 2.4, reach: 3.0, hitY: 0.6,
      run: () => {
        const id = game.step && game.step.id;
        if (id === 'nest') this.layEggs(game);
        else if (id === 'eggs') {
          sfx.nope();
          say(t('d1.needEggs'));
        }
      },
    });

    // Mama Bronto
    game.addItem({
      track: a.mama.root, hitRadius: 2.2, reach: 4.2, hitY: 2.0,
      run: () => {
        sfx.animal('bronto');
        a.mama.gesture('gesture-positive');
        if (game.sillyTap('mama')) {
          a.mama.play('roar');
          sfx.chime();
          game.confettiAt(a.mama.root.position, 5);
        }
        game.hearts.emit(a.mama.root.position.x, 4.5, a.mama.root.position.z, 6, { speed: 0.6, up: 1.2, life: 1.6, colors: [0xff5fae, 0xff8fc7] });
        if (game.state !== 'play') return;
        const id = game.step && game.step.id;
        if (id === 'eggs') say(t('d1.mama.eggs'));
        else if (id === 'nest') say(t('d1.mama.nest'));
      },
    });
  },

  onStep(game, id) {
    const a = game.area;
    if (id === 'nest') game.setArrow(a.nestPos, 3.4);
    if (id === 'hatch') game.setArrow(null);
  },

  layEggs(game) {
    const a = game.area;
    this.nestItem.enabled = false;
    game.setArrow(null);
    game.state = 'party';
    game.target = null;
    game.faceToward(a.nestPos);
    this.nestEggs = this.eggs.map((e, i) => {
      const [shell, spot] = LOOKS[i];
      const ang = (i / 3) * Math.PI * 2 + 0.6;
      const x = a.nestPos.x + Math.cos(ang) * 0.75;
      const z = a.nestPos.z + Math.sin(ang) * 0.75;
      const g = new THREE.Group();
      g.add(makeEgg(shell, spot, 1.45));
      g.position.set(x, 0.12, z);
      g.visible = false;
      a.group.add(g);
      game.after(0.4 + i * 0.5, () => {
        g.visible = true;
        sfx.pop();
        game.burst({ x, y: 0.6, z }, 14, 1, 0.3, [0xfff1a8, 0xffffff]);
        game.hop(g.position, new THREE.Vector3(x, 0.12, z), 0.4, 0.8);
      });
      return { group: g, pos: new THREE.Vector3(x, 0, z), done: false };
    });
    game.after(2.2, () => {
      a.mama.play('eat');
      sfx.animal('bronto');
      sfx.chime();
      say(t('d1.warm'));
      for (const e of this.nestEggs) game.sparkles.emit(e.pos.x, 0.8, e.pos.z, 20, { speed: 0.8, up: 1.4, life: 1.2, colors: [0xffb347, 0xffe066, 0xffffff] });
    });
    game.after(3.6, () => {
      a.mama.play('idle');
      game.state = 'play';
      game.bag.egg = 0;
      game.ui.setBag(game.bag);
      this.nestEggs.forEach((e, i) => {
        e.item = game.addItem({
          pos: e.pos, hitRadius: 0.8, reach: 2.2, hitY: 0.6,
          run: () => this.hatch(game, i),
        });
      });
      game.addProgress('nest');
    });
  },

  hatch(game, i) {
    const a = game.area;
    const e = this.nestEggs[i];
    if (e.done) return;
    e.done = true;
    e.item.enabled = false;
    const [, , species] = LOOKS[i];
    sfx.crack();
    say(t('d1.crack'));
    game.tween(0.9, (k) => {
      e.group.rotation.z = Math.sin(k * 40) * 0.25 * k;
      e.group.scale.setScalar(1 + k * 0.1);
    }, () => {
      e.group.visible = false;
      sfx.pop();
      sfx.animal(species);
      game.burst({ x: e.pos.x, y: 0.8, z: e.pos.z }, 30, 2, 0.5, [0xfff1d6, 0xffffff, 0xffe066]);
      const baby = new Dino(species, 1.15, { baby: true });
      baby.root.position.set(e.pos.x, 0, e.pos.z);
      baby.heading = Math.atan2(game.player.position.x - e.pos.x, game.player.position.z - e.pos.z);
      baby.root.rotation.y = baby.heading;
      baby.root.scale.setScalar(0.01);
      a.group.add(baby.root);
      game.addCritter(baby);
      this.babies.push(baby);
      game.tween(0.5, (k) => baby.root.scale.setScalar(Math.max(0.01, k)), () => baby.gesture('gesture-positive'));
      game.hearts.emit(e.pos.x, 1.6, e.pos.z, 8, { speed: 0.6, up: 1.3, life: 1.5, colors: [0xff5fae, 0xff8fc7, 0xffffff] });
      say(t('d1.hellos')[this.hatched % 3]);
      this.hatched++;
      game.addProgress('hatch');
    });
  },

  onDone(game) {
    const a = game.area;
    game.state = 'party';
    game.target = null;
    sfx.fanfare();
    say(t('d1.done'));
    game.player.userData.cheering = true;
    a.mama.play('roar');
    this.babies.forEach((b, i) => game.after(i * 0.25, () => b.play('dance')));
    game.confettiAt(a.nestPos, 5);
    game.burst({ x: a.nestPos.x, y: 1.5, z: a.nestPos.z }, 50, 2.5, 1.5);
    game.after(7, () => {
      game.player.userData.cheering = false;
      game.finishDay(t('d1.end'));
    });
  },

  update(game, dt, time) {
    if (!this.eggs) return;
    this.eggs.forEach((e, i) => {
      if (e.taken) return;
      e.egg.rotation.z = Math.sin(time * 3 + i * 2) * 0.1;
      e.glow.material.opacity = 0.7 + Math.sin(time * 4 + i) * 0.2;
    });
  },
};
