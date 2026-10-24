// Day 6 · Fossil Day: dig up three bones, brush them clean, put the skeleton together.
import * as THREE from 'three';
import { sfx } from '../audio.js';
import { say } from '../speech.js';
import { t } from '../i18n.js';
import { makeBone, makeSkull, makeRibs } from '../scenery.js';
import { Dino } from '../dinos.js';

const DIRT = 0x9b7a50;
const IVORY = 0xfff3d6;
const FINDS = [() => makeSkull(DIRT), () => makeRibs(DIRT), () => makeBone(DIRT, 1.0)];
const SCALES = [1.3, 0.75, 1.5];

export default {
  id: 6,
  name: t('d6.name'),
  sticker: '🦴',
  area: 'dig',
  intro: t('d6.intro'),
  steps: [
    { id: 'dig', icon: '⛏️', count: 3, hint: t('d6.h.dig') },
    { id: 'brush', icon: '🧹', count: 3, hint: t('d6.h.brush') },
    { id: 'build', icon: '🦖', count: 1, hint: t('d6.h.build') },
  ],

  start(game) {
    const a = game.area;
    this.dugCount = 0;
    this.finds = [];
    this.guests = [];

    a.mounds.forEach((m, i) => {
      m.item = game.addItem({
        pos: m.pos, hitRadius: 1.4, reach: 1.7, hitY: 0.4,
        run: () => {
          if (m.dug) return;
          m.dug = true;
          m.item.enabled = false;
          game.wobble(m.group);
          sfx.stomp();
          const k = this.dugCount++;
          // dust and a bone that pops out and flies to the find table
          a.dust.emit(m.pos.x, 0.6, m.pos.z, 24, { speed: 1.8, up: 2.2, life: 1.4, colors: [0xd4aa68, 0xe6c98f, 0xc79a58], gravity: 2, spread: 0.8 });
          game.after(0.5, () => {
            const bone = FINDS[k]();
            bone.scale.setScalar(SCALES[k]);
            bone.position.set(m.pos.x, 0.5, m.pos.z);
            a.group.add(bone);
            sfx.pop();
            game.addToBag('bone');
            game.burst({ x: m.pos.x, y: 0.8, z: m.pos.z }, 14, 1.2, 0.4, [0xfff3d6, 0xffffff]);
            const to = a.slots[k].clone();
            game.hop(bone.position, to, 1.0, 3.2, () => {
              sfx.chime();
              a.dust.emit(to.x, 0.9, to.z, 10, { speed: 0.8, up: 1.2, life: 1.0, colors: [0xd4aa68, 0xffffff], spread: 0.4 });
            });
            this.finds[k] = { bone, clean: false, pos: to };
            say(t('nums')[Math.min(game.progress, 5)]);
            game.addProgress('dig');
          });
        },
      });
    });
    game.hintSpots = () => {
      if (!game.step) return [];
      if (game.step.id === 'dig') return a.mounds.filter((m) => !m.dug).map((m) => ({ x: m.pos.x, y: 0.9, z: m.pos.z }));
      if (game.step.id === 'brush') return this.finds.filter((f) => f && !f.clean).map((f) => ({ x: f.pos.x, y: 1.4, z: f.pos.z }));
      return [];
    };

    this.standItem = game.addItem({
      pos: a.standPos, hitRadius: 2.6, reach: 3.8, hitY: 0.6,
      run: () => {
        if (!game.step || game.step.id !== 'build') {
          sfx.nope();
          say(t('d6.standEarly'));
          return;
        }
        this.build(game);
      },
    });
  },

  onStep(game, id) {
    const a = game.area;
    if (id === 'brush') {
      this.finds.forEach((f, i) => {
        f.item = game.addItem({
          pos: f.pos, hitRadius: 1.1, reach: 3.2, hitY: 1.1,
          run: () => {
            if (f.clean) return;
            f.clean = true;
            f.item.enabled = false;
            sfx.whoosh();
            game.wobble(f.bone);
            a.dust.emit(f.pos.x, 1.2, f.pos.z, 20, { speed: 1.2, up: 1.4, life: 1.0, colors: [0xd4aa68, 0xe6c98f], spread: 0.5 });
            game.after(0.4, () => {
              f.bone.traverse((o) => {
                if (o.isMesh) {
                  o.material = o.material.clone();
                  o.material.color.set(IVORY);
                }
              });
              sfx.chime();
              game.burst({ x: f.pos.x, y: 1.3, z: f.pos.z }, 18, 1.4, 0.2, [0xffffff, 0xffe9a0]);
              game.addProgress('brush');
            });
          },
        });
      });
    }
    if (id === 'build') game.setArrow(a.standPos, 4.2);
  },

  build(game) {
    const a = game.area;
    this.standItem.enabled = false;
    game.setArrow(null);
    game.state = 'party';
    game.target = null;
    // the clean bones lift off the table...
    this.finds.forEach((f) => (f.bone.visible = false));
    const sk = a.skeleton;
    sk.group.visible = true;
    sk.parts.forEach((p, i) => {
      p.visible = false;
      game.after(0.4 + i * 0.7, () => {
        p.visible = true;
        sfx.pop();
        const y0 = p.position.y;
        game.tween(0.55, (k) => {
          p.position.y = y0 + (1 - k) * 3.5;
          p.scale.setScalar(Math.max(0.01, k));
        }, () => {
          p.scale.setScalar(1);
          p.position.y = y0;
          sfx.stomp();
          game.burst({ x: a.standPos.x, y: 1.4 + i * 0.4, z: a.standPos.z }, 16, 1.6, 0.4, [0xffffff, 0xffe9a0]);
        });
      });
    });
    game.after(3.8, () => {
      a.skelGlow.visible = true;
      sfx.fanfare();
      sfx.animal('rex');
      say(t('d6.built'));
      game.addProgress('build');
    });
  },

  onDone(game) {
    const a = game.area;
    game.state = 'party';
    game.target = null;
    game.player.userData.cheering = true;
    game.confettiAt(a.standPos, 5);
    // little visitors come to see the skeleton
    [['tri', -5, 2], ['steg', 5, 2], ['raptor', 0, 3.5]].forEach(([sp, x, z], i) => {
      const c = new Dino(sp, 1.5);
      c.root.position.set(x * 2.2, 0, 14);
      c.heading = Math.PI;
      a.group.add(c.root);
      game.addCritter(c);
      this.guests.push(c);
      game.after(i * 0.4, () => c.goTo(x, z, { speed: 5, onArrive: () => {
        c.heading = Math.atan2(a.standPos.x - c.root.position.x, a.standPos.z - c.root.position.z);
        c.play('dance');
      } }));
    });
    game.after(8, () => {
      game.player.userData.cheering = false;
      game.finishDay(t('d6.end'));
    });
  },
};
