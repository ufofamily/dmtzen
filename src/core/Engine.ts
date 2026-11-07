import * as T from 'three';
import { defaults, projectFrom, featuresFrom, random, reactiveSample, routeAudio, transitionNames, type Project, type Features } from './model';
import { generateShow, sceneAt } from '../director/VisualDirector';
import { buildVision } from './VisionWorlds';
import { buildOdyssey } from './OdysseyWorlds';
import { MusicalDynamics } from '../director/MusicalDynamics';
import { surfaceUniforms, attachSurface, perceptionMaterial } from './PerceptionEffects';

// Every transform is assigned from absolute time, independently of frame order.
class WorldLayer {
  renderer: T.WebGLRenderer;
  scene = new T.Scene();
  camera = new T.PerspectiveCamera(52, 16 / 9, .1, 180);
  root = new T.Group();
  config: Project = { ...defaults };
  features: Features | null = null;
  rings: T.Object3D[] = [];
  particles!: T.Points;
  sand?: T.ShaderMaterial;
  organic?: T.ShaderMaterial;
  surface = surfaceUniforms();
  reactiveLights: T.PointLight[] = [];
  activeWorld = '';
  show = generateShow(defaults);
  constructor(renderer: T.WebGLRenderer) {
    this.renderer = renderer;
    this.renderer.setPixelRatio(1); this.renderer.toneMapping = T.ACESFilmicToneMapping;
    this.scene.background = new T.Color('#080e13'); this.configure(defaults);
  }
  configure(value: unknown, features: Features | null = this.features) {
    const p = projectFrom(value); if (features !== this.features) this.features = features ? featuresFrom(features) : null;
    const rebuild = p.seed !== this.config.seed || p.world !== this.config.world || p.quality !== this.config.quality || this.root.children.length === 0;
    this.config = p; this.show = generateShow(p); if (rebuild) this.build(sceneAt(0, p, this.show).world);
  }
  resize(w: number, h: number) { this.renderer.setSize(w, h, false); this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); }
  clear() {
    const geometries = new Set<T.BufferGeometry>(), materials = new Set<T.Material>();
    this.scene.traverse(o => { if (o instanceof T.InstancedMesh) o.dispose(); if (o instanceof T.Mesh || o instanceof T.Points) { geometries.add(o.geometry); for (const m of Array.isArray(o.material) ? o.material : [o.material]) materials.add(m); } });
    geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); this.scene.clear();
    this.root = new T.Group(); this.rings = []; this.sand = undefined; this.organic = undefined; this.reactiveLights = [];
  }
  build(world = this.config.world) {
    this.activeWorld = world;
    this.clear(); this.scene.add(this.root); const rng = random(this.config.seed);
    const stone = new T.MeshStandardMaterial({ color: '#496066', roughness: .88, metalness: .15 });
    const dark = new T.MeshStandardMaterial({ color: '#1e2b30', roughness: .7, metalness: .25 });
    const gold = new T.MeshStandardMaterial({ color: '#bd9560', roughness: .35, metalness: .75, emissive: '#50371a', emissiveIntensity: .3 });
    const glow = new T.MeshBasicMaterial({ color: '#efc893' }); const box = new T.BoxGeometry(1, 1, 1);
    const add = (g: T.BufferGeometry, m: T.Material, x: number, y: number, z: number, sx = 1, sy = 1, sz = 1, parent: T.Object3D = this.root) => {
      const mesh = new T.Mesh(g, m); mesh.position.set(x, y, z); mesh.scale.set(sx, sy, sz); parent.add(mesh); return mesh;
    };
    this.scene.add(new T.HemisphereLight('#b1d8df', '#27201c', 2.4));
    const key = new T.DirectionalLight('#ffd6a3', 3.5); key.position.set(-8, 12, 4); this.scene.add(key);
    const fill = new T.PointLight('#6fcace', 100, 45); fill.position.set(0, 5, -14); this.scene.add(fill); this.reactiveLights.push(fill);
    if (buildOdyssey(world, this.root, this.rings, rng, this.config.quality === 'fast') || buildVision(world, this.root, this.rings, rng, this.config.quality === 'fast')) {
      // The thirty additional worlds share lifecycle and audio routing with the original set.
    } else if (world === 'temple') {
      add(box, stone, 0, -.4, -12, 18, .7, 70);
      for (let j = 0; j < 9; j++) {
        const z = 8 - j * 5.5;
        for (const side of [-1, 1]) {
          add(box, dark, side * 5, 3, z, .8, 6, .8); add(box, stone, side * 5, .4, z, 1.4, .8, 1.4);
          add(box, gold, side * 5, 5.7, z, 1.1, .22, 1.1);
          for (let k = 0; k < 5; k++) add(box, gold, side * 5, 1.2 + k * .85, z, .84, .06, .84);
          add(box, stone, side * 7, 2.2, z, 1.1, 4.4, 1.1); add(box, glow, side * 4, .25, z, .32, .12, .32);
          add(box, gold, side * 3.7, .01, z - 2, .035, .02, 5.5);
        }
        add(box, dark, 0, 6.2, z, 11.6, .55, 1); add(box, gold, 0, 5.85, z, 9.8, .08, 1.04);
        for (let k = -4; k <= 4; k++) add(box, gold, k, 6.65, z, .35, .5, .35);
      }
      for (let i = 0; i < 5; i++) add(box, stone, 0, i * .2, -25, 6 - i * .7, .2, 5 - i * .6);
      this.rings.push(add(new T.IcosahedronGeometry(1, 3), gold, 0, 3, -25));
      for (let i = 0; i < 5; i++) this.rings.push(add(new T.TorusGeometry(1.8 + i * .38, .025, 8, 96), i % 2 ? gold : glow, 0, 3, -25 - i * .12));
    } else if (world === 'garden') {
      this.sand = new T.ShaderMaterial({ uniforms: { time: { value: 0 }, energy: { value: 0 } }, vertexShader: `uniform float time; uniform float energy; varying vec3 p; void main(){p=position; float r=length(p.xy); vec3 q=p; q.z+=sin(r*3.5-time*.8)*(.045+energy*.25)+sin(length(p.xy-vec2(4.,3.))*4.-time)*energy*.13; gl_Position=projectionMatrix*modelViewMatrix*vec4(q,1.);}`, fragmentShader: `varying vec3 p; void main(){float grooves=.5+.5*sin(length(p.xy)*24.); vec3 c=mix(vec3(.25,.30,.29),vec3(.63,.64,.51),grooves*.45+.35); float fade=exp(-length(p.xy)*.028); gl_FragColor=vec4(c*fade,1.);}` });
      add(new T.PlaneGeometry(85, 85, 180, 180), this.sand, 0, 0, -15).rotation.x = -Math.PI / 2;
      const rock = new T.IcosahedronGeometry(1, 1);
      for (let i = 0; i < 24; i++) { const r = add(rock, stone, (rng() - .5) * 35, .4, 5 - rng() * 48, .5 + rng() * 2, .5 + rng() * 1.4, 1 + rng()); r.rotation.set(rng(), rng() * 6, rng() * .3); }
    } else if (world === 'mandala') {
      for (let j = 0; j < 14; j++) {
        const portal = new T.Group(); portal.position.set(0, 3, 4 - j * 4); this.root.add(portal); this.rings.push(portal);
        add(new T.TorusGeometry(4, .07, 8, 96), gold, 0, 0, 0, 1, 1, 1, portal);
        for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8; add(box, k % 2 ? stone : gold, Math.cos(a) * 4, Math.sin(a) * 4, 0, .5, 1.5, .4, portal).rotation.z = a; }
      }
    } else if (world === 'chambers') {
      for (let j = 0; j < 18; j++) {
        const frame = new T.Group(); frame.position.set(0, 3, 5 - j * 3.2); this.root.add(frame); this.rings.push(frame);
        for (const side of [-1, 1]) { add(box, gold, side * 3.8, 0, 0, .13, 7.6, .3, frame); add(box, stone, 0, side * 3.8, 0, 7.6, .13, .3, frame); }
        for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + .785; add(new T.OctahedronGeometry(.35), glow, Math.cos(a) * 5.4, Math.sin(a) * 5.4, 0, 1, 1, 1, frame); }
      }
    } else if (world === 'observers') {
      const geometry = new T.TorusKnotGeometry(2, .16, 160, 12, 3, 5);
      for (let i = 0; i < 6; i++) {
        const material = new T.MeshStandardMaterial({ color: new T.Color().setHSL(.38 + i * .055, .35, .6), transparent: true, opacity: .18 + (i === 0 ? .5 : 0), depthWrite: false, metalness: .4, roughness: .3 });
        this.rings.push(add(geometry, material, Math.sin(i * 1.3) * 1.5, 3 + Math.cos(i) * .5, -10 - i * 1.4, 1 + i * .08, 1 + i * .08, 1));
      }
      add(box, dark, 0, -.4, -15, 40, .4, 60);
    } else if (world === 'organic') {
      this.organic = new T.ShaderMaterial({ side: T.DoubleSide, uniforms: { time: { value: 0 }, energy: { value: 0 } }, vertexShader: `uniform float time; uniform float energy; varying vec3 p; varying vec3 n; void main(){p=position; n=normal; float warp=sin(p.x*3.+time*.4)*sin(p.y*2.7-time*.3)*sin(p.z*2.+time*.2); vec3 q=p+normal*warp*(.2+energy*.4); gl_Position=projectionMatrix*modelViewMatrix*vec4(q,1.);}`, fragmentShader: `uniform float time; varying vec3 p; varying vec3 n; void main(){float v=.5+.5*sin(p.y*9.+sin(p.x*5.+time*.2)*2.+p.z*4.); vec3 c=mix(vec3(.025,.13,.12),vec3(.62,.64,.26),pow(v,5.)); float l=.25+.75*abs(dot(normalize(n),normalize(vec3(.5,1.,.4)))); gl_FragColor=vec4(c*l,1.);}` });
      this.rings.push(add(new T.SphereGeometry(3.4, 64, 48), this.organic, 0, 3, -12));
      for (let i = 0; i < 12; i++) {
        const a = i * Math.PI / 6, points: T.Vector3[] = [];
        for (let j = 0; j < 20; j++) { const z = j / 19; points.push(new T.Vector3(Math.cos(a + z * 3) * (2 + z * 5), 2 + Math.sin(a + z * 4) * (1 + z * 4), -12 + z * 18)); }
        add(new T.TubeGeometry(new T.CatmullRomCurve3(points), 48, .09, 6, false), gold, 0, 0, 0);
      }
    } else if (world === 'crystals') {
      const crystal = new T.ConeGeometry(1, 1, 6);
      const mineral = new T.MeshStandardMaterial({ color: '#8ce3da', metalness: .65, roughness: .22, emissive: '#153940' });
      add(box, dark, 0, -.6, -24, 60, 1, 90);
      for (let i = 0; i < 100; i++) {
        const x = (i % 2 ? -1 : 1) * (3 + rng() * 15), z = 10 - rng() * 75, h = 2 + rng() * 9;
        const mesh = add(crystal, mineral, x, h / 2, z, .5 + rng(), h, .5 + rng()); mesh.rotation.z = (rng() - .5) * .5;
        add(crystal, mineral, x, 15 - h / 2, z, .7, h, .7).rotation.z = Math.PI;
      }
    } else if (world === 'forest') {
      add(box, dark, 0, -.4, -25, 75, .5, 100);
      const trunk = new T.CylinderGeometry(.12, .3, 1, 7), crown = new T.IcosahedronGeometry(1, 1);
      const leaves = new T.MeshStandardMaterial({ color: '#467c79', emissive: '#12382c', roughness: .65, wireframe: true });
      for (let i = 0; i < 75; i++) {
        const x = (i % 2 ? -1 : 1) * (3 + rng() * 23), z = 10 - rng() * 85, h = 4 + rng() * 9;
        add(trunk, gold, x, h / 2, z, 1, h, 1);
        add(crown, leaves, x, h, z, 2.5, 2.2, 2.5);
        add(crown, glow, x, h, z, .12, .12, .12);
      }
    } else if (world === 'library') {
      add(box, dark, 0, -.4, -25, 20, .6, 100);
      for (let j = 0; j < 15; j++) for (const side of [-1, 1]) {
        const z = 6 - j * 5;
        add(box, stone, side * 6, 5, z, .5, 10, 4.6);
        for (let level = 0; level < 6; level++) {
          add(box, gold, side * 5.4, level * 1.7, z, 1.6, .1, 4.6);
          for (let b = 0; b < 9; b++) add(box, b % 3 ? stone : gold, side * 5.4, level * 1.7 + .65, z - 1.8 + b * .45, .7, .7 + rng() * .5, .22);
        }
      }
      this.rings.push(add(new T.TorusKnotGeometry(1.5, .04, 100, 6), glow, 0, 4, -18));
    } else if (world === 'ocean') {
      this.sand = new T.ShaderMaterial({ uniforms: { time: { value: 0 }, energy: { value: 0 } }, vertexShader: `uniform float time; uniform float energy; varying vec3 p; void main(){p=position; vec3 q=p; q.z=sin(p.x*.45+time*.4)*.45+sin(p.y*.32-time*.3)*.6; gl_Position=projectionMatrix*modelViewMatrix*vec4(q,1.);}`, fragmentShader: `varying vec3 p; uniform float time; void main(){float v=pow(.5+.5*sin(p.y*2.+sin(p.x*.6+time*.2)*2.),14.); gl_FragColor=vec4(mix(vec3(.015,.07,.12),vec3(.18,.65,.7),v)*exp(-length(p.xy)*.014),1.);}` });
      add(new T.PlaneGeometry(100, 120, 160, 160), this.sand, 0, -.5, -35).rotation.x = -Math.PI / 2;
      add(new T.SphereGeometry(4, 32, 24), glow, 0, 11, -48);
      for (let i = 0; i < 14; i++) this.rings.push(add(new T.TorusGeometry(2 + i * .25, .025, 6, 80), gold, Math.sin(i) * 12, 3 + rng() * 5, -12 - i * 4));
    } else if (world === 'orrery') {
      for (let i = 0; i < 12; i++) {
        const group = new T.Group(); group.position.set(0, 4, -20); this.root.add(group); this.rings.push(group);
        add(new T.TorusGeometry(2 + i * .65, .035, 6, 100), gold, 0, 0, 0, 1, 1, 1, group).rotation.x = i * .23;
        add(new T.SphereGeometry(.15 + rng() * .4, 16, 12), i % 2 ? stone : glow, 2 + i * .65, 0, 0, 1, 1, 1, group);
      }
      add(new T.IcosahedronGeometry(1.3, 2), glow, 0, 4, -20);
    } else if (world === 'cathedral') {
      for (let j = 0; j < 18; j++) {
        const z = 8 - j * 4;
        add(box, stone, 0, -.3 + Math.sin(j * .7) * .2, z, 5, .3, 3.6);
        for (const side of [-1, 1]) {
          add(box, dark, side * 5, 5, z, .4, 10, .6);
          add(box, gold, side * 2.5, 11, z, .12, 7, .2).rotation.z = side * .8;
        }
        add(new T.OctahedronGeometry(.5), glow, 0, 8, z);
      }
    } else if (world === 'rebirth') {
      add(box, stone, 0, -.5, -20, 90, 1, 100);
      for (let i = 0; i < 20; i++) { const x = (rng() - .5) * 100, h = 5 + rng() * 18; add(new T.ConeGeometry(8 + rng() * 10, h, 5), stone, x, h / 2 - 1, -40 - rng() * 30); }
      for (const side of [-1, 1]) { add(box, dark, side * 5, 3, -15, 1, 6, 1); add(box, gold, side * 5, 5.8, -15, 1.6, .3, 1.6); }
      add(box, dark, 0, 6.2, -15, 12, .6, 2); add(box, gold, 0, 6.7, -15, 13, .2, 2.4);
      this.rings.push(add(new T.TorusGeometry(2, .025, 8, 96), glow, 0, 3, -23));
    } else {
      for (let i = 0; i < 7; i++) this.rings.push(add(new T.TorusGeometry(2 + i * .7, .012, 5, 128), glow, 0, 3, -15 - i * 2));
    }
    for (const shader of [this.sand, this.organic]) if (shader) {
      shader.uniforms.fadeAmount = { value: 1 };
      shader.fragmentShader = 'uniform float fadeAmount;\n' + shader.fragmentShader.slice(0, -1) + 'gl_FragColor.rgb *= fadeAmount;}';
    }
    // Batch static architecture by shared geometry/material; animated portals remain independent.
    const batches = new Map<T.Material, T.Mesh[]>();
    for (const child of this.root.children) {
      if (child instanceof T.Mesh && child.geometry === box && !Array.isArray(child.material)) {
        const list = batches.get(child.material) ?? []; list.push(child); batches.set(child.material, list);
      }
    }
    for (const [material, meshes] of batches) {
      const instances = new T.InstancedMesh(box, material, meshes.length);
      meshes.forEach((mesh, i) => { mesh.updateMatrix(); instances.setMatrixAt(i, mesh.matrix); this.root.remove(mesh); });
      instances.computeBoundingSphere(); this.root.add(instances);
    }
    const count = this.config.quality === 'fast' ? 350 : this.config.quality === 'high' ? 2200 : 900;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) { positions[i * 3] = (rng() - .5) * 24; positions[i * 3 + 1] = rng() * 9; positions[i * 3 + 2] = 12 - rng() * 65; }
    const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(positions, 3));
    this.particles = new T.Points(geo, new T.PointsMaterial({ size: .035, color: '#c5e1d5', transparent: true, opacity: .48, depthWrite: false })); this.root.add(this.particles);
    const used = new Set<T.Material>(); this.scene.traverse(o => { if (o instanceof T.Mesh) for (const m of Array.isArray(o.material) ? o.material : [o.material]) used.add(m); });
    used.forEach(m => attachSurface(m, this.surface));
    for (const ring of this.rings) { ring.userData.baseScale = ring.scale.clone(); ring.userData.baseRotation = ring.rotation.clone(); }
    for (const m of [stone, dark, gold, glow]) if (!used.has(m)) m.dispose();
    if (!batches.size && !['mandala', 'chambers'].includes(world)) box.dispose();
  }
  renderFrameAt(time: number, motionTime = time, dynamicStrength = 1) {
    if (!Number.isFinite(time) || time < 0) throw new Error('Invalid frame time');
    const p = this.config, state = sceneAt(time, p, this.show);
    if (state.world !== this.activeWorld) this.build(state.world);
    const t = motionTime * p.speed, a = reactiveSample(this.features, time, p.audioGain, p), intensity = Math.min(state.intensity * dynamicStrength, p.safeMode ? .8 : 2);
    const geometryAudio = routeAudio(a, p, 'geometry'), lightAudio = routeAudio(a, p, 'light'), particleAudio = routeAudio(a, p, 'particles'), surfaceAudio = routeAudio(a, p, 'surface'), cameraAudio = routeAudio(a, p, 'camera');
    this.renderer.toneMappingExposure = Math.min(p.exposure, p.safeMode ? 1.3 : 3) * state.exposure; this.scene.fog = new T.FogExp2('#080e13', p.fog);
    this.root.scale.set(1 + Math.sin(t * .37) * .012 * intensity + geometryAudio * .025 * intensity, 1 + geometryAudio * .018 * intensity, 1);
    for (let i = 0; i < this.rings.length; i++) { const ring = this.rings[i], base = ring.userData.baseRotation as T.Euler; ring.rotation.set(base.x, base.y + Math.sin(t * .19 + i) * (.12 + geometryAudio * .12) * intensity, base.z + t * .07 * (i % 2 ? 1 : -1) + i * .13); ring.scale.copy(ring.userData.baseScale).multiplyScalar(1 + geometryAudio * .12 * intensity); }
    this.surface.visionTime.value = t; this.surface.visionAmount.value = Math.min(p.surfaceFx, p.safeMode ? .35 : 1) * Math.min(intensity, 1);
    this.surface.visionBass.value = surfaceAudio; this.surface.visionHigh.value = surfaceAudio;
    for (const light of this.reactiveLights) light.intensity = 100 * (1 + lightAudio * .65 * intensity);
    if (this.sand) { this.sand.uniforms.time.value = t; this.sand.uniforms.energy.value = surfaceAudio * intensity; }
    if (this.organic) { this.organic.uniforms.time.value = t; this.organic.uniforms.energy.value = surfaceAudio * intensity; }
    for (const shader of [this.sand, this.organic]) if (shader) shader.uniforms.fadeAmount.value = state.exposure;
    this.particles.position.y = Math.sin(t * .13) * .35;
    const particleMaterial = this.particles.material as T.PointsMaterial;
    particleMaterial.size = .035 + particleAudio * .035 * intensity; particleMaterial.opacity = Math.min(1, .4 + particleAudio * .25 * intensity);
    this.particles.rotation.y = Math.sin(t * .07) * particleAudio * .04 * intensity;
    if (p.camera === 'orbit') this.camera.position.set(Math.sin(t * .1) * 7, 3.5 + Math.sin(t * .09), 2 + Math.cos(t * .1) * 5);
    else this.camera.position.set(p.camera === 'static' ? 0 : Math.sin(t * .12) * 1.2, 2.6 + (p.camera === 'static' ? 0 : Math.sin(t * .09) * .3), p.camera === 'static' ? 9 : 7 - Math.sin(t * .07) * 5);
    this.camera.fov = 52 - (p.camera === 'static' ? 0 : cameraAudio * 1.4 * intensity); this.camera.updateProjectionMatrix();
    this.camera.lookAt(0, 3, -25); this.renderer.render(this.scene, this.camera);
    return { calls: this.renderer.info.render.calls, triangles: this.renderer.info.render.triangles, geometries: this.renderer.info.memory.geometries, textures: this.renderer.info.memory.textures };
  }
  dispose() { this.clear(); }
}

