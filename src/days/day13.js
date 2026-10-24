// Day 13 · Band Day: find three instruments, stomp the glowing drum pads, play on the stage.
import * as THREE from 'three';
import { sfx } from '../audio.js';
import { say } from '../speech.js';
import { t } from '../i18n.js';

export default {
  id: 13,
  name: t('d13.name'),
  sticker: '🥁',
  area: 'stage',
  intro: t('d13.intro'),
  steps: [
    { id: 'items', icon: '🥁', count: 3, hint: t('d13.h.items') },
    { id: 'beat', icon: '🎵', count: 3, hint: t('d13.h.beat') },
    { id: 'show', icon: '🎤', count: 1, hint: t('d13.h.show') },
  ],

  start(game) {
    const a = game.area;
    this.beat = 0;

    a.finds.forEach((f, i) => {
      f.item = game.addItem({
        pos: f.pos, hitRadius: 1.0, reach: 1.5, hitY: 0.6,
        run: () => {
          if (f.taken) return;
          f.taken = true;
          f.item.enabled = false;
          f.glow.visible = false;
          sfx.chime();
          if (f.kind === 'drum') sfx.drum(0);
          game.addToBag(f.kind === 'drum' ? 'drum' : f.kind === 'horn' ? 'horn' : 'star');
          game.burst({ x: f.pos.x, y: 0.8, z: f.pos.z }, 14, 1.1, 0.3, [0xffe066, 0xffffff]);
          game.pickUp(f.group, 1.2);
          say(t('d13.found'));
          game.addProgress('items');
        },
      });
    });
    game.hintSpots = () =>
      game.step && game.step.id === 'items' ? a.finds.filter((f) => !f.taken).map((f) => ({ x: f.pos.x, y: 1, z: f.pos.z })) : [];

    this.stageItem = game.addItem({
      pos: a.stagePos, hitRadius: 2.8, reach: 4.0, hitY: 1.2,
      run: () => this.show(game),
    });
    this.stageItem.enabled = false;
  },

  onStep(game, id) {
    const a = game.area;
    if (id === 'beat') {
      a.marks.forEach((m, i) => {
        m.visible = true;
        const it = game.addItem({
          pos: { x: m.position.x, z: m.position.z }, hitRadius: 1.2, reach: 0.5, hitY: 0.3,
          run: () => {
            if (it.done) return;
            it.done = true;
            it.enabled = false;
            m.material.opacity = 1;
            sfx.drum(this.beat);
            sfx.stomp();
            game.player.userData.spin(0.9);
            game.burst({ x: m.position.x, y: 0.6, z: m.position.z }, 24, 1.8, 0.4, [m.material.color.getHex(), 0xffffff]);
            a.friends.forEach((c, k) => game.after(k * 0.15, () => c.play('dance')));
            game.after(1.6, () => a.friends.forEach((c) => c.play('idle')));
            say(t('poses')[this.beat % 3]);
            this.beat++;
            game.addProgress('beat');
          },
        });
      });
      game.hintSpots = () =>
        game.step && game.step.id === 'beat' ? a.marks.filter((m) => m.material.opacity < 1).map((m) => ({ x: m.position.x, y: 0.5, z: m.position.z })) : [];
    }
    if (id === 'show') {
      a.stageGlow.visible = true;
      this.stageItem.enabled = true;
      game.setArrow(a.stagePos, 3.6);
    }
  },

  show(game) {
    const a = game.area;
    game.state = 'party';
    game.target = null;
    game.setArrow(null);
    game.hop(game.player.position, a.stageSpot.clone(), 0.8, 1.4, () => {
      game.player.userData.cheering = false;
      game.heading = 0;
    });
    sfx.chime();
    game.tween(2.2, (k) => {
      a.curtL.position.x = -2.2 - k * 4.2;
      a.curtR.position.x = 2.2 + k * 4.2;
    });
    // a drum solo
    for (let i = 0; i < 8; i++) game.after(1.4 + i * 0.28, () => {
      sfx.drum(i % 4);
      game.burst({ x: 0, y: 1.4, z: a.stagePos.z + 0.2 }, 6, 1.2, 0, [0xffe066, 0xff8fc7, 0x6ad7ff]);
    });
    game.after(3.8, () => {
      sfx.applause();
      say(t('d13.applause'));
      game.confettiAt({ x: 0, z: a.stagePos.z }, 5);
      game.player.userData.spin(2.0);
      a.friends.forEach((c) => c.play('dance'));
    });
    game.after(6.5, () => {
      game.player.position.set(0, 0, a.stagePos.z + 4.2);
      game.state = 'play';
      game.addProgress('show');
    });
  },

  onDone(game) {
    game.state = 'party';
    game.target = null;
    sfx.fanfare();
    say(t('d13.done'));
    game.player.userData.cheering = true;
    game.area.friends.forEach((c) => c.play('dance'));
    game.after(6, () => {
      game.player.userData.cheering = false;
      game.finishDay(t('d13.end'));
    });
  },
};
