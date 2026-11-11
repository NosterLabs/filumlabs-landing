import {
  ACESFilmicToneMapping,
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  DoubleSide,
  EdgesGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Quaternion,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
  type Texture,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export type StageOptions = {
  volume: [number, number, number]; // printer x, y, z in mm, z up
  framing: 'volume' | 'model'; // whole build volume (tools) or the part alone (hero, renders)
  interactive?: boolean;
  pan?: boolean; // right drag (two fingers on touch) slides the view across the bed
  view?: StageView;
};

// degrees; pad > 1 leaves room around the part; shift moves it in the frame (fractions of width/height);
// fit frames the part as if it were scaled by this much, so the camera holds still while the part grows
export type StageView = { azimuth: number; elevation: number; pad?: number; shift?: { x: number; y: number }; fit?: number };

const HOT = new Color('#ff7a3d'); // the nozzle: the one warm colour in the brand

// One WebGL scene for every 3D view: quoter, product page, hero and the offline renders.
// It renders on demand (no idle loop), pauses off screen and frees the GPU context on dispose.
export class Stage {
  readonly canvas: HTMLCanvasElement;
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new PerspectiveCamera(28, 1, 1, 8000);
  private controls: OrbitControls | null = null;
  private pivot = new Group();
  private mesh: Mesh;
  private material: MeshStandardMaterial;
  private shadow: Mesh;
  private frame: LineSegments | null = null;
  private plate: Mesh | null = null;
  private env: Texture;
  private owned: BufferGeometry | null = null;
  private wire: Mesh;
  // uSweep / uOld: a new colour climbing the part from the base, the old one still above it
  private uniforms = { uCut: { value: 1e6 }, uBand: { value: 1.2 }, uHot: { value: HOT }, uHotOn: { value: 0 }, uSweep: { value: 1e6 }, uOld: { value: new Color() } };
  private base = new Vector3(); // geometry size before rotation and scale
  private size = new Vector3(); // world size of the part
  private k = 1;
  private raf = 0;
  private visible = true;
  private anim: ((now: number) => boolean) | null = null;
  private sweep: ((now: number) => boolean) | null = null;
  private finish: (() => void) | null = null;
  private observers: { disconnect(): void }[] = [];
  private opts: StageOptions;

  constructor(host: HTMLElement | null, opts: StageOptions) {
    this.opts = opts;
    this.renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.canvas = this.renderer.domElement;

    const pmrem = new PMREMGenerator(this.renderer);
    this.env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    this.scene.environment = this.env;
    this.scene.environmentIntensity = 0.55;

    const key = new DirectionalLight(0xffffff, 1.7);
    key.position.set(-480, 900, 640);
    const rim = new DirectionalLight(0x9fb4c4, 1.3);
    rim.position.set(700, 320, -720);
    this.scene.add(key, rim);

    const [vx, vz, vy] = opts.volume; // print y is three's z
    if (opts.framing === 'volume') {
      this.plate = new Mesh(new PlaneGeometry(vx, vz), new MeshStandardMaterial({ color: 0x1a2128, roughness: 0.92 }));
      this.plate.rotation.x = -Math.PI / 2;
      this.frame = new LineSegments(
        new EdgesGeometry(new BoxGeometry(vx, vy, vz).translate(0, vy / 2, 0)),
        new LineBasicMaterial({ color: 0x8ea3b3, transparent: true, opacity: 0.35 }),
      );
      this.scene.add(this.plate, this.frame);
    }

    this.shadow = new Mesh(
      new PlaneGeometry(1, 1),
      new MeshBasicMaterial({ map: contactShadow(), transparent: true, depthWrite: false }),
    );
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.position.y = 0.3;
    this.shadow.renderOrder = 1;
    this.shadow.visible = false; // until there is a part to ground

    this.material = new MeshStandardMaterial({ color: 0x8a939b, roughness: 0.5, metalness: 0, side: DoubleSide });
    this.material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, this.uniforms);
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying float vWorldY;')
        .replace('#include <project_vertex>', '#include <project_vertex>\nvWorldY = (modelMatrix * vec4(transformed, 1.0)).y;');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying float vWorldY;\nuniform float uCut;\nuniform float uBand;\nuniform vec3 uHot;\nuniform float uHotOn;\nuniform float uSweep;\nuniform vec3 uOld;')
        .replace('void main() {', 'void main() {\n  if (vWorldY > uCut) discard;')
        // the inside of a part being printed reads darker than its skin
        .replace('#include <color_fragment>', '#include <color_fragment>\n  if (vWorldY > uSweep) diffuseColor.rgb = uOld;\n  if (!gl_FrontFacing) diffuseColor.rgb *= 0.45;')
        // the freshest layer glows like it just left the nozzle
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n  totalEmissiveRadiance += uHot * uHotOn * 2.2 * smoothstep(uCut - uBand, uCut, vWorldY);');
    };
    this.material.customProgramCacheKey = () => 'filum-print';
    this.mesh = new Mesh(new BufferGeometry(), this.material);
    this.mesh.visible = false;
    // the file as the quoter first reads it: triangles only, before it becomes a solid
    this.wire = new Mesh(this.mesh.geometry, new MeshBasicMaterial({ color: 0xb9c7d2, wireframe: true, transparent: true, opacity: 0, depthWrite: false }));
    this.wire.visible = false;
    this.mesh.add(this.wire);
    this.pivot.add(this.mesh, this.shadow);
    this.scene.add(this.pivot);

    if (opts.interactive) {
      this.controls = new OrbitControls(this.camera, this.canvas);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.08;
      this.controls.enablePan = !!opts.pan;
      this.controls.addEventListener('change', () => this.request());
    }

    if (host) {
      host.appendChild(this.canvas);
      const ro = new ResizeObserver(() => this.resize(host.clientWidth, host.clientHeight));
      ro.observe(host);
      const io = new IntersectionObserver(([e]) => {
        this.visible = e.isIntersecting;
        if (this.visible) this.request();
      });
      io.observe(host);
      this.observers.push(ro, io);
      this.resize(host.clientWidth, host.clientHeight);
    }
  }

  // owned: the stage disposes this geometry when it is replaced (catalogue geometry is shared)
  setModel(g: BufferGeometry | null, owned = true) {
    if (this.owned && this.owned !== g) this.owned.dispose();
    this.owned = owned ? g : null;
    this.mesh.visible = !!g;
    this.shadow.visible = !!g;
    if (g) {
      g.computeBoundingBox();
      const b = g.boundingBox!;
      g.translate(-(b.min.x + b.max.x) / 2, -(b.min.y + b.max.y) / 2, -(b.min.z + b.max.z) / 2);
      b.getSize(this.base);
      this.mesh.geometry = g;
      this.wire.geometry = g;
    }
    this.layout();
    this.fit();
  }

  setRotation(q: Quaternion) {
    this.mesh.quaternion.copy(q);
    this.layout();
    if (this.opts.framing === 'model') this.fit();
    this.request();
  }

  setScale(k: number) {
    this.k = k;
    this.mesh.scale.setScalar(k);
    this.layout();
    if (this.opts.framing === 'model') this.fit();
    this.request();
  }

  // sweep: the new colour climbs the part layer by layer instead of switching at once
  setColor(hex: string, sweep = false) {
    if (sweep && this.mesh.visible && !this.material.color.equals(new Color(hex))) {
      this.uniforms.uOld.value.copy(this.material.color);
      let start = -1;
      this.sweep = (now) => {
        if (start < 0) start = now;
        const t = Math.min(1, (now - start) / 700);
        this.uniforms.uSweep.value = t < 1 ? this.size.y * (1 - Math.pow(1 - t, 2)) : 1e6;
        return t < 1;
      };
      this.uniforms.uSweep.value = 0;
    }
    this.material.color.set(hex);
    this.request();
  }

  // 0 = solid part, 1 = triangle mesh only
  setWire(t: number) {
    const transparent = t > 0;
    if (this.material.transparent !== transparent) {
      this.material.transparent = transparent;
      this.material.needsUpdate = true;
    }
    this.material.opacity = 1 - t;
    this.material.visible = t < 1;
    (this.wire.material as MeshBasicMaterial).opacity = t * 0.6;
    this.wire.visible = t > 0;
    this.request();
  }

  setView(view: StageView) {
    this.opts = { ...this.opts, view };
    this.fit();
  }

  setFits(fits: boolean) {
    if (this.frame) (this.frame.material as LineBasicMaterial).color.set(fits ? 0x8ea3b3 : 0xff6b6b);
    this.request();
  }

  setTurn(radians: number) {
    this.pivot.rotation.y = radians;
    this.request();
  }

  // 0 = nothing printed yet, 1 = finished part; hot: the freshest layer glows (off while layers come off)
  setCut(p: number, hot = true) {
    const done = p >= 1;
    this.uniforms.uBand.value = Math.max(0.8, this.size.y * 0.015);
    this.uniforms.uCut.value = done ? 1e6 : this.size.y * Math.max(0, p);
    this.uniforms.uHotOn.value = !hot || done || p <= 0 ? 0 : 1;
    this.request();
  }

  // Plays the print: the part rises layer by layer while the pivot turns a little.
  print({ duration = 6000, onProgress }: { duration?: number; onProgress?: (p: number) => void } = {}) {
    let start = -1;
    const turn0 = this.pivot.rotation.y;
    this.anim = (now) => {
      if (start < 0) start = now;
      const t = Math.min(1, (now - start) / duration);
      const p = 1 - Math.pow(1 - t, 1.4); // a touch faster at the base, like a real first layers run
      this.setCut(p);
      this.pivot.rotation.y = turn0 + Math.sin(t * Math.PI) * 0.35;
      onProgress?.(p);
      if (t >= 1) this.finish = null;
      return t < 1;
    };
    this.request();
    this.finish = () => {
      this.anim = null;
      this.finish = null;
      this.setCut(1);
      onProgress?.(1);
    };
    return this.finish;
  }

  // jumps a playing print to its end: the scroll is about to take over the part
  skip() {
    this.finish?.();
  }

  // back to the starting camera after orbiting, zooming or panning away
  recenter() {
    // damping keeps a little motion after a drag: flush it, or it nudges the fresh framing
    if (this.controls) {
      this.controls.enableDamping = false;
      this.controls.update();
      this.controls.enableDamping = true;
    }
    this.fit();
  }

  // A still image of the current scene, for the catalogue and the hero poster.
  snapshot(width: number, height: number, type = 'image/webp', quality = 0.92) {
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.fit();
    this.renderer.render(this.scene, this.camera);
    return this.canvas.toDataURL(type, quality);
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this.observers.forEach((o) => o.disconnect());
    this.controls?.dispose();
    this.owned?.dispose();
    this.material.dispose();
    (this.wire.material as MeshBasicMaterial).dispose();
    this.shadow.geometry.dispose();
    const sm = this.shadow.material as MeshBasicMaterial;
    sm.map?.dispose();
    sm.dispose();
    this.plate?.geometry.dispose();
    (this.plate?.material as MeshStandardMaterial | undefined)?.dispose();
    this.frame?.geometry.dispose();
    (this.frame?.material as LineBasicMaterial | undefined)?.dispose();
    this.env.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.canvas.remove();
  }

  private request() {
    if (!this.raf && this.visible) this.raf = requestAnimationFrame(this.frameLoop);
  }

  private frameLoop = (now: number) => {
    this.raf = 0;
    let more = false;
    if (this.controls) more = this.controls.update() || more;
    if (this.anim && !this.anim(now)) this.anim = null;
    if (this.sweep && !this.sweep(now)) this.sweep = null;
    if (this.anim || this.sweep) more = true;
    this.renderer.render(this.scene, this.camera);
    if (more) this.request();
  };

  private resize(w: number, h: number) {
    if (!w || !h) return;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, w < 640 ? 1.5 : 2));
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.fit();
    this.request();
  }

  // world size after rotation and scale; quarter turns map the box onto a box, so this is exact
  private layout() {
    const m = new Matrix4().makeRotationFromQuaternion(this.mesh.quaternion).elements;
    const b = [this.base.x, this.base.y, this.base.z];
    const d = [0, 1, 2].map((i) => [0, 1, 2].reduce((s, j) => s + Math.abs(m[j * 4 + i]) * b[j], 0) * this.k);
    this.size.set(d[0], d[1], d[2]);
    this.mesh.position.set(0, this.size.y / 2, 0);
    const foot = Math.max(this.size.x, this.size.z, 10) * 1.7;
    this.shadow.scale.set(foot, foot, 1);
  }

  private fit() {
    const { azimuth = 38, elevation = 24, pad = 1.04, shift, fit } = this.opts.view ?? {};
    const az = (azimuth * Math.PI) / 180, el = (elevation * Math.PI) / 180;
    const dir = new Vector3(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az));
    let target: Vector3, dist: number;
    if (this.opts.framing === 'volume') {
      const [vx, vz, vy] = this.opts.volume;
      target = new Vector3(0, vy * 0.38, 0);
      dist = Math.max(vx, vy, vz) * 3;
    } else {
      const f = fit ? fit / this.k : 1;
      const r = Math.max((this.size.length() / 2) * f, 5);
      const vf = ((this.camera.fov / 2) * Math.PI) / 180;
      const hf = Math.atan(Math.tan(vf) * this.camera.aspect);
      dist = (r / Math.sin(Math.min(vf, hf))) * pad;
      target = new Vector3(0, (this.size.y * f) / 2, 0);
    }
    // a view offset slides the part across the frame without changing the perspective
    if (shift) {
      const w = 1000, h = 1000 / this.camera.aspect;
      this.camera.setViewOffset(w, h, -shift.x * w, shift.y * h, w, h);
    } else this.camera.clearViewOffset();
    this.camera.position.copy(target).addScaledVector(dir, dist);
    this.camera.near = dist / 50;
    this.camera.far = dist * 8;
    this.camera.updateProjectionMatrix();
    this.camera.lookAt(target);
    if (this.controls) {
      this.controls.target.copy(target);
      this.controls.minDistance = dist * 0.35;
      this.controls.maxDistance = dist * 2.5;
      this.controls.update();
    }
    this.request();
  }
}

// soft dark ellipse under the part: grounds it without a shadow map
function contactShadow() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(0,0,0,0.55)');
  r.addColorStop(0.55, 'rgba(0,0,0,0.22)');
  r.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, 128, 128);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}
