// Day 3: the stone kitchen. A big stone table with the stew pot, a fire pit, and ingredient patches around.
import * as THREE from 'three';
import { mat, add, ball, CYL, CONE, SPHERE } from '../models.js';
import { makeFern, makePalm, makeConifer, makeBush, makeMushroom, makeRock, makeStonePot, makeCampfire, makeBowl, makeGlow, makeLeafBundle, bake } from '../scenery.js';
import { rng, place, ground, circleClamp, scatter, boulderRing, tufts, skyLife } from './util.js';

const R = 14;

export function buildKitchen(game) {
  const g = new THREE.Group();
  const rand = rng(41);
  const colliders = [];
  const block = (x, z, r) => colliders.push({ x, z, r });

  ground(g, 0x8fdc6a, 0xe0c890, R + 1);
  tufts(g, rand, 160, R + 3);

  const decor = new THREE.Group();
  boulderRing(decor, rand, R + 0.4, 0x9a8f88, 40);
  const far = (x, z) => z > 3 || Math.hypot(x, z) < R + 2;
  scatter(rand, 12, R + 2.5, R + 16, (x, z) => place(decor, makePalm(rand, 4 + rand() * 2), x, z, { rot: rand() * 6 }), far);
  scatter(rand, 12, R + 3, R + 20, (x, z) => place(decor, makeConifer(rand, 5 + rand() * 4), x, z, { rot: rand() * 6 }), far);
  scatter(rand, 18, 3, R, (x, z) => place(decor, makeFern(rand, 1 + rand() * 0.5), x, z, { rot: rand() * 6 }), (x, z) => Math.hypot(x, z + 3) < 4.2 || Math.hypot(x - 6.5, z + 7) < 3 || z > 7 || Math.hypot(x + 8, z - 3) < 2.2 || Math.hypot(x - 9, z - 4) < 2.2 || Math.hypot(x + 4, z + 9) < 2.2);
  g.add(bake(decor));

  // the stone table with the pot
  const island = { pos: new THREE.Vector3(0, 0, -3), top: 1.0 };
  const table = new THREE.Group();
  add(table, CYL, mat(0xaaa097), [0, 0.5, 0], [2.4, 1.0, 2.4]);
  add(table, CYL, mat(0xc4baa9), [0, 1.0, 0], [2.5, 0.08, 2.5]);
  place(g, table, 0, -3);
  block(0, -3, 2.9);
  const pot = makeStonePot();
  pot.position.set(0, island.top - 0.5, -3);
  g.add(pot);
  const ladle = new THREE.Group();
  add(ladle, CYL, 0x7a5230, [0, 0.7, 0], [0.04, 1.4, 0.04]);
  ball(ladle, 0x6b6f78, [0, 0.05, 0], [0.16, 0.08, 0.16]);
  ladle.position.set(0.55, island.top + 0.6, -3);
  ladle.rotation.z = 0.25;
  g.add(ladle);

  // the fire pit (east)
  const fireSpot = new THREE.Vector3(7, 0, -7);
  const fireB = makeCampfire();
  place(g, fireB, fireSpot.x, fireSpot.z);
  block(fireSpot.x, fireSpot.z, 1.3);
  const fire = fireB.userData.fire;
  const fireLight = makeGlow(0xffa94d, 7);
  fireLight.position.set(fireSpot.x, 1.0, fireSpot.z);
  fireLight.visible = false;
  g.add(fireLight);

  // ingredient patches
  const spots = { fern: new THREE.Vector3(-8, 0, 3), berry: new THREE.Vector3(9, 0, 4), mushroom: new THREE.Vector3(-4, 0, -9) };
  const stumpAt = (v) => {
    const s = add(g, CYL, 0x9b6b43, [v.x, 0.25, v.z], [0.7, 0.5, 0.7]);
    add(g, CYL, 0xd9b27a, [v.x, 0.51, v.z], [0.66, 0.02, 0.66]).castShadow = false;
    block(v.x, v.z, 0.7);
  };
  Object.values(spots).forEach(stumpAt);
  place(g, makeBush(0x5b6bff, rand), 11.5, 6, { scale: 1.2 });
  place(g, makeBush(0xff4d6d, rand), 7, 6.5, { scale: 1.1 });

  // bowls (shown after cooking)
  const bowls = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    const b = makeBowl();
    b.position.set(Math.cos(a) * 1.65, island.top + 0.04, -3 + Math.sin(a) * 1.65);
    b.scale.setScalar(1.8);
    b.visible = false;
    const soup = add(b, CYL, 0xffffff, [0, 0.17, 0], [0.22, 0.02, 0.22]);
    soup.visible = false;
    soup.castShadow = false;
    g.add(b);
    bowls.push({ group: b, soup, x: b.position.x, z: b.position.z });
  }

  const sky = skyLife(game, g, rand, { flyers: 2 });
  const update = (dt, t) => {
    sky(dt, t);
    if (fire.visible) {
      const fl = fire.userData.flame;
      fl[0].scale.y = 0.9 * (1 + Math.sin(t * 11) * 0.12);
      fl[1].scale.y = 0.6 * (1 + Math.sin(t * 14 + 1) * 0.15);
      fireLight.material.opacity = 0.7 + Math.sin(t * 9) * 0.15;
    }
  };

  return {
    name: 'kitchen',
    group: g,
    bg: 0xbfe6ff,
    fog: { color: 0xcdeeff, near: 34, far: 100 },
    camScale: 1,
    spawn: new THREE.Vector3(0, 0, 8),
    heading: Math.PI,
    clamp: circleClamp(R),
    colliders,
    update,
    island, pot, ladle, spots, bowls, fire, fireLight, firePos: fireSpot,
  };
}
