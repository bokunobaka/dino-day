import * as THREE from 'three';
import { mat, makeCloud } from '../models.js';
import { makeRock } from '../scenery.js';
import { Dino } from '../dinos.js';
import { Particles, textures } from '../fx.js';

// deterministic scatter so every area looks the same each time
export function rng(seed) {
  let s = seed;
  return () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
}

export function place(group, obj, x, z, { rot = 0, scale = 1, y = 0 } = {}) {
  obj.position.set(x, y, z);
  obj.rotation.y = rot;
  obj.scale.setScalar(scale);
  group.add(obj);
  return obj;
}

// big flat ground discs (outer + a slightly different inner lawn)
export function ground(group, outer, inner, innerR) {
  const g = new THREE.Mesh(new THREE.CircleGeometry(80, 64), mat(outer));
  g.rotation.x = -Math.PI / 2;
  g.receiveShadow = true;
  group.add(g);
  if (inner !== undefined) {
    const l = new THREE.Mesh(new THREE.CircleGeometry(innerR, 64), mat(inner));
    l.rotation.x = -Math.PI / 2;
    l.position.y = 0.01;
    l.receiveShadow = true;
    group.add(l);
  }
}

export const circleClamp = (R) => (p) => {
  const r = Math.hypot(p.x, p.z);
  if (r > R) {
    p.x *= R / r;
    p.z *= R / r;
  }
};

// a ring of posts + two rails (low fence marking the play area)
export function fenceRing(group, R, color = 0xffffff, rail = 0xffd6ea) {
  const postGeo = new THREE.BoxGeometry(0.2, 1, 0.2);
  for (let i = 0; i < 56; i++) {
    const a = (i / 56) * Math.PI * 2;
    const p = new THREE.Mesh(postGeo, mat(color));
    p.position.set(Math.cos(a) * R, 0.5, Math.sin(a) * R);
    p.castShadow = true;
    group.add(p);
  }
  for (const y of [0.35, 0.75]) {
    const r = new THREE.Mesh(new THREE.TorusGeometry(R, 0.05, 6, 120), mat(rail));
    r.rotation.x = Math.PI / 2;
    r.position.y = y;
    group.add(r);
  }
}

export function stars(group, n, radius = 90) {
  const pos = new Float32Array(n * 3);
  const rand = rng(11);
  for (let i = 0; i < n; i++) {
    const a = rand() * Math.PI * 2;
    const e = 0.15 + rand() * 0.8;
    pos[i * 3] = Math.cos(a) * Math.cos(e) * radius;
    pos[i * 3 + 1] = Math.sin(e) * radius;
    pos[i * 3 + 2] = Math.sin(a) * Math.cos(e) * radius;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.9, fog: false, sizeAttenuation: false, transparent: true, opacity: 0.9 }));
  pts.frustumCulled = false;
  group.add(pts);
}

// scatter `n` things on a ring between rMin and rMax, skipping spots `skip(x, z)` says no to
export function scatter(rand, n, rMin, rMax, fn, skip = () => false) {
  let placed = 0;
  for (let tries = 0; placed < n && tries < n * 6; tries++) {
    const a = rand() * Math.PI * 2;
    const r = rMin + Math.sqrt(rand()) * (rMax - rMin);
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (skip(x, z)) continue;
    fn(x, z, placed++);
  }
}

// a ring of boulders marking the edge of the play area
export function boulderRing(group, rand, R, color = 0x8e98a3, n = 40) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = R + 0.6 + rand() * 0.5;
    const s = 0.7 + rand() * 0.7;
    const rock = makeRock(color + (i % 3) * 0x050505, s, rand);
    rock.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
    group.add(rock);
  }
}

// little tufts of grass
export function tufts(group, rand, n, R, color = 0x7ed36a) {
  const geo = new THREE.ConeGeometry(0.07, 0.3, 5);
  const mesh = new THREE.InstancedMesh(geo, mat(color), n);
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < n; i++) {
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(rand()) * R;
    m4.makeScale(1, 0.6 + rand() * 0.9, 1).setPosition(Math.cos(a) * r, 0.14, Math.sin(a) * r);
    mesh.setMatrixAt(i, m4);
  }
  group.add(mesh);
}

// the sky: drifting clouds + a few pterosaurs gliding in circles; returns an update function
export function skyLife(game, group, rand, { clouds = 7, flyers = 3, y = 20, center = [0, -24] } = {}) {
  const cl = [];
  for (let i = 0; i < clouds; i++) {
    const c = makeCloud();
    c.position.set((rand() - 0.5) * 90, y + rand() * 8, -20 - rand() * 40);
    c.scale.setScalar(1.2 + rand() * 1.3);
    group.add(c);
    cl.push(c);
  }
  const birds = [];
  for (let i = 0; i < flyers; i++) {
    const d = new Dino('ptero', 2.6, i === 1 ? { main: 0xff9a4d, accent: 0xffd23f } : {});
    group.add(d.root);
    birds.push({ d, a: rand() * 6, r: 16 + rand() * 12, h: 12 + rand() * 6, sp: 0.12 + rand() * 0.08 });
  }
  return (dt, t) => {
    cl.forEach((c, i) => {
      c.position.x += dt * (0.25 + (i % 3) * 0.1);
      if (c.position.x > 55) c.position.x = -55;
    });
    for (const b of birds) {
      b.a += dt * b.sp;
      const x = center[0] + Math.cos(b.a) * b.r;
      const z = center[1] + Math.sin(b.a) * b.r * 0.6;
      b.d.root.position.set(x, b.h + Math.sin(t + b.a) * 0.6, z);
      b.d.root.rotation.y = -b.a + Math.PI;
      b.d.root.rotation.z = 0.25;
      b.d.update(dt);
    }
  };
}

// slow grey smoke drifting up from a volcano
export function volcanoSmoke(group, x, y, z) {
  const smoke = new Particles(group, textures.snow, { max: 70, size: 4.2, additive: false });
  let acc = 0;
  return (dt) => {
    smoke.update(dt);
    acc -= dt;
    if (acc <= 0) {
      acc = 0.35;
      smoke.emit(x, y, z, 1, { speed: 0.5, up: 2.2, life: 6, colors: [0x9a9a9a, 0xb4aaa4, 0x8a8280], spread: 1.2 });
    }
  };
}
