import * as T from 'three';
import { visionScenes } from './model';

/** Thirty compositions built from ten geometric vocabularies. No external assets. */
export function buildVision(world: string, root: T.Group, animated: T.Object3D[], rng: () => number, fast: boolean) {
  const entry = visionScenes.find(s => s[0] === world); if (!entry) return false;
  const [, , family, variant] = entry;
  const hue = (visionScenes.indexOf(entry) * .067 + .08) % 1;
  const ink = new T.MeshStandardMaterial({ color: new T.Color().setHSL(hue, .38, .22), metalness: .4, roughness: .55 });
  const gold = new T.MeshStandardMaterial({ color: '#d8b37a', metalness: .65, roughness: .3, emissive: '#38250b', emissiveIntensity: .35 });
  const jewel = new T.MeshStandardMaterial({ color: new T.Color().setHSL((hue + .38) % 1, .65, .55), metalness: .55, roughness: .25, emissive: new T.Color().setHSL(hue, .65, .12) });
  const light = new T.MeshStandardMaterial({ color: '#b9efe1', emissive: '#3d9089', emissiveIntensity: .7, roughness: .3 });
  const geometries = new Map<string, T.BufferGeometry>();
  const geometry = (kind: string) => {
    if (!geometries.has(kind)) geometries.set(kind, kind === 'orb' ? new T.SphereGeometry(1, fast ? 12 : 24, 12)
      : kind === 'gem' ? new T.OctahedronGeometry(1)
      : kind === 'ring' ? new T.TorusGeometry(1, .035, 6, fast ? 40 : 72)
      : kind === 'pole' ? new T.CylinderGeometry(.7, 1, 1, 8)
      : kind === 'roof' ? new T.ConeGeometry(1, 1, 4)
      : new T.BoxGeometry(1, 1, 1));
    return geometries.get(kind)!;
  };
  const add = (kind: string, mat: T.Material, x: number, y: number, z: number, sx = 1, sy = sx, sz = sx, parent: T.Object3D = root) => {
    const mesh = new T.Mesh(geometry(kind), mat); mesh.position.set(x, y, z); mesh.scale.set(sx, sy, sz); parent.add(mesh); return mesh;
  };
  const group = (x: number, y: number, z: number, moving = false) => { const g = new T.Group(); g.position.set(x, y, z); root.add(g); if (moving) animated.push(g); return g; };
  const tube = (points: T.Vector3[], radius: number, mat: T.Material, parent: T.Object3D = root) => {
    const mesh = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points), fast ? 32 : 64, radius, 6, false), mat); parent.add(mesh); return mesh;
  };
  const lotus = (x: number, y: number, z: number, size: number, layers: number, upright = false) => {
    const g = group(x, y, z, true); if (upright) g.rotation.x = Math.PI / 2;
    for (let layer = 0; layer < layers; layer++) for (let k = 0; k < 12; k++) {
      const a = k * Math.PI / 6 + layer * .23, r = size * (.55 + layer * .3);
      const petal = add('orb', layer % 2 ? jewel : gold, Math.cos(a) * r, layer * size * .15, Math.sin(a) * r, size * .65, size * .12, size * .25, g); petal.rotation.y = -a; petal.rotation.z = .22;
    }
    add('gem', light, 0, .35 * size, 0, size * .35, size * .6, size * .35, g);
  };
  const stupa = (x: number, y: number, z: number, s: number, floating = false) => {
    const g = group(x, y, z, floating);
    for (let j = 0; j < 4; j++) add('box', j % 2 ? gold : ink, 0, j * .35 * s, 0, (3 - j * .4) * s, .3 * s, (3 - j * .4) * s, g);
    add('orb', jewel, 0, 1.25 * s, 0, s, 1.1 * s, s, g);
    for (let j = 0; j < 7; j++) add('pole', gold, 0, (2.1 + j * .23) * s, 0, (.6 - j * .07) * s, .14 * s, (.6 - j * .07) * s, g);
    add('gem', light, 0, 3.9 * s, 0, .16 * s, .45 * s, .16 * s, g);
  };
  const wheel = (x: number, y: number, z: number, r: number, tilt = 0) => {
    const g = group(x, y, z, true); g.rotation.x = tilt;
    add('ring', gold, 0, 0, 0, r, r, r, g); add('ring', jewel, 0, 0, 0, r * .75, r * .75, r * .75, g);
    for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; const spoke = add('box', gold, Math.cos(a) * r * .5, Math.sin(a) * r * .5, 0, r, .08, .1, g); spoke.rotation.z = a; add('gem', light, Math.cos(a) * r, Math.sin(a) * r, 0, .16, .25, .16, g); }
    add('orb', jewel, 0, 0, 0, .3, .3, .3, g);
  };
  const pagoda = (x: number, y: number, z: number, s: number, tiers: number, upside = false) => {
    const g = group(x, y, z); if (upside) g.rotation.z = Math.PI;
    for (let j = 0; j < tiers; j++) {
      const w = s * (1 - j / (tiers + 1));
      add('box', ink, 0, j * s * .9, 0, w * 1.5, s * .65, w * 1.5, g);
      const roof = add('roof', j % 2 ? jewel : gold, 0, j * s * .9 + s * .5, 0, w * 1.7, s * .6, w * 1.7, g); roof.rotation.y = Math.PI / 4;
      for (const dx of [-1, 1]) for (const dz of [-1, 1]) add('pole', gold, dx * w * .65, j * s * .9, dz * w * .65, .07, s * .8, .07, g);
    }
  };
  if (family === 'lotus') {
    if (variant === 0) { add('box', ink, 0, -.8, -25, 65, .15, 90); for (let i = 0; i < 24; i++) lotus((rng() - .5) * 28, -.2, 4 - i * 2.5, .6 + rng(), 2); }
    if (variant === 1) { lotus(0, 3, -18, 3, 7, true); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; lotus(Math.cos(a) * 9, 4 + Math.sin(a) * 7, -27, 1.3, 2, true); } }
    if (variant === 2) for (let i = 0; i < 14; i++) lotus(0, 3, 1 - i * 5, 3.5, 2, true);
  } else if (family === 'stupa') {
    if (variant === 0) { add('box', ink, 0, -.4, -30, 70, .5, 100); for (let i = 0; i < 30; i++) stupa((i % 2 ? -1 : 1) * (4 + rng() * 15), 0, 3 - i * 2.4, .6 + rng()); }
    if (variant === 1) { stupa(0, 2, -18, 2, true); for (let i = 0; i < 7; i++) wheel(0, 3, -22 - i * 3, 4 + i * .6, .2); }
    if (variant === 2) for (let i = 0; i < 36; i++) { const a = i * .6; stupa(Math.cos(a) * (4 + i * .12), -2 + i * .3, -20 + Math.sin(a) * 8, .5 + i * .01); }
  } else if (family === 'wheel') {
    if (variant === 0) { wheel(0, 4, -19, 6); for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; wheel(Math.cos(a) * 9, 4 + Math.sin(a) * 9, -25, 1.6); } }
    if (variant === 1) for (let i = 0; i < 16; i++) wheel(0, 3, 1 - i * 4, 4.5);
    if (variant === 2) for (let i = 0; i < 15; i++) { const a = i * 2.4; wheel(Math.cos(a) * 5, 3 + Math.sin(a) * 4, -12 - i * 2, 2 + rng() * 2, a); }
  } else if (family === 'knot') {
    const count = variant === 0 ? 1 : variant === 1 ? 14 : 9;
    for (let i = 0; i < count; i++) {
      const g = group(variant === 2 ? (i % 3 - 1) * 5 : 0, variant === 2 ? 1 + Math.floor(i / 3) * 4 : 3, variant === 1 ? -3 - i * 4 : -18 - i * .2, true);
      const points: T.Vector3[] = []; const size = variant === 0 ? 4 : 2;
      for (let j = 0; j <= 180; j++) { const a = j / 180 * Math.PI * 2; points.push(new T.Vector3(Math.sin(3 * a) * size, Math.sin(4 * a) * size, Math.cos(5 * a) * .65)); }
      tube(points, variant === 0 ? .16 : .07, i % 2 ? gold : jewel, g);
      if (variant === 0) { wheel(0, 3, -21, 6); add('box', ink, 0, -.8, -18, 11, .5, 8); }
      if (variant === 1) add('box', ink, 0, -.4, -3 - i * 4, 4, .2, 3.7);
    }
  } else if (family === 'pagoda') {
    if (variant === 0) for (let i = 0; i < 15; i++) { const x = (i % 2 ? -1 : 1) * (5 + rng() * 12), z = -8 - i * 4; pagoda(x, rng() * 4, z, 1.5, 4); add('orb', ink, x, -1, z, 4, .5, 3); }
    if (variant === 1) { pagoda(0, -1, -22, 4, 5); pagoda(0, 18, -22, 4, 5, true); }
    if (variant === 2) for (let i = 0; i < 7; i++) { pagoda(-6, 0, -i * 9, 2, 4); pagoda(6, 0, -i * 9, 2, 4); add('box', gold, 0, 6, -i * 9, 12, .25, 1); }
  } else if (family === 'lantern') {
    const g = group(0, 0, 0, variant === 2);
    for (let i = 0; i < 120; i++) {
      const a = i * .38, z = variant === 2 ? -20 + Math.sin(a) * (2 + i * .04) : 8 - i * .65;
      const x = variant === 0 ? Math.sin(i * .14) * 6 + (rng() - .5) * 4 : variant === 1 ? Math.cos(a) * 9 : Math.cos(a) * (2 + i * .04);
      const y = variant === 0 ? .3 + rng() * 2 : variant === 1 ? 3 + Math.abs(Math.sin(a)) * 8 : -2 + i * .12;
      add('orb', jewel, x, y, z, .24, .45, .24, g); add('pole', gold, x, y + .42, z, .25, .08, .25, g); add('gem', light, x, y, z, .12, .5, .12, g);
    }
    if (variant === 0) add('box', ink, 0, -.4, -30, 45, .1, 100);
  } else if (family === 'vajra') {
    if (variant === 0) {
      const g = group(0, 3, -17, true); add('orb', jewel, 0, 0, 0, 1, 1, 1, g);
      for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; const pts = Array.from({ length: 33 }, (_, j) => { const t = j / 32 * Math.PI * 2; return new T.Vector3(Math.cos(a) * Math.sin(t) * 2, Math.sin(a) * Math.sin(t) * 2, Math.cos(t) * 5); }); tube(pts, .1, gold, g); }
      wheel(0, 3, -25, 7);
    }
    if (variant === 1) for (let i = 0; i < 100; i++) { const g = group((rng() - .5) * 30, rng() * 16 - 3, 4 - rng() * 70, true); add('gem', i % 3 ? jewel : gold, 0, 0, 0, .2 + rng() * .4, 1.1 + rng(), .3, g); }
    if (variant === 2) for (let z = 0; z < 8; z++) for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; const mesh = add('gem', (z + k) % 2 ? gold : jewel, Math.cos(a) * 5, 3 + Math.sin(a) * 5, -z * 6, .7, 2, .7); mesh.rotation.z = a; }
  } else if (family === 'net') {
    if (variant === 0) {
      for (let row = 0; row < 9; row++) {
        const pts: T.Vector3[] = []; for (let col = 0; col < 13; col++) { const x = (col - 6) * 2, y = (row - 4) * 1.7 + 4, z = -22 + Math.cos(col * .5) * 3; pts.push(new T.Vector3(x, y, z)); add('gem', jewel, x, y, z, .23); } tube(pts, .025, gold);
      }
      for (let col = 0; col < 13; col++) tube([new T.Vector3((col - 6) * 2, -3, -22 + Math.cos(col * .5) * 3), new T.Vector3((col - 6) * 2, 12, -22 + Math.cos(col * .5) * 3)], .025, gold);
    }
    if (variant === 1) for (let j = 0; j < 18; j++) for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6 + j * .12; add('gem', k % 3 ? jewel : gold, Math.cos(a) * 7, 3 + Math.sin(a) * 7, 5 - j * 4, .7, 1.3, .7); }
    if (variant === 2) for (let i = 0; i < 18; i++) { const g = group(Math.sin(i * 1.7) * 4, 3, 1 - i * 4, true); add('box', jewel, 0, 0, 0, 3.8, 5.5, .08, g); for (const s of [-1, 1]) { add('box', gold, s * 2, 0, 0, .08, 5.8, .2, g); add('box', gold, 0, s * 2.9, 0, 4.1, .08, .2, g); } }
  } else if (family === 'terrace') {
    if (variant === 0) { for (let i = 0; i < 16; i++) { const mesh = add('box', i % 3 ? ink : gold, 0, i * .55 - 2, -27, 18 - i, .5, 18 - i); mesh.rotation.y = i * .1; } stupa(0, 7, -27, 1); }
    if (variant === 1) for (let i = 0; i < 64; i++) { const a = i * .24, r = 2 + i * .12; const mesh = add('box', i % 4 ? jewel : gold, Math.cos(a) * r, i * .13 - 2, -22 + Math.sin(a) * r, 2, .2, 1.4); mesh.rotation.y = -a; }
    if (variant === 2) for (let i = 0; i < 16; i++) { const x = (rng() - .5) * 30, y = rng() * 9 - 3, z = -8 - i * 4; add('gem', ink, x, y - 2, z, 3, 3, 3); add('box', jewel, x, y, z, 4, .2, 4); stupa(x, y + .2, z, .5); }
  } else if (family === 'bodhi') {
    const trees = variant === 0 ? 1 : variant === 1 ? 12 : 8;
    for (let i = 0; i < trees; i++) {
      const g = group(variant === 1 ? (i % 2 ? -5 : 5) : 0, variant === 2 ? 3 : 0, variant === 1 ? -i * 6 : -20, variant === 2);
      if (variant === 2) g.rotation.z = i * Math.PI / 4;
      const height = variant === 0 ? 9 : 5; add('pole', gold, 0, height / 2, 0, .3, height, .3, g);
      for (let k = 0; k < 16; k++) {
        const a = k * 2.4, r = 2 + rng() * 3, y = height * (.55 + rng() * .45);
        tube([new T.Vector3(0, 1, 0), new T.Vector3(Math.cos(a) * r * .4, y * .7, Math.sin(a) * r * .4), new T.Vector3(Math.cos(a) * r, y, Math.sin(a) * r)], .055, gold, g);
        add('orb', jewel, Math.cos(a) * r, y, Math.sin(a) * r, .8, .13, .45, g);
        if (variant === 0) add('gem', light, Math.cos(a) * r, y - .5, Math.sin(a) * r, .1, .3, .1, g);
      }
    }
    if (variant === 0) { lotus(0, .2, -16, 1.6, 3); add('box', ink, 0, -.4, -22, 22, .5, 20); }
  }
  // Batch static meshes recursively, leaving animated group transforms intact.
  const batch = (parent: T.Object3D) => {
    const groups = new Map<T.BufferGeometry, Map<T.Material, T.Mesh[]>>();
    for (const child of [...parent.children]) {
      if (child instanceof T.Group) batch(child);
      if (!(child instanceof T.Mesh) || Array.isArray(child.material)) continue;
      const byMaterial = groups.get(child.geometry) ?? new Map<T.Material, T.Mesh[]>(); groups.set(child.geometry, byMaterial);
      const list = byMaterial.get(child.material) ?? []; list.push(child); byMaterial.set(child.material, list);
    }
    for (const [geo, byMaterial] of groups) for (const [mat, meshes] of byMaterial) if (meshes.length > 1) {
      const inst = new T.InstancedMesh(geo, mat, meshes.length);
      meshes.forEach((mesh, i) => { mesh.updateMatrix(); inst.setMatrixAt(i, mesh.matrix); parent.remove(mesh); }); inst.computeBoundingSphere(); parent.add(inst);
    }
  };
  batch(root);
  const used = new Set<T.Material>(); root.traverse(o => { if (o instanceof T.Mesh && !Array.isArray(o.material)) used.add(o.material); });
  for (const mat of [ink, gold, jewel, light]) if (!used.has(mat)) mat.dispose();
  return true;
}
