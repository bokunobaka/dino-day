// Procedural scenery and props shared by the areas and days: prehistoric plants, rocks, volcanoes, eggs, nests,
// gems, party things, camp things... All built from primitives, origin on the ground.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { mat, add, ball, gradient, SPHERE, CYL, CONE, BOX, GOLD } from './models.js';
import { textures } from './fx.js';

const ROCK = new THREE.IcosahedronGeometry(1, 0);
const flat = (c) => mat(c);

export function makeGlow(color, size) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: textures.glow, color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  s.scale.set(size, size, 1);
  return s;
}

// Merges every static mesh under `root` into one mesh per material, so a whole forest costs a few draw calls.
// Only put things in `root` that never move, are never tapped and are plain meshes.
export function bake(root) {
  root.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const buckets = new Map();
  root.traverse((o) => {
    if (!o.isMesh) return;
    const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
    for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal' && k !== 'uv') g.deleteAttribute(k);
    g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld));
    const key = `${o.material.uuid}|${o.castShadow ? 1 : 0}|${o.receiveShadow ? 1 : 0}`;
    if (!buckets.has(key)) buckets.set(key, { material: o.material, cast: o.castShadow, recv: o.receiveShadow, geos: [] });
    buckets.get(key).geos.push(g);
  });
  const out = new THREE.Group();
  out.position.copy(root.position);
  out.rotation.copy(root.rotation);
  out.scale.copy(root.scale);
  for (const b of buckets.values()) {
    const m = new THREE.Mesh(mergeGeometries(b.geos), b.material);
    m.castShadow = b.cast;
    m.receiveShadow = b.recv;
    out.add(m);
  }
  return out;
}

// ------------------------------------------------------------------ plants
export function makeFern(rand = Math.random, s = 1) {
  const root = new THREE.Group();
  const n = 6 + ((rand() * 3) | 0);
  const greens = [0x4cb85a, 0x5cc866, 0x3fa653];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rand() * 0.4;
    const h = new THREE.Group();
    h.rotation.y = a;
    root.add(h);
    const len = (0.9 + rand() * 0.5) * s;
    const leaf = ball(h, greens[i % 3], [0, 0.4 * s, 0.45 * s], [0.17 * s, 0.035 * s, len * 0.55]);
    leaf.rotation.x = -0.55;
    leaf.castShadow = false;
    const tip = ball(h, greens[(i + 1) % 3], [0, 0.22 * s, 0.98 * s], [0.12 * s, 0.03 * s, len * 0.22]);
    tip.rotation.x = 0.2;
    tip.castShadow = false;
  }
  return root;
}

export function makePalm(rand = Math.random, h = 4) {
  const root = new THREE.Group();
  const trunk = new THREE.Group();
  root.add(trunk);
  const lean = (rand() - 0.5) * 0.5;
  const segs = 4;
  let x = 0;
  let y = 0;
  for (let i = 0; i < segs; i++) {
    const m = add(trunk, CYL, i % 2 ? 0x9b6b43 : 0xa87850, [x, y + h / segs / 2, 0], [0.22 - i * 0.025, h / segs * 1.05, 0.22 - i * 0.025]);
    m.rotation.z = -lean * 0.4;
    x += Math.sin(lean * 0.4) * (h / segs);
    y += (h / segs) * 0.97;
  }
  const crown = new THREE.Group();
  crown.position.set(x, y, 0);
  root.add(crown);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const g = new THREE.Group();
    g.rotation.y = a;
    crown.add(g);
    const f = ball(g, i % 2 ? 0x4cb85a : 0x5cc866, [0, 0.0, 0.9], [0.28, 0.04, 1.1]);
    f.rotation.x = 0.35;
    const t = ball(g, 0x4cb85a, [0, -0.45, 1.85], [0.2, 0.035, 0.6]);
    t.rotation.x = 0.9;
  }
  for (let i = 0; i < 3; i++) ball(crown, 0x7a4a22, [Math.cos(i * 2.1) * 0.25, -0.2, Math.sin(i * 2.1) * 0.25], 0.17);
  return root;
}

// a tall prehistoric conifer (monkey-puzzle-ish): trunk and three layers of cones
export function makeConifer(rand = Math.random, h = 6, color = 0x2f9e5b) {
  const root = new THREE.Group();
  add(root, CYL, 0x7a5230, [0, h * 0.2, 0], [0.22, h * 0.4, 0.22]);
  for (let i = 0; i < 3; i++) {
    const w = (1.5 - i * 0.35) * (h / 6);
    add(root, CONE, i % 2 ? color + 0x081008 : color, [0, h * (0.45 + i * 0.2), 0], [w, h * 0.38, w]);
  }
  return root;
}

