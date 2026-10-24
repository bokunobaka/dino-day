// Day 6: the fossil dig. Sandy badlands with red rock mesas, sandy mounds to dig, a find table and the display stand.
import * as THREE from 'three';
import { mat, add, ball, CYL, CONE, SPHERE, BOX } from '../models.js';
import { makeRock, makePalm, makeBone, makeSkull, makeRibs, makeAmmonite, makeFootprint, makeGlow, bake } from '../scenery.js';
import { rng, place, ground, circleClamp, scatter, boulderRing, tufts, skyLife } from './util.js';
import { Particles, textures } from '../fx.js';

const R = 15;
const IVORY = 0xfff3d6;

function makeMound() {
  const root = new THREE.Group();
  ball(root, 0xd4aa68, [0, 0.12, 0], [1.0, 0.45, 0.9]);
  ball(root, 0xc79a58, [0.4, 0.1, 0.3], [0.45, 0.25, 0.4]);
  add(root, CYL, 0x7a5230, [0, 0.55, 0], [0.04, 0.8, 0.04]);
  add(root, BOX, 0xff5fae, [0.18, 0.78, 0], [0.34, 0.2, 0.02]);
  return root;
}

// the finished skeleton, in four pieces so they can fly in one by one. Faces +z, base on the ground.
function makeSkeleton() {
  const root = new THREE.Group();
  const parts = [];
  const part = (fn) => {
    const g = new THREE.Group();
    fn(g);
    root.add(g);
    parts.push(g);
    return g;
  };
  // skull
  part((g) => {
    const s = makeSkull(IVORY);
    s.scale.setScalar(1.9);
    s.position.set(0, 2.2, 1.9);
    g.add(s);
  });
  // ribs + spine
  part((g) => {
    const r = makeRibs(IVORY);
    r.scale.set(1.5, 1.5, 1.2);
    r.position.set(0, 1.3, 0.2);
    g.add(r);
    add(g, CYL, IVORY, [0, 2.2, 0.3], [0.11, 3.0, 0.11]).rotation.x = Math.PI / 2;
    add(g, CYL, IVORY, [0, 2.25, 1.55], [0.09, 0.9, 0.09]).rotation.x = Math.PI / 2 - 0.5;
  });
  // tail
  part((g) => {
    for (let i = 0; i < 8; i++) {
      const k = i / 7;
      ball(g, IVORY, [0, 2.2 - k * 0.9, -1.4 - k * 3.4], 0.16 - k * 0.1);
      if (i < 7) add(g, CYL, IVORY, [0, 2.2 - k * 0.9, -1.6 - k * 3.4], [0.06 - k * 0.03, 0.35, 0.06 - k * 0.03]).rotation.x = Math.PI / 2;
    }
  });
  // legs and little arms
  part((g) => {
    for (const s of [-1, 1]) {
      add(g, CYL, IVORY, [s * 0.75, 1.55, 0.2], [0.16, 1.1, 0.16]).rotation.x = 0.35;
      add(g, CYL, IVORY, [s * 0.75, 0.6, 0.55], [0.12, 1.0, 0.12]).rotation.x = -0.3;
      ball(g, IVORY, [s * 0.75, 2.05, 0.05], 0.22);
      ball(g, IVORY, [s * 0.75, 0.1, 0.95], [0.18, 0.1, 0.34]);
      add(g, CYL, IVORY, [s * 0.55, 1.75, 1.4], [0.06, 0.6, 0.06]).rotation.x = 0.8;
    }
  });
  return { group: root, parts };
}

