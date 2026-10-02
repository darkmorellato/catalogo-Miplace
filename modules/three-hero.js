// ============================================================
// MIPLACE MAGAZINE — three-hero.js
// Experiências 3D (Three.js r186) — escopo editorial:
//   1. Photo-slab: a foto real do produto vira um slab 3D com
//      reflexo que gira com o cursor (em cima do card).
//   2. Orbe líquido: esfera com ondulação + fresnel editorial
//      no cabeçalho de "A Coleção", reagindo ao mouse.
// Módulo ES carregado via import map (vendor/three.module.js).
// Gates: prefers-reduced-motion, pointer fino, WebGL, visibility.
// @ts-check
// ============================================================

import * as THREE from 'three';

const PALETTE = {
    ink: 0x1c1917,
    paper: 0xf4f4f0,
    accent: 0x991b1b
};

/** @type {boolean} */
const REDUCE_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
/** @type {boolean} */
const FINE_POINTER = window.matchMedia('(pointer: fine)').matches;

/** @returns {boolean} */
function hasWebGL() {
    try {
        const canvas = document.createElement('canvas');
        return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
    } catch (_e) {
        return false;
    }
}

/**
 * Ambiente de reflexão discreto (faixa clara de estúdio) para o clearcoat.
 * @param {THREE.WebGLRenderer} renderer
 * @returns {THREE.Texture}
 */
function makeStudioEnv(renderer) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 128;
    const ctx = /** @type {CanvasRenderingContext2D | null} */ (canvas.getContext('2d'));
    if (ctx) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 128);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.42, '#d8d4cd');
        gradient.addColorStop(0.52, '#ffffff');
        gradient.addColorStop(1, '#6b6560');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 128);
    }
    const source = new THREE.CanvasTexture(canvas);
    source.mapping = THREE.EquirectangularReflectionMapping;
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromEquirectangular(source).texture;
    pmrem.dispose();
    source.dispose();
    return env;
}

/**
 * Forma de retângulo arredondado (slab com cantos suaves).
 * @param {number} w
 * @param {number} h
 * @param {number} r
 * @returns {THREE.Shape}
 */
function roundedRectShape(w, h, r) {
    const shape = new THREE.Shape();
    const x = -w / 2;
    const y = -h / 2;
    shape.moveTo(x + r, y);
    shape.lineTo(x + w - r, y);
    shape.quadraticCurveTo(x + w, y, x + w, y + r);
    shape.lineTo(x + w, y + h - r);
    shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    shape.lineTo(x + r, y + h);
    shape.quadraticCurveTo(x, y + h, x, y + h - r);
    shape.lineTo(x, y + r);
    shape.quadraticCurveTo(x, y, x + r, y);
    return shape;
}

/**
 * Normaliza as UVs da face frontal do ExtrudeGeometry (mundo -> 0..1).
 * @param {THREE.BufferGeometry} geometry
 * @param {number} w
 * @param {number} h
 * @returns {void}
 */
function normalizeUVs(geometry, w, h) {
    const uv = geometry.attributes.uv;
    for (let i = 0; i < uv.count; i++) {
        uv.setXY(i, (uv.getX(i) + w / 2) / w, (uv.getY(i) + h / 2) / h);
    }
    uv.needsUpdate = true;
}

// ============================================================
// 1. PHOTO-SLAB — canvas único movido para o card sob hover
// ============================================================

