// Day 10: the waterhole. A round lake with sandy shores, palms, floaty toys on the sand and thirsty friends.
import * as THREE from 'three';
import { mat, add, ball, CYL, CONE, BOX, SPHERE } from '../models.js';
import { Dino } from '../dinos.js';
import { makeFern, makePalm, makeConifer, makeRock, makeDuck, makeSwimRing, makeBeachBall, makeGlow, bake } from '../scenery.js';
import { rng, place, ground, circleClamp, scatter, boulderRing, tufts, skyLife } from './util.js';

const R = 16;
const POOL = { x: 0, z: -3, r: 6.6 };

export function buildWaterhole(game) {
  const g = new THREE.Group();
  const rand = rng(111);
  const colliders = [];
  const block = (x, z, r) => colliders.push({ x, z, r });

  ground(g, 0x8fdc6a, 0xf0dca0, R + 1);
  tufts(g, rand, 120, R + 3);

  // the lake
  const water = new THREE.Mesh(
    new THREE.CylinderGeometry(POOL.r, POOL.r, 0.2, 40),
    new THREE.MeshToonMaterial({ color: 0x4fc7e8, emissive: 0x1a7fa8, emissiveIntensity: 0.35, transparent: true, opacity: 0.92, gradientMap: mat(0).gradientMap })
  );
  water.position.set(POOL.x, -0.02, POOL.z);
  water.receiveShadow = true;
  g.add(water);
  const sandRing = new THREE.Mesh(new THREE.RingGeometry(POOL.r, POOL.r + 1.4, 40), new THREE.MeshToonMaterial({ color: 0xe0c27a }));
  sandRing.rotation.x = -Math.PI / 2;
  sandRing.position.set(POOL.x, 0.02, POOL.z);
  g.add(sandRing);
  const ripples = [0, 1, 2].map((i) => {
    const r = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.0, 32), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4, depthWrite: false }));
    r.rotation.x = -Math.PI / 2;
    r.position.set(POOL.x + (i - 1) * 2.4, 0.1, POOL.z + (i % 2 ? 1.5 : -1.5));
    g.add(r);
    return r;
  });

  const decor = new THREE.Group();
  // rocks around the shore, lily pads on the water
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2;
    place(decor, makeRock(0x9aa3ad, 0.6 + rand() * 0.5, rand), POOL.x + Math.cos(a) * (POOL.r + 0.3), POOL.z + Math.sin(a) * (POOL.r + 0.3));
  }
  for (let i = 0; i < 7; i++) {
    const a = rand() * Math.PI * 2;
    const r = rand() * (POOL.r - 1.5);
    const pad = add(decor, CYL, 0x3fa653, [POOL.x + Math.cos(a) * r, 0.12, POOL.z + Math.sin(a) * r], [0.5, 0.03, 0.5]);
    pad.castShadow = false;
    if (i % 3 === 0) ball(decor, 0xff8fc7, [POOL.x + Math.cos(a) * r, 0.2, POOL.z + Math.sin(a) * r], 0.14);
  }
  boulderRing(decor, rand, R + 0.5, 0x9aa3ad, 44);
  const far = (x, z) => z > 4 || Math.hypot(x, z) < R + 2;
  scatter(rand, 14, R + 2.5, R + 16, (x, z) => place(decor, makePalm(rand, 4 + rand() * 2), x, z, { rot: rand() * 6 }), far);
  scatter(rand, 12, R + 3, R + 20, (x, z) => place(decor, makeConifer(rand, 5 + rand() * 4), x, z, { rot: rand() * 6 }), far);
  scatter(rand, 8, 3, R, (x, z) => place(decor, makePalm(rand, 4 + rand() * 1.5), x, z, { rot: rand() * 6 }), (x, z) => Math.hypot(x - POOL.x, z - POOL.z) < POOL.r + 3 || z > 4);
  scatter(rand, 22, 3, R, (x, z) => place(decor, makeFern(rand, 1 + rand() * 0.5), x, z, { rot: rand() * 6 }), (x, z) => Math.hypot(x - POOL.x, z - POOL.z) < POOL.r + 2 || z > 8);
  g.add(bake(decor));
  // a few palms inside need blocking
  [[-11, 2], [11, 1], [-8, -10], [9, -11]].forEach(([x, z]) => {
    place(g, makePalm(rand, 5), x, z, { rot: rand() * 6 });
    block(x, z, 0.5);
  });

  // the floaty toys lying on the sand
  const toySpots = [[-9.5, 5], [10, 4.5], [-10.5, -6], [10.5, -9]];
  const makers = [makeDuck, makeSwimRing, makeBeachBall, () => { const d = makeDuck(); d.traverse((o) => o.isMesh && (o.material = mat(o.material.color.getHex() === 0xffe14d || o.material.color.getHex() === 0xffd21f ? 0xff8fc7 : o.material.color.getHex()))); return d; }];
  const toys = toySpots.map(([x, z], i) => {
    const o = makers[i]();
    o.scale.setScalar(1.3);
    place(g, o, x, z, { rot: rand() * 6 });
    const gl = makeGlow(0xfff1a8, 2.6);
    gl.position.set(x, 0.8, z);
    g.add(gl);
    return { group: o, glow: gl, pos: new THREE.Vector3(x, 0, z), taken: false };
  });

  // thirsty friends
  const friends = [['tri', 1.7, -12.5, -1, 1.2], ['pachy', 1.8, 12.8, -2, -1.2], ['anky', 1.3, 6, -14, 0.2]].map(([sp, h, x, z, hd]) => {
    const c = new Dino(sp, h);
    c.root.position.set(x, 0, z);
    c.heading = hd;
    c.root.rotation.y = hd;
    g.add(c.root);
    game.addCritter(c);
    return c;
  });

  const sky = skyLife(game, g, rand, { flyers: 2 });
  const update = (dt, t) => {
    sky(dt, t);
    ripples.forEach((r, i) => {
      const k = (t * 0.35 + i / 3) % 1;
      r.scale.setScalar(1 + k * 2.4);
      r.material.opacity = 0.45 * (1 - k);
    });
    toys.forEach((o, i) => {
      if (o.taken) return;
      o.glow.material.opacity = 0.7 + Math.sin(t * 4 + i) * 0.2;
      o.group.position.y = Math.sin(t * 2 + i) * 0.06;
    });
  };

  return {
    name: 'waterhole',
    group: g,
    bg: 0xbfe6ff,
    fog: { color: 0xcdeeff, near: 36, far: 110 },
    camScale: 1,
    spawn: new THREE.Vector3(0, 0, 10),
    heading: Math.PI,
    clamp: circleClamp(R),
    colliders,
    update,
    POOL, edgePos: new THREE.Vector3(0, 0, POOL.z + POOL.r + 0.7), toys, friends,
  };
}
