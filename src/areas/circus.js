// Day 14: the dino circus. A striped big top, a lava stream to cross on a log, a flaming hoop, a circus triceratops.
import * as THREE from 'three';
import { mat, add, ball, CYL, CONE, BOX, SPHERE } from '../models.js';
import { Dino } from '../dinos.js';
import { makeFern, makePalm, makeConifer, makeRock, makeBall, makeHoop, makeBridgeLog, makeBanner, makeGlow, bake } from '../scenery.js';
import { rng, place, ground, circleClamp, scatter, boulderRing, tufts, skyLife } from './util.js';

const R = 15;
export const BALL_COLORS = [0xff4d6d, 0xffd23f, 0x4dc9ff, 0x7be37a, 0xb48cff];

export function buildCircus(game) {
  const g = new THREE.Group();
  const rand = rng(151);
  const colliders = [];
  const block = (x, z, r) => colliders.push({ x, z, r });

  ground(g, 0x8fdc6a, 0xf0d9a0, R + 1);
  tufts(g, rand, 120, R + 3);

  const decor = new THREE.Group();
  // a red-and-white ring curb
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2;
    place(decor, makeRock(i % 2 ? 0xe84545 : 0xffffff, 0.45, rand), Math.cos(a) * (R + 0.4), Math.sin(a) * (R + 0.4));
  }
  const far = (x, z) => z > 4 || Math.hypot(x, z) < R + 2;
  scatter(rand, 12, R + 2.5, R + 16, (x, z) => place(decor, makePalm(rand, 4 + rand() * 2), x, z, { rot: rand() * 6 }), far);
  scatter(rand, 12, R + 3, R + 20, (x, z) => place(decor, makeConifer(rand, 5 + rand() * 4), x, z, { rot: rand() * 6 }), far);
  scatter(rand, 10, 3, R, (x, z) => place(decor, makeFern(rand, 1 + rand() * 0.5), x, z, { rot: rand() * 6 }), (x, z) => z > 8 || Math.abs(z) < 3 || Math.hypot(x, z + 8) < 6);
  g.add(bake(decor));

  // the big top, far back
  const top = new THREE.Group();
  for (let i = 0; i < 8; i++) {
    const seg = new THREE.Mesh(new THREE.ConeGeometry(11, 8, 8, 1, false, (i / 8) * Math.PI * 2, Math.PI / 4), mat(i % 2 ? 0xffffff : 0xe84545));
    seg.position.y = 10;
    seg.castShadow = true;
    top.add(seg);
  }
  add(top, new THREE.CylinderGeometry(9.5, 9.5, 6, 16, 1, true), new THREE.MeshToonMaterial({ color: 0xffd23f, side: THREE.DoubleSide, gradientMap: mat(0).gradientMap }), [0, 3, 0]);
  ball(top, 0xffd23f, [0, 14.4, 0], 0.5);
  place(g, top, 0, -26, { scale: 1.1 });
  const bunt = makeBanner([0xff5fae, 0xffd23f, 0x6ad7ff, 0x7be37a], 14, 20);
  place(g, bunt, 0, -13.5, { y: 6 });
  for (const sx of [-1, 1]) add(g, CYL, 0x7a5230, [sx * 10, 3, -13.5], [0.2, 6, 0.2]);

  // the lava stream with a log across
  const lavaZ = 0.8;
  const lava = new THREE.Mesh(new THREE.PlaneGeometry(14, 2.2), new THREE.MeshBasicMaterial({ color: 0xff6a1f }));
  lava.rotation.x = -Math.PI / 2;
  lava.position.set(0, 0.05, lavaZ);
  g.add(lava);
  const lava2 = new THREE.Mesh(new THREE.PlaneGeometry(14, 0.7), new THREE.MeshBasicMaterial({ color: 0xffc13a }));
  lava2.rotation.x = -Math.PI / 2;
  lava2.position.set(0, 0.06, lavaZ);
  g.add(lava2);
  for (const sz of [-1, 1]) for (let i = 0; i < 8; i++) place(g, makeRock(0x5a4a46, 0.45 + rand() * 0.2, rand), -6.4 + i * 1.85, lavaZ + sz * 1.35);
  const log = makeBridgeLog(7);
  place(g, log, 0, lavaZ, { y: 0.0 });
  const beamStart = new THREE.Vector3(-4.6, 0, lavaZ);
  const beamEnd = new THREE.Vector3(4.6, 0, lavaZ);
  const lg = makeGlow(0xff9a3a, 14);
  lg.position.set(0, 0.8, lavaZ);
  g.add(lg);

  // the balls to gather
  const ballSpots = [[-9, 5], [9, 5.5], [-11, -3], [11, -3.5], [0, 7.5]];
  const balls = ballSpots.map(([x, z], i) => {
    const b = makeBall(BALL_COLORS[i]);
    b.scale.setScalar(1.7);
    place(g, b, x, z);
    const gl = makeGlow(0xfff1a8, 2.8);
    gl.position.set(x, 0.9, z);
    g.add(gl);
    return { group: b, glow: gl, pos: new THREE.Vector3(x, 0, z), taken: false };
  });

  // the hoop and the circus triceratops
  const hoopPos = new THREE.Vector3(0, 0, -8);
  const hoop = makeHoop();
  hoop.rotation.y = Math.PI / 2;
  place(g, hoop, hoopPos.x, hoopPos.z);
  const tri = new Dino('tri', 2.1, { main: 0xff8a3d, accent: 0xe84545 });
  const triPos = new THREE.Vector3(-4.5, 0, -8);
  tri.root.position.copy(triPos);
  tri.heading = Math.PI / 2;
  tri.root.rotation.y = Math.PI / 2;
  g.add(tri.root);
  game.addCritter(tri);
  const hat = new THREE.Group();
  add(hat, CYL, 0x2b2236, [0, 0.0, 0], [0.4, 0.04, 0.4]);
  add(hat, CYL, 0x2b2236, [0, 0.2, 0], [0.25, 0.4, 0.25]);
  add(hat, CYL, 0xff4d6d, [0, 0.06, 0], [0.26, 0.07, 0.26]);
  hat.position.set(0, 0.55, -0.1);
  hat.scale.setScalar(0.9);
  tri.rig.head.add(hat);

  // audience
  [['para', 2.5, -12, -4, 1.0], ['steg', 1.7, 12, -6, -1.0], ['pachy', 1.7, 12.5, 8, -2.2], ['anky', 1.3, -12, 8, 2.2]].forEach(([sp, h, x, z, hd]) => {
    const c = new Dino(sp, h);
    c.root.position.set(x, 0, z);
    c.heading = hd;
    c.root.rotation.y = hd;
    g.add(c.root);
    game.addCritter(c);
  });

  const sky = skyLife(game, g, rand, { flyers: 2 });
  const update = (dt, t) => {
    sky(dt, t);
    lg.material.opacity = 0.55 + Math.sin(t * 5) * 0.12;
    balls.forEach((b, i) => {
      if (b.taken) return;
      b.glow.material.opacity = 0.7 + Math.sin(t * 4 + i) * 0.2;
      b.group.position.y = Math.abs(Math.sin(t * 2.4 + i)) * 0.25;
    });
    if (hoop.userData.fire.visible) {
      const fl = hoop.userData.fire.userData.flame;
      fl[0].scale.y = 0.6 * 1.4 * (1 + Math.sin(t * 11) * 0.12);
    }
  };

  return {
    name: 'circus',
    group: g,
    bg: 0xbfe6ff,
    fog: { color: 0xcdeeff, near: 36, far: 110 },
    camScale: 1,
    spawn: new THREE.Vector3(0, 0, 9),
    heading: Math.PI,
    clamp: circleClamp(R),
    colliders,
    update,
    balls, beamStart, beamEnd, hoop, hoopPos, tri, triPos, lavaZ,
  };
}