export function buildDig(game) {
  const g = new THREE.Group();
  const rand = rng(71);
  const colliders = [];
  const block = (x, z, r) => colliders.push({ x, z, r });

  ground(g, 0xe3c487, 0xf0d9a6, R + 1);
  tufts(g, rand, 120, R + 3, 0xc9b46a);

  const decor = new THREE.Group();
  boulderRing(decor, rand, R + 0.5, 0xb9855a, 40);
  // red-and-cream mesas on the horizon
  for (let i = 0; i < 12; i++) {
    const a = Math.PI + 0.15 + (i / 11) * (Math.PI - 0.3);
    const r = 28 + rand() * 14;
    const h = 5 + rand() * 9;
    const w = 4 + rand() * 4;
    const mesa = new THREE.Group();
    add(mesa, new THREE.CylinderGeometry(w * 0.8, w, h, 8), 0xc9774a, [0, h / 2, 0]);
    add(mesa, new THREE.CylinderGeometry(w * 0.82, w * 0.8, h * 0.18, 8), 0xe9b782, [0, h * 0.62, 0]);
    add(mesa, new THREE.CylinderGeometry(w * 0.86, w * 0.82, h * 0.1, 8), 0xe8d3a2, [0, h * 0.35, 0]);
    place(decor, mesa, Math.cos(a) * r, Math.sin(a) * r - 4);
  }
  scatter(rand, 18, R + 2, R + 22, (x, z) => place(decor, makeRock(0xb9855a, 1.5 + rand() * 2, rand), x, z), (x, z) => z > 4 || Math.hypot(x, z) < R + 2);
  scatter(rand, 10, 3, R, (x, z) => place(decor, makeRock(0xcaa377, 0.5 + rand() * 0.6, rand), x, z), (x, z) => z > 6 || Math.hypot(x, z + 9) < 4);
  scatter(rand, 7, R + 2, R + 12, (x, z) => place(decor, makePalm(rand, 3.5 + rand() * 1.5), x, z), (x, z) => z > 4 || Math.hypot(x, z) < R + 2);
  // old footprints in the sand, and a half-buried ribcage
  scatter(rand, 8, 4, R - 2, (x, z) => {
    const f = makeFootprint(0xb98f52, 1.3);
    f.children.forEach((c) => c.material = new THREE.MeshBasicMaterial({ color: 0xc19a5e }));
    place(decor, f, x, z, { rot: rand() * 6 });
  }, (x, z) => z > 6 || Math.hypot(x, z + 9) < 4);
  const rib = makeRibs(IVORY);
  rib.scale.setScalar(2.4);
  place(decor, rib, -13.5, -3, { rot: 0.4, y: -0.9 });
  g.add(bake(decor));

  // the three sandy mounds
  const moundSpots = [[-8, 3.5], [8.5, -1], [-2.5, -6.5]];
  const mounds = moundSpots.map(([x, z]) => {
    const m = makeMound();
    place(g, m, x, z, { rot: rand() * 6, scale: 1.3 });
    return { group: m, pos: new THREE.Vector3(x, 0, z), dug: false };
  });

  // the find table
  const table = new THREE.Group();
  add(table, BOX, 0xc9a07a, [0, 0.55, 0], [5.6, 0.2, 2.2]);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(table, CYL, 0x8a5a33, [sx * 2.5, 0.25, sz * 0.9], [0.12, 0.5, 0.12]);
  place(g, table, 0, -10);
  block(0, -10, 3.2);
  const slots = [-1.7, 0, 1.7].map((x) => new THREE.Vector3(x, 0.78, -10));

  // the display stand where the skeleton goes together
  const stand = new THREE.Group();
  add(stand, CYL, 0xaaa097, [0, 0.12, 0], [3.2, 0.24, 3.2]);
  add(stand, CYL, 0x7a5230, [0, 0.3, 0], [3.0, 0.1, 3.0]);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    add(stand, CYL, 0x8a5a33, [Math.cos(a) * 3.1, 0.5, Math.sin(a) * 3.1], [0.08, 1.0, 0.08]);
  }
  place(g, stand, 0, -2.4);
  const standPos = new THREE.Vector3(0, 0, -2.4);
  const skel = makeSkeleton();
  skel.group.position.set(0, 0.35, -2.4);
  skel.group.rotation.y = 0.5;
  skel.group.scale.setScalar(0.62);
  skel.group.visible = false;
  g.add(skel.group);
  const skelGlow = makeGlow(0xffe9a0, 9);
  skelGlow.position.set(0, 2.2, -2.4);
  skelGlow.visible = false;
  g.add(skelGlow);

  const dust = new Particles(g, textures.snow, { max: 120, size: 0.5, additive: false });
  const sky = skyLife(game, g, rand, { flyers: 2 });
  const update = (dt, t) => {
    sky(dt, t);
    dust.update(dt);
    if (skelGlow.visible) skelGlow.material.opacity = 0.55 + Math.sin(t * 4) * 0.2;
  };

  return {
    name: 'dig',
    group: g,
    bg: 0xcdeaff,
    fog: { color: 0xf3e4c4, near: 34, far: 100 },
    light: { hemi: 1.0, hemiColor: 0xfff6e0, hemiGround: 0xe0c090, sun: 1.5, sunColor: 0xfff0d0 },
    camScale: 1,
    spawn: new THREE.Vector3(0, 0, 9),
    heading: Math.PI,
    clamp: circleClamp(R),
    colliders,
    update,
    mounds, slots, standPos, skeleton: skel, skelGlow, dust, tablePos: new THREE.Vector3(0, 0, -8.3),
  };
}

export { IVORY, makeBone, makeSkull, makeRibs };
