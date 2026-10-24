// Day 4 · Picnic Day: invite friends, seat them on the blanket, serve each the food they like.
import * as THREE from 'three';
import { sfx } from '../audio.js';
import { say } from '../speech.js';
import { t } from '../i18n.js';
import { Dino } from '../dinos.js';
import { makeLeafBundle, makeBerry, makeFish } from '../scenery.js';

const TREATS = [
  { id: 'fern', icon: '🌿', word: t('treat.fern'), make: () => makeLeafBundle(), scale: 2.2 },
  { id: 'berry', icon: '🍇', word: t('treat.berry'), make: () => makeBerry(), scale: 2.4 },
  { id: 'fish', icon: '🐟', word: t('treat.fish'), make: () => makeFish(), scale: 2.2 },
];

export default {
  id: 4,
  name: t('d4.name'),
  sticker: '🧺',
  area: 'meadow',
  intro: t('d4.intro'),
  steps: [
    { id: 'invite', icon: '💌', count: 3, hint: t('d4.h.invite') },
    { id: 'seat', icon: '🧺', count: 1, hint: t('d4.h.seat') },
    { id: 'serve', icon: '🍽️', count: 3, hint: t('d4.h.serve') },
  ],

  start(game) {
    const a = game.area;
    this.selected = null;
    a.picnic.visible = true;
    a.nest.visible = false; // the picnic takes the nest's spot today
    a.colliders = a.colliders.filter((c) => !(c.x === 0 && c.z === -9));

    const roster = [
      { sp: 'tri', h: 1.7, at: [-9.5, 3.5], hd: 1, name: t('animal.tri'), likes: 'fern' },
      { sp: 'steg', h: 1.7, at: [9.5, 0.5], hd: -1, name: t('animal.steg'), likes: 'berry' },
      { sp: 'raptor', h: 1.8, at: [10, -7], hd: -1.4, name: t('animal.raptor'), likes: 'fish' },
    ].map((r, i) => {
      const c = new Dino(r.sp, r.h);
      c.root.position.set(r.at[0], 0, r.at[1]);
      c.heading = r.hd;
      c.root.rotation.y = r.hd;
      a.group.add(c.root);
      game.addCritter(c);
      return { ...r, c, slot: a.seats[i] };
    });
    this.guests = roster;

    roster.forEach((g) => {
      const c = g.c;
      g.bubble = game.addBubble(c.root, '💌', c.height + 0.6);
      g.item = game.addItem({
        track: c.root, hitRadius: 1.2, reach: 1.9, hitY: 0.9,
        run: () => {
          if (g.invited) return;
          g.invited = true;
          g.item.enabled = false;
          g.bubble.remove();
          g.bubble = null;
          sfx.chime();
          c.gesture('gesture-positive');
          game.hearts.emit(c.root.position.x, 1.8, c.root.position.z, 8, { speed: 0.6, up: 1.4, life: 1.6, colors: [0xff5fae, 0xff8fc7] });
          say(t('d4.yes', { name: g.name }));
          game.after(1.4, () => game.addFollower(c));
          game.addProgress('invite');
        },
      });
    });

    this.table = game.addItem({
      pos: a.picnicPos, hitRadius: 3.0, reach: 4.4, hitY: 0.3,
      run: () => {
        a.mama.gesture('gesture-positive');
        sfx.animal('bronto');
        if (game.sillyTap('mama')) {
          a.mama.play('roar');
          sfx.chime();
          game.confettiAt(a.mama.root.position, 5);
        }
        const id = game.step && game.step.id;
        if (id === 'seat') this.seat(game);
        else if (id === 'invite') say(t('d4.mama'));
      },
    });
  },

  onStep(game, id) {
    if (id === 'seat') game.setArrow(game.area.picnicPos, 2.4);
  },

  seat(game) {
    const a = game.area;
    game.setArrow(null);
    game.state = 'party';
    game.target = null;
    game.walkTo(0, -4.6, 0.1, null, () => game.faceToward(a.picnicPos));
    game.clearFollowers(); // friends stop following and go to their places
    let seated = 0;
    const arrived = () => {
      if (++seated < this.guests.length) return;
      game.after(0.6, () => {
        this.guests.forEach((g) => (g.c.heading = Math.atan2(a.picnicPos.x - g.c.root.position.x, a.picnicPos.z - g.c.root.position.z)));
        sfx.chime();
        game.state = 'play';
        game.advanceStepSilent();
        this.beginServing(game);
      });
    };
    this.guests.forEach((g, i) => {
      game.after(i * 0.4, () => g.c.goTo(g.slot.x, g.slot.z, { speed: 4.2, onArrive: arrived }));
    });
  },

  beginServing(game) {
    say(t('d4.look'));
    game.ui.showTray(TREATS, (id) => {
      this.selected = id;
      sfx.tap();
    });
    this.guests.forEach((g) => {
      const treat = TREATS.find((x) => x.id === g.likes);
      g.bubble = game.addBubble(g.c.root, treat.icon, g.c.height + 0.7);
      g.item.enabled = true;
      g.item.reach = 99;
      g.served = false;
      g.item.run = () => this.serve(game, g);
    });
  },

  serve(game, g) {
    if (g.served) return;
    const a = game.area;
    if (!this.selected) {
      sfx.nope();
      say(t('d4.pickFirst'));
      game.ui.pulseTray();
      return;
    }
    const c = g.c;
    if (this.selected !== g.likes) {
      sfx.nope();
      c.gesture('gesture-negative');
      const want = TREATS.find((x) => x.id === g.likes);
      say(t('d4.no', { name: g.name, want: want.word }));
      return;
    }
    g.served = true;
    g.item.enabled = false;
    g.bubble.remove();
    const treat = TREATS.find((x) => x.id === g.likes);
    const m = treat.make();
    m.scale.setScalar(treat.scale);
    m.position.set(c.root.position.x, 2.0, c.root.position.z);
    a.group.add(m);
    c.play('eat');
    sfx.pop();
    game.tween(0.9, (k) => (m.position.y = 2.0 - k * 0.9), () => m.removeFromParent());
    game.after(1.4, () => {
      sfx.chime();
      game.hearts.emit(c.root.position.x, 2, c.root.position.z, 10, { speed: 0.8, up: 1.4, life: 1.8, colors: [0xff5fae, 0xff8fc7, 0xffffff] });
      say(t('d4.yum', { name: g.name }));
      c.gesture('gesture-positive');
      game.after(1.0, () => c.play('idle'));
    });
    game.addProgress('serve');
  },

  onDone(game) {
    const a = game.area;
    game.ui.hideTray();
    game.state = 'party';
    game.after(1.8, () => {
      sfx.fanfare();
      say(t('d4.cheer'));
      a.mama.play('roar');
      game.player.userData.cheering = true;
      this.guests.forEach((g) => g.c.play('dance'));
      game.confettiAt(a.picnicPos, 3.4);
      game.burst({ x: a.picnicPos.x, y: 1.2, z: a.picnicPos.z }, 50, 2.5, 1.5);
    });
    game.after(7.5, () => {
      game.player.userData.cheering = false;
      game.finishDay(t('d4.end'));
    });
  },
};
