// Shared toolkit for building low-poly toon models from primitives, plus a few generic bits of scenery.
import * as THREE from 'three';

export const gradient = (() => {
  const data = new Uint8Array([120, 175, 228, 255]);
  const t = new THREE.DataTexture(data, 4, 1, THREE.RedFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter;
  t.needsUpdate = true;
  return t;
})();

const mats = new Map();
export function mat(color, extra = {}) {
  const key = color + JSON.stringify(extra);
  let m = mats.get(key);
  if (!m) {
    m = new THREE.MeshToonMaterial({ color, gradientMap: gradient, ...extra });
    mats.set(key, m);
  }
  return m;
}

export const SPHERE = new THREE.SphereGeometry(1, 16, 11);
export const SPHERE_LO = new THREE.SphereGeometry(1, 10, 7); // for small parts: eyes, cheeks, toes
export const CYL = new THREE.CylinderGeometry(1, 1, 1, 18);
export const CONE = new THREE.ConeGeometry(1, 1, 14);
export const BOX = new THREE.BoxGeometry(1, 1, 1);

// add(parent, geometry, color, [x,y,z], [sx,sy,sz])
export function add(parent, geo, color, pos = [0, 0, 0], scale = [1, 1, 1], extra) {
  const m = new THREE.Mesh(geo, color instanceof THREE.Material ? color : mat(color, extra));
  m.position.set(...pos);
  m.scale.set(...(typeof scale === 'number' ? [scale, scale, scale] : scale));
  m.castShadow = true;
  parent.add(m);
  return m;
}
export const ball = (p, c, pos, s) => {
  const sc = typeof s === 'number' ? [s, s, s] : s;
  return add(p, Math.max(sc[0], sc[1], sc[2]) < 0.16 ? SPHERE_LO : SPHERE, c, pos, sc);
};

export const GOLD = 0xffcf3f;
export const ORANGE = 0xff8a3d;

// a fluffy cloud (unlit white, ignores fog so it always reads as a cloud)
export function makeCloud() {
  const root = new THREE.Group();
  const white = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false });
  for (const [x, y, s] of [[0, 0, 2.2], [2, -0.2, 1.7], [-2, -0.3, 1.6], [0.8, 0.8, 1.5]])
    add(root, SPHERE, white, [x, y, 0], [s, s * 0.75, s]).castShadow = false;
  return root;
}

export function makeButterfly(color) {
  const root = new THREE.Group();
  const wings = [];
  for (const s of [-1, 1]) {
    const w = new THREE.Group();
    root.add(w);
    const m = ball(w, color, [s * 0.1, 0, 0], [0.11, 0.015, 0.09]);
    m.castShadow = false;
    wings.push(w);
  }
  ball(root, 0x5b4a6a, [0, 0, 0], [0.025, 0.025, 0.09]).castShadow = false;
  root.userData.wings = wings;
  return root;
}
