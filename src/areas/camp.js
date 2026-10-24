// Day 15: a campsite at dusk. Tents, logs to sit on, a fire pit waiting for wood, a starry sky with shooting stars.
import * as THREE from 'three';
import { mat, add, ball, CYL, CONE, BOX, SPHERE } from '../models.js';
import { Dino } from '../dinos.js';
import { makeFern, makePalm, makeConifer, makeRock, makeCampfire, makeLog, makeTent, makeGlow, bake } from '../scenery.js';
import { Particles, textures } from '../fx.js';
import { rng, place, ground, circleClamp, scatter, boulderRing, tufts, stars } from './util.js';

const R = 15;

export function buildCamp(game) {
  const g = new THREE.Group();
  const rand = rng(161);
  const colliders = [];
  const block = (x, z, r) => colliders.push({ x, z, r });

  ground(g, 0x3d7a58, 0x55946a, R + 1);
  stars(g, 140);
  const moon = new THREE.Mesh(SPHERE, new THREE.MeshBasicMaterial({ color: 0xfff8d8, fog: false }));
  moon.scale.setScalar(4);
  moon.position.set(-22, 28, -55);
  g.add(moon);
  tufts(g, rand, 160, R + 3, 0x2f6a48);

  const decor = new THREE.Group();
  boulderRing(decor, rand, R + 0.5, 0x6a7a80, 44);
  const far = (x, z) => z > 4 || Math.hypot(x, z) < R + 2;
  scatter(rand, 14, R + 2.5, R + 16, (x, z) => place(decor, makePalm(rand, 4 + rand() * 2), x, z, { rot: rand() * 6 }), far);
  scatter(rand, 20, R + 3, R + 20, (x, z) => place(decor, makeConifer(rand, 5 + rand() * 4, 0x1f7a52), x, z, { rot: rand() * 6 }), far);
  scatter(rand, 16, 3, R, (x, z) => place(decor, makeFern(rand, 1 + rand() * 0.5), x, z, { rot: rand() * 6 }), (x, z) => z > 8 || Math.hypot(x, z + 3) < 4.5);
  g.add(bake(decor));

  // tents
  place(g, makeTent(0xff9a4d), -9, -8, { rot: 0.5, scale: 1.2 });
  place(g, makeTent(0x4a90e2), 9.5, -8.5, { rot: -0.5, scale: 1.2 });
  block(-9, -8, 2.2);
  block(9.5, -8.5, 2.2);

  // the fire pit
  const pitPos = new THREE.Vector3(0, 0, -3);
  const fireB = makeCampfire();
  place(g, fireB, pitPos.x, pitPos.z, { scale: 1.2 });
  block(pitPos.x, pitPos.z, 1.4);
  const fire = fireB.userData.fire;
  const fireGlow = makeGlow(0xffa94d, 11);
  fireGlow.position.set(pitPos.x, 1.2, pitPos.z);
  fireGlow.visible = false;
  g.add(fireGlow);
  // logs to sit on around the fire
  [[-3.6, -1.5, 0.4], [3.6, -1.5, -0.4], [-2.6, -5.6, -0.5], [2.8, -5.6, 0.5]].forEach(([x, z, r]) => {
    const l = makeLog();
    l.scale.setScalar(2.2);
    place(g, l, x, z, { rot: r });
  });

  // firewood to find
  const woodSpots = [[-9.5, 3.5], [10, 2.5], [-6, -11], [6.5, 6.5]];
  const woods = woodSpots.map(([x, z], i) => {
    const w = new THREE.Group();
    for (let k = 0; k < 3; k++) {
      const l = makeLog();
      l.scale.setScalar(1.3);
      l.position.set((k - 1) * 0.1, k * 0.2, 0);
      l.rotation.y = k * 0.5;
      w.add(l);
    }
    place(g, w, x, z, { rot: i });
    const gl = makeGlow(0xfff1a8, 2.8);
    gl.position.set(x, 0.8, z);
    g.add(gl);
    return { group: w, glow: gl, pos: new THREE.Vector3(x, 0, z), taken: false };
  });

  // friends waiting around the fire
  const friends = [['tri', 1.7, -5.5, -2.8, 1.2], ['steg', 1.7, 5.7, -3.4, -1.2], ['raptor', 1.9, 0.5, -7.2, 0]].map(([sp, h, x, z, hd]) => {
    const c = new Dino(sp, h);
    c.root.position.set(x, 0, z);
    c.heading = hd;
    c.root.rotation.y = hd;
    g.add(c.root);
    game.addCritter(c);
    return c;
  });

  // fireflies + embers + the odd shooting star
  const flies = new Particles(g, textures.glow, { max: 80, size: 0.45 });
  let facc = 0;
  let nextStar = 4;
  const shoot = [];
  const update = (dt, t) => {
    flies.update(dt);
    facc += dt * 5;
    while (facc >= 1) {
      facc -= 1;
      flies.emit((Math.random() - 0.5) * 30, 0.4 + Math.random() * 2.5, -12 + Math.random() * 22, 1, { speed: 0.25, up: 0.2, life: 4, colors: [0xe8ff7a, 0xffffaa], spread: 0.1 });
    }
    if (fireGlow.visible) {
      fireGlow.material.opacity = 0.7 + Math.sin(t * 9) * 0.15;
      const fl = fire.userData.flame;
      fl[0].scale.y = 0.9 * (1 + Math.sin(t * 11) * 0.12);
      fl[1].scale.y = 0.6 * (1 + Math.sin(t * 14 + 1) * 0.15);
      game.sparkles.emit(pitPos.x, 2.2, pitPos.z, 1, { speed: 0.5, up: 2.2, life: 1.6, colors: [0xffd23f, 0xff8a3d], spread: 0.3 });
    }
    woods.forEach((w, i) => {
      if (!w.taken) w.glow.material.opacity = 0.7 + Math.sin(t * 4 + i) * 0.2;
    });
    nextStar -= dt;
    if (nextStar <= 0) {
      nextStar = 5 + Math.random() * 5;
      const x = -20 + Math.random() * 30;
      for (let i = 0; i < 14; i++) shoot.push({ t: i * 0.04, x, y: 30 + Math.random() * 6, z: -50 });
    }
    for (let i = shoot.length - 1; i >= 0; i--) {
      const s = shoot[i];
      s.t -= dt;
      if (s.t <= 0) {
        game.sparkles.emit(s.x, s.y, s.z, 1, { speed: 0.1, up: 0, life: 0.8, colors: [0xffffff, 0xfff1a8] });
        s.x += 2.4;
        s.y -= 1.4;
        s.t = 0.03;
        if (s.y < 14) shoot.splice(i, 1);
      }
    }
  };

  return {
    name: 'camp',
    group: g,
    bg: 0x1a2748,
    fog: { color: 0x22325a, near: 32, far: 95 },
    light: { hemi: 0.95, hemiColor: 0xb8d4ff, hemiGround: 0x5a8a7a, sun: 0.95, sunColor: 0xd0e0ff },
    camScale: 1,
    spawn: new THREE.Vector3(0, 0, 9),
    heading: Math.PI,
    clamp: circleClamp(R),
    colliders,
    update,
    pitPos, woods, friends,
    setFire: (on) => {
      fire.visible = on;
      fireGlow.visible = on;
    },
  };
}
