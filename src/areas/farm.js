// Day 12: the dino nursery farm. Leafy trees, a hungry long-neck, wandering babies, a cosy pen with a stone hut.
import * as THREE from 'three';
import { mat, add, ball, CYL, CONE, BOX, SPHERE } from '../models.js';
import { Dino } from '../dinos.js';
import { makeFern, makePalm, makeConifer, makeBigTree, makeRock, makeFenceSection, makeLeafBundle, makeGlow, makeBush, bake } from '../scenery.js';
import { rng, place, ground, circleClamp, scatter, boulderRing, tufts, skyLife } from './util.js';

const R = 16;

export function buildFarm(game) {
  const g = new THREE.Group();
  const rand = rng(131);
  const colliders = [];
  const block = (x, z, r) => colliders.push({ x, z, r });

  ground(g, 0x8fdc6a, 0xa4e87e, R + 1);
  tufts(g, rand, 260, R + 3);

  const decor = new THREE.Group();
  boulderRing(decor, rand, R + 0.5, 0x9aa3ad, 44);
  const far = (x, z) => z > 4 || Math.hypot(x, z) < R + 2;
  scatter(rand, 12, R + 2.5, R + 16, (x, z) => place(decor, makePalm(rand, 4 + rand() * 2), x, z, { rot: rand() * 6 }), far);
  scatter(rand, 12, R + 3, R + 20, (x, z) => place(decor, makeConifer(rand, 5 + rand() * 4), x, z, { rot: rand() * 6 }), far);
  scatter(rand, 20, 3, R, (x, z) => place(decor, makeFern(rand, 1 + rand() * 0.5), x, z, { rot: rand() * 6 }), (x, z) => z > 8 || Math.hypot(x - 9.5, z + 7) < 6 || Math.hypot(x + 6, z + 8) < 3.5);
  g.add(bake(decor));

  // four leafy trees to pick leaves from
  const treeSpots = [[-11, 3], [12, 4.5], [-4, -10.5], [6.5, 2.5]];
  const trees = treeSpots.map(([x, z]) => {
    const tr = new THREE.Group();
    add(tr, CYL, 0x9b6b43, [0, 1.6, 0], [0.32, 3.2, 0.32]);
    ball(tr, 0x4cb85a, [0, 3.7, 0], [1.9, 1.5, 1.9]);
    ball(tr, 0x5cc866, [1.0, 3.2, 0.4], 1.0);
    ball(tr, 0x3fa653, [-0.9, 3.1, -0.3], 1.0);
    place(g, tr, x, z);
    block(x, z, 0.6);
    const gl = makeGlow(0xcfff9a, 4.6);
    gl.position.set(x, 3.4, z);
    g.add(gl);
    const bundle = makeLeafBundle();
    bundle.scale.setScalar(2.2);
    bundle.position.set(x + 1.3, 2.6, z + 0.6);
    g.add(bundle);
    return { group: tr, bundle, glow: gl, pos: new THREE.Vector3(x, 0, z), taken: false };
  });

  // the big hungry long-neck
  const big = new Dino('bronto', 5.6, { main: 0x8f86e8, belly: 0xe6e2ff, accent: 0xffd23f });
  big.root.position.set(-6.5, 0, -8.5);
  big.heading = 0.4;
  big.root.rotation.y = 0.4;
  g.add(big.root);
  game.addCritter(big);
  block(-6.5, -8.5, 2.3);

  // the pen with its stone hut
  const penC = new THREE.Vector3(10, 0, -7);
  const pen = new THREE.Group();
  const wide = 7;
  const deep = 6;
  for (let i = 0; i < 3; i++) {
    for (const sz of [-1, 1]) {
      const f = makeFenceSection(2.4);
      f.position.set(-wide / 2 + 1.2 + i * 2.4, 0, sz * deep / 2);
      pen.add(f);
    }
  }
  for (let i = 0; i < 2; i++) {
    for (const sx of [-1, 1]) {
      const f = makeFenceSection(2.4);
      f.rotation.y = Math.PI / 2;
      f.position.set(sx * wide / 2, 0, -deep / 2 + 1.2 + i * 2.4 + (sx > 0 ? 0 : 0));
      if (sx < 0 && i === 0) f.visible = true;
      pen.add(f);
    }
  }
  place(g, pen, penC.x, penC.z);
  const hut = new THREE.Group();
  add(hut, SPHERE, mat(0x9a8f88), [0, 1.3, 0], [2.4, 1.8, 2.0]);
  add(hut, SPHERE, new THREE.MeshBasicMaterial({ color: 0x20141a }), [0, 0.7, 1.8], [0.9, 0.9, 0.35]).castShadow = false;
  for (let i = 0; i < 6; i++) add(hut, CONE, 0x8a7a70, [-1.4 + i * 0.56, 2.9, -0.1], [0.28, 0.55, 0.28]);
  place(g, hut, penC.x + 0.5, penC.z - 1.6);
  block(penC.x + 0.5, penC.z - 1.6, 2.3);
  const coopPos = new THREE.Vector3(penC.x, 0, penC.z + 3.6);
  const penDoor = new THREE.Vector3(penC.x + 0.4, 0, penC.z - 0.5);
  for (const [x, z] of [[penC.x - 2.6, penC.z + 2.8], [penC.x + 2.6, penC.z + 2.8]]) {
    add(g, CYL, 0x7a5230, [x, 1.0, z], [0.1, 2.0, 0.1]);
  }

  // the baby dinos wandering about
  const looks = [['tri', {}], ['steg', {}], ['rex', { main: 0xff8fc7, belly: 0xffe3f1, accent: 0xffd23f }]];
  const babies = [[-8, 4], [3, -4], [-1, 6.5]].map(([x, z], i) => {
    const c = new Dino(looks[i][0], 1.0, { baby: true, ...looks[i][1] });
    c.root.position.set(x, 0, z);
    c.heading = i * 2;
    g.add(c.root);
    game.addCritter(c);
    return { c, invited: false, wait: 1 + i, home: new THREE.Vector3(x, 0, z) };
  });

  const sky = skyLife(game, g, rand, { flyers: 2 });
  const update = (dt, t) => {
    sky(dt, t);
    trees.forEach((tr, i) => {
      if (!tr.taken) tr.glow.material.opacity = 0.6 + Math.sin(t * 3 + i) * 0.2;
    });
    for (const b of babies) {
      if (b.invited || b.c.dest) continue;
      b.wait -= dt;
      if (b.wait <= 0) {
        b.wait = 2 + Math.random() * 3;
        b.c.goTo(b.home.x + (Math.random() - 0.5) * 6, b.home.z + (Math.random() - 0.5) * 5, { speed: 1.4 });
      }
    }
  };

  return {
    name: 'farm',
    group: g,
    bg: 0xbfe6ff,
    fog: { color: 0xcdeeff, near: 36, far: 110 },
    camScale: 1,
    spawn: new THREE.Vector3(0, 0, 9),
    heading: Math.PI,
    clamp: circleClamp(R),
    colliders,
    update,
    trees, big, babies, coopPos, penC, penDoor,
  };
}
