// Day 5 · Volcano Party: light the torches, invite friends, stomp the glowing footprints, then the volcano erupts in fireworks.
import * as THREE from 'three';
import { sfx } from '../audio.js';
import { say } from '../speech.js';
import { t } from '../i18n.js';
import { Dino } from '../dinos.js';

const FRIENDS = [
  { sp: 'raptor', h: 1.8, at: [-11, 3], hello: t('d5.hello.raptor') },
  { sp: 'anky', h: 1.4, at: [11, 3], hello: t('d5.hello.anky') },
  { sp: 'para', h: 2.5, at: [-12, -3], hello: t('d5.hello.para') },
  { sp: 'spino', h: 2.3, at: [12, -3], hello: t('d5.hello.spino') },
];

export default {
  id: 5,
  name: t('d5.name'),
  sticker: '🌋',
  area: 'volcano',
  intro: t('d5.intro'),
  steps: [
    { id: 'light', icon: '🔥', count: 3, hint: t('d5.h.light') },
    { id: 'invite', icon: '💌', count: 4, hint: t('d5.h.invite') },
    { id: 'stomp', icon: '👣', count: 6, hint: t('d5.h.stomp') },
  ],

  start(game) {
    const a = game.area;
    this.friends = [];

    a.torches.forEach((tc) => {
      const item = game.addItem({
        pos: tc.pos, hitRadius: 1.1, reach: 1.8, hitY: 1.6,
        run: () => {
          if (tc.lit) return;
          tc.lit = true;
          item.enabled = false;
          tc.fire.visible = true;
          sfx.fire();
          game.burst({ x: tc.pos.x, y: 2.0, z: tc.pos.z }, 20, 1.4, 0, [0xffe9a8, 0xffb347, 0xff7a1f]);
          game.addProgress('light');
        },
      });
    });
    game.hintSpots = () =>
      game.step && game.step.id === 'light' ? a.torches.filter((x) => !x.lit).map((x) => ({ x: x.pos.x, y: 2.0, z: x.pos.z })) : [];

    FRIENDS.forEach((f, i) => {
      const c = new Dino(f.sp, f.h);
      c.root.position.set(f.at[0], 0, f.at[1]);
      c.heading = f.at[0] < 0 ? 1.2 : -1.2;
      c.root.rotation.y = c.heading;
      a.group.add(c.root);
      game.addCritter(c);
      this.friends.push(c);
      const bubble = game.addBubble(c.root, '💌', f.h + 0.6);
      const item = game.addItem({
        track: c.root, hitRadius: 1.3, reach: 2.2, hitY: 1,
        run: () => {
          item.enabled = false;
          bubble.remove();
          sfx.chime();
          c.gesture('gesture-positive');
          say(f.hello);
          const ang = (i / FRIENDS.length) * Math.PI * 2 + 0.8;
          game.after(1.2, () => c.goTo(a.center.x + Math.cos(ang) * 2.0 * 1.5, a.center.z + Math.sin(ang) * 1.6 * 1.5 - 3.6, {
            speed: 4,
            onArrive: () => {
              c.heading = Math.atan2(a.center.x - c.root.position.x, a.center.z - 3.6 - c.root.position.z);
              c.play('dance');
            },
          }));
          game.addProgress('invite');
        },
      });
    });
  },

  onStep(game, id) {
    if (id === 'stomp') this.startStomp(game);
  },

  startStomp(game) {
    const a = game.area;
    this.stepped = 0;
    a.tiles.forEach((tile, i) => {
      tile.visible = true;
      const item = game.addItem({
        pos: { x: tile.position.x, z: tile.position.z }, hitRadius: 1.0, reach: 0.5, hitY: 0.3,
        run: () => {
          if (item.done) return;
          item.done = true;
          item.enabled = false;
          tile.material.opacity = 1;
          sfx.stomp();
          sfx.note(this.stepped);
          this.stepped++;
          game.burst({ x: tile.position.x, y: 0.3, z: tile.position.z }, 18, 1.5, 0.4, [tile.material.color.getHex(), 0xffffff]);
          game.addProgress('stomp');
        },
      });
    });
    game.hintSpots = () =>
      game.step && game.step.id === 'stomp' ? a.tiles.filter((x) => x.material.opacity < 1).map((x) => ({ x: x.position.x, y: 0.4, z: x.position.z })) : [];
    this.pulse = (tm) => a.tiles.forEach((tile, i) => { if (tile.material.opacity < 1) tile.material.opacity = 0.45 + Math.sin(tm * 4 + i) * 0.2; });
  },

  update(game, dt, tm) {
    if (this.pulse && game.step && game.step.id === 'stomp') this.pulse(tm);
  },

  onDone(game) {
    const a = game.area;
    game.state = 'party';
    game.target = null;
    sfx.fanfare();
    say(t('d5.done'));
    game.walkTo(a.center.x, a.center.z + 3, 0.1, null, () => (game.player.userData.cheering = true));
    this.friends.forEach((c) => c.play('dance'));
    game.confettiAt(a.center, 4.5);
    // the volcano erupts: lava fountains from three vents + fireworks overhead
    sfx.animal('rex');
    for (let i = 0; i < 14; i++)
      game.after(0.6 + i * 0.5, () => {
        sfx.whoosh();
        for (const vx of [-8, 0, 8]) game.sparkles.emit(vx, 0.4, -9, 50, { speed: 1.4, up: 12, life: 2.0, colors: [0xff7a1f, 0xffb02e, 0xffe066], gravity: 9, spread: 0.6 });
        const x = (Math.random() - 0.5) * 18;
        const y = 5 + Math.random() * 5;
        const z = -3 + (Math.random() - 0.5) * 7;
        const colors = [[0xff6bb5, 0xffffff], [0xffe66b, 0xffb347], [0x6ad7ff, 0xffffff], [0x9bff7a, 0xffffff]][i % 4];
        game.after(0.8, () => {
          game.sparkles.emit(x, y, z, 50, { speed: 4, up: 3, life: 1.6, colors, gravity: 3, spread: 0.3 });
          sfx.sparkle();
        });
      });
    game.after(9.5, () => {
      game.player.userData.cheering = false;
      game.finishDay(t('d5.end'));
    });
  },
};
