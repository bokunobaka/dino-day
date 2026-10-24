// Day 7 · Birthday: gather balloons, find presents, light the candles, sing happy birthday.
import * as THREE from 'three';
import { sfx } from '../audio.js';
import { say } from '../speech.js';
import { t } from '../i18n.js';
import { makePresent } from '../scenery.js';

export default {
  id: 7,
  name: t('d7.name'),
  sticker: '🎂',
  area: 'party',
  intro: t('d7.intro'),
  steps: [
    { id: 'balloons', icon: '🎈', count: 5, hint: t('d7.h.balloons') },
    { id: 'presents', icon: '🎁', count: 3, hint: t('d7.h.presents') },
    { id: 'candles', icon: '🕯️', count: 3, hint: t('d7.h.candles') },
    { id: 'song', icon: '🎂', count: 1, hint: t('d7.h.song') },
  ],

  start(game) {
    const a = game.area;
    this.lit = 0;

    a.balloons.forEach((b, i) => {
      b.item = game.addItem({
        pos: b.pos, hitRadius: 1.0, reach: 1.6, hitY: 2.2,
        run: () => {
          if (b.taken) return;
          b.taken = true;
          b.item.enabled = false;
          sfx.pop();
          game.addToBag('balloon');
          const target = a.anchors[i].clone();
          game.hop(b.group, target, 1.1, 1.0);
          game.burst({ x: b.pos.x, y: 2, z: b.pos.z }, 12, 1, 0.6, [0xffffff, 0xcdf5a8, 0xfff0a0]);
          say(t('nums')[Math.min(game.progress, 5)]);
          game.addProgress('balloons');
        },
      });
    });
    game.hintSpots = () => {
      if (!game.step) return [];
      if (game.step.id === 'balloons') return a.balloons.filter((b) => !b.taken).map((b) => ({ x: b.pos.x, y: 2.4, z: b.pos.z }));
      if (game.step.id === 'presents') return a.presents.filter((p) => !p.taken).map((p) => ({ x: p.pos.x, y: 1.0, z: p.pos.z }));
      return [];
    };

    a.presents.forEach((p) => {
      p.item = game.addItem({
        pos: p.pos, hitRadius: 1.0, reach: 1.5, hitY: 0.5,
        run: () => {
          if (p.taken) return;
          p.taken = true;
          p.item.enabled = false;
          p.glow.visible = false;
          sfx.chime();
          game.addToBag('present');
          game.burst({ x: p.pos.x, y: 0.7, z: p.pos.z }, 16, 1.2, 0.6);
          game.pickUp(p.group);
          say(t('d7.foundPresent'));
          game.addProgress('presents');
        },
      });
    });

    // the cake: lights the candles, then sings
    this.cakeItem = game.addItem({
      pos: a.tablePos, hitRadius: 2.2, hitY: 1.3, reach: 3.6,
      run: () => this.cake(game),
    });

    game.addItem({
      track: a.honoree.root, hitRadius: 2.0, reach: 4.0, hitY: 2.0,
      run: () => {
        sfx.animal('bronto');
        a.honoree.gesture('gesture-positive');
        if (game.sillyTap('honoree')) {
          a.honoree.play('roar');
          game.confettiAt(a.honoree.root.position, 5);
        }
        game.hearts.emit(a.honoree.root.position.x, 4.4, a.honoree.root.position.z, 6, { speed: 0.6, up: 1.2, life: 1.6, colors: [0xff5fae, 0xff8fc7] });
        say(t('d7.honoree'));
      },
    });
  },

  onStep(game, id) {
    const a = game.area;
    if (id === 'candles') {
      // the presents that were found are piled up next to the table
      const cols = [[0xff5fae, 0xffe066], [0x6ad7ff, 0xffffff], [0xb48cff, 0xffe066]];
      cols.forEach(([c, r], i) => {
        const m = makePresent(c, r);
        m.position.set(-3.8 + i * 1.1, 0, -3.2 + (i % 2) * 0.7);
        m.rotation.y = i;
        a.group.add(m);
        m.scale.setScalar(0.01);
        game.after(i * 0.2, () => game.tween(0.4, (kk) => m.scale.setScalar(Math.max(0.01, 1.8 * kk))));
      });
      game.setArrow(a.tablePos, 3.8);
    }
    if (id === 'song') game.setArrow(a.tablePos, 3.8);
  },

  cake(game) {
    const a = game.area;
    const id = game.step && game.step.id;
    if (id === 'candles') {
      const i = this.lit++;
      a.flames[i].visible = true;
      a.glow.visible = true;
      sfx.sparkle();
      game.burst({ x: 0, y: 2.8, z: -4.5 }, 12, 1, 0.3, [0xffe066, 0xffffff]);
      say(t('d7.candle'));
      game.addProgress('candles');
    } else if (id === 'song') {
      this.sing(game);
    } else {
      sfx.nope();
      say(t('d7.notYet'));
    }
  },

  sing(game) {
    const a = game.area;
    game.state = 'party';
    game.target = null;
    game.setArrow(null);
    a.flames[3].visible = true;
    const dur = sfx.birthday() || 12;
    a.guests.forEach((c, i) => game.after(i * 0.3, () => c.play('dance')));
    a.honoree.play('dance');
    game.player.userData.cheering = true;
    game.advanceStepSilent();
    game.after(dur + 0.4, () => {
      say(t('d7.wish'));
      game.player.userData.cheering = false;
      a.honoree.play('idle');
    });
    game.after(dur + 2.6, () => {
      a.flames.forEach((f) => (f.visible = false));
      a.glow.visible = false;
      sfx.pop();
      sfx.fanfare();
      say(t('d7.done'));
      game.confettiAt({ x: 0, z: -4.5 }, 5);
      game.burst({ x: 0, y: 2.5, z: -4.5 }, 40, 2.4, 1);
      a.honoree.play('roar');
      game.player.userData.cheering = true;
    });
    game.after(dur + 8.5, () => {
      game.player.userData.cheering = false;
      game.finishDay(t('d7.end'));
    });
  },
};