export function makeBigTree(rand = Math.random, h = 5) {
  const root = new THREE.Group();
  add(root, CYL, 0x9b6b43, [0, h * 0.3, 0], [0.3, h * 0.6, 0.3]);
  const greens = [0x6fd06f, 0x7bd96f, 0x62c46a];
  const g = greens[(rand() * 3) | 0];
  ball(root, g, [0, h * 0.75, 0], [h * 0.3, h * 0.24, h * 0.3]);
  ball(root, g, [h * 0.16, h * 0.62, 0.3], h * 0.17);
  ball(root, g, [-h * 0.14, h * 0.9, -0.2], h * 0.17);
  return root;
}

export function makeBush(berry = 0xff4d6d, rand = Math.random) {
  const root = new THREE.Group();
  const g = 0x4cb85a;
  ball(root, g, [0, 0.45, 0], [0.8, 0.55, 0.8]);
  ball(root, 0x5cc866, [0.5, 0.35, 0.2], 0.45);
  ball(root, 0x3fa653, [-0.45, 0.35, -0.1], 0.45);
  if (berry) for (let i = 0; i < 7; i++) {
    const a = rand() * Math.PI * 2;
    ball(root, berry, [Math.cos(a) * 0.72, 0.4 + rand() * 0.4, Math.sin(a) * 0.72], 0.07).castShadow = false;
  }
  return root;
}

export function makeMushroom(color = 0xff6b6b, s = 1) {
  const root = new THREE.Group();
  add(root, CYL, 0xfff1d6, [0, 0.2 * s, 0], [0.1 * s, 0.4 * s, 0.1 * s]);
  ball(root, color, [0, 0.42 * s, 0], [0.3 * s, 0.2 * s, 0.3 * s]);
  for (const [x, z] of [[0.12, 0.1], [-0.1, 0.14], [0.02, -0.16]]) ball(root, 0xffffff, [x * s, 0.55 * s, z * s], 0.045 * s).castShadow = false;
  return root;
}

export function makeRock(color = 0x9aa3ad, s = 1, rand = Math.random) {
  const root = new THREE.Group();
  const r = add(root, ROCK, flat(color), [0, 0.45 * s, 0], [0.8 * s, 0.6 * s, 0.7 * s]);
  r.rotation.set(rand() * 3, rand() * 3, rand() * 3);
  return root;
}

export function makeBoulder(color = 0x8e98a3, s = 1.6) {
  const root = new THREE.Group();
  add(root, SPHERE, flat(color), [0, s * 0.8, 0], s).scale.set(s, s * 0.9, s);
  const r = add(root, ROCK, flat(color + 0x0a0a0a), [s * 0.5, s * 1.3, 0.2], s * 0.45);
  r.rotation.set(1, 2, 0.5);
  return root;
}

export function makeCrystal(color = 0x6ad7ff, s = 1) {
  const root = new THREE.Group();
  const gm = new THREE.MeshToonMaterial({ color, emissive: color, emissiveIntensity: 0.45, gradientMap: gradient });
  [[0, 0, 0, 1, 0], [0.35, 0, 0.1, 0.65, 0.4], [-0.3, 0, 0.15, 0.55, -0.45]].forEach(([x, y, z, k, lean]) => {
    const c = add(root, new THREE.OctahedronGeometry(0.28), gm, [x * s, 0.5 * k * s, z * s], [0.7 * s, 1.9 * k * s, 0.7 * s]);
    c.rotation.z = lean;
  });
  return root;
}

// ------------------------------------------------------------------ the big picture
export function makeVolcano(h = 14, lava = true) {
  const root = new THREE.Group();
  const r = h * 1.15;
  add(root, new THREE.CylinderGeometry(r * 0.28, r, h, 18, 1), flat(0x7a6a62), [0, h / 2, 0]).castShadow = false;
  add(root, new THREE.CylinderGeometry(r * 0.3, r * 0.34, 0.8, 18), flat(0x4a3d3a), [0, h + 0.1, 0]).castShadow = false;
  const top = new THREE.MeshBasicMaterial({ color: 0xff6a1f });
  add(root, new THREE.CylinderGeometry(r * 0.24, r * 0.24, 0.3, 18), top, [0, h + 0.4, 0]).castShadow = false;
  if (lava) {
    for (let i = 0; i < 4; i++) {
      const a = i * 1.7 + 0.4;
      const st = add(root, BOX, new THREE.MeshBasicMaterial({ color: i % 2 ? 0xff9a2e : 0xff5a1f }), [Math.cos(a) * r * 0.5, h * 0.62, Math.sin(a) * r * 0.5], [0.5, h * 0.55, 0.5]);
      st.castShadow = false;
      st.lookAt(Math.cos(a) * r * 2, 0, Math.sin(a) * r * 2);
      st.rotation.x = 0.55;
      st.scale.set(0.5, h * 0.55, 0.5);
    }
    const gl = makeGlow(0xff7a2e, h * 0.9);
    gl.position.set(0, h + 1, 0);
    root.add(gl);
  }
  return root;
}

