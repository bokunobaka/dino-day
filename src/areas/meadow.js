// The fern meadow: Day 1 (egg hunt, big nest, Mama Bronto) and Day 4 (picnic). Also the backdrop of the title screen.
import * as THREE from 'three';
import { mat, add, ball, CYL, BOX } from '../models.js';
import { Dino } from '../dinos.js';
import { makeFern, makePalm, makeConifer, makeBigTree, makeBush, makeMushroom, makeRock, makeVolcano, makeMountains, makeNest, bake } from '../scenery.js';
import { rng, place, ground, circleClamp, scatter, boulderRing, tufts, skyLife, volcanoSmoke } from './util.js';

export const R = 15.5;
export const NEST_POS = new THREE.Vector3(0, 0, -9);

export function buildMeadow(game) {
  const g = new THREE.Group();
  const rand = rng(7);
  const colliders = [];
  const block = (x, z, r) => colliders.push({ x, z, r });

  ground(g, 0x8fdc6a, 0x9be37a, R + 1);
  tufts(g, rand, 260, R + 3);

  const decor = new THREE.Group();
  boulderRing(decor, rand, R + 0.5, 0x8e98a3, 44);
  // trees and plants all around, none between the camera and the play area
  const far = (x, z) => z > 4 || Math.hypot(x, z) < R + 2;
  scatter(rand, 16, R + 2.5, R + 18, (x, z, i) => place(decor, makePalm(rand, 4 + rand() * 2), x, z, { rot: rand() * 6 }), far);
  scatter(rand, 16, R + 3, R + 22, (x, z, i) => place(decor, makeConifer(rand, 5 + rand() * 4), x, z, { rot: rand() * 6 }), far);
  scatter(rand, 8, R + 2, R + 14, (x, z) => place(decor, makeBigTree(rand, 5 + rand() * 2), x, z, { rot: rand() * 6 }), far);
  scatter(rand, 26, 3, R + 1, (x, z) => place(decor, makeFern(rand, 1 + rand() * 0.6), x, z, { rot: rand() * 6 }), (x, z) => Math.hypot(x - NEST_POS.x, z - NEST_POS.z) < 3.4 || (Math.abs(x) < 1.2 && z > 3));
  scatter(rand, 6, 5, R - 1, (x, z, i) => {
    place(decor, makeBush(i % 2 ? 0x5b6bff : 0xff4d6d, rand), x, z, { rot: rand() * 6, scale: 1.1 });
    block(x, z, 0.8);
  }, (x, z) => Math.hypot(x - NEST_POS.x, z - NEST_POS.z) < 4 || (Math.abs(x) < 2 && z > 2) || z > 9);
  scatter(rand, 9, 3, R, (x, z, i) => place(decor, makeMushroom([0xff6b6b, 0xffb347, 0xc9a6ff][i % 3], 1 + rand() * 0.5), x, z), (x, z) => Math.hypot(x - NEST_POS.x, z - NEST_POS.z) < 3.4);
  scatter(rand, 8, 4, R - 1, (x, z) => {
    const s = 0.8 + rand() * 0.8;
    place(decor, makeRock(0x9aa3ad, s, rand), x, z, { rot: rand() * 6 });
    block(x, z, 0.5 * s);
  }, (x, z) => Math.hypot(x - NEST_POS.x, z - NEST_POS.z) < 4 || z > 8);
  g.add(bake(decor));

  // far away: mountains, the volcano with its smoke, a rainbow-less sky
  g.add(makeMountains(rand, 9, 55));
  const volcano = makeVolcano(22);
  place(g, volcano, 24, -55);
  const smokeUp = volcanoSmoke(g, 24, 25, -55);
  const sky = skyLife(game, g, rand, { flyers: 3 });

  // the big nest where the eggs go
  const nest = makeNest(2.1);
  place(g, nest, NEST_POS.x, NEST_POS.z);
  block(NEST_POS.x, NEST_POS.z, 1.7);

  // Mama Bronto watches over the nest
  const mama = new Dino('bronto', 5.2);
  mama.root.position.set(-6.3, 0, -11);
  mama.heading = Math.atan2(NEST_POS.x + 6.3, NEST_POS.z + 11);
  mama.root.rotation.y = mama.heading;
  g.add(mama.root);
  game.addCritter(mama);
  block(-6.3, -11, 2.2);

  // picnic blanket (shown on Day 4)
  const picnic = new THREE.Group();
  picnic.visible = false;
  add(picnic, BOX, 0xff6b6b, [0, 0.03, 0], [6, 0.06, 4.6]).castShadow = false;
  for (let i = 0; i < 5; i++) add(picnic, BOX, 0xffffff, [0, 0.07, -2 + i * 1], [6.02, 0.02, 0.5]).castShadow = false;
  add(picnic, CYL, 0xd9a06a, [0, 0.2, 0], [0.7, 0.3, 0.7]);
  place(g, picnic, 0, -8);
  const seats = [[-3.4, 1.0, 1.5], [3.4, 1.0, -1.5], [-2.6, -1.6, 0.6], [2.6, -1.6, -0.6]].map(([x, z]) => ({ x, z: z - 8 }));
  picnic.userData.seats = seats;

  const update = (dt, t) => {
    sky(dt, t);
    smokeUp(dt);
  };

  return {
    name: 'meadow',
    group: g,
    bg: 0xbfe6ff,
    fog: { color: 0xcdeeff, near: 36, far: 110 },
    camScale: 1,
    spawn: new THREE.Vector3(0, 0, 8),
    heading: Math.PI,
    clamp: circleClamp(R),
    colliders,
    update,
    nest, nestPos: NEST_POS, mama, picnic, picnicPos: new THREE.Vector3(0, 0, -8), seats,
    eggSpots: [[-8, 3.5], [8.8, -1.5], [-3.2, -4.2], [4.8, 6], [-11, -4]],
  };
}