/** @returns {void} */
function initPhotoSlabs() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'three-slab-canvas';
    canvas.setAttribute('aria-hidden', 'true');

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

    const scene = new THREE.Scene();
    scene.environment = makeStudioEnv(renderer);

    const camera = new THREE.PerspectiveCamera(32, 16 / 9, 0.1, 20);
    camera.position.set(0, 0, 3.15);

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 1.9);
    key.position.set(2.2, 3, 4);
    scene.add(key);
    const rim = new THREE.DirectionalLight(PALETTE.paper, 1.1);
    rim.position.set(-3, -1.5, -2);
    scene.add(rim);

    const slabW = 2.42;
    const slabH = slabW * 9 / 16;
    const geometry = new THREE.ExtrudeGeometry(roundedRectShape(slabW, slabH, 0.12), {
        depth: 0.075,
        bevelEnabled: true,
        bevelThickness: 0.014,
        bevelSize: 0.014,
        bevelSegments: 2,
        curveSegments: 10
    });
    geometry.center();
    normalizeUVs(geometry, slabW, slabH);

    const edgeMaterial = new THREE.MeshPhysicalMaterial({
        color: PALETTE.ink,
        roughness: 0.32,
        metalness: 0.62,
        clearcoat: 1,
        clearcoatRoughness: 0.28
    });
    const faceMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.52,
        metalness: 0.06,
        clearcoat: 1,
        clearcoatRoughness: 0.32
    });
    const slab = new THREE.Mesh(geometry, [faceMaterial, edgeMaterial]);
    scene.add(slab);

    /** @type {Map<string, THREE.Texture>} */
    const textureCache = new Map();
    const loader = new THREE.TextureLoader();
    /** @param {string} url @returns {THREE.Texture} */
    function getTexture(url) {
        let tex = textureCache.get(url);
        if (!tex) {
            tex = loader.load(url);
            tex.colorSpace = THREE.SRGBColorSpace;
            textureCache.set(url, tex);
        }
        return tex;
    }

    /** @type {HTMLElement | null} */
    let activeWrap = null;
    let targetRX = 0;
    let targetRY = 0;
    let currentRX = 0;
    let currentRY = 0;
    let running = false;
    let lastW = 0;
    let lastH = 0;

    /** @returns {void} */
    function placeCanvas() {
        if (!activeWrap) return;
        const width = Math.max(1, activeWrap.clientWidth);
        const height = Math.max(1, activeWrap.clientHeight);
        if (width === lastW && height === lastH) return;
        lastW = width;
        lastH = height;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }

    /** @returns {void} */
    function tick() {
        if (!running) return;
        window.requestAnimationFrame(tick);
        if (document.hidden || !activeWrap || !activeWrap.isConnected) {
            if (activeWrap && !activeWrap.isConnected) deactivate();
            return;
        }
        placeCanvas();
        currentRX += (targetRX - currentRX) * 0.12;
        currentRY += (targetRY - currentRY) * 0.12;
        slab.rotation.x = currentRX;
        slab.rotation.y = currentRY;
        renderer.render(scene, camera);
    }

    /** @returns {void} */
    function activate() {
        if (!running) {
            running = true;
            window.requestAnimationFrame(tick);
        }
        canvas.classList.add('is-on');
    }

    /** @returns {void} */
    function deactivate() {
        running = false;
        canvas.classList.remove('is-on');
        activeWrap = null;
        window.setTimeout(() => {
            if (!running && canvas.parentElement !== document.body) {
                document.body.appendChild(canvas);
            }
        }, 380);
    }

    grid.addEventListener('pointerover', (e) => {
        if (!FINE_POINTER) return;
        const target = /** @type {Element} */ (/** @type {unknown} */ (e.target));
        const card = target.closest('[data-tilt]');
        if (!(card instanceof HTMLElement)) return;
        const wrap = card.querySelector('.product-img-wrap');
        const img = wrap ? wrap.querySelector('img') : null;
        if (!(wrap instanceof HTMLElement) || !(img instanceof HTMLImageElement)) return;
        const url = img.getAttribute('src');
        if (!url) return;
        if (activeWrap !== wrap) {
            activeWrap = wrap;
            faceMaterial.map = getTexture(url);
            faceMaterial.needsUpdate = true;
            currentRX = 0;
            currentRY = 0;
            lastW = 0;
            lastH = 0;
            wrap.appendChild(canvas);
            placeCanvas();
        }
        activate();
    });

    grid.addEventListener('pointerout', (e) => {
        const target = /** @type {Element} */ (/** @type {unknown} */ (e.target));
        const card = target.closest('[data-tilt]');
        if (!card) return;
        const to = e.relatedTarget;
        if (to instanceof Node && card.contains(to)) return;
        deactivate();
    });

    grid.addEventListener('pointermove', (e) => {
        if (!activeWrap) return;
        const rect = activeWrap.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        // Amplitude ~1.5x do tilt CSS: a foto "flutua" acima do card
        targetRX = (0.5 - py) * 0.42;
        targetRY = (px - 0.5) * 0.58;
    });

    window.addEventListener('resize', placeCanvas);
}

// ============================================================
// 2. ORBE EDITORIAL — cabeçalho de "A Coleção"
// ============================================================

