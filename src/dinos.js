// Procedural dinosaurs. Every species is built from a few primitives into a small "rig" (body, head, neck and tail
// segments, legs, wings...) that one shared animator moves. `Dino` is the walking/dancing friend used in every day;
// `makeDinoKid` is the player (dress-up colours + hats).
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { mat, add, ball, gradient, SPHERE, CYL, CONE, BOX, GOLD } from './models.js';

const Z = new THREE.Vector3(0, 0, 1);
const PUPIL = 0x2b2236;
const CHEEK = 0xff9aa8;
const CREAM = 0xfff6dd;

// ------------------------------------------------------------------ building blocks
// A bendable run of ellipsoids (neck, tail). Each segment is a pivot nested in the previous one.
function chain(parent, { n, step, r0, r1, color, pos = [0, 0, 0], rot = [0, 0, 0], deco }) {
  const segs = [];
  const dir = new THREE.Vector3(...step);
  const len = dir.length();
  dir.normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(Z, dir);
  let p = parent;
  for (let i = 0; i < n; i++) {
    const g = new THREE.Group();
    if (i === 0) {
      g.position.set(...pos);
      g.rotation.set(...rot);
    } else g.position.set(...step);
    p.add(g);
    const r = r0 + ((r1 - r0) * i) / Math.max(1, n - 1);
    const m = ball(g, color, [step[0] / 2, step[1] / 2, step[2] / 2], [r, r, len * 0.64]);
    m.quaternion.copy(q);
    if (deco) deco(g, i, r);
    segs.push(g);
    p = g;
  }
  return segs;
}

function leg(parent, { x, y, z, len, r, color, foot = color, footLen = 0.3, claws = 0 }) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  parent.add(g);
  add(g, new THREE.CylinderGeometry(1, 0.8, 1, 14), color, [0, -len / 2, 0], [r, len, r]);
  ball(g, foot, [0, -len + r * 0.35, footLen * 0.35], [r * 1.2, r * 0.7, footLen]);
  for (let i = 0; i < claws; i++) ball(g, CREAM, [(i - (claws - 1) / 2) * r * 0.7, -len + r * 0.3, footLen * 0.35 + footLen * 0.9], r * 0.22);
  return g;
}

function eyes(head, x, y, z, r) {
  const grp = new THREE.Group();
  head.add(grp);
  for (const s of [-1, 1]) {
    ball(grp, 0xffffff, [s * x, y, z], r);
    ball(grp, PUPIL, [s * x * 0.97, y, z + r * 0.52], r * 0.64);
    ball(grp, 0xffffff, [s * x + r * 0.22, y + r * 0.28, z + r * 0.92], r * 0.2).castShadow = false;
  }
  return grp;
}

function cheeks(head, x, y, z, r) {
  for (const s of [-1, 1]) ball(head, CHEEK, [s * x, y, z], [r, r * 0.6, r * 0.4]).castShadow = false;
}

function smile(head, y, z, w = 0.1) {
  const m = add(head, new THREE.TorusGeometry(w, w * 0.14, 6, 14, Math.PI), 0xc2455d, [0, y, z]);
  m.rotation.z = Math.PI;
  m.castShadow = false;
  return m;
}

// dark open mouth that grows when the dino roars
function mouth(head, pos, size) {
  const m = ball(head, 0x8c2640, pos, size);
  m.scale.setScalar(0.001);
  m.castShadow = false;
  m.userData.size = size;
  m.userData.keep = true;
  return m;
}

const spike = (p, color, pos, s, rot = [0, 0, 0]) => {
  const c = add(p, CONE, color, pos, s);
  c.rotation.set(...rot);
  return c;
};

// Fewer draw calls: inside every group, merge the plain meshes that share a material into one. Meshes marked
// `userData.keep` (the roar mouths) stay separate because the animator scales them.
export function mergeGroup(group) {
  const buckets = new Map();
  for (const o of group.children.slice()) {
    if (!o.isMesh || o.userData.keep) continue;
    o.updateMatrix();
    const g = (o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone()).applyMatrix4(o.matrix);
    for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal' && k !== 'uv') g.deleteAttribute(k);
    const key = `${o.material.uuid}|${o.castShadow ? 1 : 0}`;
    if (!buckets.has(key)) buckets.set(key, { material: o.material, cast: o.castShadow, geos: [] });
    buckets.get(key).geos.push(g);
    group.remove(o);
  }
  for (const b of buckets.values()) {
    const m = new THREE.Mesh(mergeGeometries(b.geos), b.material);
    m.castShadow = b.cast;
    group.add(m);
  }
}

export function mergeRig(root) {
  const groups = [];
  root.traverse((o) => (o === root || o.isGroup) && groups.push(o));
  groups.forEach(mergeGroup);
}

// ------------------------------------------------------------------ the rig
function newRig(root) {
  const body = new THREE.Group();
  root.add(body);
  return { root, body, head: null, headBase: 0, neck: [], tail: [], legs: [], arms: [], wings: [], flippers: [], mouths: [], eyes: null, k: 1, phase: 0, pieces: {} };
}

