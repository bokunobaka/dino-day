// Day 14 · Circus Day: gather five balls, walk the log over the lava stream, send the circus triceratops through the fiery hoop.
import * as THREE from 'three';
import { sfx } from '../audio.js';
import { say } from '../speech.js';
import { t } from '../i18n.js';

export default {
  id: 14,
  name: t('d14.name'),
  sticker: '🎪',
  area: 'circus',
  intro: t('d14.intro'),
  steps: [
    { id: 'balls', icon: '⚽', count: 5, hint: t('d14.h.balls') },
    { id: 'log', icon: '🤹', count: 1, hint: t('d14.h.log') },
    { id: 'hoop', icon: '🦕', count: 1, hint: t('d14.h.hoop') },
  ],

  start(game) {
    const a = game.area;
    // the circus has a rope-free zone: the stream can only be crossed on the log
    this.walked = false;
    this.jumped = false;

    a.balls.forEach((b) => {
      b.item = game.addItem({
        pos: b.pos, hitRadius: 1.0, reach: 1.4, hitY: 0.7,
        run: () => {
          if (b.taken) return;
          b.taken = true;
          b.item.enabled = false;
          b.glow.visible = false;
          sfx.pop();
          game.addToBag('ball');
          game.burst({ x: b.pos.x, y: 0.7, z: b.pos.z }, 12, 1, 0.3, [0xffffff, 0xffe066, 0xff8fc7]);
          game.pickUp(b.group, 1.2);
          say(t('nums')[Math.min(game.progress, 5)]);
          game.addProgress('balls');
        },
      });
    });
    game.hintSpots = () => (game.step && game.step.id === 'balls' ? a.balls.filter((b) => !b.taken).map((b) => ({ x: b.pos.x, y: 1, z: b.pos.z })) : []);

    // the log over the lava
    this.logItem = game.addItem({
      pos: a.beamStart, hitRadius: 1.4, reach: 1.4, hitY: 0.9,
      run: () => this.walkLog(game),
    });

    // the circus triceratops
    this.triItem = game.addItem({
      track: a.tri.root, hitRadius: 1.5, reach: 3.6, hitY: 1.0,
      run: () => this.jump(game),
    });
  },

  onStep(game, id) {
    const a = game.area;
    if (id === 'log') game.setArrow(a.beamStart, 2.8);
    if (id === 'hoop') game.setArrow(a.triPos, 3.6);
  },

  walkLog(game) {
    const a = game.area;
    if (this.walking || this.walked) return;
    if (!game.step || game.step.id !== 'log') {
      sfx.nope();
      say(t('d14.logEarly'));
      return;
    }
    this.walking = true;
    game.setArrow(null);
    game.state = 'party';
    game.target = null;
    const p = game.player;
    const from = a.beamStart;
    const to = a.beamEnd;
    p.userData.cheering = true; // arms out for balance
    game.hop(p.position, new THREE.Vector3(from.x + 0.5, 0.72, from.z), 0.5, 0.7, () => {
      say(t('d14.balance'));
      game.heading = Math.PI / 2;
      game.tween(4.2, (k) => {
        p.position.set(from.x + 0.5 + (to.x - 0.5 - from.x - 0.5) * k, 0.72, from.z);
        p.rotation.z = Math.sin(k * 24) * 0.12 * (1 - Math.abs(k - 0.5));
        if (Math.floor(k * 40) % 8 === 0) game.sparkles.emit(p.position.x, 0.9, p.position.z, 1, { speed: 0.3, up: 0.4, life: 0.6, colors: [0xffe066] });
      }, () => {
        p.rotation.z = 0;
        game.hop(p.position, new THREE.Vector3(to.x + 0.8, 0, to.z + 2.2), 0.5, 0.8, () => {
          p.userData.cheering = false;
          sfx.fanfare();
          say(t('d14.balanced'));
          game.confettiAt(p.position, 3);
          game.state = 'play';
          this.walked = true;
          game.addProgress('log');
        });
      });
    });
  },

  jump(game) {
    const a = game.area;
    const tri = a.tri;
    sfx.animal('tri');
    tri.gesture('gesture-positive');
    if (this.jumped || !game.step || game.step.id !== 'hoop') return;
    this.jumped = true;
    game.setArrow(null);
    this.triItem.enabled = false;
    game.state = 'party';
    say(t('d14.tri'));
    a.hoop.userData.fire.visible = true;
    sfx.fire();
    const start = tri.root.position.clone();
    const end = new THREE.Vector3(a.hoopPos.x + 4.5, 0, a.hoopPos.z);
    game.after(1.0, () => {
      tri.play('dance');
      game.hop(tri.root, end, 1.3, 2.4, () => {
        tri.root.position.y = 0;
        sfx.animal('tri');
        game.confettiAt(a.hoopPos, 3.2);
        game.burst({ x: a.hoopPos.x, y: 2.4, z: a.hoopPos.z }, 40, 2.4, 0, [0xffb347, 0xffe066, 0xffffff]);
        sfx.fanfare();
        game.after(1.2, () => {
          tri.root.position.set(start.x, 0, start.z);
          tri.play('idle');
          a.hoop.userData.fire.visible = false;
          game.state = 'play';
          game.addProgress('hoop');
        });
      });
    });
  },

  onDone(game) {
    game.state = 'party';
    game.target = null;
    sfx.fanfare();
    say(t('d14.done'));
    game.player.userData.cheering = true;
    game.area.tri.play('dance');
    game.confettiAt({ x: 0, z: -2 }, 5);
    game.after(7, () => {
      game.player.userData.cheering = false;
      game.finishDay(t('d14.end'));
    });
  },
};
