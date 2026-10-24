// Dev-only page (npm run dev -> /gallery.html): every dino species and hat in a row, for checking the models.
import * as THREE from 'three';
import { Dino, SPECIES_LIST, makeDinoKid, HAT_ICONS } from './dinos.js';

const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.shadowMap.enabled = true;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfe6ff);
scene.add(new THREE.HemisphereLight(0xffffff, 0xbfe8a8, 0.9));
const sun = new THREE.DirectionalLight(0xfff3d6, 1.5);
sun.position.set(6, 12, 8);
sun.castShadow = true;
sun.shadow.camera.left = sun.shadow.camera.bottom = -20;
sun.shadow.camera.right = sun.shadow.camera.top = 20;
scene.add(sun);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshToonMaterial({ color: 0xa9ee86 }));
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const q = new URLSearchParams(location.search);
const mode = q.get('mode') || 'species';
const things = [];
if (mode === 'species') {
  SPECIES_LIST.forEach((s, i) => {
    const d = new Dino(s, 2.0);
    d.root.position.set((i % 5) * 6 - 12, 0, Math.floor(i / 5) * 7 - 7);
    d.root.rotation.y = 0.5;
    scene.add(d.root);
    things.push((dt) => d.update(dt));
    if (q.get('walk')) d.play('dance');
  });
} else {
  HAT_ICONS.forEach((_, i) => {
    const k = makeDinoKid({ skin: i, hat: i });
    k.position.set((i % 6) * 3 - 7.5, 0, Math.floor(i / 6) * 3.4);
    k.rotation.y = 0.35;
    scene.add(k);
    let t = 0;
    things.push((dt) => k.userData.animate(dt, 0, (t += dt)));
  });
}
const cam = new THREE.PerspectiveCamera(40, 1, 0.1, 200);
cam.position.set(0, mode === "species" ? 11 : 4, mode === "species" ? 26 : 16);
cam.lookAt(0, 1.0, -1);
function resize() {
  renderer.setSize(innerWidth, innerHeight, false);
  cam.aspect = innerWidth / innerHeight;
  cam.updateProjectionMatrix();
}
resize();
addEventListener('resize', resize);
const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = Math.min(0.05, clock.getDelta());
  things.forEach((f) => f(dt));
  renderer.render(scene, cam);
});
window.__ready = true;