// each builder returns a rig facing +z; P = { main, belly, accent, baby, kid }
const BUILD = {
  rex(P) {
    const kid = !!P.kid;
    const root = new THREE.Group();
    const r = newRig(root);
    const b = r.body;
    const hip = kid ? 0.62 : 0.8;
    const legLen = kid ? 0.62 : 0.8;
    for (const [i, s] of [-1, 1].entries()) r.legs.push({ g: leg(b, { x: s * 0.28, y: hip, z: 0.05, len: legLen, r: kid ? 0.19 : 0.17, color: P.main, foot: P.belly, footLen: 0.34, claws: 3 }), ph: i * Math.PI, amp: 0.75 });
    const tor = ball(b, P.main, [0, hip + 0.25, 0.05], [0.5, 0.48, 0.72]);
    tor.rotation.x = -0.18;
    ball(b, P.belly, [0, hip + 0.17, 0.24], [0.4, 0.4, 0.5]).castShadow = false;
    // head
    const head = (r.head = new THREE.Group());
    head.position.set(0, hip + (kid ? 0.78 : 0.88), 0.55);
    b.add(head);
    const hs = kid ? 1.25 : P.baby ? 1.2 : 1;
    head.scale.setScalar(hs);
    r.headBase = head.position.y;
    ball(head, P.main, [0, 0, 0], [0.5, 0.46, 0.5]);
    ball(head, P.main, [0, -0.1, 0.42], [0.32, 0.24, 0.36]);
    ball(head, P.belly, [0, -0.2, 0.45], [0.26, 0.12, 0.3]).castShadow = false;
    for (const s of [-1, 1]) ball(head, PUPIL, [s * 0.1, 0.0, 0.76], 0.035).castShadow = false;
    r.eyes = eyes(head, 0.25, 0.14, 0.36, 0.14);
    cheeks(head, 0.34, -0.06, 0.34, 0.09);
    smile(head, -0.2, 0.7, 0.09);
    r.mouths.push(mouth(head, [0, -0.2, 0.66], 0.17));
    // tiny arms
    for (const s of [-1, 1]) {
      const arm = new THREE.Group();
      arm.position.set(s * 0.4, hip + 0.5, 0.45);
      b.add(arm);
      const al = kid ? 0.42 : 0.3;
      add(arm, CYL, P.main, [0, -al / 2, 0], [kid ? 0.08 : 0.07, al, kid ? 0.08 : 0.07]);
      ball(arm, P.belly, [0, -al, 0.02], kid ? 0.1 : 0.085);
      arm.rotation.z = s * 0.1;
      r.arms.push(arm);
    }
    r.tail = chain(b, {
      n: 5, step: [0, 0, -0.42], r0: 0.34, r1: 0.07, color: P.main, pos: [0, hip + 0.22, -0.5], rot: [-0.12, 0, 0],
      deco: (g, i, rad) => spike(g, P.accent, [0, rad * 0.95, -0.2], [rad * 0.35, rad * 0.8, rad * 0.35]),
    });
    for (let i = 0; i < 4; i++) spike(b, P.accent, [0, hip + 0.72 - i * 0.04, 0.45 - i * 0.28], [0.1, 0.22, 0.1], [-0.3, 0, 0]);
    r.pieces = { hatY: 0.5, hatZ: 0.02, headScale: hs };
    r.k = 1;
    return r;
  },

  tri(P) {
    const root = new THREE.Group();
    const r = newRig(root);
    const b = r.body;
    ball(b, P.main, [0, 0.98, 0], [0.64, 0.56, 0.98]);
    ball(b, P.belly, [0, 0.82, 0.1], [0.5, 0.42, 0.8]).castShadow = false;
    [[-1, 0.52], [-1, -0.55], [1, 0.52], [1, -0.55]].forEach(([s, z], i) => {
      const side = Math.sign(z);
      r.legs.push({ g: leg(b, { x: s * 0.4, y: 0.7, z, len: 0.7, r: 0.2, color: P.main, foot: P.belly, footLen: 0.3, claws: 3 }), ph: (s * side > 0 ? 0 : Math.PI), amp: 0.6 });
    });
    const head = (r.head = new THREE.Group());
    head.position.set(0, 0.95, 1.02);
    b.add(head);
    r.headBase = 0.95;
    ball(head, P.main, [0, 0, 0], [0.46, 0.42, 0.5]);
    ball(head, CREAM, [0, -0.1, 0.42], [0.22, 0.2, 0.3]);
    spike(head, P.accent, [0, 0.0, 0.7], [0.1, 0.16, 0.1], [Math.PI / 2, 0, 0]).castShadow = false;
    r.eyes = eyes(head, 0.28, 0.1, 0.3, 0.12);
    cheeks(head, 0.36, -0.12, 0.28, 0.08);
    smile(head, -0.22, 0.52, 0.08);
    r.mouths.push(mouth(head, [0, -0.2, 0.55], 0.13));
    for (const s of [-1, 1]) spike(head, CREAM, [s * 0.2, 0.42, 0.34], [0.07, 0.62, 0.07], [1.0, 0, -s * 0.08]);
    spike(head, CREAM, [0, 0.12, 0.6], [0.07, 0.3, 0.07], [0.9, 0, 0]);
    // frill
    const frill = ball(head, P.accent, [0, 0.38, -0.3], [0.78, 0.74, 0.1]);
    frill.rotation.x = -0.35;
    for (let i = 0; i < 9; i++) {
      const a = Math.PI * (0.08 + (i / 8) * 0.84);
      ball(head, CREAM, [Math.cos(a) * 0.74, 0.38 + Math.sin(a) * 0.7 * 0.97, -0.3 - Math.sin(a) * 0.2], 0.075);
    }
    r.tail = chain(b, { n: 4, step: [0, -0.02, -0.5], r0: 0.38, r1: 0.07, color: P.main, pos: [0, 1.0, -0.85], rot: [0.05, 0, 0] });
    r.pieces = { hatY: 0.5, hatZ: 0.0, headScale: 1 };
    return r;
  },

  steg(P) {
    const root = new THREE.Group();
    const r = newRig(root);
    const b = r.body;
    const tor = ball(b, P.main, [0, 1.0, 0], [0.6, 0.56, 1.0]);
    ball(b, P.belly, [0, 0.82, 0.1], [0.48, 0.42, 0.8]).castShadow = false;
    [[-1, 0.55], [-1, -0.55], [1, 0.55], [1, -0.55]].forEach(([s, z]) => {
      r.legs.push({ g: leg(b, { x: s * 0.4, y: 0.72, z, len: z > 0 ? 0.7 : 0.78, r: 0.19, color: P.main, foot: P.belly, footLen: 0.28, claws: 3 }), ph: s * z > 0 ? 0 : Math.PI, amp: 0.55 });
    });
    const head = (r.head = new THREE.Group());
    head.position.set(0, 0.8, 1.1);
    b.add(head);
    r.headBase = 0.8;
    ball(head, P.main, [0, 0, 0], [0.34, 0.31, 0.38]);
    ball(head, P.main, [0, -0.07, 0.34], [0.2, 0.17, 0.3]);
    r.eyes = eyes(head, 0.2, 0.1, 0.24, 0.1);
    cheeks(head, 0.27, -0.08, 0.22, 0.06);
    smile(head, -0.15, 0.5, 0.06);
    r.mouths.push(mouth(head, [0, -0.15, 0.46], 0.1));
    for (let i = 0; i < 9; i++) {
      const z = 0.65 - i * 0.2;
      const y = 1.0 + 0.56 * Math.sqrt(Math.max(0, 1 - (z / 1.0) ** 2)) - 0.04;
      const s = 0.18 + 0.12 * Math.sin((i / 8) * Math.PI);
      const p = spike(b, i % 2 ? P.accent : 0xffd27a, [i % 2 ? 0.12 : -0.12, y + 0.05, z], [0.07, s * 1.6, s * 0.9], [0, 0, i % 2 ? -0.15 : 0.15]);
      p.scale.set(0.05, s * 2.2, s * 1.1);
    }
    r.tail = chain(b, {
      n: 4, step: [0, 0.02, -0.5], r0: 0.38, r1: 0.07, color: P.main, pos: [0, 0.98, -0.85], rot: [-0.1, 0, 0],
      deco: (g, i, rad) => {
        if (i < 2) {
          const p = spike(g, P.accent, [0, rad * 0.9, -0.2], [0.05, rad * 2.4, rad * 1.1]);
          p.castShadow = true;
        }
        if (i >= 2) for (const s of [-1, 1]) spike(g, CREAM, [s * rad * 0.8, 0.02, -0.25], [0.05, 0.28, 0.05], [Math.PI / 2 + 0.3, 0, -s * 0.9]);
      },
    });
    r.pieces = { hatY: 0.35, hatZ: 0.05, headScale: 1 };
    return r;
  },

  bronto(P) {
    const root = new THREE.Group();
    const r = newRig(root);
    const b = r.body;
    ball(b, P.main, [0, 1.25, 0], [0.82, 0.74, 1.25]);
    ball(b, P.belly, [0, 1.05, 0.15], [0.66, 0.55, 1.0]).castShadow = false;
    [[-1, 0.7], [-1, -0.7], [1, 0.7], [1, -0.7]].forEach(([s, z]) => {
      r.legs.push({ g: leg(b, { x: s * 0.52, y: 0.95, z, len: 0.95, r: 0.27, color: P.main, foot: P.belly, footLen: 0.34, claws: 3 }), ph: s * z > 0 ? 0 : Math.PI, amp: 0.45 });
    });
    r.neck = chain(b, { n: 5, step: [0, 0.52, 0.26], r0: 0.34, r1: 0.18, color: P.main, pos: [0, 1.5, 1.0], rot: [0, 0, 0] });
    const top = r.neck[r.neck.length - 1];
    const head = (r.head = new THREE.Group());
    head.position.set(0, 0.52, 0.26);
    top.add(head);
    ball(head, P.main, [0, 0, 0.05], [0.26, 0.24, 0.32]);
    ball(head, P.main, [0, -0.05, 0.3], [0.18, 0.14, 0.2]);
    r.eyes = eyes(head, 0.17, 0.1, 0.12, 0.09);
    cheeks(head, 0.23, -0.06, 0.12, 0.06);
    smile(head, -0.12, 0.43, 0.05);
    r.mouths.push(mouth(head, [0, -0.1, 0.42], 0.09));
    r.tail = chain(b, { n: 6, step: [0, -0.04, -0.6], r0: 0.5, r1: 0.05, color: P.main, pos: [0, 1.25, -1.0], rot: [0.05, 0, 0] });
    r.pieces = { hatY: 0.3, hatZ: 0.05, headScale: 1 };
    return r;
  },

  raptor(P) {
    const root = new THREE.Group();
    const r = newRig(root);
    const b = r.body;
    const hip = 0.78;
    for (const [i, s] of [-1, 1].entries()) {
      const l = leg(b, { x: s * 0.2, y: hip, z: 0.02, len: 0.78, r: 0.1, color: P.main, foot: P.belly, footLen: 0.3, claws: 3 });
      spike(l, 0xffffff, [0, -0.7, 0.05], [0.04, 0.2, 0.04], [Math.PI / 2 + 0.5, 0, 0]);
      r.legs.push({ g: l, ph: i * Math.PI, amp: 0.85 });
    }
    const tor = ball(b, P.main, [0, hip + 0.18, 0.12], [0.34, 0.34, 0.68]);
    tor.rotation.x = -0.35;
    ball(b, P.belly, [0, hip + 0.1, 0.28], [0.26, 0.26, 0.5]).castShadow = false;
    r.neck = chain(b, { n: 2, step: [0, 0.28, 0.2], r0: 0.17, r1: 0.14, color: P.main, pos: [0, hip + 0.42, 0.45], rot: [0, 0, 0] });
    const head = (r.head = new THREE.Group());
    head.position.set(0, 0.3, 0.2);
    r.neck[1].add(head);
    ball(head, P.main, [0, 0, 0], [0.27, 0.25, 0.3]);
    ball(head, P.main, [0, -0.04, 0.3], [0.16, 0.12, 0.3]);
    ball(head, P.belly, [0, -0.1, 0.32], [0.14, 0.06, 0.26]).castShadow = false;
    r.eyes = eyes(head, 0.17, 0.09, 0.14, 0.095);
    cheeks(head, 0.22, -0.05, 0.14, 0.06);
    smile(head, -0.1, 0.5, 0.06);
    r.mouths.push(mouth(head, [0, -0.1, 0.47], 0.09));
    for (let i = 0; i < 3; i++) spike(head, P.accent, [0, 0.24 - i * 0.02, -0.1 - i * 0.12], [0.06, 0.2 - i * 0.03, 0.06], [-0.9, 0, 0]);
    for (const s of [-1, 1]) {
      const arm = new THREE.Group();
      arm.position.set(s * 0.28, hip + 0.28, 0.5);
      b.add(arm);
      add(arm, CYL, P.main, [0, -0.15, 0.05], [0.05, 0.34, 0.05]).rotation.x = -0.5;
      ball(arm, CREAM, [0, -0.3, 0.17], 0.06);
      r.arms.push(arm);
    }
    r.tail = chain(b, {
      n: 6, step: [0, 0, -0.38], r0: 0.2, r1: 0.04, color: P.main, pos: [0, hip + 0.1, -0.5], rot: [0.05, 0, 0],
      deco: (g, i, rad) => i % 2 === 0 && i < 4 && ball(g, P.accent, [0, rad * 0.5, -0.15], [rad * 1.02, rad * 0.9, 0.08]),
    });
    r.pieces = { hatY: 0.34, hatZ: 0.0, headScale: 1 };
    return r;
  },

  anky(P) {
    const root = new THREE.Group();
    const r = newRig(root);
    const b = r.body;
    ball(b, P.main, [0, 0.62, 0], [0.82, 0.46, 1.05]);
    ball(b, P.belly, [0, 0.48, 0.1], [0.66, 0.32, 0.8]).castShadow = false;
    [[-1, 0.55], [-1, -0.55], [1, 0.55], [1, -0.55]].forEach(([s, z]) => {
      r.legs.push({ g: leg(b, { x: s * 0.52, y: 0.42, z, len: 0.42, r: 0.17, color: P.main, foot: P.belly, footLen: 0.26, claws: 3 }), ph: s * z > 0 ? 0 : Math.PI, amp: 0.55 });
    });
    for (let row = 0; row < 4; row++)
      for (const s of [-1, 0, 1]) {
        const z = 0.6 - row * 0.4;
        const x = s * 0.42;
        const y = 0.62 + 0.46 * Math.sqrt(Math.max(0, 1 - (x / 0.82) ** 2 - (z / 1.05) ** 2)) - 0.02;
        ball(b, (row + s) % 2 ? P.accent : 0xffd27a, [x, y, z], 0.17 + (s === 0 ? 0.03 : 0));
      }
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) spike(b, CREAM, [s * 0.8, 0.66, 0.6 - i * 0.4], [0.08, 0.22, 0.08], [0, 0, -s * 1.2]);
    const head = (r.head = new THREE.Group());
    head.position.set(0, 0.6, 1.0);
    b.add(head);
    r.headBase = 0.6;
    ball(head, P.main, [0, 0, 0], [0.38, 0.3, 0.38]);
    ball(head, P.main, [0, -0.06, 0.28], [0.26, 0.18, 0.26]);
    r.eyes = eyes(head, 0.22, 0.1, 0.22, 0.1);
    cheeks(head, 0.3, -0.06, 0.2, 0.06);
    smile(head, -0.13, 0.5, 0.07);
    r.mouths.push(mouth(head, [0, -0.13, 0.46], 0.1));
    for (const s of [-1, 1]) spike(head, CREAM, [s * 0.3, 0.12, -0.05], [0.07, 0.2, 0.07], [0, 0, -s * 1.2]);
    r.tail = chain(b, { n: 4, step: [0, 0, -0.45], r0: 0.38, r1: 0.1, color: P.main, pos: [0, 0.6, -0.8] });
    const club = r.tail[3];
    ball(club, P.accent, [0, 0, -0.55], [0.34, 0.3, 0.32]);
    for (const s of [-1, 1]) spike(club, CREAM, [s * 0.34, 0, -0.55], [0.08, 0.2, 0.08], [0, 0, -s * Math.PI / 2]);
    r.pieces = { hatY: 0.28, hatZ: 0.0, headScale: 1 };
    return r;
  },

  para(P) {
    const root = new THREE.Group();
    const r = newRig(root);
    const b = r.body;
    const hip = 0.85;
    for (const [i, s] of [-1, 1].entries()) r.legs.push({ g: leg(b, { x: s * 0.28, y: hip, z: 0.05, len: 0.85, r: 0.17, color: P.main, foot: P.belly, footLen: 0.34, claws: 3 }), ph: i * Math.PI, amp: 0.7 });
    const tor = ball(b, P.main, [0, hip + 0.3, 0.05], [0.46, 0.5, 0.78]);
    tor.rotation.x = -0.3;
    ball(b, P.belly, [0, hip + 0.22, 0.22], [0.36, 0.4, 0.55]).castShadow = false;
    r.neck = chain(b, { n: 3, step: [0, 0.34, 0.2], r0: 0.26, r1: 0.17, color: P.main, pos: [0, hip + 0.6, 0.5] });
    const head = (r.head = new THREE.Group());
    head.position.set(0, 0.34, 0.2);
    r.neck[2].add(head);
    ball(head, P.main, [0, 0, 0], [0.26, 0.26, 0.32]);
    ball(head, P.main, [0, -0.07, 0.34], [0.17, 0.1, 0.3]);
    ball(head, P.belly, [0, -0.12, 0.34], [0.15, 0.05, 0.27]).castShadow = false;
    r.eyes = eyes(head, 0.18, 0.09, 0.14, 0.095);
    cheeks(head, 0.23, -0.05, 0.14, 0.06);
    smile(head, -0.13, 0.5, 0.06);
    r.mouths.push(mouth(head, [0, -0.12, 0.5], 0.09));
    // the long hollow crest, curving back from the head
    let p = head;
    for (let i = 0; i < 5; i++) {
      const seg = new THREE.Group();
      seg.position.set(0, i === 0 ? 0.22 : 0, i === 0 ? -0.02 : -0.17);
      seg.rotation.x = i === 0 ? -1.2 : 0.35;
      p.add(seg);
      add(seg, CYL, i % 2 ? P.accent : 0xffffff, [0, 0, -0.085], [0.07 - i * 0.004, 0.2, 0.07 - i * 0.004]).rotation.x = Math.PI / 2;
      p = seg;
    }
    for (const s of [-1, 1]) {
      const arm = new THREE.Group();
      arm.position.set(s * 0.35, hip + 0.5, 0.5);
      b.add(arm);
      add(arm, CYL, P.main, [0, -0.17, 0.04], [0.06, 0.36, 0.06]).rotation.x = -0.35;
      ball(arm, P.belly, [0, -0.35, 0.12], 0.07);
      r.arms.push(arm);
    }
    r.tail = chain(b, { n: 5, step: [0, 0, -0.45], r0: 0.3, r1: 0.06, color: P.main, pos: [0, hip + 0.2, -0.5], rot: [-0.1, 0, 0] });
    r.pieces = { hatY: 0.3, hatZ: 0.0, headScale: 1 };
    return r;
  },

  spino(P) {
    const root = new THREE.Group();
    const r = newRig(root);
    const b = r.body;
    const hip = 0.78;
    for (const [i, s] of [-1, 1].entries()) r.legs.push({ g: leg(b, { x: s * 0.28, y: hip, z: 0.05, len: 0.78, r: 0.17, color: P.main, foot: P.belly, footLen: 0.34, claws: 3 }), ph: i * Math.PI, amp: 0.75 });
    const tor = ball(b, P.main, [0, hip + 0.26, 0.05], [0.46, 0.46, 0.8]);
    tor.rotation.x = -0.15;
    ball(b, P.belly, [0, hip + 0.17, 0.22], [0.36, 0.36, 0.56]).castShadow = false;
    // the sail
    for (let i = 0; i < 7; i++) {
      const z = 0.5 - i * 0.16;
      const h = 0.4 + 0.5 * Math.sin(((i + 0.5) / 7) * Math.PI);
      const f = ball(b, i % 2 ? P.accent : 0xffa07a, [0, hip + 0.72 + h / 2 - 0.1, z], [0.05, h / 2 + 0.05, 0.12]);
      f.rotation.x = -0.12;
    }
    r.neck = chain(b, { n: 2, step: [0, 0.22, 0.28], r0: 0.28, r1: 0.22, color: P.main, pos: [0, hip + 0.55, 0.5] });
    const head = (r.head = new THREE.Group());
    head.position.set(0, 0.2, 0.28);
    r.neck[1].add(head);
    ball(head, P.main, [0, 0, 0], [0.3, 0.28, 0.32]);
    ball(head, P.main, [0, -0.06, 0.42], [0.18, 0.14, 0.42]);
    ball(head, P.belly, [0, -0.11, 0.45], [0.15, 0.06, 0.38]).castShadow = false;
    r.eyes = eyes(head, 0.2, 0.1, 0.16, 0.1);
    cheeks(head, 0.25, -0.05, 0.16, 0.06);
    smile(head, -0.12, 0.65, 0.06);
    r.mouths.push(mouth(head, [0, -0.12, 0.7], 0.1));
    spike(head, P.accent, [0, 0.28, 0.1], [0.04, 0.18, 0.1]);
    for (const s of [-1, 1]) {
      const arm = new THREE.Group();
      arm.position.set(s * 0.38, hip + 0.4, 0.5);
      b.add(arm);
      add(arm, CYL, P.main, [0, -0.17, 0.04], [0.06, 0.36, 0.06]).rotation.x = -0.4;
      ball(arm, CREAM, [0, -0.35, 0.12], 0.06);
      r.arms.push(arm);
    }
    r.tail = chain(b, { n: 5, step: [0, 0, -0.45], r0: 0.3, r1: 0.06, color: P.main, pos: [0, hip + 0.14, -0.5], rot: [-0.05, 0, 0],
      deco: (g, i, rad) => i > 0 && i < 4 && ball(g, P.accent, [0, rad * 0.8, -0.2], [0.04, rad * 1.1, 0.18]) });
    r.pieces = { hatY: 0.32, hatZ: 0.0, headScale: 1 };
    return r;
  },

  pachy(P) {
    const root = new THREE.Group();
    const r = newRig(root);
    const b = r.body;
    const hip = 0.72;
    for (const [i, s] of [-1, 1].entries()) r.legs.push({ g: leg(b, { x: s * 0.28, y: hip, z: 0.05, len: 0.72, r: 0.18, color: P.main, foot: P.belly, footLen: 0.32, claws: 3 }), ph: i * Math.PI, amp: 0.75 });
    const tor = ball(b, P.main, [0, hip + 0.28, 0.05], [0.52, 0.52, 0.7]);
    tor.rotation.x = -0.15;
    ball(b, P.belly, [0, hip + 0.2, 0.22], [0.42, 0.42, 0.5]).castShadow = false;
    const head = (r.head = new THREE.Group());
    head.position.set(0, hip + 0.82, 0.45);
    b.add(head);
    r.headBase = hip + 0.82;
    ball(head, P.main, [0, 0, 0], [0.46, 0.42, 0.46]);
    ball(head, P.main, [0, -0.1, 0.36], [0.26, 0.2, 0.28]);
    ball(head, P.accent, [0, 0.32, 0.0], [0.38, 0.28, 0.38]); // the dome
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      ball(head, 0xffffff, [Math.cos(a) * 0.4, 0.22, Math.sin(a) * 0.4], 0.07);
    }
    r.eyes = eyes(head, 0.24, 0.08, 0.3, 0.12);
    cheeks(head, 0.32, -0.08, 0.28, 0.08);
    smile(head, -0.18, 0.56, 0.08);
    r.mouths.push(mouth(head, [0, -0.18, 0.54], 0.13));
    for (const s of [-1, 1]) {
      const arm = new THREE.Group();
      arm.position.set(s * 0.45, hip + 0.45, 0.35);
      b.add(arm);
      add(arm, CYL, P.main, [0, -0.15, 0.03], [0.07, 0.32, 0.07]).rotation.x = -0.3;
      ball(arm, P.belly, [0, -0.31, 0.09], 0.08);
      r.arms.push(arm);
    }
    r.tail = chain(b, { n: 4, step: [0, 0, -0.42], r0: 0.34, r1: 0.07, color: P.main, pos: [0, hip + 0.18, -0.5], rot: [-0.1, 0, 0] });
    r.pieces = { hatY: 0.55, hatZ: 0.0, headScale: 1 };
    return r;
  },

  ptero(P) {
    const root = new THREE.Group();
    const r = newRig(root);
    const b = r.body;
    r.fly = true;
    ball(b, P.main, [0, 0.4, 0], [0.26, 0.24, 0.5]);
    ball(b, P.belly, [0, 0.32, 0.08], [0.2, 0.17, 0.38]).castShadow = false;
    const head = (r.head = new THREE.Group());
    head.position.set(0, 0.58, 0.5);
    b.add(head);
    r.headBase = 0.58;
    ball(head, P.main, [0, 0, 0], [0.2, 0.19, 0.22]);
    spike(head, CREAM, [0, -0.02, 0.5], [0.07, 0.62, 0.07], [Math.PI / 2, 0, 0]);
    spike(head, P.accent, [0, 0.12, -0.35], [0.06, 0.62, 0.1], [-Math.PI / 2 - 0.35, 0, 0]);
    r.eyes = eyes(head, 0.13, 0.06, 0.12, 0.07);
    cheeks(head, 0.17, -0.04, 0.1, 0.045);
    r.mouths.push(mouth(head, [0, -0.06, 0.34], 0.06));
    for (const s of [-1, 1]) {
      const w = new THREE.Group();
      w.position.set(s * 0.2, 0.5, 0.1);
      b.add(w);
      const mem = ball(w, P.accent, [s * 0.8, 0, -0.1], [0.82, 0.025, 0.42]);
      mem.rotation.y = -s * 0.15;
      ball(w, P.main, [s * 0.42, 0.015, 0.2], [0.42, 0.03, 0.07]).rotation.y = -s * 0.2;
      ball(w, P.main, [s * 1.45, 0, -0.05], [0.4, 0.03, 0.06]);
      r.wings.push({ g: w, side: s });
    }
    spike(b, P.main, [0, 0.42, -0.55], [0.08, 0.5, 0.08], [-Math.PI / 2 - 0.1, 0, 0]);
    for (const s of [-1, 1]) leg(b, { x: s * 0.1, y: 0.28, z: 0.0, len: 0.22, r: 0.04, color: CREAM, footLen: 0.1 }).rotation.x = 0.5;
    r.pieces = { hatY: 0.2, hatZ: 0, headScale: 1 };
    return r;
  },

  plesio(P) {
    const root = new THREE.Group();
    const r = newRig(root);
    const b = r.body;
    r.swim = true;
    ball(b, P.main, [0, 0.5, 0], [0.55, 0.4, 0.85]);
    ball(b, P.belly, [0, 0.36, 0.1], [0.44, 0.28, 0.7]).castShadow = false;
    r.neck = chain(b, { n: 4, step: [0, 0.3, 0.3], r0: 0.2, r1: 0.13, color: P.main, pos: [0, 0.65, 0.65] });
    const head = (r.head = new THREE.Group());
    head.position.set(0, 0.3, 0.3);
    r.neck[3].add(head);
    ball(head, P.main, [0, 0, 0.04], [0.17, 0.15, 0.24]);
    ball(head, P.main, [0, -0.03, 0.22], [0.11, 0.09, 0.16]);
    r.eyes = eyes(head, 0.12, 0.06, 0.1, 0.07);
    cheeks(head, 0.16, -0.04, 0.1, 0.045);
    smile(head, -0.08, 0.33, 0.04);
    r.mouths.push(mouth(head, [0, -0.07, 0.32], 0.06));
    for (const [s, z] of [[-1, 0.45], [1, 0.45], [-1, -0.35], [1, -0.35]]) {
      const f = new THREE.Group();
      f.position.set(s * 0.5, 0.35, z);
      b.add(f);
      const fl = ball(f, P.accent, [s * 0.32, 0, 0], [0.36, 0.045, 0.2]);
      fl.rotation.y = s * 0.4;
      r.flippers.push({ g: f, side: s, ph: z > 0 ? 0 : Math.PI });
    }
    r.tail = chain(b, { n: 3, step: [0, 0, -0.4], r0: 0.3, r1: 0.06, color: P.main, pos: [0, 0.5, -0.7] });
    r.pieces = { hatY: 0.2, hatZ: 0, headScale: 1 };
    return r;
  },

  ichthyo(P) {
    const root = new THREE.Group();
    const r = newRig(root);
    const b = r.body;
    r.swim = true;
    ball(b, P.main, [0, 0.5, 0], [0.42, 0.42, 0.95]);
    ball(b, P.belly, [0, 0.38, 0.15], [0.34, 0.28, 0.75]).castShadow = false;
    const head = (r.head = new THREE.Group());
    head.position.set(0, 0.5, 0.85);
    b.add(head);
    r.headBase = 0.5;
    ball(head, P.main, [0, 0, 0], [0.3, 0.3, 0.32]);
    spike(head, P.belly, [0, -0.04, 0.62], [0.11, 0.7, 0.11], [Math.PI / 2, 0, 0]);
    r.eyes = eyes(head, 0.2, 0.1, 0.14, 0.095);
    cheeks(head, 0.26, -0.06, 0.16, 0.06);
    r.mouths.push(mouth(head, [0, -0.1, 0.5], 0.08));
    spike(b, P.accent, [0, 0.98, -0.1], [0.05, 0.45, 0.4], [0, 0, 0]);
    r.tail = chain(b, { n: 3, step: [0, 0, -0.5], r0: 0.32, r1: 0.1, color: P.main, pos: [0, 0.5, -0.8] });
    const fin = r.tail[2];
    ball(fin, P.accent, [0, 0.2, -0.3], [0.04, 0.4, 0.2]).rotation.x = 0.4;
    ball(fin, P.accent, [0, -0.2, -0.3], [0.04, 0.3, 0.18]).rotation.x = -0.4;
    for (const s of [-1, 1]) {
      const f = new THREE.Group();
      f.position.set(s * 0.38, 0.35, 0.35);
      b.add(f);
      ball(f, P.accent, [s * 0.2, -0.05, 0], [0.26, 0.04, 0.14]).rotation.y = s * 0.4;
      r.flippers.push({ g: f, side: s, ph: 0 });
    }
    r.pieces = { hatY: 0.3, hatZ: 0, headScale: 1 };
    return r;
  },

  turtle(P) {
    const root = new THREE.Group();
    const r = newRig(root);
    const b = r.body;
    r.swim = true;
    const shell = ball(b, P.accent, [0, 0.5, 0], [0.7, 0.42, 0.85]);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ball(b, 0xfff0c8, [Math.cos(a) * 0.4, 0.78 - (i % 2) * 0.03, Math.sin(a) * 0.5], [0.2, 0.08, 0.2]);
    }
    ball(b, 0xfff0c8, [0, 0.9, 0], [0.24, 0.07, 0.26]);
    ball(b, P.belly, [0, 0.36, 0], [0.55, 0.2, 0.7]).castShadow = false;
    const head = (r.head = new THREE.Group());
    head.position.set(0, 0.5, 0.88);
    b.add(head);
    r.headBase = 0.5;
    ball(head, P.main, [0, 0, 0], [0.24, 0.22, 0.28]);
    r.eyes = eyes(head, 0.16, 0.07, 0.15, 0.085);
    cheeks(head, 0.21, -0.05, 0.14, 0.05);
    smile(head, -0.1, 0.27, 0.05);
    r.mouths.push(mouth(head, [0, -0.1, 0.27], 0.07));
    for (const [s, z] of [[-1, 0.5], [1, 0.5], [-1, -0.45], [1, -0.45]]) {
      const f = new THREE.Group();
      f.position.set(s * 0.6, 0.38, z);
      b.add(f);
      ball(f, P.main, [s * 0.26, 0, 0], [0.34, 0.05, z > 0 ? 0.2 : 0.14]).rotation.y = s * 0.4;
      r.flippers.push({ g: f, side: s, ph: z > 0 ? 0 : Math.PI });
    }
    r.tail = chain(b, { n: 2, step: [0, 0, -0.25], r0: 0.14, r1: 0.04, color: P.main, pos: [0, 0.4, -0.8] });
    r.pieces = { hatY: 0.2, hatZ: 0, headScale: 1 };
    return r;
  },
};

