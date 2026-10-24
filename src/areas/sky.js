// Mini-game: a flight over the valley on a pterodactyl. Amber gems and hearts in the air, volcanoes and clouds drifting by.
import * as THREE from 'three';
import { mat, add, ball, makeCloud, CYL, CONE, SPHERE } from '../models.js';
import { Dino } from '../dinos.js';
import { makeGlow, makeVolcano, makePalm, makeConifer, makeRock, bake } from '../scenery.js';
import { rng } from './util.js';

export const LENGTH = 230;
export const FLY_Y = 7;
export const pathX = (z) => 5 * Math.sin(z * 0.045) + 2.5 * Math.sin(z * 0.11);

export function buildSky(game) {
  const g = new THREE.Group();
  const rand = rng(181);

  // the valley far below
  const floor = new THREE.Mesh(new THREE.CircleGeometry(200, 48), mat(0x8fdc6a));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, -LENGTH / 2);
  floor.receiveShadow = true;
  g.add(floor);
  // a winding river
  const riverM = mat(0x4fc7e8);
  for (let i = 0; i < 90; i++) {
    const z = 20 - i * 3;
    const s = add(g, SPHERE, riverM, [pathX(z * 0.8 + 40) * 2.4 + 14, 0.05, z], [3.2, 0.03, 2.2]);
    s.castShadow = false;
  }

  // forests, hills and volcanoes along the way
  const decor = new THREE.Group();
  for (let i = 0; i < 160; i++) {
    const z = 20 - rand() * (LENGTH + 60);
    const side = rand() < 0.5 ? -1 : 1;
    const x = pathX(z) + side * (7 + rand() * 40);
    const k = rand();
    if (k < 0.45) {
      const t = makePalm(rand, 3.5 + rand() * 2);
      t.position.set(x, 0, z);
      decor.add(t);
    } else if (k < 0.8) {
      const t = makeConifer(rand, 5 + rand() * 4);
      t.position.set(x, 0, z);
      decor.add(t);
    } else {
      const h = new THREE.Mesh(SPHERE, mat([0x7ed36a, 0x6fc760, 0x8fdc86][i % 3]));
      h.scale.set(6 + rand() * 6, 3 + rand() * 4, 6 + rand() * 6);
      h.position.set(x, 0, z);
      decor.add(h);
    }
  }
  g.add(bake(decor));
  for (let i = 0; i < 5; i++) {
    const z = -20 - i * 48;
    const v = makeVolcano(16 + rand() * 6);
    v.position.set(pathX(z) + (i % 2 ? 30 : -30) + (rand() - 0.5) * 10, 0, z);
    g.add(v);
  }

  // fluffy clouds all around, low and high
  for (let i = 0; i < 70; i++) {
    const c = makeCloud();
    const z = 10 - rand() * (LENGTH + 40);
    const side = rand() < 0.5 ? -1 : 1;
    c.position.set(pathX(z) + side * (9 + rand() * 24), 2 + rand() * 18, z);
    c.scale.setScalar(1.4 + rand() * 1.8);
    g.add(c);
  }

  // other pterodactyls gliding along
  const mates = [];
  for (let i = 0; i < 4; i++) {
    const d = new Dino('ptero', 3.2, i % 2 ? { main: 0xff9a4d, accent: 0xffd23f } : { main: 0x6ad7ff, accent: 0xff7aa8 });
    const z = -30 - i * 55;
    d.root.position.set(pathX(z) + (i % 2 ? 11 : -11), FLY_Y + 3 + (i % 2) * 2, z);
    d.root.rotation.y = Math.PI;
    g.add(d.root);
    mates.push(d);
  }

  // amber gems and hearts to gather
  const stars = [];
  for (let i = 0; i < 34; i++) {
    const z = -10 - i * 6.4;
    const off = (rand() - 0.5) * 5.2;
    const heart = i % 7 === 6;
    const m = new THREE.Group();
    const body = add(m, new THREE.OctahedronGeometry(0.5), new THREE.MeshBasicMaterial({ color: heart ? 0xff5fae : 0xffb21f }), [0, 0, 0]);
    body.scale.set(1, 1.25, 0.7);
    m.add(makeGlow(heart ? 0xff9ac7 : 0xffd27a, 2.8));
    m.position.set(pathX(z) + off, FLY_Y + 1.0 + Math.sin(i) * 0.9, z);
    g.add(m);
    stars.push({ group: m, taken: false, heart });
  }

  // the finish: a big golden ring
  const arch = new THREE.Group();
  const ring = add(arch, new THREE.TorusGeometry(5, 0.55, 12, 36), 0xffd23f, [0, FLY_Y + 1, 0]);
  const ringGlow = makeGlow(0xfff1a8, 18);
  ringGlow.position.set(0, FLY_Y + 1, 0);
  arch.add(ringGlow);
  arch.position.set(pathX(-LENGTH + 5), 0, -LENGTH + 5);
  g.add(arch);

  // the pterodactyl that carries the little dino
  const ptero = new Dino('ptero', 4.4);
  g.add(ptero.root);

  const update = (dt, t) => {
    mates.forEach((d, i) => d.update(dt));
    ring.rotation.z = t * 0.4;
  };

  return {
    name: 'sky',
    group: g,
    bg: 0xcfeaff,
    fog: { color: 0xe3f3ff, near: 40, far: 130 },
    light: { hemi: 1.1, sun: 1.6 },
    camScale: 1.25,
    spawn: new THREE.Vector3(pathX(8), FLY_Y, 8),
    heading: Math.PI,
    clamp: () => {},
    colliders: [],
    update,
    stars, ptero, finishZ: -LENGTH + 5,
  };
}