export function makeMountains(rand, n, radius, y = -1) {
  const root = new THREE.Group();
  for (let i = 0; i < n; i++) {
    const a = Math.PI + (i / (n - 1)) * Math.PI * 1.0 - 0.0;
    const r = radius + rand() * 8;
    const m = new THREE.Mesh(CONE, flat([0x7aa57a, 0x8dbb8d, 0x6e9a8a][i % 3]));
    const h = 12 + rand() * 14;
    m.scale.set(10 + rand() * 8, h, 10 + rand() * 8);
    m.position.set(Math.cos(a) * r, h / 2 + y, Math.sin(a) * r - 6);
    root.add(m);
  }
  return root;
}

// ------------------------------------------------------------------ eggs, nests, gems
export function makeEgg(main = 0xfff1d6, spot = 0x6fd06f, s = 1) {
  const root = new THREE.Group();
  const e = add(root, SPHERE, main, [0, 0.36 * s, 0], [0.26 * s, 0.34 * s, 0.26 * s]);
  for (const [x, y, z, k] of [[0.14, 0.45, 0.17, 0.07], [-0.12, 0.3, 0.2, 0.06], [0.0, 0.62, 0.1, 0.055], [-0.16, 0.5, -0.1, 0.06], [0.1, 0.25, -0.2, 0.06]]) {
    ball(root, spot, [x * s, y * s, z * s], [k * s, k * s, k * 0.4 * s]).castShadow = false;
  }
  root.userData.shell = e;
  return root;
}

export function makeNest(r = 1.4) {
  const root = new THREE.Group();
  add(root, CYL, 0x7a5230, [0, 0.1, 0], [r * 0.85, 0.2, r * 0.85]);
  add(root, CYL, 0xd9c08a, [0, 0.22, 0], [r * 0.66, 0.06, r * 0.66]).castShadow = false;
  // two rings of twigs lying along the rim
  for (let ring = 0; ring < 2; ring++) {
    const n = 20 + ring * 4;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + ring * 0.2;
      const rr = r * (0.9 - ring * 0.1);
      const t = add(root, CYL, (i + ring) % 2 ? 0x9b6b43 : 0x6e4a2a, [Math.cos(a) * rr, 0.2 + ring * 0.14 + (i % 3) * 0.03, Math.sin(a) * rr], [0.07, r * 0.8, 0.07]);
      t.rotation.order = 'YXZ';
      t.rotation.set(0, -a - Math.PI / 2 + (i % 2 ? 0.25 : -0.25), Math.PI / 2);
    }
  }
  return root;
}

export function makeAmber(color = 0xffb21f) {
  const root = new THREE.Group();
  const gm = new THREE.MeshToonMaterial({ color, emissive: color, emissiveIntensity: 0.55, gradientMap: gradient });
  const a = add(root, new THREE.OctahedronGeometry(0.34), gm, [0, 0.55, 0], [1, 1.35, 1]);
  const b = ball(root, 0xffe9a0, [-0.1, 0.7, 0.2], 0.06);
  b.castShadow = false;
  root.userData.gem = a;
  const gl = makeGlow(0xffd27a, 2.4);
  gl.position.y = 0.55;
  root.add(gl);
  root.userData.glow = gl;
  return root;
}

// a three-toed footprint lying flat
export function makeFootprint(color = 0x6fd06f, size = 1) {
  const root = new THREE.Group();
  const m = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55, depthWrite: false });
  const heel = new THREE.Mesh(SPHERE, m);
  heel.scale.set(0.34 * size, 0.01, 0.42 * size);
  heel.position.set(0, 0.04, -0.2 * size);
  root.add(heel);
  [[-0.28, 0.35, -0.35], [0, 0.5, 0], [0.28, 0.35, 0.35]].forEach(([x, z, r]) => {
    const toe = new THREE.Mesh(SPHERE, m);
    toe.scale.set(0.13 * size, 0.01, 0.28 * size);
    toe.position.set(x * size, 0.04, z * size + 0.1 * size);
    toe.rotation.y = r * 0.6;
    root.add(toe);
  });
  root.userData.mat = m;
  return root;
}

// ------------------------------------------------------------------ food
export function makeLeafBundle() {
  const root = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const l = ball(root, i % 2 ? 0x4cb85a : 0x6fd06f, [(i - 2) * 0.07, 0.3, 0], [0.09, 0.32, 0.03]);
    l.rotation.z = (i - 2) * 0.22;
  }
  add(root, CYL, 0x9b6b43, [0, 0.05, 0], [0.05, 0.1, 0.05]);
  return root;
}

export function makeBerry(color = 0x5b6bff) {
  const root = new THREE.Group();
  for (const [x, y, z] of [[0, 0.1, 0], [0.12, 0.08, 0.06], [-0.1, 0.09, 0.08], [0.02, 0.2, 0.04]]) ball(root, color, [x, y, z], 0.1);
  ball(root, 0x4cb85a, [0, 0.3, 0.04], [0.06, 0.04, 0.1]);
  return root;
}

