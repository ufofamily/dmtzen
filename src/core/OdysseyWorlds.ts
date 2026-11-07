import * as T from 'three';
import { odysseyScenes } from './model';

/** 14 structural motifs × 5 spatial scores; not merely color presets. */
export function buildOdyssey(world: string, root: T.Group, animated: T.Object3D[], rng: () => number, fast: boolean) {
  const scene = odysseyScenes.find(s => s.id === world); if (!scene) return false;
  const { family, variant } = scene, index = odysseyScenes.indexOf(scene);
  const hue = (index * .037 + .12) % 1;
  const colors = [new T.Color('#d9b774'), new T.Color().setHSL(hue, .65, .5), new T.Color().setHSL((hue + .35) % 1, .4, .3)];
  const mats = colors.map((color, i) => new T.MeshStandardMaterial({ color, metalness: .45, roughness: .35, emissive: color.clone().multiplyScalar(i === 1 ? .18 : .03) }));
  const geo = new Map<string, T.BufferGeometry>();
  const cached = (id: string, make: () => T.BufferGeometry) => { if (!geo.has(id)) geo.set(id, make()); return geo.get(id)!; };
  const shape = (id: string) => cached(id, () => id === 'ring' ? new T.TorusGeometry(1, .055, 6, fast ? 36 : 72) : id === 'sphere' ? new T.SphereGeometry(1, 16, 12) : id === 'cone' ? new T.ConeGeometry(1, 1, 12) : id === 'drum' ? new T.CylinderGeometry(1, 1, 1, 16) : id === 'gem' ? new T.OctahedronGeometry(1) : new T.BoxGeometry(1, 1, 1));
  const add = (g: T.Object3D, kind: string | T.BufferGeometry, m: number, x: number, y: number, z: number, sx = 1, sy = sx, sz = sx) => {
    const mesh = new T.Mesh(typeof kind === 'string' ? shape(kind) : kind, mats[m]); mesh.position.set(x, y, z); mesh.scale.set(sx, sy, sz); g.add(mesh); return mesh;
  };
  const curve = (id: string, points: T.Vector3[], radius = .07) => cached(id, () => new T.TubeGeometry(new T.CatmullRomCurve3(points), fast ? 48 : 96, radius, 6, false));
  const unit = (g: T.Group) => {
    if (family === 'torus') {
      for (let j = 0; j < 5; j++) { const r = add(g, 'ring', j % 3, 0, 0, 0, 1.5 + j * .2); r.rotation.set(j * .36, j * .22, 0); }
      add(g, 'gem', 1, 0, 0, 0, .55);
    } else if (family === 'helix') {
      for (let side = 0; side < 2; side++) {
        const points = Array.from({ length: 65 }, (_, j) => { const a = j / 64 * Math.PI * 6 + side * Math.PI; return new T.Vector3(Math.cos(a), j / 64 * 5 - 2.5, Math.sin(a)); });
        add(g, curve(`helix${side}`, points), side, 0, 0, 0);
      }
      for (let j = 0; j < 12; j++) { const a = j * Math.PI / 2; add(g, 'box', 2, 0, j / 11 * 5 - 2.5, 0, 2, .045, .045).rotation.y = -a; }
    } else if (family === 'flame') {
      for (let j = 0; j < 7; j++) {
        const a = j * Math.PI * 2 / 7;
        const points = Array.from({ length: 33 }, (_, k) => { const t = k / 32; return new T.Vector3(Math.cos(a + t * 2) * Math.sin(t * Math.PI), t * 4 - 2, Math.sin(a + t * 2) * Math.sin(t * Math.PI)); });
        add(g, curve(`flame${j}`, points, .1), j % 2, 0, 0, 0);
      }
      add(g, 'ring', 0, 0, -2, 0, 1.2).rotation.x = Math.PI / 2;
    } else if (family === 'drum') {
      add(g, 'drum', 1, 0, 0, 0, .8, 2.4, .8);
      add(g, 'drum', 0, 0, 0, 0, .07, 4, .07);
      for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; add(g, 'gem', 0, Math.cos(a) * .82, 0, Math.sin(a) * .82, .14, .6, .14); }
      for (const y of [-1.2, 1.2]) add(g, 'ring', 0, 0, y, 0, .88).rotation.x = Math.PI / 2;
    } else if (family === 'scroll') {
      add(g, 'box', 1, 0, 0, 0, 2.3, 3.2, .05);
      for (const y of [-1.6, 1.6]) add(g, 'drum', 0, 0, y, 0, .17, 2.8, .17).rotation.z = Math.PI / 2;
      for (let j = 0; j < 9; j++) add(g, 'box', 0, Math.sin(j) * .12, j * .28 - 1.1, .055, .8 + (j % 3) * .4, .045, .02);
    } else if (family === 'cloud') {
      for (let j = 0; j < 9; j++) { const a = j * 2.4; add(g, 'sphere', j % 3, Math.cos(a) * 1.2, Math.sin(a * .6) * .5, Math.sin(a) * .8, .8, .35 + j * .02, .7); }
      add(g, 'cone', 0, 0, 1, 0, .7, .7, .7); add(g, 'gem', 1, 0, 1.8, 0, .2, .5, .2);
    } else if (family === 'bridge') {
      for (let j = 0; j < 9; j++) { const z = j * .5 - 2; const y = Math.cos(z * .6) * .65; add(g, 'box', j % 3, 0, y, z, 2.4, .15, .46); for (const side of [-1, 1]) add(g, 'box', 0, side * 1.1, y + .6, z, .06, 1.2, .06); }
      for (const side of [-1, 1]) { const points = Array.from({ length: 17 }, (_, j) => { const z = j / 16 * 4 - 2; return new T.Vector3(side * 1.1, 1.2 + Math.cos(z * .6) * .65, z); }); add(g, curve(`bridge${side}`, points), 0, 0, 0, 0); }
    } else if (family === 'maze') {
      for (let j = 0; j < 5; j++) { const r = .4 + j * .4; add(g, 'box', j % 3, 0, r, 0, r * 2, .12, .3); add(g, 'box', j % 3, r, 0, 0, .12, r * 2, .3); add(g, 'box', j % 3, 0, -r, 0, r * 2, .12, .3); add(g, 'box', 0, -r, r * .3, 0, .12, r * 1.4, .3); }
    } else if (family === 'bell') {
      const bell = cached('bell-profile', () => new T.LatheGeometry([new T.Vector2(1.2, -1), new T.Vector2(1.1, -.8), new T.Vector2(.65, -.3), new T.Vector2(.5, .7), new T.Vector2(.1, 1)], 24));
      add(g, bell, 0, 0, 0, 0); add(g, 'gem', 1, 0, -.5, 0, .2, .6, .2); add(g, 'ring', 0, 0, 1.3, 0, .3);
    } else if (family === 'parasol') {
      add(g, 'cone', 1, 0, 1, 0, 2, .6, 2); add(g, 'drum', 0, 0, -.4, 0, .06, 3.4, .06);
      for (let j = 0; j < 12; j++) { const a = j * Math.PI / 6; add(g, 'box', 0, Math.cos(a) * 1.8, .2, Math.sin(a) * 1.8, .04, 1.1, .04); add(g, 'gem', 1, Math.cos(a) * 1.8, -.4, Math.sin(a) * 1.8, .09, .2, .09); }
    } else if (family === 'aurora') {
      for (let k = 0; k < 5; k++) {
        const points = Array.from({ length: 49 }, (_, j) => { const t = j / 48 * 6 - 3; return new T.Vector3(t, Math.sin(t * 1.5 + k * .4) * .8 + k * .3, Math.cos(t + k) * .6); });
        add(g, curve(`aurora${k}`, points, .12), k % 3, 0, 0, 0);
      }
    } else if (family === 'gyroid') {
      for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) { const ring = add(g, 'ring', (x + y + 4) % 3, x * 1.1, y * 1.1, Math.sin(x + y) * .6, .8); ring.rotation.set(x * .7, y * .7, 0); }
    } else if (family === 'shell') {
      const points = Array.from({ length: 129 }, (_, j) => { const a = j / 128 * Math.PI * 7, r = .15 + j / 128 * 1.8; return new T.Vector3(Math.cos(a) * r, Math.sin(a) * r, j / 128 * 2 - 1); });
      add(g, curve('shell', points, .11), 0, 0, 0, 0); add(g, 'sphere', 1, 0, 0, -.8, .35);
    } else if (family === 'eye') {
      add(g, 'ring', 0, 0, 0, 0, 2, .8, 1); add(g, 'sphere', 1, 0, 0, 0, .65, .65, .3); add(g, 'gem', 2, 0, 0, .35, .3); for (let j = 0; j < 6; j++) add(g, 'ring', j % 3, 0, 0, -.2 - j * .2, .8 + j * .15);
    }
  };
  const count = [12, 14, 18, 15, 5][variant];
  for (let i = 0; i < count; i++) {
    const g = new T.Group(), a = i / count * Math.PI * 2;
    if (variant === 0) { g.position.set(i % 2 ? -3.5 : 3.5, 3, 2 - i * 4.8); g.rotation.y = i % 2 ? -.3 : .3; }
    if (variant === 1) { g.position.set(Math.cos(a) * 9, 4 + Math.sin(a) * 7, -24 + Math.sin(a * 2) * 3); g.rotation.z = a + Math.PI / 2; }
    if (variant === 2) { g.position.set(Math.cos(i * .7) * (3 + i * .2), 1 + i * .35, -12 - i * 2.4); g.rotation.y = i * .3; g.scale.setScalar(.6 + i * .025); }
    if (variant === 3) { g.position.set((i % 5 - 2) * 5, 2 + Math.floor(i / 5) * 3, -12 - Math.floor(i / 5) * 10); g.scale.setScalar(.7 + rng() * .25); }
    if (variant === 4) { g.position.set(0, 3, -12 - i * 8); g.scale.setScalar(1.5 + i * .3); g.rotation.z = i * .35; }
    root.add(g); unit(g);
    // Static architecture does not tumble; floating ritual objects do.
    if (!['bridge', 'scroll', 'parasol', 'maze'].includes(family)) animated.push(g);
  }
  if ([0, 3].includes(variant)) add(root, 'box', 2, 0, -.8, -30, 35, .3, 100);
  // Reuse geometries across all repetitions; instance each group's repeated parts.
  root.traverse(parent => {
    if (!(parent instanceof T.Group)) return;
    const batches = new Map<T.BufferGeometry, Map<T.Material, T.Mesh[]>>();
    for (const child of parent.children) if (child instanceof T.Mesh && !Array.isArray(child.material)) {
      const by = batches.get(child.geometry) ?? new Map<T.Material, T.Mesh[]>(); batches.set(child.geometry, by);
      const list = by.get(child.material) ?? []; list.push(child); by.set(child.material, list);
    }
    for (const [geometry, by] of batches) for (const [material, list] of by) if (list.length > 1) {
      const mesh = new T.InstancedMesh(geometry, material, list.length); list.forEach((part, j) => { part.updateMatrix(); mesh.setMatrixAt(j, part.matrix); parent.remove(part); }); mesh.computeBoundingSphere(); parent.add(mesh);
    }
  });
  const used = new Set<T.Material>(); root.traverse(o => { if (o instanceof T.Mesh && !Array.isArray(o.material)) used.add(o.material); }); mats.forEach(m => { if (!used.has(m)) m.dispose(); });
  return true;
}
