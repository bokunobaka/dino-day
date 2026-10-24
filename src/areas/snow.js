// Day 9: a snowy valley. Piles to roll into a snow dino, a bench of dress-up bits, shivering friends to give presents to.
import * as THREE from 'three';
import { mat, add, ball, CYL, CONE, BOX, SPHERE } from '../models.js';
import { Dino } from '../dinos.js';
import { makeSnowTree, makeSnowPile, makeSnowDino, makePresent, makeRock, makeGlow, makeMountains, bake } from '../scenery.js';
import { Particles, textures } from '../fx.js';
import { rng, place, ground, circleClamp, scatter, boulderRing } from './util.js';

const R = 15;

export function buildSnow(game) {
  const g = new THREE.Group();
  const rand = rng(101);
  const colliders = [];
  const block = (x, z, r) => colliders.push({ x, z, r });

  ground(g, 0xdbe7f6, 0xf6faff, R + 1.5);

  const decor = new THREE.Group();
  boulderRing(decor, rand, R + 0.5, 0xb8c4d6, 44);
  const far = (x, z) => z > 4 || Math.hypot(x, z) < R + 2;
  scatter(rand, 34, R + 2, R + 20, (x, z) => place(decor, makeSnowTree(rand, 5 + rand() * 4), x, z, { rot: rand() * 6 }), far);
  scatter(rand, 8, 4, R - 1, (x, z) => {
    place(decor, makeSnowTree(rand, 4 + rand() * 2), x, z, { rot: rand() * 6 });
    block(x, z, 0.5);
  }, (x, z) => z > 5 || Math.hypot(x, z + 4) < 6 || Math.hypot(x - 7, z + 6) < 3.4);
  scatter(rand, 8, 4, R - 1, (x, z) => place(decor, makeRock(0xaab6c8, 0.7 + rand() * 0.8, rand), x, z), (x, z) => z > 6 || Math.hypot(x, z + 4) < 6);
  g.add(bake(decor));

  // white mountains far away
  const mtn = makeMountains(rand, 9, 55);
  mtn.children.forEach((m) => (m.material = mat(0xeaf3ff)));
  g.add(mtn);

  // the building site for the snow dino
  const sitePos = new THREE.Vector3(0, 0, -5.5);
  const site = makeSnowDino();
  place(g, site, sitePos.x, sitePos.z, { scale: 1.1 });
  block(sitePos.x, sitePos.z, 2.2);
  const parts = site.userData.parts;

  // three snow piles to roll up
  const pileSpots = [[-8, 3], [8.5, 1.5], [-3, -9.5]];
  const piles = pileSpots.map(([x, z], i) => {
    const p = makeSnowPile(1.7);
    place(g, p, x, z);
    const gl = makeGlow(0xa8d8ff, 4.2);
    gl.position.set(x, 0.9, z);
    g.add(gl);
    p.userData.glow = gl;
    return { group: p, glow: gl, pos: new THREE.Vector3(x, 0, z), taken: false };
  });

  // the bench with the dress-up bits
  const benchPos = new THREE.Vector3(7.5, 0, -7.5);
  const bench = new THREE.Group();
  add(bench, BOX, 0x9b6b43, [0, 0.55, 0], [3.2, 0.2, 1.0]);
  for (const sx of [-1, 1]) add(bench, BOX, 0x7a5230, [sx * 1.3, 0.25, 0], [0.2, 0.5, 0.8]);
  place(g, bench, benchPos.x, benchPos.z);
  block(benchPos.x, benchPos.z, 1.8);
  const bits = [
    { key: 'scarf', icon: '🧣', make: () => { const r = new THREE.Group(); add(r, new THREE.TorusGeometry(0.2, 0.08, 8, 14), 0xff4d6d, [0, 0.12, 0]).rotation.x = Math.PI / 2; add(r, BOX, 0xff4d6d, [0.18, 0.05, 0.1], [0.3, 0.06, 0.14]); return r; } },
    { key: 'hat', icon: '🧢', make: () => { const r = new THREE.Group(); add(r, CYL, 0x3b6bff, [0, 0.07, 0], [0.26, 0.14, 0.26]); ball(r, 0xffe35a, [0, 0.2, 0], 0.07); return r; } },
    { key: 'eyes', icon: '👀', make: () => { const r = new THREE.Group(); for (const s of [-1, 1]) { ball(r, 0xffffff, [s * 0.14, 0.12, 0], 0.1); ball(r, 0x2b2236, [s * 0.14, 0.12, 0.08], 0.055); } return r; } },
  ].map((b, i) => {
    const m = b.make();
    m.scale.setScalar(2.2);
    m.position.set(benchPos.x - 1.0 + i * 1.0, 0.7, benchPos.z);
    g.add(m);
    return { ...b, group: m, pos: new THREE.Vector3(benchPos.x - 1.0 + i, 0, benchPos.z), taken: false };
  });

  // shivering friends, wrapped up in a snow coat
  const friends = [['tri', 1.7, -11, -3, 1.0], ['steg', 1.8, 11.5, -2, -1.0], ['anky', 1.3, 3.5, 6, 2.6]].map(([sp, h, x, z, hd]) => {
    const c = new Dino(sp, h, sp === 'tri' ? { main: 0xf2a65a } : {});
    c.root.position.set(x, 0, z);
    c.heading = hd;
    c.root.rotation.y = hd;
    g.add(c.root);
    game.addCritter(c);
    return c;
  });

  // presents (shown when the snow dino is dressed)
  const presents = [];
  for (let i = 0; i < 3; i++) {
    const p = makePresent([0xff5fae, 0x6ad7ff, 0xb48cff][i], 0xffe066);
    p.scale.setScalar(1.7);
    p.position.set(-2 + i * 2, 0, -2.2);
    p.visible = false;
    g.add(p);
    presents.push({ group: p, pos: new THREE.Vector3(-2 + i * 2, 0, -2.2), given: false });
  }

  const snow = new Particles(g, textures.snow, { max: 420, size: 0.26, additive: false });
  let acc = 0;
  const update = (dt, t) => {
    snow.update(dt);
    acc += dt * 40;
    const p = game.player.position;
    while (acc >= 1) {
      acc -= 1;
      snow.emit(p.x + (Math.random() - 0.5) * 34, 14, p.z + (Math.random() - 0.5) * 28, 1, { speed: 0.5, up: -1.8, life: 8, spread: 0.1 });
    }
    friends.forEach((c, i) => {
      if (c.mode !== 'dance') c.root.rotation.z = Math.sin(t * 28 + i) * 0.03 * (c.shiver ? 1 : 0);
    });
  };
  friends.forEach((c) => (c.shiver = true));

  return {
    name: 'snow',
    group: g,
    bg: 0xcfe8ff,
    fog: { color: 0xdcefff, near: 30, far: 85 },
    light: { hemi: 1.0, hemiColor: 0xeaf3ff, hemiGround: 0xc8d8f0, sun: 1.25, sunColor: 0xfff6e0 },
    camScale: 1,
    spawn: new THREE.Vector3(0, 0, 9),
    heading: Math.PI,
    clamp: circleClamp(R),
    colliders,
    update,
    sitePos, site, parts, piles, bits, benchPos, friends, presents,
  };
}