export function makeFish(color = 0x4ab0ff) {
  const root = new THREE.Group();
  ball(root, color, [0, 0.14, 0], [0.12, 0.13, 0.28]);
  add(root, CONE, color, [0, 0.14, -0.33], [0.1, 0.18, 0.04]).rotation.x = -Math.PI / 2;
  ball(root, 0xffffff, [0.07, 0.18, 0.18], 0.035).castShadow = false;
  return root;
}

export function makeBowl(color = 0xc9a07a) {
  const root = new THREE.Group();
  add(root, new THREE.CylinderGeometry(0.26, 0.16, 0.18, 16), color, [0, 0.09, 0]);
  return root;
}

export function makeStonePot() {
  const root = new THREE.Group();
  add(root, new THREE.CylinderGeometry(0.75, 0.55, 0.8, 18), flat(0x6b6f78), [0, 0.7, 0]);
  add(root, CYL, 0x7a4a22, [0, 1.1, 0], [0.7, 0.04, 0.7]);
  const soup = add(root, CYL, 0xb86bd9, [0, 1.06, 0], [0.64, 0.04, 0.64]);
  soup.castShadow = false;
  root.userData.soup = soup;
  for (const a of [0, 2.1, 4.2]) add(root, CYL, 0x6b6f78, [Math.cos(a) * 0.5, 0.15, Math.sin(a) * 0.5], [0.1, 0.4, 0.1]);
  return root;
}

// ------------------------------------------------------------------ fire and light
export function makeFlame(size = 1) {
  const root = new THREE.Group();
  const f1 = add(root, CONE, new THREE.MeshBasicMaterial({ color: 0xff7a1f }), [0, 0.3 * size, 0], [0.22 * size, 0.6 * size, 0.22 * size]);
  const f2 = add(root, CONE, new THREE.MeshBasicMaterial({ color: 0xffd23f }), [0, 0.22 * size, 0], [0.13 * size, 0.4 * size, 0.13 * size]);
  f1.castShadow = f2.castShadow = false;
  const gl = makeGlow(0xffa94d, 2.8 * size);
  gl.position.y = 0.4 * size;
  root.add(gl);
  root.userData.flame = [f1, f2];
  root.userData.glow = gl;
  return root;
}

export function makeTorch() {
  const root = new THREE.Group();
  add(root, CYL, 0x7a5230, [0, 0.8, 0], [0.07, 1.6, 0.07]);
  add(root, new THREE.CylinderGeometry(0.14, 0.08, 0.2, 10), 0x4a3d3a, [0, 1.65, 0]);
  const f = makeFlame(1);
  f.position.y = 1.7;
  f.visible = false;
  root.add(f);
  root.userData.fire = f;
  return root;
}

export function makeCampfire() {
  const root = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const l = add(root, CYL, i % 2 ? 0x8a5a33 : 0x6e4a2a, [Math.cos(a) * 0.35, 0.14, Math.sin(a) * 0.35], [0.07, 0.8, 0.07]);
    l.rotation.set(0, -a, Math.PI / 2 - 0.5);
    l.rotation.order = 'YXZ';
  }
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ball(root, 0x8e98a3, [Math.cos(a) * 0.85, 0.12, Math.sin(a) * 0.85], [0.2, 0.14, 0.2]);
  }
  const fire = makeFlame(1.5);
  fire.visible = false;
  root.add(fire);
  root.userData.fire = fire;
  return root;
}

// ------------------------------------------------------------------ party
export function makeBalloon(color) {
  const root = new THREE.Group();
  add(root, CYL, 0xffffff, [0, 0.7, 0], [0.012, 1.4, 0.012]).castShadow = false;
  const b = add(root, SPHERE, color, [0, 1.95, 0], [0.5, 0.62, 0.5]);
  add(root, CONE, color, [0, 1.3, 0], [0.09, 0.12, 0.09]).rotation.x = Math.PI;
  add(root, SPHERE, 0xffffff, [-0.17, 2.15, 0.28], [0.08, 0.14, 0.04]).castShadow = false;
  root.userData.body = b;
  return root;
}

export function makePresent(color = 0xff5fae, ribbon = 0xffe066) {
  const root = new THREE.Group();
  add(root, BOX, color, [0, 0.25, 0], [0.5, 0.5, 0.5]);
  add(root, BOX, ribbon, [0, 0.25, 0], [0.54, 0.1, 0.54]);
  add(root, BOX, ribbon, [0, 0.25, 0], [0.1, 0.54, 0.54]);
  ball(root, ribbon, [-0.1, 0.58, 0], [0.12, 0.08, 0.07]);
  ball(root, ribbon, [0.1, 0.58, 0], [0.12, 0.08, 0.07]);
  return root;
}

