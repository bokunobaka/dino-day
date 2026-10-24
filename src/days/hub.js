// Home: Dino Valley. Not a "day" with quests: a place with things to do.
import * as THREE from 'three';
import { sfx } from '../audio.js';
import { say } from '../speech.js';
import { t } from '../i18n.js';
import { save } from '../save.js';
import { EGG_LOOKS } from '../areas/valley.js';

const TYPES = Object.keys(EGG_LOOKS);

export default {
  id: 0,
  hub: true,
  name: '',
  sticker: '',
  area: 'valley',
  intro: '',
  steps: [],

  start(game) {
    const a = game.area;
    const S = a.stations;
    game.saved.plots.forEach((p, i) => a.setPlot(i, p));

    // `hitAt` puts the invisible tap area on the thing itself (not where we walk to), so it can't block taps on things behind it
    const station = (st, icon, yOff, hitR, reach, run, track = st.group, hitAt = null) => {
      game.addBubble(track, icon, yOff);
      const item = game.addItem({ pos: st.pos, hitRadius: hitR, reach, hitY: 1.2, run });
      if (hitAt) item.hit.position.copy(hitAt);
    };

    station(S.perch, '🪽', 2.2, 1.6, 2.8, () => {
      sfx.animal('ptero');
      S.perch.bird.gesture('gesture-positive');
      say(t('hub.ride'));
      game.after(1.6, () => game.startDay(101));
    }, S.perch.group, new THREE.Vector3(-12.2, 3.2, -3));

    station(S.dance, '👣', 5.2, 2.0, 3.4, () => {
      sfx.stomp();
      say(t('hub.dance'));
      game.after(1.6, () => game.startDay(102));
    }, S.dance.group, new THREE.Vector3(11.5, 0.9, -3));

    station(S.booth, '📸', 3.2, 1.5, 2.4, () => game.startPhoto(S.booth));

    station(S.book, '📖', 2.8, 1.2, 2.0, () => {
      sfx.chime();
      game.openBook();
    });

    station(S.map, '🗺️', 4.0, 1.3, 2.2, () => {
      sfx.chime();
      say(t('hub.map'));
      game.openDayMap();
    });

    station(S.kennel, '🐾', 3.0, 1.6, 2.4, () => {
      say(t('hub.pets'));
      game.changePet();
    });

    station(S.mirror, '🎨', 2.4, 1.4, 2.2, () => {
      say(t('hub.mirror'));
      game.openWardrobe(() => {
        sfx.chime();
        say(t('d2.looks'));
      });
    });

    // egg nests: lay an egg, keep it warm, and (after a few days of play) it hatches
    S.plots.forEach((plot, i) => {
      if (i === 1) game.addBubble(plot.holder, '🥚', 2.4);
      game.addItem({
        pos: plot.pos, hitRadius: 1.2, reach: 1.9, hitY: 0.5,
        run: () => {
          const st = game.saved.plots[i];
          if (!st) {
            game.saved.plots[i] = { type: TYPES[(Math.random() * TYPES.length) | 0], stage: 0, warmed: false };
            a.setPlot(i, game.saved.plots[i]);
            sfx.pop();
            game.burst({ x: plot.x, y: 0.7, z: plot.z }, 12, 1, 0.2, [0xffffff, 0xfff1d6, 0xffe066]);
            say(t('hub.plant'));
          } else if (st.stage < 3) {
            st.warmed = true;
            sfx.fire();
            game.sparkles.emit(plot.x, 0.8, plot.z, 30, { speed: 0.9, up: 1.8, life: 1.0, colors: [0xffb347, 0xffe066, 0xffffff], spread: 0.8 });
            if (plot.egg) game.wobble(plot.egg);
            say(t('hub.water'));
          } else {
            game.saved.hatched++;
            const baby = plot.baby;
            game.saved.plots[i] = null;
            sfx.animal(st.type);
            if (baby) {
              baby.gesture('gesture-positive');
              game.hearts.emit(plot.x, 1.6, plot.z, 10, { speed: 0.8, up: 1.5, life: 1.6, colors: [0xff5fae, 0xff8fc7, 0xffffff] });
              game.confettiAt({ x: plot.x, z: plot.z }, 2.6);
              game.after(1.2, () => a.setPlot(i, null));
            } else a.setPlot(i, null);
            say(t('hub.pick'));
          }
          save(game.saved);
        },
      });
    });
  },
};
