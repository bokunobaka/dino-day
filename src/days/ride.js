// Mini-game · Pterodactyl flight: glide over the valley and gather amber gems. Drag or tap left/right to steer.
// Nothing can go wrong: the flight always ends at the golden ring.
import * as THREE from 'three';
import { sfx } from '../audio.js';
import { say } from '../speech.js';
import { t } from '../i18n.js';
import { pathX, FLY_Y } from '../areas/sky.js';

const SPEED = 6.5;

export default {
  id: 101,
  minigame: 'ride',
  name: t('mg.ride.name'),
  sticker: '🦅',
  area: 'sky',
  intro: t('mg.ride.intro'),
  steps: [],

  start(game) {
    const a = game.area;
    this.z = 8;
    this.offset = 0;
    this.target = 0;
    this.score = 0;
    this.finished = false;
    game.state = 'minigame';
    game.score = 0;
    if (game.pet) game.pet.root.visible = false;
    game.player.userData.cheering = true;
    this.pose(game, 0);
  },

  pose(game, t0) {
    const a = game.area;
    const x = pathX(this.z) + this.offset;
    const ahead = pathX(this.z - 2) + this.offset;
    const heading = Math.atan2(ahead - x, -2);
    const bob = Math.sin(t0 * 2.2) * 0.35;
    a.ptero.root.position.set(x, FLY_Y + bob - 0.4, this.z);
    a.ptero.root.rotation.y = heading;
    a.ptero.root.rotation.z = -(this.target - this.offset) * 0.06;
    a.ptero.update(0.016);
    game.player.position.set(x, FLY_Y + bob + 1.5, this.z);
    game.heading = heading;
    game.player.rotation.y = heading;
  },

  // drag or tap: the pterodactyl leans toward that side of the screen
  onTap(game, ndc) {
    this.target = THREE.MathUtils.clamp(ndc.x * 4.0, -3.2, 3.2);
  },

  update(game, dt, time) {
    if (this.finished) return;
    const a = game.area;
    this.z -= SPEED * dt;
    this.offset += (this.target - this.offset) * Math.min(1, dt * 2.6);
    this.pose(game, time);
    const px = game.player.position.x;
    for (const s of a.stars) {
      if (s.taken) continue;
      s.group.rotation.y = time * 2;
      if (Math.abs(s.group.position.z - this.z) < 1.5 && Math.abs(s.group.position.x - px) < 1.9) {
        s.taken = true;
        s.group.visible = false;
        this.score += s.heart ? 2 : 1;
        game.score = this.score;
        sfx.note(this.score);
        game.burst(s.group.position, 14, 1.4, 0, s.heart ? [0xff9ac7, 0xffffff] : [0xffd27a, 0xffffff]);
        game.ui.setScore(this.score);
      }
    }
    if (this.z <= a.finishZ) this.finish(game);
  },

  finish(game) {
    this.finished = true;
    sfx.fanfare();
    sfx.animal('ptero');
    say(t('mg.ride.done'));
    game.player.userData.cheering = true;
    game.confettiAt(game.player.position, 4);
    game.after(5, () => {
      game.player.userData.cheering = false;
      game.player.position.y = 0;
      game.player.rotation.z = 0;
      game.finishDay();
    });
  },
};