/** @returns {void} */
function initCollectionOrb() {
    const header = document.querySelector('#colecao .reveal');
    if (!header || !(header instanceof HTMLElement)) return;

    header.classList.add('has-orb');
    const canvas = document.createElement('canvas');
    canvas.id = 'collection-orb';
    canvas.setAttribute('aria-hidden', 'true');
    header.appendChild(canvas);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 20);
    camera.position.set(0, 0, 3.4);

    const orbGeometry = new THREE.SphereGeometry(1, 96, 96);
    const orbMaterial = new THREE.ShaderMaterial({
        transparent: true,
        uniforms: {
            uTime: { value: 0 },
            uInk: { value: new THREE.Color(PALETTE.ink) },
            uPaper: { value: new THREE.Color(PALETTE.paper) },
            uAccent: { value: new THREE.Color(PALETTE.accent) }
        },
        vertexShader: `
            uniform float uTime;
            varying vec3 vNormal;
            varying vec3 vPos;
            void main() {
                vec3 p = position;
                float w = sin(p.y * 3.2 + uTime * 0.9) * 0.055
                        + sin(p.x * 4.1 + uTime * 0.7) * 0.04
                        + sin(p.z * 3.6 + uTime * 1.1) * 0.045;
                p += normal * w;
                vNormal = normalize(normalMatrix * normal);
                vec4 mv = modelViewMatrix * vec4(p, 1.0);
                vPos = mv.xyz;
                gl_Position = projectionMatrix * mv;
            }
        `,
        fragmentShader: `
            uniform float uTime;
            uniform vec3 uInk;
            uniform vec3 uPaper;
            uniform vec3 uAccent;
            varying vec3 vNormal;
            varying vec3 vPos;
            void main() {
                vec3 n = normalize(vNormal);
                vec3 v = normalize(-vPos);
                float fres = pow(1.0 - max(dot(n, v), 0.0), 2.3);
                float spec = pow(max(dot(n, normalize(vec3(0.55, 0.85, 0.55))), 0.0), 26.0);
                float pulse = 0.5 + 0.5 * sin(uTime * 0.8);
                vec3 col = uInk * 0.9 + uPaper * spec * 0.38 + uAccent * fres * (0.65 + pulse * 0.25);
                gl_FragColor = vec4(col, 0.9);
            }
        `
    });
    const orb = new THREE.Mesh(orbGeometry, orbMaterial);
    scene.add(orb);

    const ringMaterial = new THREE.MeshBasicMaterial({
        color: PALETTE.ink,
        transparent: true,
        opacity: 0.16
    });
    const ringA = new THREE.Mesh(new THREE.TorusGeometry(1.42, 0.012, 12, 160), ringMaterial);
    ringA.rotation.x = Math.PI / 2.6;
    scene.add(ringA);
    const ringB = new THREE.Mesh(new THREE.TorusGeometry(1.66, 0.008, 12, 160), ringMaterial.clone());
    ringB.material.opacity = 0.1;
    ringB.rotation.x = Math.PI / 2.1;
    ringB.rotation.y = Math.PI / 7;
    scene.add(ringB);

    /** @type {{ x: number, y: number }} */
    const mouse = { x: 0, y: 0 };
    /** @type {{ x: number, y: number }} */
    const smooth = { x: 0, y: 0 };
    let visible = true;
    const clock = new THREE.Clock();

    /** @returns {void} */
    function resize() {
        const width = Math.max(1, canvas.clientWidth);
        const height = Math.max(1, canvas.clientHeight);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }

    /** @returns {void} */
    function render() {
        window.requestAnimationFrame(render);
        if (!visible || document.hidden) return;
        const t = clock.getElapsedTime();
        orbMaterial.uniforms.uTime.value = t;
        orb.rotation.y = t * 0.12;
        ringA.rotation.z = t * 0.1;
        ringB.rotation.z = -t * 0.07;
        smooth.x += (mouse.x - smooth.x) * 0.06;
        smooth.y += (mouse.y - smooth.y) * 0.06;
        camera.position.x = smooth.x * 0.35;
        camera.position.y = smooth.y * 0.25;
        camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
    }

    header.addEventListener('pointermove', (e) => {
        const rect = header.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { visible = entry.isIntersecting; });
    }, { threshold: 0.05 });
    observer.observe(canvas);

    window.addEventListener('resize', resize);
    resize();
    render();
}

// ============================================================
// BOOT — só depois do primeiro paint, com gates de qualidade
// ============================================================

/** @returns {void} */
function boot() {
    if (REDUCE_MOTION || !hasWebGL()) return;
    if (FINE_POINTER) initPhotoSlabs();
    initCollectionOrb();
}

/** Agenda o boot após o primeiro paint (idle quando disponível). */
function scheduleBoot() {
    const ric = window.requestIdleCallback;
    if (typeof ric === 'function') {
        ric.call(window, boot, { timeout: 2500 });
        return;
    }
    window.setTimeout(boot, 900);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleBoot);
} else {
    scheduleBoot();
}
