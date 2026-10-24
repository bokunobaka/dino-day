// Day 7: the birthday clearing. Bunting between the palms, a big stone table with the cake, balloons, presents, guests.
import * as THREE from 'three';
import { mat, add, ball, CYL, CONE, BOX, SPHERE } from '../models.js';
import { Dino } from '../dinos.js';
import { makeFern, makePalm, makeConifer, makeRock, makeBalloon, makePresent, makeCake, makeBanner, makeGlow, makeBush, bake } from '../scenery.js';
import { rng, place, ground, circleClamp, scatter, boulderRing, tufts, skyLife } from './util.js';

const R = 14.5;
export const BALLOON_COLORS = [0xff5fae, 0xffd23f, 0x6ad7ff, 0x7be37a, 0xb48cff, 0xff9a4d];

export function buildParty(game) {
  const g = new THREE.Group();
  const rand = rng(81);
  const colliders = [];
  const block = (x, z, r) => colliders.push({ x, z, r });

  ground(g, 0x8fdc6a, 0xa6ec82, R + 1);
  tufts(g, rand, 200, R + 3);

  const decor = new THREE.Group();
  boulderRing(decor, rand, R + 0.5, 0x9aa3ad, 42);
  const far = (x, z) => z > 4 || Math.hypot(x, z) < R + 2;
  scatter(rand, 12, R + 2.5, R + 16, (x, z) => place(decor, makePalm(rand, 4 + rand() * 2), x, z, { rot: rand() * 6 }), far);
  scatter(rand, 12, R + 3, R + 20, (x, z) => place(decor, makeConifer(rand, 5 + rand() * 4), x, z, { rot: rand() * 6 }), far);
  scatter(rand, 20, 3, R, (x, z) => place(decor, makeFern(rand, 1 + rand() * 0.5), x, z, { rot: rand() * 6 }), (x, z) => Math.hypot(x, z + 4.5) < 5 || z > 7);
  g.add(bake(decor));

  // bunting strung across the back, and a pair of big posts
  for (const sx of [-1, 1]) add(g, CYL, 0x7a5230, [sx * 9, 3.2, -8.5], [0.2, 6.4, 0.2]);
  const bunt = makeBanner([0xff5fae, 0xffd23f, 0x6ad7ff, 0x7be37a], 14, 18);
  bunt.position.set(0, 6.1, -8.5);
  g.add(bunt);
  const bunt2 = makeBanner([0xb48cff, 0xff9a4d, 0x6ad7ff, 0xff5fae], 12, 18);
  bunt2.position.set(0, 5.1, -8.5);
  g.add(bunt2);

  // the party table with the cake
  const tablePos = new THREE.Vector3(0, 0, -4.5);
  const table = new THREE.Group();
  add(table, CYL, 0xaaa097, [0, 0.45, 0], [1.9, 0.9, 1.9]);
  add(table, CYL, 0xff7aa8, [0, 0.92, 0], [2.4, 0.06, 2.4]);
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    ball(table, 0xffffff, [Math.cos(a) * 2.4, 0.9, Math.sin(a) * 2.4], 0.09);
  }
  place(g, table, tablePos.x, tablePos.z);
  block(tablePos.x, tablePos.z, 2.6);
  const cake = makeCake();
  cake.position.set(0, 0.95, -4.5);
  cake.scale.setScalar(1.35);
  g.add(cake);
  const flames = cake.userData.flames;
  const glow = makeGlow(0xffd27a, 4);
  glow.position.set(0, 2.5, -4.5);
  glow.visible = false;
  g.add(glow);

  // the birthday dino
  const honoree = new Dino('bronto', 4.2);
  honoree.root.position.set(-6, 0, -7);
  honoree.heading = 0.6;
  honoree.root.rotation.y = 0.6;
  g.add(honoree.root);
  game.addCritter(honoree);
  block(-6, -7, 2.0);
  const hat = new THREE.Group();
  add(hat, CONE, 0xff5fae, [0, 0.3, 0], [0.22, 0.6, 0.22]);
  add(hat, CYL, 0xffe35a, [0, 0.05, 0], [0.23, 0.05, 0.23]);
  ball(hat, 0xffffff, [0, 0.62, 0], 0.07);
  hat.position.set(0, 0.28, 0.0);
  honoree.rig.head.add(hat);

  // guests
  const guests = [['tri', 1.7, -9.5, 0.5, 1.2], ['steg', 1.8, 9.5, -1.5, -1.2], ['anky', 1.3, 6, -6.5, -0.5], ['raptor', 1.9, -10.5, 5, 1.0]].map(([sp, h, x, z, hd]) => {
    const c = new Dino(sp, h);
    c.root.position.set(x, 0, z);
    c.heading = hd;
    c.root.rotation.y = hd;
    g.add(c.root);
    game.addCritter(c);
    return c;
  });

  // balloons to gather (they float up to the string at the back)
  const balloonSpots = [[-9, 6], [8, 6.5], [-6, -2], [9.5, -3.5], [2.5, 4]];
  const balloons = balloonSpots.map(([x, z], i) => {
    const b = makeBalloon(BALLOON_COLORS[i]);
    place(g, b, x, z);
    return { group: b, pos: new THREE.Vector3(x, 0, z), taken: false };
  });
  const anchors = [-6.4, -3.2, 0, 3.2, 6.4].map((x, i) => new THREE.Vector3(x + (i === 2 ? 0 : 0), 3.6 + (i % 2) * 0.5, -8.2));

  // presents hiding in the ferns
  const presentSpots = [[-11.5, -1.5], [11, 1], [-2.5, -10]];
  const presents = presentSpots.map(([x, z], i) => {
    const p = makePresent([0xff5fae, 0x6ad7ff, 0xb48cff][i], 0xffe066);
    p.scale.setScalar(1.8);
    place(g, p, x, z, { rot: i });
    for (let k = 0; k < 3; k++) {
      const f = makeFern(rand, 0.7);
      f.position.set(x + Math.cos(k * 2.1 + i) * 0.8, 0, z + Math.sin(k * 2.1 + i) * 0.8);
      g.add(f);
    }
    const gl = makeGlow(0xfff1a8, 2.6);
    gl.position.set(x, 0.7, z);
    g.add(gl);
    return { group: p, glow: gl, pos: new THREE.Vector3(x, 0, z), taken: false };
  });

  const sky = skyLife(game, g, rand, { flyers: 2 });
  const update = (dt, t) => {
    sky(dt, t);
    balloons.forEach((b, i) => {
      if (b.taken) return;
      b.group.position.y = Math.sin(t * 2 + i) * 0.1;
      b.group.rotation.z = Math.sin(t * 1.5 + i) * 0.06;
    });
    presents.forEach((p, i) => {
      if (!p.taken) p.glow.material.opacity = 0.7 + Math.sin(t * 4 + i) * 0.2;
    });
    if (glow.visible) glow.material.opacity = 0.65 + Math.sin(t * 9) * 0.15;
    for (const f of flames) if (f.visible) {
      f.userData.flame[0].scale.y = 0.45 * (1 + Math.sin(t * 12 + f.position.x * 9) * 0.15);
    }
  };

  return {
    name: 'party',
    group: g,
    bg: 0xbfe6ff,
    fog: { color: 0xcdeeff, near: 36, far: 110 },
    camScale: 1,
    spawn: new THREE.Vector3(0, 0, 8),
    heading: Math.PI,
    clamp: circleClamp(R),
    colliders,
    update,
    tablePos, honoree, guests, balloons, anchors, presents, flames, glow, cake,
    cheerHonoree: (secs = 1.4) => {
      honoree.play('dance');
      game_after(secs, () => honoree.play('idle'));
    },
  };

  function game_after(secs, fn) {
    game.after(secs, fn);
  }
}