export function makeCake() {
  const root = new THREE.Group();
  add(root, CYL, 0xffe0f0, [0, 0.22, 0], [0.8, 0.44, 0.8]);
  add(root, CYL, 0xff8fc7, [0, 0.5, 0], [0.82, 0.1, 0.82]);
  add(root, CYL, 0xfff1d6, [0, 0.78, 0], [0.55, 0.36, 0.55]);
  add(root, CYL, 0x7be37a, [0, 0.98, 0], [0.57, 0.08, 0.57]);
  const flames = [];
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    const x = Math.cos(a) * 0.3;
    const z = Math.sin(a) * 0.3;
    add(root, CYL, [0xff5fae, 0x6ad7ff, 0xffe35a, 0xb48cff][i], [x, 1.14, z], [0.035, 0.22, 0.035]);
    const f = makeFlame(0.45);
    f.position.set(x, 1.22, z);
    f.visible = false;
    root.add(f);
    flames.push(f);
  }
  root.userData.flames = flames;
  return root;
}

export function makeBanner(colors = [0xff5fae, 0xffd23f, 0x6ad7ff, 0x7be37a], n = 8, width = 8) {
  const root = new THREE.Group();
  add(root, CYL, 0xc9a07a, [0, 0, 0], [0.025, width, 0.025]).rotation.z = Math.PI / 2;
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1) - 0.5) * (width - 0.6);
    const f = add(root, CONE, colors[i % colors.length], [x, -0.22, 0], [0.22, 0.5, 0.03]);
    f.rotation.z = Math.PI;
    f.castShadow = false;
  }
  return root;
}

export function makeConfettiPile() {
  return makePresent();
}

// ------------------------------------------------------------------ bones and fossils
export function makeBone(color = 0xfff3d6, len = 0.8) {
  const root = new THREE.Group();
  add(root, CYL, color, [0, 0.12, 0], [0.06, len, 0.06]).rotation.z = Math.PI / 2;
  for (const s of [-1, 1]) for (const z of [-0.06, 0.06]) ball(root, color, [s * len / 2, 0.12, z], 0.075);
  return root;
}

export function makeSkull(color = 0xfff3d6) {
  const root = new THREE.Group();
  ball(root, color, [0, 0.55, 0], [0.5, 0.42, 0.55]);
  ball(root, color, [0, 0.4, 0.55], [0.3, 0.22, 0.42]);
  for (const s of [-1, 1]) {
    ball(root, 0x3a2f33, [s * 0.23, 0.62, 0.3], [0.13, 0.15, 0.09]);
    for (let i = 0; i < 4; i++) add(root, CONE, 0xffffff, [s * (0.08 + i * 0.07), 0.25, 0.78 - i * 0.03], [0.035, 0.1, 0.035]).rotation.z = Math.PI;
  }
  return root;
}

export function makeRibs(color = 0xfff3d6) {
  const root = new THREE.Group();
  add(root, CYL, color, [0, 0.9, 0], [0.06, 1.6, 0.06]).rotation.x = Math.PI / 2;
  for (let i = 0; i < 6; i++) {
    for (const s of [-1, 1]) {
      const r = add(root, new THREE.TorusGeometry(0.42 - Math.abs(i - 2.5) * 0.05, 0.035, 6, 14, Math.PI * 0.8), color, [0, 0.9, -0.7 + i * 0.28]);
      r.rotation.set(0, 0, s > 0 ? -0.2 : Math.PI + 0.2);
    }
  }
  return root;
}

// ------------------------------------------------------------------ sea
export function makeShell(color = 0xffb3d9) {
  const root = new THREE.Group();
  const bottom = add(root, SPHERE, color, [0, 0.16, 0], [0.5, 0.2, 0.42]);
  const lid = new THREE.Group();
  lid.position.set(0, 0.22, -0.35);
  root.add(lid);
  const top = add(lid, SPHERE, color + 0x101010, [0, 0.05, 0.35], [0.5, 0.2, 0.42]);
  root.userData.lid = lid;
  root.userData.top = top;
  const pearl = ball(root, 0xffffff, [0, 0.22, 0.02], 0.12);
  pearl.visible = false;
  root.userData.pearl = pearl;
  return root;
}

export function makeAmmonite(color = 0xd9a06a) {
  const root = new THREE.Group();
  for (let i = 0; i < 12; i++) {
    const a = i * 0.55;
    const r = 0.06 + i * 0.027;
    const x = Math.cos(a) * (0.05 + i * 0.03);
    const y = Math.sin(a) * (0.05 + i * 0.03);
    ball(root, i % 2 ? color : color + 0x1a1008, [x, y, 0], r);
  }
  root.position.y = 0;
  return root;
}

export function makeCoral(color = 0xff7aa8, rand = Math.random) {
  const root = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const h = 0.5 + rand() * 0.7;
    const a = (i / 5) * Math.PI * 2;
    const c = add(root, CYL, color, [Math.cos(a) * 0.2, h / 2, Math.sin(a) * 0.2], [0.07, h, 0.07]);
    c.rotation.set(Math.sin(a) * 0.3, 0, -Math.cos(a) * 0.3);
    ball(root, color + 0x101010, [Math.cos(a) * (0.2 + h * 0.15), h, Math.sin(a) * (0.2 + h * 0.15)], 0.1);
  }
  return root;
}

