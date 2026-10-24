// Day 2: the cosy home cave. Hay beds, a fire, glowing crystals, a colour puddle, and the sunny way out.
import * as THREE from 'three';
import { mat, add, ball, CYL, CONE, SPHERE } from '../models.js';
import { Dino } from '../dinos.js';
import { makeCampfire, makeCrystal, makeGlow, makeRock, makeBoulder, bake } from '../scenery.js';
import { rng, place, ground, circleClamp } from './util.js';

const R = 11;

function paintingTexture() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#d9b98a';
  g.fillRect(0, 0, 512, 256);
  g.strokeStyle = '#7a3b22';
  g.fillStyle = '#7a3b22';
  g.lineWidth = 7;
  g.lineCap = 'round';
  // sun
  g.beginPath();
  g.arc(80, 70, 28, 0, 7);
  g.stroke();
  for (let i = 0; i < 10; i++) {
    g.beginPath();
    g.moveTo(80 + Math.cos(i * 0.63) * 38, 70 + Math.sin(i * 0.63) * 38);
    g.lineTo(80 + Math.cos(i * 0.63) * 56, 70 + Math.sin(i * 0.63) * 56);
    g.stroke();
  }
  // a long-neck dino and a little one
  g.beginPath();
  g.ellipse(250, 170, 60, 32, 0, 0, 7);
  g.stroke();
  g.beginPath();
  g.moveTo(300, 150);
  g.quadraticCurveTo(330, 80, 360, 70);
  g.stroke();
  g.beginPath();
  g.arc(368, 68, 9, 0, 7);
  g.stroke();
  g.beginPath();
  g.moveTo(195, 168);
  g.quadraticCurveTo(150, 175, 125, 205);
  g.stroke();
  for (const x of [215, 240, 275, 295]) {
    g.beginPath();
    g.moveTo(x, 195);
    g.lineTo(x, 235);
    g.stroke();
  }
  g.beginPath();
  g.ellipse(430, 205, 28, 18, 0, 0, 7);
  g.stroke();
  g.beginPath();
  g.arc(462, 192, 10, 0, 7);
  g.stroke();
  // hand prints
  for (const [x, y] of [[420, 70], [460, 100], [400, 110]]) {
    g.beginPath();
    g.arc(x, y, 14, 0, 7);
    g.fill();
    for (let i = 0; i < 4; i++) {
      g.beginPath();
      g.arc(x - 12 + i * 8, y - 18, 4, 0, 7);
      g.fill();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function buildCave(game) {
  const g = new THREE.Group();
  const rand = rng(21);
  const colliders = [];
  const block = (x, z, r) => colliders.push({ x, z, r });

  ground(g, 0x6e5a48, 0xcdb48a, R + 0.5);
  const decor = new THREE.Group();

  // cave walls: a ring of big rocks (open at the camera side)
  const wallM = [mat(0x7a6a62), mat(0x6a5b54), mat(0x8a7a70)];
  for (let i = 0; i < 46; i++) {
    const a = Math.PI - 0.15 + (i / 45) * (Math.PI + 0.3);
    const r = R + 1.2 + rand() * 1.4;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const h = 5 + rand() * 5;
    const rk = add(decor, SPHERE, wallM[i % 3], [x, h * 0.35, z], [2.6 + rand() * 1.4, h * 0.5, 2.6 + rand() * 1.4]);
    rk.castShadow = false;
  }
  // the stone ring on the floor edge
  for (let i = 0; i < 30; i++) {
    const a = (i / 30) * Math.PI * 2;
    place(decor, makeRock(0x8a7a70, 0.8 + rand() * 0.6, rand), Math.cos(a) * (R + 0.2), Math.sin(a) * (R + 0.2));
  }
  // stalagmites
  for (let i = 0; i < 14; i++) {
    const a = Math.PI + 0.3 + rand() * (Math.PI - 0.6);
    const r = 8 + rand() * 2.2;
    const h = 1 + rand() * 1.6;
    add(decor, CONE, 0x9a8a80, [Math.cos(a) * r, h / 2, Math.sin(a) * r], [0.5 + rand() * 0.3, h, 0.5 + rand() * 0.3]);
  }
  g.add(bake(decor));

  // the sunny way out (north), with light spilling in
  const door = new THREE.Group();
  const light = new THREE.Mesh(new THREE.CircleGeometry(3.4, 28), new THREE.MeshBasicMaterial({ color: 0xfff6c8, fog: false }));
  light.position.set(0, 3.2, 0);
  door.add(light);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(3.5, 0.5, 8, 28), mat(0x7a6a62));
  rim.position.set(0, 3.2, 0.1);
  door.add(rim);
  const beam = new THREE.Mesh(new THREE.PlaneGeometry(6, 9), new THREE.MeshBasicMaterial({ color: 0xfff2b0, transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  beam.rotation.x = -Math.PI / 2;
  beam.position.set(0, 0.05, 4.5);
  door.add(beam);
  const dg = makeGlow(0xfff2b0, 12);
  dg.position.set(0, 3.2, 1);
  door.add(dg);
  place(g, door, 0, -R - 1.4);
  const doorPos = new THREE.Vector3(0, 0, -R + 1.6);

  // cave painting on the back wall
  const paint = new THREE.Mesh(new THREE.PlaneGeometry(9, 4.5), new THREE.MeshBasicMaterial({ map: paintingTexture(), fog: false }));
  paint.position.set(-8.5, 3.5, -7.5);
  paint.rotation.y = 0.9;
  g.add(paint);

  // a fire in the middle
  const fire = makeCampfire();
  fire.userData.fire.visible = true;
  place(g, fire, 0, 1.5, { scale: 1.2 });
  block(0, 1.5, 1.4);
  const fireGlow = makeGlow(0xffa94d, 9);
  fireGlow.position.set(0, 1.2, 1.5);
  g.add(fireGlow);

  // glowing crystals
  [[-9, -3, 0x6ad7ff], [9.2, -4, 0xc9a6ff], [-7, 6, 0xff9ac7], [8, 5, 0x7be37a], [4, -9.4, 0x6ad7ff], [-3.5, -9.6, 0xffd23f]].forEach(([x, z, c], i) => {
    place(g, makeCrystal(c, 1.4), x, z);
    const gl = makeGlow(c, 4.2);
    gl.position.set(x, 1.0, z);
    g.add(gl);
    block(x, z, 0.8);
  });

  // hay beds: one for each sleeper
  const bedSpots = [[-6.5, 2.2], [6.5, -0.8], [-1.5, -6.5]];
  bedSpots.forEach(([x, z], i) => {
    const bed = new THREE.Group();
    add(bed, CYL, 0xe6c46a, [0, 0.12, 0], [1.7, 0.24, 1.7]);
    for (let k = 0; k < 14; k++) {
      const a = (k / 14) * Math.PI * 2;
      add(bed, CYL, 0xd4ae4f, [Math.cos(a) * 1.5, 0.3, Math.sin(a) * 1.5], [0.08, 0.8, 0.08]).rotation.set(Math.PI / 2, 0, -a);
    }
    place(g, bed, x, z);
  });

  // the sleepy friends
  const sleepers = [['tri', 1.6, 1], ['steg', 1.7, -1], ['pachy', 1.7, 0.4]].map(([sp, h, hd], i) => {
    const c = new Dino(sp, h);
    c.root.position.set(bedSpots[i][0], 0.14, bedSpots[i][1]);
    c.heading = hd;
    c.root.rotation.y = hd;
    c.play('sleep');
    g.add(c.root);
    game.addCritter(c);
    return c;
  });

  // the colour puddle (our mirror)
  const pond = new THREE.Group();
  const water = add(pond, CYL, new THREE.MeshToonMaterial({ color: 0xaee8ff, emissive: 0x4aa8d8, emissiveIntensity: 0.5 }), [0, 0.06, 0], [1.5, 0.08, 1.5]);
  water.castShadow = false;
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    ball(pond, 0xb9b0a6, [Math.cos(a) * 1.55, 0.14, Math.sin(a) * 1.55], [0.3, 0.22, 0.3]);
  }
  place(g, pond, 6, 6.5);
  block(6, 6.5, 1.6);
  const wardrobePos = new THREE.Vector3(6, 0, 6.5);

  const update = (dt, t) => {
    fireGlow.material.opacity = 0.75 + Math.sin(t * 9) * 0.15;
    beam.material.opacity = 0.2 + Math.sin(t * 2) * 0.05;
    const fl = fire.userData.fire.userData.flame;
    fl[0].scale.y = 0.6 * 1.5 * (1 + Math.sin(t * 11) * 0.12);
    fl[1].scale.y = 0.4 * 1.5 * (1 + Math.sin(t * 14 + 1) * 0.15);
  };

  return {
    name: 'cave',
    group: g,
    bg: 0x2a1f24,
    fog: { color: 0x2a1f24, near: 22, far: 60 },
    light: { hemi: 0.75, hemiColor: 0xffe2c4, hemiGround: 0x8a6a50, sun: 0.95, sunColor: 0xffd9a8 },
    camScale: 0.9,
    spawn: new THREE.Vector3(0, 0, 8),
    heading: Math.PI,
    clamp: circleClamp(R),
    colliders,
    update,
    sleepers, doorPos, wardrobePos,
  };
}
