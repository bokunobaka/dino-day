// Day 11: the prehistoric sea floor. Clams with pearls, swimming sea reptiles to befriend, a treasure chest.
import * as THREE from 'three';
import { mat, add, ball, CYL, CONE, SPHERE } from '../models.js';
import { Dino } from '../dinos.js';
import { makeCoral, makeSeaweed, makeShell, makeChest, makeRock, makeAmmonite, makeGlow, bake } from '../scenery.js';
import { Particles, textures } from '../fx.js';
import { rng, place, ground, circleClamp, scatter } from './util.js';

const R = 15;

export function buildSeaFloor(game) {
  const g = new THREE.Group();
  const rand = rng(121);
  const colliders = [];
  const block = (x, z, r) => colliders.push({ x, z, r });

  ground(g, 0x6fb6c8, 0xe6d6a0, R + 1);

  const decor = new THREE.Group();
  const far = (x, z) => z > 4 || Math.hypot(x, z) < R + 1.5;
  const coralCols = [0xff7aa8, 0xffb347, 0xc9a6ff, 0xff6b6b, 0x7be37a];
  scatter(rand, 36, R + 1, R + 16, (x, z, i) => place(decor, makeCoral(coralCols[i % 5], rand), x, z, { scale: 1.5 + rand() * 1.5, rot: rand() * 6 }), far);
  scatter(rand, 14, R + 1.5, R + 20, (x, z) => place(decor, makeRock(0x5a7f9a, 2 + rand() * 3, rand), x, z), far);
  scatter(rand, 12, 3, R - 1, (x, z, i) => {
    place(decor, makeCoral(coralCols[(i + 2) % 5], rand), x, z, { scale: 1 + rand() * 0.8, rot: rand() * 6 });
    block(x, z, 0.5);
  }, (x, z) => z > 6 || Math.hypot(x, z + 8) < 3.5);
  scatter(rand, 10, 3, R, (x, z) => place(decor, makeAmmonite(), x, z, { y: 0.1, rot: rand() * 6 }), (x, z) => z > 7);
  g.add(bake(decor));

  // swaying seaweed
  const weeds = [];
  scatter(rand, 40, 3, R + 6, (x, z) => {
    const w = makeSeaweed(rand, 1.6 + rand() * 1.6);
    place(g, w, x, z, { rot: rand() * 6 });
    weeds.push({ w, ph: rand() * 6 });
  }, (x, z) => z > 6 || Math.hypot(x, z + 8) < 3);

  // the clams
  const shellSpots = [[-8, 3.5], [9, 0.5], [-3.5, -7]];
  const shells = shellSpots.map(([x, z], i) => {
    const s = makeShell([0xffb3d9, 0xb3e0ff, 0xffe0a3][i]);
    s.scale.setScalar(1.8);
    place(g, s, x, z, { rot: rand() * 6 });
    const gl = makeGlow(0xffffff, 3);
    gl.position.set(x, 0.8, z);
    g.add(gl);
    return { group: s, glow: gl, pos: new THREE.Vector3(x, 0, z), opened: false };
  });

  // swimming friends
  const swimmers = [['plesio', 3.0, -11, -2], ['ichthyo', 2.4, 11, 3], ['turtle', 2.3, 2, -10.5]].map(([sp, h, x, z], i) => {
    const c = new Dino(sp, h);
    c.root.position.set(x, 1.6, z);
    c.heading = i;
    g.add(c.root);
    game.addCritter(c);
    return { c, wait: 1 + i, home: new THREE.Vector3(x, 0, z), phase: i * 2, free: true };
  });

  // the treasure chest
  const chest = makeChest();
  place(g, chest, 0, -11.5, { scale: 1.3 });
  block(0, -11.5, 1.6);
  const chestPos = new THREE.Vector3(0, 0, -9.8);
  const chestGlow = makeGlow(0xfff1a8, 7);
  chestGlow.position.set(0, 1.4, -11.5);
  chestGlow.visible = false;
  g.add(chestGlow);

  // light rays from the surface + rising bubbles
  const rays = [];
  for (let i = 0; i < 7; i++) {
    const r = new THREE.Mesh(
      new THREE.PlaneGeometry(2.4 + rand() * 2, 40),
      new THREE.MeshBasicMaterial({ color: 0xbfffff, transparent: true, opacity: 0.1, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false })
    );
    r.position.set(-18 + i * 6 + rand() * 3, 14, -18 - rand() * 14);
    r.rotation.set(0, rand(), 0.25);
    g.add(r);
    rays.push(r);
  }
  const bubbles = new Particles(g, textures.glow, { max: 160, size: 0.5 });
  let acc = 0;
  let trail = 0;

  const update = (dt, t) => {
    bubbles.update(dt);
    acc += dt * 8;
    while (acc >= 1) {
      acc -= 1;
      bubbles.emit((Math.random() - 0.5) * 36, 0.2, -16 + Math.random() * 28, 1, { speed: 0.1, up: 1.4, life: 5, colors: [0xffffff, 0xcfffff], spread: 0.2 });
    }
    trail -= dt;
    const p = game.player.position;
    if (trail <= 0) {
      trail = 0.5;
      bubbles.emit(p.x, 1.6, p.z, 1, { speed: 0.2, up: 1.2, life: 3, colors: [0xffffff], spread: 0.3 });
    }
    rays.forEach((r, i) => (r.material.opacity = 0.08 + Math.sin(t * 0.8 + i) * 0.04));
    weeds.forEach(({ w, ph }) => w.userData.segs.forEach((s, i) => (s.rotation.z = Math.sin(t * 1.4 + ph + i * 0.5) * 0.14)));
    shells.forEach((s, i) => {
      if (!s.opened) s.glow.material.opacity = 0.5 + Math.sin(t * 3 + i) * 0.2;
    });
    swimmers.forEach((s, i) => {
      s.c.root.position.y = 1.6 + Math.sin(t * 1.3 + s.phase) * 0.3;
      if (!s.free) return;
      const c = s.c;
      if (!c.dest) {
        s.wait -= dt;
        if (s.wait <= 0) {
          s.wait = 2 + Math.random() * 3;
          c.goTo(s.home.x + (Math.random() - 0.5) * 8, s.home.z + (Math.random() - 0.5) * 6, { speed: 1.6 });
        }
      }
    });
  };

  return {
    name: 'seafloor',
    group: g,
    bg: 0x5fc8e8,
    fog: { color: 0x4fb4d8, near: 10, far: 55 },
    light: { hemi: 1.0, hemiColor: 0xcffaff, hemiGround: 0x4a90a8, sun: 1.1, sunColor: 0xe0ffff },
    camScale: 1,
    spawn: new THREE.Vector3(0, 0, 9),
    heading: Math.PI,
    clamp: circleClamp(R),
    colliders,
    update,
    shells, swimmers, chest, chestPos, chestGlow,
  };
}