export const SPECIES = {
  rex:     { main: 0x58c26b, belly: 0xe6f7b8, accent: 0xff9f43 },
  tri:     { main: 0xf2a65a, belly: 0xfff0cf, accent: 0xe86a6a },
  steg:    { main: 0x9a7be0, belly: 0xe8ddff, accent: 0xffb347 },
  bronto:  { main: 0x5aa9f5, belly: 0xdbefff, accent: 0xffd23f },
  raptor:  { main: 0xf0735a, belly: 0xffe3c9, accent: 0x3d3a6b },
  anky:    { main: 0x6fbf9a, belly: 0xeaf7e6, accent: 0xd9a65a },
  para:    { main: 0xf7c54b, belly: 0xfff3c4, accent: 0xe5586e },
  spino:   { main: 0x3fb7b0, belly: 0xdaf7f1, accent: 0xff7a59 },
  pachy:   { main: 0xe880b0, belly: 0xffe6f1, accent: 0xfff1a8 },
  ptero:   { main: 0xb48cff, belly: 0xf1e8ff, accent: 0xff7aa8 },
  plesio:  { main: 0x4fd1c5, belly: 0xdcfbf6, accent: 0x2e9fb8 },
  ichthyo: { main: 0x4a90e2, belly: 0xe3f1ff, accent: 0xffd23f },
  turtle:  { main: 0x7bc47f, belly: 0xf2f7d5, accent: 0xc99a5b },
};
export const SPECIES_LIST = Object.keys(SPECIES);

