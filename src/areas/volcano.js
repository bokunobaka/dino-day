// Day 5 and the stomp mini-game: the volcano party ground. Torches to light, footprints to stomp, an eruption to finish.
import * as THREE from 'three';
import { mat, add, ball, CYL, CONE, SPHERE } from '../models.js';
import { makeRock, makeVolcano, makeTorch, makeGlow, makeFootprint, makeCrystal, makeBanner, bake } from '../scenery.js';
import { Particles, textures } from '../fx.js';
import { rng, place, ground, circleClamp, scatter, boulderRing, stars } from './util.js';

const R = 15;
export const TILE_COLORS = [0x6fd06f, 0xffb347, 0xffe66b, 0xff7aa8, 0x6ad7ff, 0xb48cff];

export function makeStompTile(color) {
  const disc = new THREE.Mesh(new THREE.CircleGeometry(0.95, 24), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5, depthWrite: false }));
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = 0.06;
  // a white footprint lying on the disc (the print is built flat in x/z; the disc is turned flat, so stand it up in the disc's frame)
  const fp = makeFootprint(0xffffff, 1.3);
  fp.rotation.x = Math.PI / 2;
  fp.position.set(0, 0, 0.02);
  fp.userData.mat.opacity = 0.9;
  disc.add(fp);
  return disc;
}

export function buildVolcano(game) {
  const g = new THREE.Group();
  const rand = rng(61);
  const colliders = [];
  const block = (x, z, r) => colliders.push({ x, z, r });

  ground(g, 0x5a4642, 0x7d6a68, R + 1);
  stars(g, 120);

  // lava streams in the dark rock around the edge
  const lavaM = new THREE.MeshBasicMaterial({ color: 0xff7a1f });
  const lavaM2 = new THREE.MeshBasicMaterial({ color: 0xffb02e });
  for (let i = 0; i < 9; i++) {
    const a = Math.PI + 0.3 + (i / 8) * (Math.PI * 1.1 - 0.6) + (i % 2 ? 0.1 : -0.1);
    const len = 8 + rand() * 6;
    const s = add(g, SPHERE, i % 2 ? lavaM : lavaM2, [Math.cos(a) * (R + 4 + len / 2), 0.04, Math.sin(a) * (R + 4 + len / 2) * 0.9], [1 + rand() * 0.6, 0.02, len / 2]);
    s.rotation.y = -a + Math.PI / 2;
    s.castShadow = false;
  }

  const decor = new THREE.Group();
  boulderRing(decor, rand, R + 0.5, 0x5a4a46, 44);
  scatter(rand, 20, 4, R, (x, z) => place(decor, makeRock(0x5a4a46 + (rand() * 3 | 0) * 0x080808, 0.6 + rand() * 0.8, rand), x, z, { rot: rand() * 6 }), (x, z) => Math.hypot(x, z + 1) < 6.2 || z > 8);
  scatter(rand, 16, R + 2, R + 18, (x, z) => place(decor, makeRock(0x4a3d3a, 2 + rand() * 2.5, rand), x, z, { rot: rand() * 6 }), (x, z) => z > 4 || Math.hypot(x, z) < R + 2);
  g.add(bake(decor));

  // the big volcano (the star of the party)
  const volcano = makeVolcano(26);
  place(g, volcano, 0, -46);
  const eruptTop = new THREE.Vector3(0, 27.5, -46);

  // glowing crystals and a banner
  [[-13, -5, 0xff7a1f], [13, -6, 0xffb02e], [-8, -12, 0xc9a6ff], [8, -12, 0x6ad7ff]].forEach(([x, z, c]) => {
    place(g, makeCrystal(c, 1.5), x, z);
    const gl = makeGlow(c, 5);
    gl.position.set(x, 1.2, z);
    g.add(gl);
    block(x, z, 0.8);
  });
  const banner = makeBanner([0xff7a1f, 0xffd23f, 0x6ad7ff, 0xff5fae], 10, 14);
  place(g, banner, 0, -13, { y: 4.2 });

  // torches (lit during the day's first step)
  const torchSpots = [[-6.5, -8], [6.5, -8], [0, -11.5]];
  const torches = torchSpots.map(([x, z]) => {
    const tc = makeTorch();
    place(g, tc, x, z);
    block(x, z, 0.4);
    return { group: tc, fire: tc.userData.fire, lit: false, pos: new THREE.Vector3(x, 0, z) };
  });

  // stomp tiles in a ring (shown when needed)
  const tiles = TILE_COLORS.map((c, i) => {
    const tile = makeStompTile(c);
    const ang = (i / 6) * Math.PI * 2 - Math.PI / 2;
    tile.position.set(Math.cos(ang) * 4.6, 0.06, -1 + Math.sin(ang) * 3.6);
    tile.visible = false;
    g.add(tile);
    return tile;
  });

  // embers rising from the dark
  const embers = new Particles(g, textures.glow, { max: 160, size: 0.6 });
  let acc = 0;
  const update = (dt, t) => {
    embers.update(dt);
    acc += dt * 14;
    while (acc >= 1) {
      acc -= 1;
      embers.emit((Math.random() - 0.5) * 50, 0.2, -4 - Math.random() * 40, 1, { speed: 0.3, up: 1.4 + Math.random(), life: 5, colors: [0xff9a2e, 0xffd23f, 0xff5a1f], spread: 0.2 });
    }
    torches.forEach((tc, i) => {
      if (!tc.lit) return;
      const fl = tc.fire.userData.flame;
      fl[0].scale.y = 0.6 * (1 + Math.sin(t * 11 + i) * 0.14);
      fl[1].scale.y = 0.4 * (1 + Math.sin(t * 14 + i) * 0.16);
    });
  };

  return {
    name: 'volcano',
    group: g,
    bg: 0x2a1a30,
    fog: { color: 0x3a2236, near: 36, far: 100 },
    light: { hemi: 1.05, hemiColor: 0xffd2b0, hemiGround: 0x7a5a58, sun: 1.1, sunColor: 0xffd8b8 },
    camScale: 1,
    spawn: new THREE.Vector3(0, 0, 9),
    heading: Math.PI,
    clamp: circleClamp(R),
    colliders,
    update,
    torches, tiles, volcano, eruptTop, center: new THREE.Vector3(0, 0, -1),
  };
}