export function makeSeaweed(rand = Math.random, h = 1.8) {
  const root = new THREE.Group();
  const segs = [];
  let p = root;
  for (let i = 0; i < 5; i++) {
    const g = new THREE.Group();
    g.position.y = i === 0 ? 0 : h / 5;
    p.add(g);
    ball(g, 0x2fb36d, [0, h / 10, 0], [0.12 - i * 0.012, h / 8, 0.05]);
    segs.push(g);
    p = g;
  }
  root.userData.segs = segs;
  return root;
}

export function makeChest() {
  const root = new THREE.Group();
  add(root, BOX, 0x9b5de5, [0, 0.45, 0], [1.6, 0.9, 1.0]);
  const lidPivot = new THREE.Group();
  lidPivot.position.set(0, 0.9, -0.5);
  root.add(lidPivot);
  const lid = add(lidPivot, new THREE.CylinderGeometry(0.5, 0.5, 1.6, 16, 1, false, 0, Math.PI), 0xb983ff, [0, 0, 0.5]);
  lid.rotation.set(0, 0, Math.PI / 2);
  lid.rotation.order = 'XYZ';
  lid.rotation.y = Math.PI / 2;
  add(lidPivot, BOX, GOLD, [0, 0, 1.02], [0.22, 0.28, 0.06]);
  add(root, BOX, GOLD, [-0.55, 0.45, 0.51], [0.1, 0.92, 0.04]);
  add(root, BOX, GOLD, [0.55, 0.45, 0.51], [0.1, 0.92, 0.04]);
  root.userData.lid = lidPivot;
  return root;
}

// ------------------------------------------------------------------ camp + circus + band
export function makeTent(color = 0xff9a4d, stripe = 0xffffff) {
  const root = new THREE.Group();
  const body = add(root, new THREE.ConeGeometry(1, 1, 4), color, [0, 1.1, 0], [2.3, 2.2, 1.7]);
  body.rotation.y = Math.PI / 4;
  add(root, BOX, 0x2b2236, [0, 0.6, 0.95], [0.8, 1.2, 0.05]);
  add(root, SPHERE, stripe, [0, 2.3, 0], 0.12);
  return root;
}

export function makeLog() {
  const root = new THREE.Group();
  const l = add(root, CYL, 0x8a5a33, [0, 0.12, 0], [0.12, 0.9, 0.12]);
  l.rotation.z = Math.PI / 2;
  add(root, CYL, 0xc99a6b, [0.44, 0.12, 0], [0.12, 0.02, 0.12]).rotation.z = Math.PI / 2;
  return root;
}

export function makeBall(color) {
  const root = new THREE.Group();
  add(root, SPHERE, color, [0, 0.3, 0], 0.3);
  add(root, SPHERE, 0xffffff, [-0.1, 0.42, 0.22], [0.06, 0.08, 0.03]).castShadow = false;
  return root;
}

export function makeDrum(color = 0xe84545) {
  const root = new THREE.Group();
  add(root, CYL, color, [0, 0.4, 0], [0.5, 0.8, 0.5]);
  add(root, CYL, 0xfff1d6, [0, 0.82, 0], [0.5, 0.04, 0.5]);
  add(root, CYL, 0x7a5230, [0, 0.78, 0], [0.52, 0.04, 0.52]);
  root.userData.top = root.children[1];
  return root;
}

export function makeSnowflake() {
  const root = new THREE.Group();
  const m = add(root, new THREE.OctahedronGeometry(0.35), new THREE.MeshBasicMaterial({ color: 0xeaf7ff }), [0, 0, 0]);
  m.scale.set(1, 1.4, 0.45);
  const m2 = add(root, new THREE.OctahedronGeometry(0.35), new THREE.MeshBasicMaterial({ color: 0xbfe3ff }), [0, 0, 0]);
  m2.scale.set(1.4, 1, 0.45);
  root.add(makeGlow(0xcfeaff, 2.4));
  return root;
}

export function makeSnowTree(rand = Math.random, h = 5) {
  const root = new THREE.Group();
  add(root, CYL, 0x7a5230, [0, h * 0.15, 0], [0.2, h * 0.3, 0.2]);
  for (let i = 0; i < 3; i++) {
    const w = (1.4 - i * 0.35) * (h / 5);
    add(root, CONE, 0x2f8f6a, [0, h * (0.35 + i * 0.2), 0], [w, h * 0.34, w]);
    add(root, CONE, 0xffffff, [0, h * (0.43 + i * 0.2), 0], [w * 0.78, h * 0.22, w * 0.78]);
  }
  return root;
}

export function makeSnowPile(s = 1) {
  const root = new THREE.Group();
  ball(root, 0xffffff, [0, 0.3 * s, 0], [0.8 * s, 0.35 * s, 0.7 * s]);
  ball(root, 0xf0f8ff, [0.5 * s, 0.2 * s, 0.2 * s], 0.3 * s);
  return root;
}