export function makeRig(species, opts = {}) {
  const P = { ...SPECIES[species], ...opts };
  const rig = BUILD[species](P);
  mergeRig(rig.root);
  rig.species = species;
  rig.eyeBlinkOffset = Math.random() * 3;
  const box = new THREE.Box3().setFromObject(rig.root);
  const w = Math.max(box.max.x - box.min.x, box.max.z - box.min.z);
  // tall animals are sized by height, wide flat ones (wings, flippers) by their spread
  rig.natural = Math.max(0.5, box.max.y - Math.min(0, box.min.y), w * 0.42);
  return rig;
}

// ------------------------------------------------------------------ animation
// s: { walk 0..1, run 0..1, t, mode, roar 0..1, hop 0..1, shake 0..1 }
export function animateRig(r, dt, s) {
  const { walk, run, t } = s;
  const k = r.k;
  r.phase += dt * (7.5 + 4 * run) * walk;
  const sw = Math.sin(r.phase);
  const mode = s.mode;
  const dancing = mode === 'dance';
  const sleeping = mode === 'sleep';
  const eating = mode === 'eat';

  // blink
  if (r.eyes) r.eyes.scale.y = sleeping ? 0.12 : (t + r.eyeBlinkOffset) % 4 < 0.12 ? 0.12 : 1;

  if (r.fly) {
    const flap = Math.sin(t * (walk > 0.2 ? 9 : 6)) * 0.75;
    r.wings.forEach((w) => (w.g.rotation.z = w.side * flap + w.side * 0.1));
    r.body.position.y = 0.5 + Math.sin(t * 2.2) * 0.12;
    r.body.rotation.x = 0.12 * walk;
    r.head.rotation.x = -s.roar * 0.5;
    r.mouths.forEach((m) => m.scale.setScalar(Math.max(0.001, m.userData.size * s.roar)));
    return;
  }
  if (r.swim) {
    const sp = walk > 0.2 ? 5 : 2.4;
    r.body.position.y = Math.sin(t * 1.6) * 0.07 + s.hop * 0.6 * Math.sin(s.hop * Math.PI) ;
    r.body.rotation.z = Math.sin(t * sp) * 0.04;
    r.body.rotation.x = Math.sin(t * 1.2) * 0.03 - s.hop * 0.3;
    r.tail.forEach((g, i) => (g.rotation.y = Math.sin(t * sp - i * 0.8) * (0.22 + 0.12 * walk)));
    r.neck.forEach((g, i) => (g.rotation.x = Math.sin(t * 1.3 + i * 0.7) * 0.1 - (i === 0 ? 0.15 : -0.05)));
    r.flippers.forEach((f) => {
      f.g.rotation.z = f.side * Math.sin(t * (walk > 0.2 ? 5 : 2.4) + f.ph) * 0.5;
    });
    if (r.head) r.head.rotation.x = -s.roar * 0.45 + (dancing ? Math.sin(t * 6) * 0.2 : 0);
    r.mouths.forEach((m) => m.scale.setScalar(Math.max(0.001, m.userData.size * s.roar)));
    if (dancing) r.body.rotation.z = Math.sin(t * 6) * 0.25;
    return;
  }

  // legs
  for (const l of r.legs) {
    const swing = dancing ? Math.sin(t * 8 + l.ph) * 0.5 : Math.sin(r.phase + l.ph) * l.amp * walk;
    l.g.rotation.x = sleeping ? 0 : swing;
  }
  // body
  let by = Math.abs(sw) * 0.07 * walk * k + Math.sin(t * 2) * 0.012 * (1 - walk) * k;
  let bz = Math.sin(r.phase) * 0.05 * walk;
  if (dancing) {
    by = Math.abs(Math.sin(t * 8)) * 0.3 * k;
    bz = Math.sin(t * 8) * 0.14;
  }
  by += Math.sin(s.hop * Math.PI) * 0.75 * k;
  if (sleeping) by = -0.18 * k + Math.sin(t * 1.4) * 0.02;
  r.body.position.y = by;
  r.body.rotation.z = bz;
  r.body.rotation.x = sleeping ? 0.08 : 0;
  r.body.rotation.y = s.spin || 0;

  // tail
  r.tail.forEach((g, i) => {
    const wag = dancing ? Math.sin(t * 8 - i * 0.7) * 0.4 : Math.sin(t * 2.2 - i * 0.6) * 0.1 + Math.cos(r.phase - i * 0.5) * 0.14 * walk;
    g.rotation.y = wag;
    if (dancing) g.rotation.x = -0.06 + Math.sin(t * 8 - i) * 0.05;
  });

  // neck + head
  const n = r.neck.length;
  r.neck.forEach((g, i) => {
    let rx = Math.sin(t * 1.2 + i * 0.6) * 0.035;
    if (eating) rx += 0.28 + Math.sin(t * 6) * 0.05;
    if (sleeping) rx += 0.2;
    rx -= s.roar * 0.14;
    g.rotation.x = rx;
    g.rotation.y = s.shake * Math.sin(t * 22) * 0.15 + (dancing ? Math.sin(t * 4) * 0.12 : 0);
  });
  if (r.head) {
    let hx = Math.sin(t * 1.7) * 0.03 + Math.abs(sw) * 0.04 * walk;
    if (eating) hx += 0.5 + Math.sin(t * 6) * 0.1;
    if (sleeping) hx += n ? 0.2 : 0.6;
    hx -= s.roar * 0.55;
    r.head.rotation.x = hx;
    r.head.rotation.y = s.shake * Math.sin(t * 22) * 0.4 + (dancing && !n ? Math.sin(t * 4) * 0.25 : 0);
    r.head.rotation.z = dancing ? Math.sin(t * 8) * 0.12 : 0;
  }
  r.mouths.forEach((m) => m.scale.setScalar(Math.max(0.001, m.userData.size * (s.roar + (eating ? 0.5 + 0.5 * Math.sin(t * 6) : 0) * 0.6))));

  // arms
  r.arms.forEach((a, i) => {
    const side = i ? 1 : -1;
    if (s.cheer) {
      a.rotation.z = side * (2.5 + Math.sin(t * 12) * 0.2);
      a.rotation.x = 0;
    } else if (dancing) {
      a.rotation.z = side * (0.9 + Math.sin(t * 8) * 0.6);
      a.rotation.x = 0;
    } else {
      a.rotation.x = -sw * 0.5 * walk * (i ? 1 : -1) * -1;
      a.rotation.z = side * 0.1 + s.roar * side * 0.5;
    }
  });
}

