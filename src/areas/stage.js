// Day 13: an open-air stage with curtains and spotlights. Instruments to find, drum pads to stomp, an audience.
import * as THREE from 'three';
import { mat, add, ball, CYL, CONE, BOX, SPHERE } from '../models.js';
import { Dino } from '../dinos.js';
import { makeFern, makePalm, makeConifer, makeRock, makeDrum, makeHorn, makeMaraca, makeGlow, makeBanner, bake } from '../scenery.js';
import { rng, place, ground, circleClamp, scatter, boulderRing, tufts, skyLife } from './util.js';

const R = 15;

export function buildStage(game) {
  const g = new THREE.Group();
  const rand = rng(141);
  const colliders = [];
  const block = (x, z, r) => colliders.push({ x, z, r });

  ground(g, 0x8fdc6a, 0xc9b88a, R + 1);
  tufts(g, rand, 160, R + 3);

  const decor = new THREE.Group();
  boulderRing(decor, rand, R + 0.5, 0x9aa3ad, 44);
  const far = (x, z) => z > 4 || Math.hypot(x, z) < R + 2;
  scatter(rand, 12, R + 2.5, R + 16, (x, z) => place(decor, makePalm(rand, 4 + rand() * 2), x, z, { rot: rand() * 6 }), far);
  scatter(rand, 12, R + 3, R + 20, (x, z) => place(decor, makeConifer(rand, 5 + rand() * 4), x, z, { rot: rand() * 6 }), far);
  scatter(rand, 16, 3, R, (x, z) => place(decor, makeFern(rand, 1 + rand() * 0.5), x, z, { rot: rand() * 6 }), (x, z) => z > 7 || Math.abs(x) < 6.5 && z < -3);
  g.add(bake(decor));

  // the stage (north)
  const stagePos = new THREE.Vector3(0, 0, -7.5);
  const stage = new THREE.Group();
  add(stage, BOX, 0xc9a07a, [0, 0.4, 0], [9, 0.8, 5]);
  add(stage, BOX, 0xe84545, [0, 0.82, 0.1], [8.6, 0.05, 4.6]);
  for (const sx of [-1, 1]) {
    add(stage, CYL, 0x7a5230, [sx * 4.7, 3, -2.4], [0.18, 6, 0.18]);
    add(stage, new THREE.CylinderGeometry(0.6, 0.6, 1.6, 12), mat(0x6b6f78), [sx * 5.4, 0.8, 1.0]);
    ball(stage, 0x2b2236, [sx * 5.4, 1.6, 1.0], 0.38);
  }
  add(stage, CYL, 0x7a5230, [0, 6, -2.4], [0.16, 9.4, 0.16]).rotation.z = Math.PI / 2;
  place(g, stage, stagePos.x, stagePos.z);
  block(stagePos.x, stagePos.z - 1, 4.0);
  const bunt = makeBanner([0xff5fae, 0xffd23f, 0x6ad7ff, 0x7be37a], 12, 9);
  place(g, bunt, 0, stagePos.z + 0.4, { y: 5.4 });
  // curtains: two panels that slide apart
  const curtL = add(g, BOX, 0xff5f8a, [-2.2, 3.0, stagePos.z + 0.3], [4.4, 5.2, 0.2]);
  const curtR = add(g, BOX, 0xff5f8a, [2.2, 3.0, stagePos.z + 0.3], [4.4, 5.2, 0.2]);
  // a warm spotlight on the stage
  const stageGlow = makeGlow(0xfff1a8, 11);
  stageGlow.position.set(0, 2.4, stagePos.z + 0.8);
  stageGlow.visible = false;
  g.add(stageGlow);
  const beams = [-3, 0, 3].map((x, i) => {
    const b = new THREE.Mesh(new THREE.ConeGeometry(1.6, 9, 16, 1, true), new THREE.MeshBasicMaterial({ color: [0xff8fc7, 0xfff1a8, 0x9be7ff][i], transparent: true, opacity: 0.0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
    b.position.set(x, 5, stagePos.z + 0.8);
    b.rotation.x = Math.PI;
    g.add(b);
    return b;
  });

  // instruments to find
  const spots = [[-9.5, 4], [10, 2], [-4, -2]];
  const makers = [makeDrum, makeHorn, makeMaraca];
  const kinds = ['drum', 'horn', 'shaker'];
  const finds = spots.map(([x, z], i) => {
    const o = makers[i]();
    o.scale.setScalar(1.6);
    place(g, o, x, z, { rot: rand() * 6 });
    const gl = makeGlow(0xfff1a8, 2.8);
    gl.position.set(x, 0.9, z);
    g.add(gl);
    return { group: o, glow: gl, kind: kinds[i], pos: new THREE.Vector3(x, 0, z), taken: false };
  });

  // glowing drum pads on the ground in front of the stage
  const marks = [[-4, 0.5, 0xff7aa8], [0, 2.2, 0xffe066], [4, 0.5, 0x6ad7ff]].map(([x, z, c]) => {
    const m = new THREE.Mesh(new THREE.CircleGeometry(1.2, 28), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.5, depthWrite: false }));
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, 0.07, z);
    m.visible = false;
    g.add(m);
    return m;
  });

  // the audience
  const friends = [['para', 2.5, -10.8, -1.5, 1.0], ['tri', 1.7, 10.8, -0.5, -1.0], ['anky', 1.3, 8.4, 5.5, -2.2], ['pachy', 1.8, -8.6, 5.8, 2.2]].map(([sp, h, x, z, hd]) => {
    const c = new Dino(sp, h);
    c.root.position.set(x, 0, z);
    c.heading = hd;
    c.root.rotation.y = hd;
    g.add(c.root);
    game.addCritter(c);
    return c;
  });

  const sky = skyLife(game, g, rand, { flyers: 2 });
  const update = (dt, t) => {
    sky(dt, t);
    finds.forEach((f, i) => {
      if (f.taken) return;
      f.glow.material.opacity = 0.7 + Math.sin(t * 4 + i) * 0.2;
      f.group.position.y = Math.sin(t * 2 + i) * 0.08;
    });
    marks.forEach((m, i) => {
      if (m.visible && m.material.opacity < 1) m.material.opacity = 0.45 + Math.sin(t * 4 + i) * 0.2;
    });
    if (stageGlow.visible) {
      stageGlow.material.opacity = 0.7 + Math.sin(t * 5) * 0.1;
      beams.forEach((b, i) => (b.material.opacity = 0.16 + Math.sin(t * 3 + i * 2) * 0.08));
      beams.forEach((b, i) => (b.rotation.z = Math.sin(t * 1.5 + i) * 0.25));
    }
  };

  return {
    name: 'stage',
    group: g,
    bg: 0xbfe6ff,
    fog: { color: 0xcdeeff, near: 36, far: 110 },
    camScale: 1,
    spawn: new THREE.Vector3(0, 0, 9),
    heading: Math.PI,
    clamp: circleClamp(R),
    colliders,
    update,
    stagePos, stageSpot: new THREE.Vector3(0, 0.85, stagePos.z + 0.2), curtL, curtR, stageGlow, beams, finds, marks, friends,
  };
}
