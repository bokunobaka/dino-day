// Day 8 · Jungle Run: find three amber stones, roll the boulder away, run to the sunny nest.
// The raptors only want to play tag and give hugs.
import * as THREE from 'three';
import { sfx } from '../audio.js';
import { say } from '../speech.js';
import { t } from '../i18n.js';

export default {
  id: 8,
  name: t('d8.name'),
  sticker: '🌴',
  area: 'jungle',
  intro: t('d8.intro'),
  steps: [
    { id: 'amber', icon: '🔶', count: 3, hint: t('d8.h.amber') },
    { id: 'gate', icon: '🪨', count: 1, hint: t('d8.h.gate') },
    { id: 'run', icon: '🏃', count: 1, hint: t('d8.h.run') },
  ],

  start(game) {
    const a = game.area;
    this.bumps = 0;

    a.ambers.forEach((k) => {
      k.item = game.addItem({
        pos: k.pos, hitRadius: 1.0, reach: 1.4, hitY: 1.0,
        run: () => {
          if (k.taken) return;
          k.taken = true;
          k.item.enabled = false;
          k.glow.visible = false;
          sfx.key();
          game.addToBag('amber');
          game.burst({ x: k.pos.x, y: 1, z: k.pos.z }, 18, 1.4, 0.6, [0xfff1a8, 0xffffff, 0xffb21f]);
          game.pickUp(k.group, 1.2);
          say(t('d8.foundAmber'));
          game.addProgress('amber');
        },
      });
    });
    game.hintSpots = () =>
      game.step && game.step.id === 'amber' ? a.ambers.filter((k) => !k.taken).map((k) => ({ x: k.pos.x, y: 1.2, z: k.pos.z })) : [];

    // the boulder gate
    this.gateItem = game.addItem({
      pos: a.gatePos, hitRadius: 3.0, reach: 3.2, hitY: 2.2,
      run: () => {
        if ((game.bag.amber || 0) < 3) {
          sfx.nope();
          say(t('d8.gateNeeds'));
          return;
        }
        this.gateItem.enabled = false;
        game.setArrow(null);
        sfx.stomp();
        const x0 = a.gate.position.x;
        game.tween(2.0, (k) => {
          a.gate.position.x = x0 + k * 7.5;
          a.gate.rotation.z = -k * 6;
        });
        game.after(0.5, () => {
          a.open = true;
          say(t('d8.gateOpen'));
          game.addProgress('gate');
        });
      },
    });

    // friendly raptors: a bump gives a hug-wish, a giggle and a little bounce, never a penalty
    a.onBump = (z) => {
      if (game.state !== 'play') return;
      const c = z.c;
      const p = game.player.position;
      const away = new THREE.Vector3(c.root.position.x - p.x, 0, c.root.position.z - p.z).normalize();
      const from = c.root.position.clone();
      game.tween(0.5, (k) => {
        c.root.position.set(from.x + away.x * 2 * k, Math.sin(k * Math.PI) * 0.6, from.z + away.z * 2 * k);
      }, () => (c.root.position.y = 0));
      c.gesture('gesture-positive');
      c.heading = Math.atan2(p.x - c.root.position.x, p.z - c.root.position.z);
      sfx.boing();
      game.hearts.emit(c.root.position.x, 2.2, c.root.position.z, 6, { speed: 0.6, up: 1.2, life: 1.5, colors: [0xffd23f, 0xff8fc7] });
      this.bumps++;
      say(t('d8.bump' + ((this.bumps % 3) + 1)));
    };

    // the safe place
    this.safeItem = game.addItem({
      pos: a.safePos, hitRadius: 3.4, reach: 1.2, hitY: 0.5,
      run: () => this.escape(game),
    });
    this.safeItem.enabled = false;
  },

  onStep(game, id) {
    const a = game.area;
    if (id === 'gate') game.setArrow(a.gatePos, 4.6);
    if (id === 'run') {
      this.safeItem.enabled = true;
      game.setArrow(a.safePos, 4);
    }
  },

  escape(game) {
    const a = game.area;
    game.state = 'party';
    game.target = null;
    game.setArrow(null);
    a.chasing = false;
    game.advanceStepSilent();
    sfx.fanfare();
    say(t('d8.escaped'));
    game.player.userData.cheering = true;
    game.confettiAt(a.safePos, 4);
    game.burst({ x: a.safePos.x, y: 1.2, z: a.safePos.z }, 50, 2.6, 0.6, [0xfff1a8, 0xffffff, 0x9dff8a]);
    a.raptors.forEach((z) => z.c.play('dance'));
    game.after(7, () => {
      game.player.userData.cheering = false;
      game.finishDay(t('d8.end'));
    });
  },
};