// ------------------------------------------------------------------ Dino: a friend that walks, follows, dances
const ALIASES = { sprint: 'run', jump: 'dance', 'pick-up': 'eat', 'emote-yes': 'gesture-positive', 'emote-no': 'gesture-negative' };
const SHOTS = { 'gesture-positive': 1.1, 'gesture-negative': 0.9, roar: 1.2, hop: 0.7 };

export class Dino {
  constructor(species, height = 1.5, opts = {}) {
    this.name = species;
    this.height = height;
    this.rig = makeRig(species, opts);
    this.root = new THREE.Group();
    this.model = new THREE.Group();
    this.model.add(this.rig.root);
    const sc = height / this.rig.natural;
    this.model.scale.setScalar(sc);
    this.rig.k = 1;
    this.root.add(this.model);
    this.dest = null;
    this.onArrive = null;
    this.speed = 2.6;
    this.heading = 0;
    this.mode = 'idle';
    this.currentName = 'idle';
    this.walk = 0;
    this.run = 0;
    this.shot = null;
    this.t = Math.random() * 10;
    this.fly = !!this.rig.fly;
    this.floatY = 0;
  }

  play(name, opts = {}) {
    name = ALIASES[name] || name;
    if (SHOTS[name]) {
      this.shot = { name, t: 0, dur: SHOTS[name] };
      return;
    }
    this.mode = name;
    this.currentName = name;
  }

