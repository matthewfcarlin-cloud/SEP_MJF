/**
 * The Kinn coin in 3D, built exactly like the site's hero (kinn/site/public/index.html): a
 * gloss-black ceramic dome on a graphite base, a polished chrome seam, a light line around the
 * side, a chrome halo and the wordmark on top, lit by a studio of thin light strips.
 */
import * as THREE from 'three';

export const S = 0.04; // scene units per mm
export const R = 11 * S;
export const H = 3.2 * S;

export function studioEnvironment(renderer: THREE.WebGLRenderer) {
  const studio = new THREE.Scene();
  studio.background = new THREE.Color(0x030303);
  const lamp = (w: number, h: number, x: number, y: number, z: number, rx: number, ry: number, rz: number, c: number, k: number) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), side: THREE.DoubleSide }));
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    studio.add(m);
  };
  lamp(0.7, 14, -5, 2, 1, 0, Math.PI / 2.4, 0.3, 0xffffff, 12);
  lamp(0.4, 14, 5, 1, -1, 0, -Math.PI / 2.2, -0.5, 0xffffff, 10);
  lamp(14, 0.6, 0, 6, 0, Math.PI / 2, 0, 0.4, 0xffffff, 7);
  lamp(0.6, 12, 0, 1, 6, 0, 0, 0.9, 0xdfe8ff, 8);
  lamp(0.3, 12, -2, 3, -6, 0, 0, -0.7, 0xffe2c8, 7);
  lamp(3, 14, 2.5, 3, 7, 0, 0, 0.35, 0xffffff, 1.6);
  lamp(10, 10, 0, 7, 0, Math.PI / 2, 0, 0, 0x2a2a2a, 1);
  const pm = new THREE.PMREMGenerator(renderer);
  const tex = pm.fromScene(studio, 0.02).texture;
  pm.dispose();
  return tex;
}

export type CoinParts = { group: THREE.Group; ring: THREE.MeshBasicMaterial; dispose: () => void };

/** The coin, axis along local Y, top face up. `word` puts the wordmark on the face. */
export function buildCoin({ word = true }: { word?: boolean } = {}): CoinParts {
  const V = (p: number[]) => new THREE.Vector2(p[0], p[1]);
  const group = new THREE.Group();
  const chrome = new THREE.MeshPhysicalMaterial({ color: 0xd8d8d8, metalness: 1, roughness: 0.09, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1.5 });
  // Three 0.147 supports iridescence; its type definitions just don't list it yet.
  Object.assign(chrome, { iridescence: 0.7, iridescenceIOR: 1.5, iridescenceThicknessRange: [250, 800] });
  const ring = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
  const graphite = new THREE.MeshPhysicalMaterial({ color: 0x2a2c30, metalness: 0.6, roughness: 0.38, envMapIntensity: 0.7 });
  const blackCeramic = new THREE.MeshPhysicalMaterial({ color: 0x050506, roughness: 0.35, clearcoat: 0.9, clearcoatRoughness: 0.06, envMapIntensity: 0.55 });

  const baseProf = [[0.001, 0], [R - 0.6 * S, 0], [R, 0.5 * S], [R, 1.0 * S]].map(V);
  const domeProf = [[R, 1.0 * S]];
  for (let i = 1; i <= 24; i++) {
    const t = i / 24;
    domeProf.push([R - 3.5 * S * (1 - Math.cos((t * Math.PI) / 2)), 1.0 * S + 2.2 * S * Math.sin((t * Math.PI) / 2)]);
  }
  domeProf.push([0.001, H]);

  const geos: THREE.BufferGeometry[] = [];
  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, f?: (m: THREE.Mesh) => void) => {
    geos.push(geo);
    const m = new THREE.Mesh(geo, mat);
    f?.(m);
    group.add(m);
    return m;
  };
  add(new THREE.LatheGeometry(baseProf, 96), graphite);
  add(new THREE.LatheGeometry(domeProf.map(V), 96), blackCeramic);
  add(new THREE.TorusGeometry(R - 0.1 * S, 0.2 * S, 16, 160), chrome, (m) => {
    m.rotation.x = Math.PI / 2;
    m.position.y = 1.0 * S;
  });
  add(new THREE.TorusGeometry(R + 0.04 * S, 0.12 * S, 10, 160), ring, (m) => {
    m.rotation.x = Math.PI / 2;
    m.position.y = 0.5 * S;
    m.scale.z = 0.8;
  });
  add(new THREE.TorusGeometry(6.6 * S, 0.07 * S, 8, 140), chrome, (m) => {
    m.rotation.x = Math.PI / 2;
    m.position.y = H + 0.02 * S;
  });

  let texture: THREE.CanvasTexture | null = null;
  if (word) {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d')!;
    g.fillStyle = 'rgba(214,214,214,.9)';
    g.font = '600 60px Manrope, Helvetica, Arial, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('kinn', 128, 134);
    texture = new THREE.CanvasTexture(c);
    texture.encoding = THREE.sRGBEncoding;
    add(new THREE.CircleGeometry(6.2 * S, 48), new THREE.MeshStandardMaterial({ map: texture, transparent: true, roughness: 0.4, depthWrite: false }), (m) => {
      m.rotation.x = -Math.PI / 2;
      m.position.y = H + 0.002;
    });
  }

  return {
    group,
    ring,
    dispose: () => {
      geos.forEach((g) => g.dispose());
      [chrome, ring, graphite, blackCeramic].forEach((m) => m.dispose());
      texture?.dispose();
    },
  };
}

export function makeRenderer(canvas?: HTMLCanvasElement, opts: { alpha?: boolean; preserve?: boolean } = {}) {
  try {
    const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: opts.alpha ?? true, preserveDrawingBuffer: opts.preserve ?? false });
    if (!r.getContext()) return null;
    r.outputEncoding = THREE.sRGBEncoding;
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.3;
    return r;
  } catch {
    return null;
  }
}

let shared: { r: THREE.WebGLRenderer; env: THREE.Texture } | null | undefined;

/**
 * One renderer for the whole app (the opening and the dial snapshot), so the coin's shaders
 * compile once. Null when WebGL isn't available.
 */
export function sharedRenderer() {
  if (shared !== undefined) return shared;
  const r = makeRenderer(undefined, { alpha: true, preserve: true });
  shared = r ? { r, env: studioEnvironment(r) } : null;
  return shared;
}

const snapshots = new Map<number, string | null>();

/**
 * The coin seen from just above, rendered once to an image for the Today dial (one live WebGL
 * view per screen is plenty). Null when WebGL isn't available; the dial then draws a flat coin.
 */
export function coinSnapshot(px: number): string | null {
  if (snapshots.has(px)) return snapshots.get(px)!;
  const gl = sharedRenderer();
  if (!gl) {
    snapshots.set(px, null);
    return null;
  }
  const { r, env } = gl;
  r.setPixelRatio(1);
  r.setSize(px, px, false);
  r.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  scene.environment = env;
  const coin = buildCoin({ word: false });
  coin.group.rotation.x = 0.16; // a touch of tilt so the dome catches the strip lights
  scene.add(coin.group);
  const cam = new THREE.PerspectiveCamera(20, 1, 0.1, 20);
  cam.position.set(0, 2.62, 0.02);
  cam.lookAt(0, 0, 0);
  r.render(scene, cam);
  const url = r.domElement.toDataURL('image/png');
  coin.dispose();
  snapshots.set(px, url);
  return url;
}
