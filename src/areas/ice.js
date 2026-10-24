// Day 16: the frozen lake. Gliding is slippery! Snowflakes to gather, a big star to spin on, friends to skate with.
import * as THREE from 'three';
import { mat, add, ball, CYL, CONE, SPHERE } from '../models.js';
import { Dino } from '../dinos.js';
import { makeSnowTree, makeSnowflake, makeRock, makeGlow, makeMountains, bake } from '../scenery.js';
import { Particles, textures } from '../fx.js';
import { rng, place, ground, circleClamp, scatter } from './util.js';

const R = 14.5;
export const ICE_R = 10;

export function buildIce(game) {
  const g = new THREE.Group();
  const rand = rng(171);

  ground(g, 0xdbe7f6, 0xf2f8ff, R + 2);

  // the ice
  const ice = new THREE.Mesh(
    new THREE.CircleGeometry(ICE_R, 56),
    new THREE.MeshToonMaterial({ color: 0xbfe6ff, emissive: 0x4a90c8, emissiveIntensity: 0.25, gradientMap: mat(0).gradientMap })
  );
  ice.rotation.x = -Math.PI / 2;
  ice.position.y = 0.03;
  ice.receiveShadow = true;
  g.add(ice);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(ICE_R + 0.15, 0.22, 8, 64), mat(0x8fc8f0));
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.1;
  g.add(rim);
  for (let i = 0; i < 5; i++) {
    const m = new THREE.Mesh(new THREE.TorusGeometry(2 + i * 1.6, 0.025, 4, 48), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 }));
    m.rotation.x = Math.PI / 2;
    m.position.set(0.4 * (i - 2), 0.05, 0.3 * (2 - i));
    g.add(m);
  }

  const decor = new THREE.Group();
  scatter(rand, 36, R + 1.5, R + 20, (x, z) => place(decor, makeSnowTree(rand, 5 + rand() * 4), x, z, { rot: rand() * 6 }), (x, z) => z > 4);
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    place(decor, makeRock(0xaab6c8, 0.7 + rand() * 0.6, rand), Math.cos(a) * (R + 0.4), Math.sin(a) * (R + 0.4));
  }
  g.add(bake(decor));
  const mtn = makeMountains(rand, 9, 55);
  mtn.children.forEach((m) => (m.material = mat(0xeaf3ff)));
  g.add(mtn);

  // snowflakes to gather
  const flakeSpots = [[-5, 3], [5.5, 2], [-2, -5.5], [3.5, -6.5], [0, 5.5]];
  const flakes = flakeSpots.map(([x, z]) => {
    const f = makeSnowflake();
    f.scale.setScalar(1.5);
    place(g, f, x, z, { y: 0.9 });
    return { group: f, pos: new THREE.Vector3(x, 0, z), taken: false };
  });

  // the big star in the middle, to spin on
  const star = new THREE.Group();
  const disc = new THREE.Mesh(new THREE.CircleGeometry(1.6, 28), new THREE.MeshBasicMaterial({ color: 0xfff1a8, transparent: true, opacity: 0.55, depthWrite: false }));
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = 0.07;
  star.add(disc);
  const sg = makeGlow(0xfff1a8, 6);
  sg.position.y = 0.6;
  star.add(sg);
  place(g, star, 0, -0.5);
  const starPos = new THREE.Vector3(0, 0, -0.5);
  star.visible = false;

  // skating friends
  const friends = [['raptor', 1.8, -9, -3, { main: 0x5aa9f5, belly: 0xdbefff, accent: 0xffffff }], ['tri', 1.7, 0, -9.4, { main: 0xbfe3ff, belly: 0xffffff, accent: 0x5aa9f5 }], ['steg', 1.8, 9, -3, { main: 0xff8fc7, belly: 0xffe3f1, accent: 0xffffff }]].map(([sp, h, x, z, look]) => {
    const c = new Dino(sp, h, look);
    c.root.position.set(x, 0.04, z);
    c.heading = Math.atan2(-x, -z);
    c.root.rotation.y = c.heading;
    g.add(c.root);
    game.addCritter(c);
    return c;
  });

  const snow = new Particles(g, textures.snow, { max: 420, size: 0.26, additive: false });
  let acc = 0;
  const update = (dt, t) => {
    snow.update(dt);
    acc += dt * 45;
    const p = game.player.position;
    while (acc >= 1) {
      acc -= 1;
      snow.emit(p.x + (Math.random() - 0.5) * 34, 14, p.z + (Math.random() - 0.5) * 28, 1, { speed: 0.5, up: -1.8, life: 8, spread: 0.1 });
    }
    flakes.forEach((f, i) => {
      if (f.taken) return;
      f.group.position.y = 0.9 + Math.sin(t * 2 + i) * 0.15;
      f.group.rotation.y = t * 1.5;
    });
    star.rotation.y = t * 0.5;
    disc.material.opacity = 0.45 + Math.sin(t * 3) * 0.15;
  };

  return {
    name: 'ice',
    group: g,
    bg: 0xcfe8ff,
    fog: { color: 0xdcefff, near: 30, far: 85 },
    light: { hemi: 1.0, hemiColor: 0xeaf3ff, hemiGround: 0xc8d8f0, sun: 1.25, sunColor: 0xfff6e0 },
    camScale: 1,
    spawn: new THREE.Vector3(0, 0, 11),
    heading: Math.PI,
    clamp: circleClamp(R),
    colliders: [],
    update,
    slippery: true,
    iceRadius: ICE_R,
    flakes, star, starPos, friends,
  };
}