  // a one-off reaction; friendly ones make the dino's call
  gesture(name) {
    if (name === 'gesture-positive' && Dino.callHook) Dino.callHook(this.name);
    this.play(name);
  }

  goTo(x, z, { speed = 2.6, onArrive = null } = {}) {
    this.dest = new THREE.Vector3(x, 0, z);
    this.speed = speed;
    this.onArrive = onArrive;
  }

  face(x, z) {
    this.heading = Math.atan2(x - this.root.position.x, z - this.root.position.z);
  }

  update(dt, clamp) {
    const p = this.root.position;
    this.t += dt;
    let moving = 0;
    if (this.dest) {
      const dx = this.dest.x - p.x;
      const dz = this.dest.z - p.z;
      const d = Math.hypot(dx, dz);
      if (d < 0.08) {
        this.dest = null;
        const cb = this.onArrive;
        this.onArrive = null;
        cb && cb();
      } else {
        const step = Math.min(d, this.speed * dt);
        p.x += (dx / d) * step;
        p.z += (dz / d) * step;
        if (clamp) clamp(p);
        this.heading = Math.atan2(dx, dz);
        moving = 1;
        this.run += ((this.speed > 3.4 ? 1 : 0) - this.run) * Math.min(1, dt * 6);
      }
    }
    const target = moving ? Math.min(1, 0.45 + this.speed / 4) : 0;
    this.walk += (target - this.walk) * Math.min(1, dt * 8);
    let diff = this.heading - this.root.rotation.y;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    this.root.rotation.y += diff * Math.min(1, dt * 10);

    const s = { walk: this.walk, run: this.run, t: this.t, mode: this.dest ? 'walk' : this.mode, roar: 0, hop: 0, shake: 0 };
    if (this.shot) {
      this.shot.t += dt;
      const k = Math.min(1, this.shot.t / this.shot.dur);
      if (this.shot.name === 'gesture-positive') {
        s.hop = k;
        s.roar = Math.sin(Math.min(1, k * 1.4) * Math.PI);
      } else if (this.shot.name === 'roar') s.roar = Math.sin(k * Math.PI);
      else if (this.shot.name === 'gesture-negative') s.shake = Math.sin(k * Math.PI);
      else if (this.shot.name === 'hop') s.hop = k;
      if (k >= 1) this.shot = null;
    }
    animateRig(this.rig, dt, s);
    if (this.fly) this.model.position.y = this.floatY;
  }
}

