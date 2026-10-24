// Day 12 · Farm Day: pick leaves, feed the hungry long-neck, lead the babies to their pen.
import * as THREE from 'three';
import { sfx } from '../audio.js';
import { say } from '../speech.js';
import { t } from '../i18n.js';

export default {
  id: 12,
  name: t('d12.name'),
  sticker: '🦕',
  area: 'farm',
  intro: t('d12.intro'),
  steps: [
    { id: 'leaves', icon: '🍃', count: 4, hint: t('d12.h.leaves') },
    { id: 'feed', icon: '🦕', count: 1, hint: t('d12.h.feed') },
    { id: 'babies', icon: '🐣', count: 3, hint: t('d12.h.babies') },
    { id: 'pen', icon: '🏠', count: 1, hint: t('d12.h.pen') },
  ],

  start(game) {
    const a = game.area;
    this.invited = [];

    a.trees.forEach((tr) => {
      tr.item = game.addItem({
        pos: tr.pos, hitRadius: 1.8, reach: 2.2, hitY: 2.4,
        run: () => {
          if (tr.taken) return;
          tr.taken = true;
          tr.item.enabled = false;
          tr.glow.visible = false;
          sfx.pop();
          game.addToBag('leaf');
          game.burst({ x: tr.pos.x, y: 2.8, z: tr.pos.z }, 16, 1.2, 0.2, [0xcfff9a, 0xffffff, 0x7bd96f]);
          game.tween(0.5, (k) => {
            tr.bundle.position.y = 2.6 - k * 1.6;
            tr.bundle.scale.setScalar(Math.max(0.01, 2.2 * (1 - k * k)));
          }, () => (tr.bundle.visible = false));
          game.wobble(tr.group);
          say(t('nums')[Math.min(game.progress, 5)]);
          game.addProgress('leaves');
        },
      });
    });
    game.hintSpots = () => {
      if (!game.step) return [];
      if (game.step.id === 'leaves') return a.trees.filter((x) => !x.taken).map((x) => ({ x: x.pos.x + 1.3, y: 2.6, z: x.pos.z + 0.6 }));
      if (game.step.id === 'babies') return a.babies.filter((b) => !b.invited).map((b) => ({ x: b.c.root.position.x, y: 1.1, z: b.c.root.position.z }));
      return [];
    };

    this.bigBubble = game.addBubble(a.big.root, '🍃', 6.2);
    this.bigItem = game.addItem({
      track: a.big.root, hitRadius: 2.4, reach: 4.2, hitY: 2.2,
      run: () => {
        sfx.animal('bronto');
        a.big.gesture('gesture-positive');
        if (!game.step || game.step.id !== 'feed') {
          if (game.step && game.step.id === 'leaves') say(t('d12.hungry'));
          return;
        }
        this.feed(game);
      },
    });

    a.babies.forEach((w) => {
      w.item = game.addItem({
        track: w.c.root, hitRadius: 1.0, reach: 1.9, hitY: 0.6,
        run: () => {
          if (w.invited) return;
          w.invited = true;
          w.item.enabled = false;
          w.c.dest = null;
          sfx.animal(w.c.name);
          w.c.gesture('gesture-positive');
          game.hearts.emit(w.c.root.position.x, 1.5, w.c.root.position.z, 6, { speed: 0.5, up: 1.2, life: 1.4, colors: [0xff5fae, 0xffe066] });
          game.addFollower(w.c);
          this.invited.push(w.c);
          say(t('d12.baby'));
          game.addProgress('babies');
        },
      });
    });

    this.penItem = game.addItem({
      pos: a.coopPos, hitRadius: 2.0, reach: 3.0, hitY: 1.0,
      run: () => {
        if (!game.step || game.step.id !== 'pen') {
          sfx.nope();
          say(t('d12.notYet'));
          return;
        }
        this.penItem.enabled = false;
        game.setArrow(null);
        game.clearFollowers();
        let home = 0;
        this.invited.forEach((c, i) => {
          c.goTo(a.penDoor.x, a.penDoor.z + 2.5, {
            speed: 3.4,
            onArrive: () =>
              c.goTo(a.penC.x + (i - 1) * 1.6, a.penC.z - 0.6 + (i % 2) * 0.8, {
                speed: 2.6,
                onArrive: () => {
                  c.play('sleep');
                  sfx.animal(c.name);
                  if (++home === this.invited.length) {
                    game.hearts.emit(a.penC.x, 2, a.penC.z, 12, { speed: 0.8, up: 1.4, life: 1.6, colors: [0xff5fae, 0xffe066, 0xffffff] });
                    say(t('d12.penDone'));
                    game.addProgress('pen');
                  }
                },
              }),
          });
        });
      },
    });
  },

  feed(game) {
    const a = game.area;
    this.bigItem.enabled = false;
    this.bigBubble.remove();
    game.state = 'party';
    game.target = null;
    game.addToBag('leaf', -4);
    say(t('d12.feed'));
    const h = a.big.root.position;
    for (let i = 0; i < 4; i++)
      game.after(0.2 + i * 0.35, () => {
        sfx.pop();
        game.sparkles.emit(h.x + 1.6, 5.2, h.z + 1.2, 10, { speed: 0.8, up: 0.6, life: 0.8, colors: [0x7bd96f, 0xcfff9a] });
      });
    a.big.play('eat');
    game.after(2.2, () => {
      a.big.play('idle');
      a.big.play('roar');
      sfx.fanfare();
      say(t('d12.fed'));
      game.confettiAt(h, 6);
      game.state = 'play';
      game.addProgress('feed');
    });
  },

  onStep(game, id) {
    if (id === 'pen') game.setArrow(game.area.coopPos, 3.2);
  },

  onDone(game) {
    game.state = 'party';
    game.target = null;
    sfx.fanfare();
    say(t('d12.done'));
    game.player.userData.cheering = true;
    game.area.big.play('dance');
    game.confettiAt({ x: 0, z: -2 }, 4);
    game.after(7, () => {
      game.player.userData.cheering = false;
      game.finishDay(t('d12.end'));
    });
  },
};