export function makeBridgeLog(len = 6) {
  const root = new THREE.Group();
  const l = add(root, CYL, 0x8a5a33, [0, 0.35, 0], [0.55, len, 0.55]);
  l.rotation.z = Math.PI / 2;
  add(root, CYL, 0xc99a6b, [len / 2, 0.35, 0], [0.55, 0.02, 0.55]).rotation.z = Math.PI / 2;
  add(root, CYL, 0xc99a6b, [-len / 2, 0.35, 0], [0.55, 0.02, 0.55]).rotation.z = Math.PI / 2;
  return root;
}

export function makeHoop() {
  const root = new THREE.Group();
  const ring = add(root, new THREE.TorusGeometry(1.4, 0.12, 10, 28), 0xff7a1f, [0, 2.4, 0]);
  add(root, CYL, 0x7a5230, [0, 0.7, 0], [0.08, 1.4, 0.08]);
  const fl = makeFlame(1.4);
  fl.position.set(0, 3.8, 0);
  fl.visible = false;
  root.add(fl);
  root.userData.fire = fl;
  root.userData.ring = ring;
  return root;
}

export function makeThrone() {
  const root = new THREE.Group();
  add(root, BOX, 0x8e98a3, [0, 0.4, 0], [1.2, 0.8, 1.0]);
  add(root, BOX, 0x8e98a3, [0, 1.3, -0.4], [1.2, 1.8, 0.25]);
  return root;
}

export function makeStage(w = 7, d = 4) {
  const root = new THREE.Group();
  add(root, BOX, 0xc9a07a, [0, 0.3, 0], [w, 0.6, d]);
  add(root, BOX, 0xe84545, [0, 0.62, 0], [w - 0.4, 0.05, d - 0.4]);
  for (const s of [-1, 1]) add(root, CYL, 0x7a5230, [s * (w / 2 + 0.2), 2.2, -d / 2], [0.14, 4.4, 0.14]);
  const curtain = add(root, BOX, 0xff5f8a, [0, 4.2, -d / 2], [w + 0.5, 0.6, 0.15]);
  return root;
}

// ------------------------------------------------------------------ water play
export function makeDuck() {
  const root = new THREE.Group();
  add(root, SPHERE, 0xffe14d, [0, 0.35, 0], [0.45, 0.35, 0.55]);
  add(root, SPHERE, 0xffe14d, [0, 0.8, 0.3], 0.28);
  add(root, CONE, 0xff8a1f, [0, 0.76, 0.58], [0.1, 0.2, 0.1]).rotation.x = Math.PI / 2;
  add(root, SPHERE, PUPIL_COL, [-0.1, 0.88, 0.5], 0.035);
  add(root, SPHERE, PUPIL_COL, [0.1, 0.88, 0.5], 0.035);
  add(root, SPHERE, 0xffd21f, [0.3, 0.45, -0.1], [0.12, 0.2, 0.3]);
  add(root, SPHERE, 0xffd21f, [-0.3, 0.45, -0.1], [0.12, 0.2, 0.3]);
  return root;
}
const PUPIL_COL = 0x2b2236;

export function makeSwimRing() {
  const root = new THREE.Group();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const seg = add(root, new THREE.TorusGeometry(0.5, 0.17, 10, 8, Math.PI / 4), i % 2 ? 0xffffff : 0xff4d6d, [0, 0.25, 0]);
    seg.rotation.set(Math.PI / 2, 0, a);
  }
  return root;
}

export function makeBeachBall() {
  const root = new THREE.Group();
  const colors = [0xff4d6d, 0xffe14d, 0x4dc9ff, 0xffffff, 0x7be37a, 0xb48cff];
  for (let i = 0; i < 6; i++) {
    const g = new THREE.SphereGeometry(0.5, 12, 10, (i / 6) * Math.PI * 2, Math.PI / 3);
    add(root, g, new THREE.MeshToonMaterial({ color: colors[i], side: THREE.DoubleSide, gradientMap: gradient }), [0, 0.5, 0]);
  }
  return root;
}

export function makeCoconut() {
  const root = new THREE.Group();
  ball(root, 0x7a4a22, [0, 0.22, 0], 0.24);
  ball(root, 0xe8c9a0, [0, 0.4, 0], [0.15, 0.04, 0.15]);
  add(root, CYL, 0xff5fae, [0.05, 0.6, 0], [0.02, 0.4, 0.02]).rotation.z = -0.25;
  return root;
}

export function makeWatermelon() {
  const root = new THREE.Group();
  const g = new THREE.SphereGeometry(0.34, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2);
  const rind = add(root, g, new THREE.MeshToonMaterial({ color: 0x3fa653, side: THREE.DoubleSide, gradientMap: gradient }), [0, 0.1, 0]);
  rind.rotation.x = Math.PI;
  rind.position.y = 0.36;
  add(root, CYL, 0xff5a6e, [0, 0.36, 0], [0.33, 0.02, 0.33]);
  for (let i = 0; i < 5; i++) ball(root, 0x2b2236, [Math.cos(i * 1.3) * 0.14, 0.38, Math.sin(i * 1.3) * 0.14], 0.025).castShadow = false;
  return root;
}