// ------------------------------------------------------------------ the player: a little dino with outfits
export const SKINS = [
  { main: 0x58c26b, belly: 0xe6f7b8, accent: 0xff9f43 }, // 0 green
  { main: 0x5aa9f5, belly: 0xdbefff, accent: 0xffd23f }, // 1 blue
  { main: 0xff9a4d, belly: 0xffe2b8, accent: 0x7a4bd1 }, // 2 orange
  { main: 0xa77bf0, belly: 0xeadcff, accent: 0x5be3a0 }, // 3 purple
  { main: 0xff8fc7, belly: 0xffe3f1, accent: 0x7be37a }, // 4 pink
  { main: 0xffd23f, belly: 0xfff3b8, accent: 0xff6b6b }, // 5 sunny
  { main: 0xf0605d, belly: 0xffd9c9, accent: 0x2f2a52 }, // 6 red
  { main: 0x3fcfc0, belly: 0xd5fbf6, accent: 0xffd23f }, // 7 teal
  { main: 0xbfe3ff, belly: 0xffffff, accent: 0x5aa9f5 }, // 8 ice
  { main: 0xf5c542, belly: 0xfff2b8, accent: 0xff7a2f }, // 9 gold
  { main: 0x4a3b52, belly: 0xff7b3a, accent: 0xffd23f }, // 10 lava
  { main: 0x2f3a8f, belly: 0x8f9bff, accent: 0xffe066 }, // 11 night
  { main: 0xff9ad5, belly: 0xb6f0ff, accent: 0xffe35a }, // 12 candy
  { main: 0x6a8f3a, belly: 0xc6d98a, accent: 0x9b5f2b }, // 13 jungle
];
export const HAT_ICONS = ['🧢', '🎉', '🌸', '🪖', '👑', '🏴‍☠️', '🧑‍🚀', '🤠', '👨‍🍳', '🧙', '🍃', '😎'];

