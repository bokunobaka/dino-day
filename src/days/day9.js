// Day 9 · Snow Day: roll up a snow dino, dress it, and give presents to the shivering friends.
import * as THREE from 'three';
import { sfx } from '../audio.js';
import { say } from '../speech.js';
import { t } from '../i18n.js';
import { makeSnowPile } from '../scenery.js';

const ORDER = ['body', 'head', 'tail'];

export default {
  id: 9,
  name: t('d9.name'),
  sticker: '⛄',
  area: 'snow',
  intro: t('d9.intro'),
  steps: [
    { id: 'balls', icon: '⛄', count: 3, hint: t('d9.h.balls') },
    { id: 'dress', icon: '🧣', count: 3, hint: t('d9.h.dress') },
    { id: 'gifts', icon: '🎁', count: 3, hint: t('d9.h.gifts') },
  ],

  start(game) {
    const a = game.area;
    this.built = 0;
    this.given = 0;

    a.piles.forEach((p, i) => {
      p.item = game.addItem({
        pos: p.pos, hitRadius: 1.4, reach: 1.8, hitY: 0.5,
        run: () => {
          if (p.taken) return;
          p.taken = true;
          p.item.enabled = false;
          sfx.pop();
          game.addToBag('snowball');
          const part = a.parts[ORDER[this.built++]];
          // a snowball rolls over from the pile and becomes part of the snow dino
          const ball = makeSnowPile(0.9);
          ball.position.copy(p.pos);
          a.group.add(ball);
          p.glow.visible = false;
          game.pickUp(p.group, 0.3, 0.3);
          game.hop(ball.position, new THREE.Vector3(a.sitePos.x, 1.2, a.sitePos.z), 1.0, 2.4, () => {
            ball.removeFromParent();
            part.visible = true;
            part.scale.setScalar(0.1);
            sfx.stomp();
            game.tween(0.4, (k) => part.scale.setScalar(Math.max(0.1, k)));
            game.burst({ x: a.sitePos.x, y: 1.8, z: a.sitePos.z }, 18, 1.6, 0.6, [0xffffff, 0xcfeaff]);
          });
          say(t('nums')[Math.min(game.progress, 5)]);
          game.addProgress('balls');
        },
      });
    });
    game.hintSpots = () => {
      if (!game.step) return [];
      if (game.step.id === 'balls') return a.piles.filter((p) => !p.taken).map((p) => ({ x: p.pos.x, y: 0.9, z: p.pos.z }));
      if (game.step.id === 'dress') return a.bits.filter((b) => !b.taken).map((b) => ({ x: b.pos.x, y: 1.5, z: b.pos.z }));
      if (game.step.id === 'gifts') return a.presents.filter((p) => !p.given).map((p) => ({ x: p.pos.x, y: 1.1, z: p.pos.z }));
      return [];
    };

    a.bits.forEach((b) => {
      b.item = game.addItem({
        pos: b.pos, hitRadius: 0.8, reach: 3.0, hitY: 0.9,
        run: () => {
          if (b.taken) return;
          if (this.built < 3) {
            sfx.nope();
            say(t('d9.needDino'));
            return;
          }
          b.taken = true;
          b.item.enabled = false;
          sfx.chime();
          game.hop(b.group.position, new THREE.Vector3(a.sitePos.x, 2.6, a.sitePos.z + 1), 0.9, 2.2, () => {
            b.group.visible = false;
            a.parts[b.key].visible = true;
            a.parts[b.key].scale.setScalar(0.1);
            game.tween(0.35, (k) => a.parts[b.key].scale.setScalar(Math.max(0.1, k)));
            game.burst({ x: a.sitePos.x, y: 2.6, z: a.sitePos.z + 1 }, 16, 1.4, 0.4, [0xffffff, 0xffe35a, 0xff8fa8]);
          });
          game.addProgress('dress');
        },
      });
    });

    a.friends.forEach((c) => {
      const bubble = game.addBubble(c.root, '🥶', c.height + 0.6);
      c.bubble = bubble;
    });
    this.dinoItem = game.addItem({
      pos: a.sitePos, hitRadius: 2.2, reach: 3.4, hitY: 1.5,
      run: () => {
        sfx.boing();
        game.sparkles.emit(a.sitePos.x, 3, a.sitePos.z, 12, { speed: 1, up: 1.4, life: 1.0, colors: [0xffffff, 0xcfeaff] });
        if (this.built < 3) say(t('d9.dino.build'));
      },
    });
  },

  onStep(game, id) {
    const a = game.area;
    if (id === 'dress') {
      game.setArrow(a.benchPos, 2.6);
    }
    if (id === 'gifts') {
      game.setArrow(null);
      a.presents.forEach((p, i) => {
        p.group.visible = true;
        p.group.scale.setScalar(0.01);
        game.after(i * 0.2, () => {
          sfx.pop();
          game.tween(0.4, (k) => p.group.scale.setScalar(Math.max(0.01, 1.7 * k)));
        });
        p.item = game.addItem({
          pos: p.pos, hitRadius: 1.0, reach: 2.2, hitY: 0.6,
          run: () => {
            if (p.given) return;
            p.given = true;
            p.item.enabled = false;
            const c = a.friends[this.given++ % a.friends.length];
            sfx.chime();
            game.hop(p.group.position, new THREE.Vector3(c.root.position.x + 0.8, 0, c.root.position.z), 1.0, 2.6, () => {
              p.group.visible = false;
              c.shiver = false;
              c.root.rotation.z = 0;
              c.bubble.remove();
              sfx.animal(c.name);
              c.gesture('gesture-positive');
              game.after(1.0, () => c.play('dance'));
              game.hearts.emit(c.root.position.x, 2, c.root.position.z, 10, { speed: 0.8, up: 1.4, life: 1.6, colors: [0xff5fae, 0xff8fc7, 0xffffff] });
              say(t('d9.thanks'));
            });
            game.addProgress('gifts');
          },
        });
      });
    }
  },

  onDone(game) {
    const a = game.area;
    game.state = 'party';
    game.target = null;
    sfx.fanfare();
    say(t('d9.done'));
    game.player.userData.cheering = true;
    game.confettiAt(a.sitePos, 5);
    for (let i = 0; i < 6; i++)
      game.after(0.4 + i * 0.5, () => {
        game.sparkles.emit((Math.random() - 0.5) * 14, 6 + Math.random() * 4, -6 + (Math.random() - 0.5) * 6, 36, {
          speed: 3, up: 2, life: 1.4, colors: [[0xbfe3ff, 0xffffff], [0xfff1a8, 0xffffff], [0xff9ac7, 0xffffff]][i % 3], gravity: 3, spread: 0.3,
        });
        sfx.sparkle();
      });
    game.after(8, () => {
      game.player.userData.cheering = false;
      game.finishDay(t('d9.end'));
    });
  },
};
