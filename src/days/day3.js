// Day 3 · Stew Day: gather ingredients, stir the pot, cook it on the fire, fill the bowls.
import * as THREE from 'three';
import { sfx } from '../audio.js';
import { say } from '../speech.js';
import { t } from '../i18n.js';
import { makeLeafBundle, makeBerry, makeMushroom } from '../scenery.js';

const SOUPS = [0xff8fb0, 0xffc857, 0x9be37a, 0xc9a6ff, 0x6ad7ff, 0xff9a4d];
const ING = [
  { key: 'fern', make: () => makeLeafBundle(), scale: 2.3, name: 'd3.i.fern' },
  { key: 'berry', make: () => makeBerry(), scale: 2.6, name: 'd3.i.berry' },
  { key: 'mushroom', make: () => makeMushroom(0xff6b6b, 1.3), scale: 1.2, name: 'd3.i.mushroom' },
];

export default {
  id: 3,
  name: t('d3.name'),
  sticker: '🍲',
  area: 'kitchen',
  intro: t('d3.intro'),
  steps: [
    { id: 'gather', icon: '🧺', count: 3, hint: t('d3.h.gather') },
    { id: 'mix', icon: '🥄', count: 5, hint: t('d3.h.mix') },
    { id: 'cook', icon: '🔥', count: 1, hint: t('d3.h.cook') },
    { id: 'serve', icon: '🍲', count: 6, hint: t('d3.h.serve') },
  ],

  start(game) {
    const a = game.area;
    this.stirs = 0;
    this.found = [];
    this.ingredients = ING.map((d) => {
      const spot = a.spots[d.key];
      const m = d.make();
      m.scale.setScalar(d.scale);
      m.position.set(spot.x, 0.55, spot.z);
      a.group.add(m);
      const item = game.addItem({
        pos: spot, hitRadius: 1.0, reach: 1.7, hitY: 0.8,
        run: () => {
          item.enabled = false;
          sfx.pop();
          game.addToBag(d.key);
          game.burst({ x: spot.x, y: 0.9, z: spot.z }, 16, 1, 0.5);
          game.tween(0.4, (k) => {
            m.position.y = 0.55 + k * 1.2;
            m.scale.setScalar(Math.max(0.01, d.scale * (1 - k * k)));
          }, () => (m.visible = false));
          this.found.push(d);
          say(t('d3.found', { x: t(d.name) }));
          game.addProgress('gather');
        },
      });
      return { m, item, d, spot };
    });
    game.hintSpots = () =>
      game.step && game.step.id === 'gather' ? this.ingredients.filter((i) => i.item.enabled).map((i) => ({ x: i.spot.x, y: 1.2, z: i.spot.z })) : [];

    this.potItem = game.addItem({
      pos: a.island.pos, hitRadius: 1.5, reach: 3.2, hitY: 1.5,
      run: () => this.stir(game),
    });
    this.fireItem = game.addItem({
      pos: a.firePos, hitRadius: 1.4, reach: 2.4, hitY: 0.8,
      run: () => this.cook(game),
    });
  },

  onStep(game, id) {
    const a = game.area;
    if (id === 'mix') {
      this.dropIn(game);
      game.setArrow(a.island.pos, 3.4);
      this.stirs = 0;
    }
    if (id === 'cook') {
      this.potItem.enabled = false;
      game.setArrow(a.firePos, 3.0);
    }
    if (id === 'serve') game.setArrow(null);
  },

  // the ingredients tumble into the pot
  dropIn(game) {
    const a = game.area;
    this.found.forEach((d, i) => {
      const m = d.make();
      m.scale.setScalar(d.scale * 0.8);
      m.position.set(a.island.pos.x + (i - 1) * 0.3, a.island.top + 3.0 + i * 0.6, a.island.pos.z);
      a.group.add(m);
      game.after(i * 0.35, () =>
        game.tween(0.5, (k) => {
          m.position.y = a.island.top + 0.6 + 2.4 * (1 - k * k);
        }, () => {
          sfx.pop();
          game.burst({ x: a.island.pos.x, y: a.island.top + 0.5, z: a.island.pos.z }, 8, 0.8, 0.3, [0x9be37a, 0xffffff]);
          m.removeFromParent();
        })
      );
    });
    a.pot.userData.soup.material = a.pot.userData.soup.material.clone();
    a.pot.userData.soup.material.color.set(0x7fd0ff);
  },

  stir(game) {
    const a = game.area;
    if (!game.step) return;
    if (game.step.id === 'gather') {
      sfx.nope();
      say(t('d3.needFirst'));
      return;
    }
    if (game.step.id !== 'mix') return;
    this.stirs++;
    sfx.boing();
    const l = a.ladle;
    const cx = a.island.pos.x;
    const cz = a.island.pos.z;
    game.tween(0.45, (k) => {
      l.position.set(cx + Math.cos(k * 6.28) * 0.35, a.island.top + 0.55, cz + Math.sin(k * 6.28) * 0.35);
    }, () => l.position.set(cx + 0.55, a.island.top + 0.6, cz));
    a.pot.userData.soup.material.color.lerp(new THREE.Color(0xb86bd9), 0.25);
    game.burst({ x: cx, y: a.island.top + 0.7, z: cz }, 10, 1, 0.7, [0xc9a6ff, 0xffffff, 0x9be7ff]);
    say(t('stirs')[this.stirs - 1] || t('d3.stir'));
    game.addProgress('mix');
  },

  cook(game) {
    const a = game.area;
    if (!game.step || game.step.id !== 'cook') {
      sfx.nope();
      say(game.step && game.step.id === 'serve' ? t('d3.alreadyCooked') : t('d3.cookEarly'));
      return;
    }
    this.fireItem.enabled = false;
    game.setArrow(null);
    game.state = 'party';
    game.target = null;
    say(t('d3.ontoFire'));
    const pot = a.pot;
    const from = pot.position.clone();
    const to = new THREE.Vector3(a.firePos.x, 1.1, a.firePos.z);
    a.fire.visible = true;
    a.fireLight.visible = true;
    sfx.fire();
    game.hop(pot.position, to, 1.0, 1.6, () => {
      for (let i = 0; i < 8; i++)
        game.after(i * 0.4, () => {
          game.sparkles.emit(a.firePos.x, 2.2, a.firePos.z, 6, { speed: 0.5, up: 1.6, life: 1.3, colors: [0xffffff, 0xe6e6e6, 0xffd9a0] });
          sfx.tap();
        });
      game.after(3.4, () => {
        pot.userData.soup.material.color.set(0xff9a4d);
        game.hop(pot.position, from, 1.0, 1.6, () => {
          a.fire.visible = false;
          a.fireLight.visible = false;
          sfx.chime();
          say(t('d3.ding'));
          game.state = 'play';
          this.makeBowls(game);
        });
      });
    });
  },

  makeBowls(game) {
    const a = game.area;
    a.bowls.forEach((b, i) => {
      b.group.visible = true;
      b.group.scale.setScalar(0.01);
      game.after(i * 0.15, () => {
        sfx.pop();
        game.tween(0.35, (k) => b.group.scale.setScalar(Math.max(0.01, 1.8 * k)));
      });
      b.soup.material = b.soup.material.clone();
      b.soup.material.color.set(SOUPS[i]);
      b.item = game.addItem({
        pos: { x: b.x, z: b.z }, hitRadius: 0.6, reach: 3.0, hitY: a.island.top + 0.3,
        run: () => {
          b.item.enabled = false;
          b.soup.visible = true;
          sfx.pop();
          game.burst({ x: b.x, y: a.island.top + 0.4, z: b.z }, 12, 1, 0.5, [SOUPS[i], 0xffffff, 0xffe9a8]);
          game.tween(0.35, (k) => (b.group.position.y = a.island.top + 0.04 + Math.sin(k * Math.PI) * 0.35));
          game.addProgress('serve');
        },
      });
    });
    game.advanceStepSilent();
    game.after(1.0, () => say(t('d3.tapEach')));
  },

  onDone(game) {
    const a = game.area;
    game.state = 'party';
    game.player.userData.cheering = true;
    sfx.fanfare();
    say(t('d3.yummy'));
    game.confettiAt(a.island.pos, 3.5);
    game.after(5.0, () => {
      game.player.userData.cheering = false;
      game.finishDay(t('d3.end'));
    });
  },
};
