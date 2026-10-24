// Day 11 · Sea Floor Day: open the clams for pearls, befriend three sea reptiles, open the treasure chest.
import * as THREE from 'three';
import { sfx } from '../audio.js';
import { say } from '../speech.js';
import { t } from '../i18n.js';

export default {
  id: 11,
  name: t('d11.name'),
  sticker: '🐚',
  area: 'seafloor',
  intro: t('d11.intro'),
  steps: [
    { id: 'pearls', icon: '🦪', count: 3, hint: t('d11.h.pearls') },
    { id: 'friends', icon: '🐢', count: 3, hint: t('d11.h.friends') },
    { id: 'chest', icon: '💎', count: 1, hint: t('d11.h.chest') },
  ],

  start(game) {
    const a = game.area;

    a.shells.forEach((s) => {
      s.item = game.addItem({
        pos: s.pos, hitRadius: 1.2, reach: 1.6, hitY: 0.5,
        run: () => {
          if (s.opened) return;
          s.opened = true;
          s.item.enabled = false;
          s.glow.visible = false;
          sfx.pop();
          const lid = s.group.userData.lid;
          const pearl = s.group.userData.pearl;
          game.tween(0.5, (k) => (lid.rotation.x = -k * 1.0));
          pearl.visible = true;
          game.after(0.5, () => {
            sfx.chime();
            game.addToBag('pearl');
            game.burst({ x: s.pos.x, y: 0.8, z: s.pos.z }, 20, 1.4, 0.5, [0xffffff, 0xfff1d6, 0xffd0ec]);
            const p0 = pearl.position.clone();
            game.tween(0.5, (k) => {
              pearl.position.set(p0.x, p0.y + Math.sin(k * Math.PI) * 1.2 + k * 1.6, p0.z);
              pearl.scale.setScalar(Math.max(0.01, 1 - k * k));
            }, () => (pearl.visible = false));
          });
          say(t('nums')[Math.min(game.progress, 5)]);
          game.addProgress('pearls');
        },
      });
    });
    game.hintSpots = () => {
      if (!game.step) return [];
      if (game.step.id === 'pearls') return a.shells.filter((s) => !s.opened).map((s) => ({ x: s.pos.x, y: 0.9, z: s.pos.z }));
      if (game.step.id === 'friends') return a.swimmers.filter((s) => s.free).map((s) => ({ x: s.c.root.position.x, y: 2.2, z: s.c.root.position.z }));
      return [];
    };

    a.swimmers.forEach((s) => {
      const c = s.c;
      const bubble = game.addBubble(c.root, '💙', c.height + 0.8);
      s.item = game.addItem({
        track: c.root, hitRadius: 1.8, reach: 2.8, hitY: 1.6,
        run: () => {
          if (!s.free) return;
          s.free = false;
          s.item.enabled = false;
          bubble.remove();
          c.dest = null;
          sfx.animal(c.name);
          c.gesture('gesture-positive');
          game.hearts.emit(c.root.position.x, 2.6, c.root.position.z, 8, { speed: 0.6, up: 1.4, life: 1.6, colors: [0x6ad7ff, 0xff8fc7, 0xffffff] });
          game.after(1.0, () => game.addFollower(c));
          say(t('d11.friend'));
          game.addProgress('friends');
        },
      });
    });

    this.chestItem = game.addItem({
      pos: a.chestPos, hitRadius: 1.8, reach: 2.8, hitY: 1.0,
      run: () => {
        if (!game.step || game.step.id !== 'chest') {
          sfx.nope();
          say(t('d11.locked'));
          return;
        }
        this.openChest(game);
      },
    });
  },

  onStep(game, id) {
    if (id === 'chest') game.setArrow(game.area.chestPos, 3.4);
  },

  openChest(game) {
    const a = game.area;
    this.chestItem.enabled = false;
    game.setArrow(null);
    game.state = 'party';
    game.target = null;
    game.clearFollowers();
    sfx.creak && sfx.creak();
    const lid = a.chest.userData.lid;
    game.tween(1.0, (k) => (lid.rotation.x = -k * 1.2));
    game.after(1.0, () => {
      a.chestGlow.visible = true;
      sfx.fanfare();
      say(t('d11.opened'));
      for (let i = 0; i < 6; i++)
        game.after(i * 0.2, () =>
          game.sparkles.emit(0, 2.2, -11.5, 30, { speed: 3, up: 6, life: 1.6, colors: [0xffe066, 0xff8fc7, 0x6ad7ff, 0xffffff], gravity: 6, spread: 0.4 })
        );
      game.addProgress('chest');
    });
  },

  onDone(game) {
    const a = game.area;
    game.state = 'party';
    game.target = null;
    game.player.userData.cheering = true;
    a.swimmers.forEach((s, i) => {
      const c = s.c;
      c.goTo(-4 + i * 4, -6, { speed: 3, onArrive: () => c.play('dance') });
    });
    game.confettiAt({ x: 0, z: -9 }, 4);
    game.after(7, () => {
      game.player.userData.cheering = false;
      game.finishDay(t('d11.end'));
    });
  },
};