export function makeJuice() {
  const root = new THREE.Group();
  add(root, new THREE.CylinderGeometry(0.15, 0.11, 0.38, 14), new THREE.MeshToonMaterial({ color: 0xff9a2e, transparent: true, opacity: 0.85, gradientMap: gradient }), [0, 0.2, 0]);
  add(root, CYL, 0x6ad7ff, [0.05, 0.5, 0], [0.02, 0.4, 0.02]).rotation.z = -0.3;
  ball(root, 0xffe066, [0.1, 0.4, 0.14], 0.07);
  return root;
}

// ------------------------------------------------------------------ snow dino bits
export function makeSnowDino() {
  const root = new THREE.Group();
  const S = 0xffffff;
  const parts = {};
  parts.body = new THREE.Group();
  ball(parts.body, S, [0, 1.15, 0], [1.25, 1.0, 1.7]);
  for (let i = 0; i < 5; i++) add(parts.body, CONE, 0xcfeaff, [0, 2.15 - Math.abs(i - 2) * 0.12, 0.9 - i * 0.45], [0.2, 0.5, 0.2]);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) ball(parts.body, S, [sx * 0.7, 0.3, sz * 0.8], [0.32, 0.4, 0.32]);
  parts.head = new THREE.Group();
  ball(parts.head, S, [0, 2.2, 1.6], 0.82);
  ball(parts.head, S, [0, 2.0, 2.3], [0.5, 0.4, 0.5]);
  parts.tail = new THREE.Group();
  [[0, 0.95, -1.8, 0.7], [0, 0.8, -2.5, 0.5], [0, 0.65, -3.1, 0.3]].forEach(([x, y, z, r]) => ball(parts.tail, S, [x, y, z], r));
  parts.scarf = new THREE.Group();
  const sc = add(parts.scarf, new THREE.TorusGeometry(0.75, 0.16, 8, 20), 0xff4d6d, [0, 1.75, 1.35]);
  sc.rotation.x = Math.PI / 2 - 0.5;
  add(parts.scarf, BOX, 0xff4d6d, [0.5, 1.2, 1.7], [0.28, 0.9, 0.08]);
  parts.hat = new THREE.Group();
  add(parts.hat, CYL, 0x3b6bff, [0, 2.95, 1.55], [0.55, 0.12, 0.55]);
  add(parts.hat, CYL, 0x3b6bff, [0, 3.3, 1.55], [0.4, 0.6, 0.4]);
  ball(parts.hat, 0xffe35a, [0, 3.65, 1.55], 0.12);
  parts.eyes = new THREE.Group();
  for (const sx of [-1, 1]) {
    ball(parts.eyes, 0xffffff, [sx * 0.42, 2.45, 2.0], 0.18);
    ball(parts.eyes, 0x2b2236, [sx * 0.43, 2.45, 2.15], 0.1);
  }
  ball(parts.eyes, 0x2b2236, [0, 2.0, 2.74], [0.1, 0.07, 0.05]);
  for (const k of Object.keys(parts)) {
    parts[k].visible = false;
    root.add(parts[k]);
  }
  root.userData.parts = parts;
  return root;
}

export function makeHorn() {
  const root = new THREE.Group();
  const bell = add(root, CONE, 0xffd23f, [0.3, 0.2, 0], [0.26, 0.5, 0.26]);
  bell.rotation.z = -Math.PI / 2;
  add(root, CYL, 0xffd23f, [-0.15, 0.2, 0], [0.06, 0.6, 0.06]).rotation.z = Math.PI / 2;
  add(root, new THREE.TorusGeometry(0.16, 0.05, 8, 14), 0xffd23f, [-0.45, 0.2, 0]).rotation.y = Math.PI / 2;
  return root;
}

export function makeMaraca() {
  const root = new THREE.Group();
  add(root, SPHERE, 0xff5fae, [0, 0.55, 0], [0.22, 0.28, 0.22]);
  add(root, CYL, 0xc9a07a, [0, 0.2, 0], [0.05, 0.5, 0.05]);
  ball(root, 0xffe066, [0.1, 0.65, 0.16], 0.04).castShadow = false;
  ball(root, 0x6ad7ff, [-0.1, 0.5, 0.18], 0.04).castShadow = false;
  return root;
}

export function makeFenceSection(len = 2.2) {
  const root = new THREE.Group();
  for (const x of [-len / 2, len / 2]) add(root, CYL, 0x8a5a33, [x, 0.55, 0], [0.09, 1.1, 0.09]);
  for (const y of [0.4, 0.8]) add(root, CYL, 0xa87850, [0, y, 0], [0.05, len, 0.05]).rotation.z = Math.PI / 2;
  return root;
}
