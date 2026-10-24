// Day 8: a thick jungle. Amber stones to find, a rolling boulder gate to open, a sunny nest to run to.
// The raptors chase but are friendly: a bump only makes them want a hug.
import * as THREE from 'three';
import { mat, add, ball, CYL, CONE, SPHERE } from '../models.js';
import { Dino } from '../dinos.js';
import { makeFern, makePalm, makeConifer, makeBigTree, makeRock, makeBoulder, makeAmber, makeGlow, makeNest, makeEgg, makeMushroom, bake } from '../scenery.js';
import { rng, place, ground, circleClamp, scatter, tufts } from './util.js';

const R = 16;

export function buildJungle(game) {
  const g = new THREE.Group();
  const rand = rng(91);
  const colliders = [];
  const block = (x, z, r) => colliders.push({ x, z, r });

  ground(g, 0x3f9b57, 0x56b36a, R + 1.5);
  tufts(g, rand, 220, R + 3, 0x2f8a47);

  const decor = new THREE.Group();
  // dense jungle outside, with a corridor kept clear beyond the gate
  const outer = (x, z) => z > 4 || Math.hypot(x, z) < R + 1.2 || (Math.abs(x) < 5 && z < -R + 2);
  scatter(rand, 30, R + 1.5, R + 14, (x, z) => place(decor, makePalm(rand, 4.5 + rand() * 3), x, z, { rot: rand() * 6 }), outer);
  scatter(rand, 20, R + 2, R + 18, (x, z) => place(decor, makeBigTree(rand, 6 + rand() * 3), x, z, { rot: rand() * 6 }), outer);
  scatter(rand, 24, R + 1.5, R + 12, (x, z) => place(decor, makeFern(rand, 1.4 + rand() * 0.8), x, z, { rot: rand() * 6 }), outer);
  // trees and ferns inside the play area
  const treeSpots = [[-11, 2], [-12.5, -5], [12, 3.5], [11.5, -8], [-6, -9.5], [5.5, -12], [-9, 8.5], [10, 9]];
  treeSpots.forEach(([x, z], i) => {
    place(decor, i % 2 ? makeBigTree(rand, 6.5) : makePalm(rand, 5.5), x, z, { rot: rand() * 6 });
    block(x, z, 0.55);
  });
  scatter(rand, 26, 3, R, (x, z) => place(decor, makeFern(rand, 1 + rand() * 0.6), x, z, { rot: rand() * 6 }), (x, z) => z > 9 || Math.hypot(x, z + 2) < 2);
  scatter(rand, 10, 3, R, (x, z, i) => place(decor, makeMushroom([0xff6b6b, 0xffb347, 0xc9a6ff][i % 3], 1 + rand() * 0.6), x, z), () => false);
  // hanging vines
  for (let i = 0; i < 16; i++) {
    const a = Math.PI + 0.2 + rand() * (Math.PI - 0.4);
    const r = R + 1 + rand() * 4;
    const h = 4 + rand() * 4;
    add(decor, CYL, 0x2f8a47, [Math.cos(a) * r, 9 - h / 2, Math.sin(a) * r], [0.05, h, 0.05]);
  }
  g.add(bake(decor));

  // the gate: two rock pillars with a big boulder between
  for (const sx of [-1, 1]) {
    place(g, makeBoulder(0x8e98a3, 2.0), sx * 5.2, -R - 0.8);
    block(sx * 5.2, -R - 0.8, 2.4);
  }
  const gate = new THREE.Group();
  const bould = add(gate, SPHERE, mat(0x8e98a3), [0, 2.8, 0], [3.2, 3.2, 2.6]);
  const bm = ball(gate, 0x9aa3ad, [0.8, 4.4, 0.3], 1.1);
  place(g, gate, 0, -R - 0.8);
  const gatePos = new THREE.Vector3(0, 0, -R + 1.8);

  // the safe place beyond: a sunny nest
  const safe = new THREE.Mesh(new THREE.CircleGeometry(3.4, 32), new THREE.MeshBasicMaterial({ color: 0xfff1a8, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }));
  safe.rotation.x = -Math.PI / 2;
  safe.position.set(0, 0.06, -26);
  g.add(safe);
  const safeGlow = makeGlow(0xfff1a8, 10);
  safeGlow.position.set(0, 2, -26);
  g.add(safeGlow);
  place(g, makeNest(2), 0, -26);
  place(g, makeEgg(0xfff1d6, 0x58c26b, 1.4), 0.3, -26.2, { y: 0.2 });
  const safePos = new THREE.Vector3(0, 0, -26);

  // the amber stones
  const amberSpots = [[-10.8, 5.2], [10.6, -5.5], [-3.8, -11.8]];
  const ambers = amberSpots.map(([x, z]) => {
    const k = makeAmber();
    k.scale.setScalar(1.5);
    place(g, k, x, z);
    return { group: k, glow: k.userData.glow, pos: new THREE.Vector3(x, 0, z), taken: false };
  });

  // calm friends just standing around
  [['para', 2.6, -13.5, 0, 1.2], ['pachy', 1.8, 13.6, 0.5, -1.2], ['anky', 1.3, 7, -7.5, 0]].forEach(([sp, h, x, z, hd]) => {
    const c = new Dino(sp, h);
    c.root.position.set(x, 0, z);
    c.heading = hd;
    c.root.rotation.y = hd;
    g.add(c.root);
    game.addCritter(c);
  });

  // the friendly raptors
  const looks = [{}, { main: 0x6fbf9a, belly: 0xeaf7e6, accent: 0xf2c84b }, { main: 0x5aa9f5, belly: 0xdbefff, accent: 0xff7aa8 }];
  const raptors = [[-8, -3], [8, 3], [1, -7.5]].map(([x, z], i) => {
    const c = new Dino('raptor', 1.9, looks[i]);
    c.root.position.set(x, 0, z);
    g.add(c.root);
    game.addCritter(c);
    return { c, cool: 1 + i, wait: 1 + i, home: new THREE.Vector3(x, 0, z) };
  });

  const area = {
    name: 'jungle',
    group: g,
    bg: 0xa8e0c0,
    fog: { color: 0xb6e8c8, near: 26, far: 80 },
    light: { hemi: 0.95, hemiColor: 0xe8ffe0, hemiGround: 0x4a8a50, sun: 1.3, sunColor: 0xfff3c8 },
    camScale: 1,
    spawn: new THREE.Vector3(0, 0, 10),
    heading: Math.PI,
    colliders,
    open: false,
    onBump: null,
    chasing: true,
    gate, gatePos, safePos, ambers, raptors,
  };

  const base = circleClamp(R);
  area.clamp = (p) => {
    if (area.open && Math.abs(p.x) < 3.2 && p.z < -R + 1) {
      p.x = Math.max(-3.2, Math.min(3.2, p.x));
      p.z = Math.max(-29, p.z);
      return;
    }
    base(p);
  };

  area.update = (dt, t) => {
    for (const k of ambers) {
      if (k.taken) continue;
      k.group.rotation.y = t * 2;
      k.group.position.y = Math.sin(t * 2.5 + k.pos.x) * 0.15;
      k.glow.material.opacity = 0.7 + Math.sin(t * 4 + k.pos.z) * 0.2;
    }
    safe.material.opacity = 0.45 + Math.sin(t * 3) * 0.12;

    const p = game.player.position;
    for (const z of raptors) {
      const c = z.c;
      if (!area.chasing) {
        if (c.dest) c.dest = null;
        continue;
      }
      if (z.cool > 0) {
        z.cool -= dt;
        if (c.dest) {
          c.dest = null;
          c.play('idle');
        }
        continue;
      }
      const d = Math.hypot(p.x - c.root.position.x, p.z - c.root.position.z);
      if (d < 1.4) {
        z.cool = 3.2;
        c.dest = null;
        c.play('idle');
        area.onBump && area.onBump(z);
      } else if (d < 10) {
        c.speed = 2.6;
        c.dest = c.dest || new THREE.Vector3();
        c.dest.set(p.x, 0, p.z);
      } else if (!c.dest) {
        z.wait -= dt;
        if (z.wait <= 0) {
          z.wait = 2 + Math.random() * 3;
          c.goTo(z.home.x + (Math.random() - 0.5) * 6, z.home.z + (Math.random() - 0.5) * 6, { speed: 1.4 });
        }
      }
    }
  };
  return area;
}
