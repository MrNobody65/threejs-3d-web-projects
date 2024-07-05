import * as THREE from "three"
import spline from "./spline.js"
import { EffectComposer } from "jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "jsm/postprocessing/UnrealBloomPass.js";

const w = window.innerWidth
const h = window.innerHeight
const scene = new THREE.Scene()
scene.fog = new THREE.FogExp2(0x000000, 0.3)
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 10)
camera.position.z = 5
const renderer = new THREE.WebGLRenderer()
renderer.setSize(w, h)
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.outputColorSpace = THREE.SRGBColorSpace
document.body.appendChild(renderer.domElement)

const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 1.5, 0.4, 100);
bloomPass.threshold = 0.002;
bloomPass.strength = 1;
bloomPass.radius = 0;
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

const tubeGeo = new THREE.TubeGeometry(spline, 300, 0.65, 20, true)
const edges = new THREE.EdgesGeometry(tubeGeo, 0.2)
const lineMat = new THREE.LineBasicMaterial({ color: 0x8888ff })
const tubeLines = new THREE.LineSegments(edges, lineMat)
scene.add(tubeLines)

const numBoxes = 100
const size = 0.08
const boxGeo = new THREE.BoxGeometry(size, size, size)
for (let i = 0; i < numBoxes; i++) {
    const p = (i / numBoxes + Math.random() * 0.1) % 1
    const pos = tubeGeo.parameters.path.getPointAt(p)
    pos.x += Math.random() - 0.4
    pos.z += Math.random() - 0.4
    const rote = new THREE.Vector3(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
    )
    const edges = new THREE.EdgesGeometry(boxGeo, 0.2)
    const color = new THREE.Color().setHSL(p, 1, 0.5)
    const lineMat = new THREE.LineBasicMaterial({ color: color })
    const boxLines = new THREE.LineSegments(edges, lineMat)
    boxLines.position.copy(pos)
    boxLines.rotation.set(rote.x, rote.y, rote.z)
    scene.add(boxLines)
}

function updateCamera(t) {
    const time = t * 0.016;
    const looptime = 1000;
    const p = (time % looptime) / looptime;
    const pos = tubeGeo.parameters.path.getPointAt(p);
    const lookAt = tubeGeo.parameters.path.getPointAt((p + 0.03) % 1);
    camera.position.copy(pos);
    camera.lookAt(lookAt);
}

function animate(t = 0) {
    requestAnimationFrame(animate)
    updateCamera(t)
    composer.render(scene, camera)
}
animate()

function handleWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', handleWindowResize, false);