// Two bounded world layers: the incoming world appears through a breathing aperture
// before filling the view. All composition is a pure function of timeline time.
export class Engine {
  renderer: T.WebGLRenderer;
  config: Project = { ...defaults };
  features: Features | null = null;
  activeWorld = '';
  private layers: WorldLayer[];
  private targets = [new T.WebGLRenderTarget(1, 1), new T.WebGLRenderTarget(1, 1)];
  private screen = new T.Scene();
  private camera = new T.Camera();
  private material = perceptionMaterial();
  private dynamics = new MusicalDynamics();
  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new T.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
    this.layers = [new WorldLayer(this.renderer), new WorldLayer(this.renderer)];
    this.screen.add(new T.Mesh(new T.PlaneGeometry(2, 2), this.material));
    this.configure(defaults);
  }
  configure(value: unknown, features: Features | null = this.features) {
    this.config = projectFrom(value); this.features = features ? featuresFrom(features) : null;
    this.dynamics.configure(this.config, this.features);
  }
  resize(w: number, h: number) {
    this.layers.forEach(l => l.resize(w, h)); this.targets.forEach(t => t.setSize(w, h)); this.material.uniforms.aspect.value = w / h;
  }
  renderFrameAt(time: number) {
    if (!Number.isFinite(time) || time < 0) throw new Error('Invalid frame time');
    const state = sceneAt(time, this.config); this.activeWorld = state.blend < .5 ? state.world : state.nextWorld;
    // Features can also be attached by the existing UI between configure calls.
    this.dynamics.configure(this.config, this.features);
    const dynamics = this.dynamics.at(time);
    const worlds = state.blend > 0 && state.world !== state.nextWorld ? [state.world, state.nextWorld] : [state.world];
    // Reuse the incoming layer as the outgoing layer at a boundary.
    if (this.layers[1].activeWorld === worlds[0]) this.layers.reverse();
    let calls = 0, triangles = 0;
    for (let i = 0; i < worlds.length; i++) {
      const layer = this.layers[i];
      layer.configure({ ...this.config, world: worlds[i], markers: [] }, this.features);
      this.renderer.setRenderTarget(this.targets[i]);
      const stats = layer.renderFrameAt(time, dynamics.motionTime, dynamics.strength); calls += stats.calls; triangles += stats.triangles;
    }
    this.material.uniforms.first.value = this.targets[0].texture;
    this.material.uniforms.second.value = this.targets[worlds.length - 1].texture;
    this.material.uniforms.blend.value = worlds.length === 2 ? state.blend : 0;
    this.material.uniforms.time.value = dynamics.motionTime * this.config.speed;
    const p = this.config, a = reactiveSample(this.features, time, p.audioGain, p);
    const strength = Math.min(state.intensity * dynamics.strength, p.safeMode ? .8 : 1);
    this.material.uniforms.bass.value = routeAudio(a, p, 'distortion') * strength; this.material.uniforms.high.value = routeAudio(a, p, 'distortion') * strength; this.material.uniforms.energy.value = routeAudio(a, p, 'light') * strength;
    this.material.uniforms.transitionAudio.value = routeAudio(a, p, 'transition') * strength;
    this.material.uniforms.psychedelic.value = Math.min(p.psychedelic, p.safeMode ? .3 : 1) * strength;
    this.material.uniforms.dissociation.value = Math.min(p.dissociation, p.safeMode ? .2 : 1) * strength;
    this.material.uniforms.transitionPower.value = p.safeMode ? strength * .4 : strength;
    for (const key of ['fractal', 'tunnelFx', 'liquid', 'iridescence'] as const) this.material.uniforms[key].value = Math.min(p[key], p.safeMode ? .25 : 1) * strength;
    this.material.uniforms.symmetry.value = p.symmetry;
    const styles = Object.keys(transitionNames).filter(k => k !== 'auto');
    const hash = [...state.world + state.nextWorld].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, p.seed);
    this.material.uniforms.style.value = p.transitionStyle === 'auto' ? hash % styles.length : styles.indexOf(p.transitionStyle);
    this.renderer.setRenderTarget(null); this.renderer.render(this.screen, this.camera);
    return { calls: calls + 1, triangles: triangles + 2, geometries: this.renderer.info.memory.geometries, textures: this.renderer.info.memory.textures };
  }
  dispose() { this.layers.forEach(l => l.dispose()); this.targets.forEach(t => t.dispose()); (this.screen.children[0] as T.Mesh).geometry.dispose(); this.material.dispose(); this.renderer.dispose(); }
}