function makeHats(deep) {
  const hats = [];
  const mk = (y = 0, z = 0) => {
    const g = new THREE.Group();
    g.position.set(0, y, z);
    hats.push(g);
    return g;
  };
  // 0 cap
  let h = mk(0.42, 0.04);
  ball(h, 0xe84545, [0, 0, 0], [0.4, 0.22, 0.4]);
  add(h, CYL, 0xe84545, [0, -0.02, 0.36], [0.26, 0.03, 0.2]);
  ball(h, 0xffffff, [0, 0.2, 0], 0.05);
  // 1 party hat
  h = mk(0.42, 0);
  spike(h, 0xff5fae, [0, 0.3, 0], [0.26, 0.62, 0.26]);
  add(h, CYL, 0xffe35a, [0, 0.05, 0], [0.27, 0.05, 0.27]);
  ball(h, 0xffffff, [0, 0.62, 0], 0.07);
  // 2 flower crown
  h = mk(0.4, 0);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const f = new THREE.Group();
    f.position.set(Math.cos(a) * 0.36, 0, Math.sin(a) * 0.36);
    ball(f, [0xffffff, 0xffc2e0, 0xffe35a, 0xc9a6ff][i % 4], [0, 0.02, 0], 0.09);
    ball(f, 0xffe35a, [0, 0.08, 0], 0.04);
    h.add(f);
  }
  // 3 viking helmet
  h = mk(0.38, 0);
  ball(h, 0xaab4c2, [0, 0.02, 0], [0.42, 0.3, 0.42]);
  add(h, CYL, 0x8a6b43, [0, -0.1, 0], [0.43, 0.05, 0.43]);
  for (const s of [-1, 1]) {
    const horn = spike(h, 0xfff1d0, [s * 0.44, 0.12, 0], [0.09, 0.4, 0.09], [0, 0, -s * 0.9]);
    horn.castShadow = true;
  }
  // 4 crown
  h = mk(0.46, 0);
  add(h, new THREE.CylinderGeometry(0.26, 0.22, 0.14, 18), GOLD, [0, 0, 0]);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    spike(h, GOLD, [Math.cos(a) * 0.23, 0.15, Math.sin(a) * 0.23], [0.07, 0.2, 0.07]);
    ball(h, [0xff5fae, 0x6ad7ff, 0xffffff][i % 3], [Math.cos(a) * 0.23, 0.27, Math.sin(a) * 0.23], 0.035);
  }
  // 5 pirate hat
  h = mk(0.42, 0);
  const brim = ball(h, 0x2b2236, [0, 0.02, 0], [0.56, 0.14, 0.4]);
  brim.rotation.z = 0.0;
  ball(h, 0x2b2236, [0, 0.14, 0], [0.34, 0.2, 0.3]);
  ball(h, 0xffffff, [0, 0.14, 0.27], [0.08, 0.06, 0.03]);
  ball(h, 0xffffff, [0.0, 0.13, 0.27], [0.03, 0.1, 0.03]);
  // 6 astronaut helmet
  h = mk(0.0, 0);
  const bub = new THREE.Mesh(SPHERE, new THREE.MeshToonMaterial({ color: 0xcfeaff, transparent: true, opacity: 0.35, gradientMap: gradient }));
  bub.scale.setScalar(0.62);
  h.add(bub);
  add(h, new THREE.TorusGeometry(0.5, 0.06, 8, 24), 0xffffff, [0, -0.3, 0]).rotation.x = Math.PI / 2;
  spike(h, 0xff5fae, [0.0, 0.66, 0], [0.03, 0.2, 0.03]);
  // 7 cowboy hat
  h = mk(0.42, 0);
  add(h, CYL, 0xb97a3f, [0, 0, 0], [0.62, 0.04, 0.5]);
  add(h, CYL, 0xb97a3f, [0, 0.14, 0], [0.3, 0.26, 0.28]);
  add(h, CYL, 0x7a4a22, [0, 0.06, 0], [0.305, 0.06, 0.285]);
  // 8 chef hat
  h = mk(0.44, 0);
  add(h, CYL, 0xffffff, [0, 0, 0], [0.3, 0.2, 0.3]);
  ball(h, 0xffffff, [0, 0.22, 0], [0.34, 0.24, 0.34]);
  ball(h, 0xffffff, [0.2, 0.18, 0], 0.18);
  ball(h, 0xffffff, [-0.2, 0.18, 0], 0.18);
  // 9 wizard hat
  h = mk(0.42, 0);
  add(h, CYL, 0x4b3678, [0, 0, 0], [0.5, 0.04, 0.5]);
  const cone = spike(h, 0x5b3fa0, [0, 0.4, 0], [0.3, 0.8, 0.3]);
  cone.rotation.z = -0.15;
  for (const [x, y] of [[0.05, 0.3], [-0.08, 0.5]]) ball(h, 0xffe066, [x, y, 0.2], 0.04);
  // 10 leaf crown
  h = mk(0.4, 0);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const l = ball(h, i % 2 ? 0x5cc45f : 0x7bd96f, [Math.cos(a) * 0.36, 0.06, Math.sin(a) * 0.36], [0.07, 0.18, 0.05]);
    l.rotation.set(0.0, -a, Math.cos(a) * 0.5);
  }
  // 11 sunglasses (sit on the face, not the head)
  h = mk(0.0, 0);
  h.position.set(0, 0.16, 0.5);
  for (const s of [-1, 1]) {
    const lens = add(h, CYL, 0x1d1b2b, [s * 0.24, 0, 0.1], [0.17, 0.04, 0.15]);
    lens.rotation.x = Math.PI / 2;
    ball(h, 0xffffff, [s * 0.2, 0.05, 0.16], 0.025).castShadow = false;
  }
  add(h, BOX, 0x1d1b2b, [0, 0.02, 0.12], [0.2, 0.04, 0.04]);
  return hats;
}

export function makeDinoKid(outfit = { skin: 0, hat: 0 }) {
  const mainM = mat(SKINS[0].main).clone();
  const bellyM = mat(SKINS[0].belly).clone();
  const accentM = mat(SKINS[0].accent).clone();
  const rig = BUILD.rex({ main: mainM, belly: bellyM, accent: accentM, kid: true });
  mergeRig(rig.root);
  const root = new THREE.Group();
  root.add(rig.root);
  const hats = makeHats(accentM);
  hats.forEach((hat) => {
    mergeGroup(hat);
    rig.head.add(hat);
  });
  // back spots in the accent colour
  for (const [x, y, z] of [[0.22, 1.42, -0.05], [-0.2, 1.36, 0.2], [0.05, 1.5, 0.25], [-0.25, 1.4, -0.25]]) ball(rig.body, accentM, [x, y, z], [0.07, 0.04, 0.07]).castShadow = false;
  root.scale.setScalar(0.72);
  rig.k = 1;

  root.userData.setOutfit = (o) => {
    const sk = SKINS[o.skin % SKINS.length];
    mainM.color.set(sk.main);
    bellyM.color.set(sk.belly);
    accentM.color.set(sk.accent);
    hats.forEach((h, i) => (h.visible = i === o.hat % hats.length));
  };
  root.userData.setOutfit(outfit);

  let spinT = 0;
  let spinDur = 1;
  root.userData.spin = (dur = 1.2) => {
    spinT = dur;
    spinDur = dur;
  };
  root.userData.cheering = false;
  root.userData.rig = rig;
  let tt = 0;
  root.userData.animate = (dt, walk, t) => {
    tt = t;
    let spin = 0;
    if (spinT > 0) {
      spinT = Math.max(0, spinT - dt);
      spin = (1 - spinT / spinDur) * Math.PI * 4;
    }
    const cheer = root.userData.cheering;
    animateRig(rig, dt, { walk, run: 0, t, mode: cheer ? 'dance' : 'idle', roar: cheer ? 0.5 + Math.sin(t * 6) * 0.5 : 0, hop: 0, shake: 0, cheer, spin });
    if (cheer) rig.body.position.y = Math.abs(Math.sin(t * 7)) * 0.3;
  };
  return root;
}

// a small picture of a dino, rendered once for the pet picker
export function thumbnail(renderer, species, opts = {}, size = 160) {
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0xbbddbb, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 1.8);
  sun.position.set(3, 6, 5);
  scene.add(sun);
  const d = new Dino(species, 1.6, opts);
  d.root.rotation.y = 0.5;
  d.update(0.016);
  scene.add(d.root);
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  cam.position.set(0, 1.3, 6);
  cam.lookAt(0, 0.85, 0);
  const rt = new THREE.WebGLRenderTarget(size, size, { samples: 4 });
  const prev = renderer.getRenderTarget();
  const prevBg = scene.background;
  renderer.setRenderTarget(rt);
  renderer.setClearColor(0x000000, 0);
  renderer.clear();
  renderer.render(scene, cam);
  const buf = new Uint8Array(size * size * 4);
  renderer.readRenderTargetPixels(rt, 0, 0, size, size, buf);
  renderer.setRenderTarget(prev);
  rt.dispose();
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const img = g.createImageData(size, size);
  for (let y = 0; y < size; y++) img.data.set(buf.subarray((size - 1 - y) * size * 4, (size - y) * size * 4), y * size * 4);
  g.putImageData(img, 0, 0);
  return c.toDataURL('image/png');
}
