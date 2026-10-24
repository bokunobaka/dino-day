// Dino Valley: home base. Stations for the pet nest, egg nests, photo spot, pterodactyl perch, stomp pad,
// fossil book, day map signpost and the colour-and-hat puddle mirror.
import * as THREE from 'three';
import { mat, add, ball, makeButterfly, CYL, BOX, CONE, SPHERE, GOLD } from '../models.js';
import { Dino } from '../dinos.js';
import { makeFern, makePalm, makeConifer, makeBigTree, makeBush, makeMushroom, makeRock, makeBoulder, makeVolcano, makeMountains, makeEgg, makeNest, makeFootprint, bake } from '../scenery.js';
import { rng, place, ground, circleClamp, scatter, boulderRing, tufts, skyLife, volcanoSmoke } from './util.js';

const R = 16.5;

export const EGG_LOOKS = {
  rex: [0xfff1d6, 0x58c26b],
  tri: [0xe6f3ff, 0xf2a65a],
  steg: [0xfff0f8, 0x9a7be0],
  raptor: [0xfff6d6, 0xf0735a],
  anky: [0xf0ffe6, 0x6fbf9a],
  pachy: [0xfff0f4, 0xe880b0],
};

function backdropTexture(kind) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 192;
  const g = c.getContext('2d');
  if (kind === 0) {
    // an erupting volcano
    const sky = g.createLinearGradient(0, 0, 0, 192);
    sky.addColorStop(0, '#ffb26b');
    sky.addColorStop(1, '#ffe9b8');
    g.fillStyle = sky;
    g.fillRect(0, 0, 256, 192);
    g.fillStyle = '#7a5a52';
    g.beginPath();
    g.moveTo(40, 192);
    g.lineTo(104, 74);
    g.lineTo(152, 74);
    g.lineTo(216, 192);
    g.fill();
    g.fillStyle = '#ff5a1f';
    g.beginPath();
    g.ellipse(128, 74, 26, 8, 0, 0, 7);
    g.fill();
    for (let i = 0; i < 12; i++) {
      g.fillStyle = i % 2 ? '#ff9a2e' : '#ff5a1f';
      g.beginPath();
      g.arc(128 + Math.sin(i * 1.9) * 40, 50 - ((i * 13) % 40), 5 + (i % 3) * 2, 0, 7);
      g.fill();
    }
    g.fillStyle = '#8fdc86';
    g.fillRect(0, 170, 256, 22);
  } else if (kind === 1) {
    // jungle
    g.fillStyle = '#bfeeff';
    g.fillRect(0, 0, 256, 192);
    g.fillStyle = '#8fdc86';
    g.beginPath();
    g.ellipse(128, 215, 200, 80, 0, 0, 7);
    g.fill();
    for (const [x, h] of [[40, 110], [90, 130], [190, 120], [230, 100]]) {
      g.fillStyle = '#9b6b43';
      g.fillRect(x - 5, 192 - h, 10, h);
      g.fillStyle = '#3fa653';
      for (let i = 0; i < 6; i++) {
        g.beginPath();
        g.ellipse(x + Math.cos(i) * 26, 192 - h + Math.sin(i) * 8, 30, 8, i, 0, 7);
        g.fill();
      }
    }
    g.fillStyle = '#ffe35a';
    g.beginPath();
    g.arc(128, 40, 22, 0, 7);
    g.fill();
  } else {
    // night sky with stars and a moon
    g.fillStyle = '#2b2a6b';
    g.fillRect(0, 0, 256, 192);
    g.fillStyle = '#fff6c4';
    for (let i = 0; i < 40; i++) {
      g.beginPath();
      g.arc((i * 71) % 256, (i * 37) % 170, 1 + (i % 3), 0, 7);
      g.fill();
    }
    g.beginPath();
    g.arc(190, 50, 26, 0, 7);
    g.fill();
    g.fillStyle = '#2b2a6b';
    g.beginPath();
    g.arc(200, 44, 22, 0, 7);
    g.fill();
    g.fillStyle = '#1b1a47';
    g.beginPath();
    g.ellipse(60, 200, 90, 40, 0, 0, 7);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function buildValley(game) {
  const g = new THREE.Group();
  const rand = rng(5);
  const colliders = [];
  const block = (x, z, r) => colliders.push({ x, z, r });

  ground(g, 0x8fdc6a, 0xa0e87a, R + 1.5);
  tufts(g, rand, 300, R + 3);

  const decor = new THREE.Group();
  boulderRing(decor, rand, R + 0.6, 0x8e98a3, 48);
  // stepping stones from the gate to the geyser
  for (let i = 0; i < 10; i++) {
    const s = add(decor, CYL, 0xe7d8b4, [Math.sin(i * 1.3) * 0.5, 0.03, 10 - i * 1.3], [0.6, 0.05, 0.45]);
    s.castShadow = false;
    s.receiveShadow = true;
  }
  const far = (x, z) => z > 6 || Math.hypot(x, z) < R + 2;
  scatter(rand, 14, R + 2.5, R + 18, (x, z) => place(decor, makePalm(rand, 4 + rand() * 2), x, z, { rot: rand() * 6 }), far);
  scatter(rand, 14, R + 3, R + 22, (x, z) => place(decor, makeConifer(rand, 5 + rand() * 4), x, z, { rot: rand() * 6 }), far);
  scatter(rand, 8, R + 2, R + 14, (x, z) => place(decor, makeBigTree(rand, 5 + rand() * 2), x, z, { rot: rand() * 6 }), far);
  const nearStation = (x, z) => [[-12, -3], [11.5, -3], [-6.3, -11], [7.5, -12.5], [-9, 6], [9, 6.5], [-4.5, 7], [4, 7.5], [0, -4.5], [0, 10]].some(([a, b]) => Math.hypot(x - a, z - b) < 3.6);
  scatter(rand, 30, 3, R + 1, (x, z) => place(decor, makeFern(rand, 1 + rand() * 0.5), x, z, { rot: rand() * 6 }), nearStation);
  scatter(rand, 10, 4, R, (x, z, i) => place(decor, makeMushroom([0xff6b6b, 0xffb347, 0xc9a6ff][i % 3], 1 + rand() * 0.5), x, z), nearStation);
  scatter(rand, 6, 4, R - 1, (x, z, i) => {
    place(decor, makeBush(i % 2 ? 0x5b6bff : 0xff4d6d, rand), x, z, { rot: rand() * 6, scale: 1.1 });
    block(x, z, 0.8);
  }, (x, z) => nearStation(x, z) || z > 5);
  g.add(bake(decor));

  // far away: mountains, the big volcano and sky life
  g.add(makeMountains(rand, 10, 56));
  place(g, makeVolcano(24), -22, -58);
  const smokeUp = volcanoSmoke(g, -22, 27, -58);
  const sky = skyLife(game, g, rand, { flyers: 3 });

  // the home cave: a big rock dome with a dark mouth
  {
    const cave = new THREE.Group();
    const rockM = mat(0x9a8f88);
    add(cave, SPHERE, rockM, [0, 3, 0], [9, 6.5, 6]);
    add(cave, SPHERE, rockM, [-6.5, 2, 0.5], [4.5, 4, 4]);
    add(cave, SPHERE, rockM, [6.5, 2.2, 0.5], [4.2, 4.4, 4]);
    const mouth = add(cave, SPHERE, new THREE.MeshBasicMaterial({ color: 0x20141a }), [0, 1.6, 5.2], [2.4, 2.8, 1.2]);
    mouth.castShadow = false;
    for (const s of [-1, 1]) add(cave, CYL, 0x7a5230, [s * 3.4, 2, 5.6], [0.14, 4, 0.14]);
    add(cave, BOX, 0xff9a4d, [0, 3.7, 5.8], [7, 0.8, 0.12]);
    for (let i = 0; i < 6; i++) {
      const f = add(cave, CONE, [0xff5fae, 0xffd23f, 0x6ad7ff][i % 3], [-3 + i * 1.2, 3.1, 5.9], [0.3, 0.7, 0.05]);
      f.rotation.z = Math.PI;
    }
    place(g, cave, 0, -24, { scale: 1.5 });
  }

  const stations = {};

  // ---- geyser pond (centre)
  {
    const f = new THREE.Group();
    add(f, CYL, 0x8e98a3, [0, 0.3, 0], [2.0, 0.6, 2.0]);
    add(f, CYL, 0x6fd3ff, [0, 0.55, 0], [1.75, 0.1, 1.75]).castShadow = false;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      ball(f, 0x9aa3ad + (i % 3) * 0x080808, [Math.cos(a) * 2.0, 0.5, Math.sin(a) * 2.0], [0.34, 0.3, 0.34]);
    }
    place(g, f, 0, -4.5);
    block(0, -4.5, 2.4);
  }

  // ---- pterodactyl perch (west)
  {
    const perch = new THREE.Group();
    add(perch, new THREE.CylinderGeometry(1.1, 1.7, 3.4, 9), mat(0x9a8f88), [0, 1.7, 0]);
    add(perch, new THREE.CylinderGeometry(1.7, 1.4, 0.5, 9), mat(0xaaa097), [0, 3.5, 0]);
    place(g, perch, -12.2, -3);
    block(-12.2, -3, 1.9);
    const bird = new Dino('ptero', 3.4);
    bird.root.position.set(-12.2, 3.7, -3);
    bird.root.rotation.y = Math.PI / 2;
    bird.heading = Math.PI / 2;
    g.add(bird.root);
    game.addCritter(bird);
    stations.perch = { pos: new THREE.Vector3(-9.6, 0, -3), group: bird.root, bird };
  }

  // ---- stomp pad (east)
  {
    const d = new THREE.Group();
    add(d, CYL, 0xbfae92, [0, 0.08, 0], [3.4, 0.16, 3.4]);
    [0x6fd06f, 0xffb347, 0xffe66b, 0xff7aa8, 0x6ad7ff, 0xb48cff].forEach((c, i) => {
      const a = (i / 6) * Math.PI * 2;
      const fp = makeFootprint(c, 1.1);
      fp.position.set(Math.cos(a) * 2.0, 0.14, Math.sin(a) * 2.0);
      fp.rotation.y = -a + Math.PI;
      fp.userData.mat.opacity = 0.9;
      d.add(fp);
    });
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      add(d, CYL, 0x7a5230, [Math.cos(a) * 3.1, 1.2, Math.sin(a) * 3.1], [0.16, 2.4, 0.16]);
      const fl = add(d, CONE, [0xff5fae, 0xffd23f, 0x6ad7ff, 0x7be37a][i], [Math.cos(a) * 3.1, 2.7, Math.sin(a) * 3.1], [0.4, 0.7, 0.05]);
      fl.rotation.z = Math.PI / 2;
    }
    place(g, d, 11.5, -3);
    stations.dance = { pos: new THREE.Vector3(8.2, 0, -3), group: d };
  }

  // ---- egg nests (north-west)
  const plots = [];
  [-9.5, -6.3, -3.1].forEach((x, i) => {
    const nest = makeNest(1.25);
    place(g, nest, x, -11);
    const holder = new THREE.Group();
    holder.position.set(x, 0.28, -11);
    g.add(holder);
    plots.push({ bed: nest, holder, pos: new THREE.Vector3(x, 0, -9.4), x, z: -11, shown: '' });
    block(x, -11, 1.3);
  });
  const setPlot = (i, state) => {
    const p = plots[i];
    const key = state ? `${state.type}${state.stage}` : '';
    if (p.shown === key) return;
    p.shown = key;
    p.holder.clear();
    p.egg = null;
    p.baby = null;
    if (!state) return;
    const [shell, spot] = EGG_LOOKS[state.type] || EGG_LOOKS.rex;
    if (state.stage < 3) {
      const egg = makeEgg(shell, spot, [0.8, 1.0, 1.25][state.stage]);
      if (state.stage === 2) {
        // a crack across the shell
        for (let k = 0; k < 4; k++) {
          const c = add(egg, BOX, 0x4a3326, [(k % 2 ? 0.05 : -0.05) * 1.3, 0.66 + k * 0.05, 0.3 - k * 0.012], [0.12, 0.025, 0.02]);
          c.rotation.z = k % 2 ? 0.7 : -0.7;
          c.castShadow = false;
        }
      }
      p.holder.add(egg);
      p.egg = egg;
    } else {
      const baby = new Dino(state.type, 1.15, { baby: true });
      baby.root.rotation.y = Math.PI / 2 + i * 0.4;
      baby.heading = baby.root.rotation.y;
      p.holder.add(baby.root);
      p.baby = baby;
    }
  };
  stations.plots = plots;

  // ---- photo spot (north-east)
  const booth = new THREE.Group();
  const panelMat = new THREE.MeshBasicMaterial({ map: backdropTexture(0) });
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(6, 4.5), panelMat);
  panel.position.set(0, 2.6, 0);
  booth.add(panel);
  add(booth, CYL, 0x7a5230, [-3.1, 2.6, 0], [0.16, 4.7, 0.16]);
  add(booth, CYL, 0x7a5230, [3.1, 2.6, 0], [0.16, 4.7, 0.16]);
  add(booth, CYL, 0x7a5230, [0, 5.0, 0], [0.16, 6.5, 0.16]).rotation.z = Math.PI / 2;
  add(booth, BOX, 0xe7d8b4, [0, 0.06, 2.2], [6, 0.12, 4.4]);
  place(g, booth, 7.5, -12.5);
  const cam = new THREE.Group();
  add(cam, CYL, 0x555555, [0, 0.7, 0], [0.05, 1.4, 0.05]);
  add(cam, BOX, 0x2b2236, [0, 1.5, 0], [0.7, 0.5, 0.45]);
  add(cam, SPHERE, 0x9bd1ff, [0, 1.5, 0.3], 0.18);
  place(g, cam, 4.6, -8.2, { rot: -0.5 });
  stations.booth = {
    pos: new THREE.Vector3(7.5, 0, -8.4),
    standAt: new THREE.Vector3(7.5, 0, -10.3),
    camPos: new THREE.Vector3(7.5, 2.6, -4.9),
    camLook: new THREE.Vector3(7.5, 1.6, -10.3),
    group: cam,
    setBackdrop: (i) => {
      panelMat.map = backdropTexture(i);
      panelMat.needsUpdate = true;
    },
  };

  // ---- fossil book on a stone lectern (south-west)
  {
    const l = new THREE.Group();
    add(l, CYL, 0x9a8f88, [0, 0.7, 0], [0.4, 1.4, 0.4]);
    const top = add(l, BOX, 0xaaa097, [0, 1.5, 0], [1.3, 0.14, 0.9]);
    top.rotation.x = -0.35;
    const book = add(l, BOX, 0x27ae60, [0, 1.62, 0.02], [1.0, 0.14, 0.7]);
    book.rotation.x = -0.35;
    add(l, BOX, 0xfff6dd, [0, 1.7, 0.02], [0.9, 0.05, 0.62]).rotation.x = -0.35;
    place(l, makeBoneIcon(), 0, 0.02, { y: 1.78 });
    place(g, l, -9, 6, { rot: 0.4 });
    block(-9, 6, 0.8);
    stations.book = { pos: new THREE.Vector3(-9, 0, 6), group: l };
  }

  // ---- day map signpost (south-east)
  {
    const s = new THREE.Group();
    add(s, CYL, 0x9b6b43, [0, 1.6, 0], [0.14, 3.2, 0.14]);
    [[2.7, 0.2, 0xff9a4d], [2.2, -0.15, 0x6ad7ff], [1.7, 0.1, 0xffd23f]].forEach(([y, r, c]) => {
      const a = add(s, BOX, c, [0.5, y, 0], [1.0, 0.36, 0.08]);
      a.rotation.y = r;
      add(s, CONE, c, [1.1, y, 0], [0.22, 0.4, 0.08]).rotation.z = -Math.PI / 2;
    });
    place(g, s, 9, 6.5, { rot: -0.4 });
    block(9, 6.5, 0.6);
    stations.map = { pos: new THREE.Vector3(9, 0, 6.5), group: s };
  }

  // ---- pet corner: a snug little cave (south)
  {
    const k = new THREE.Group();
    add(k, SPHERE, mat(0x9a8f88), [0, 0.8, 0], [1.5, 1.2, 1.3]);
    add(k, SPHERE, new THREE.MeshBasicMaterial({ color: 0x20141a }), [0, 0.55, 1.05], [0.6, 0.6, 0.3]).castShadow = false;
    add(k, CONE, 0x7bd96f, [0.9, 1.7, 0], [0.3, 0.6, 0.3]);
    place(g, k, -4.5, 7);
    block(-4.5, 7, 1.4);
    stations.kennel = { pos: new THREE.Vector3(-4.5, 0, 7), group: k };
  }

  // ---- colour-and-hat puddle (south)
  {
    const m = new THREE.Group();
    const water = add(m, CYL, new THREE.MeshToonMaterial({ color: 0xaee8ff, emissive: 0x4aa8d8, emissiveIntensity: 0.4 }), [0, 0.06, 0], [1.2, 0.08, 1.2]);
    water.castShadow = false;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      ball(m, 0xb9b0a6, [Math.cos(a) * 1.25, 0.14, Math.sin(a) * 1.25], [0.28, 0.2, 0.28]);
    }
    // a hat floating on it, as the sign
    const hat = add(m, CONE, 0xff5fae, [0, 0.35, 0], [0.22, 0.5, 0.22]);
    place(g, m, 4, 7.5);
    block(4, 7.5, 1.4);
    stations.mirror = { pos: new THREE.Vector3(4, 0, 7.5), group: m, water, hat };
  }

  const flies = [0xff9a4d, 0xffd166, 0x9bd1ff, 0xc8a6ff].map((c, i) => {
    const b = makeButterfly(c);
    g.add(b);
    return { mesh: b, a: rand() * 6, r: 5 + rand() * 8, h: 1.3 + rand(), sp: 0.2 + rand() * 0.2, i };
  });

  let geyserClock = 0;
  const update = (dt, t) => {
    sky(dt, t);
    smokeUp(dt);
    for (const b of flies) {
      b.a += dt * b.sp;
      b.mesh.position.set(Math.cos(b.a) * b.r, b.h + Math.sin(t * 2 + b.i) * 0.3, Math.sin(b.a * 1.3) * b.r * 0.8 - 2);
      b.mesh.rotation.y = -b.a * 1.3 + Math.PI / 2;
      const flap = Math.sin(t * 22 + b.i) * 0.9;
      b.mesh.userData.wings[0].rotation.z = flap;
      b.mesh.userData.wings[1].rotation.z = -flap;
    }
    geyserClock -= dt;
    if (geyserClock <= 0) {
      geyserClock = 0.07;
      game.sparkles.emit(0, 1.4, -4.5, 2, { speed: 0.8, up: 4.2, life: 1.1, colors: [0x9be7ff, 0xffffff], gravity: 7, spread: 0.1 });
    }
    stations.mirror.hat.position.y = 0.4 + Math.sin(t * 2) * 0.05;
    stations.mirror.hat.rotation.y = t;
    for (const p of plots) {
      if (p.egg) {
        const k = p.shown.endsWith('1') ? 0.08 : p.shown.endsWith('2') ? 0.18 : 0.0;
        p.egg.rotation.z = Math.sin(t * 7 + p.x) * k;
      }
      if (p.baby) p.baby.update(dt);
    }
  };

  return {
    name: 'valley',
    group: g,
    bg: 0xbfe6ff,
    fog: { color: 0xcdeeff, near: 34, far: 100 },
    camScale: 1,
    spawn: new THREE.Vector3(0, 0, 10.5),
    heading: Math.PI,
    clamp: circleClamp(R),
    colliders,
    update,
    stations,
    setPlot,
  };
}

function makeBoneIcon() {
  const r = new THREE.Group();
  add(r, CYL, 0xfff6dd, [0, 0, 0], [0.05, 0.5, 0.05]).rotation.z = Math.PI / 2 - 0.4;
  for (const s of [-1, 1]) for (const z of [-0.04, 0.04]) ball(r, 0xfff6dd, [s * 0.23, s * 0.1, z], 0.06);
  return r;
}
