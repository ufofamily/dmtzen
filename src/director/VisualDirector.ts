import { random, visionScenes, odysseyScenes, type Project, type Marker } from '../core/model';
export function generateShow(p: Project): Marker[] {
  if (p.world !== 'journey') return [{ time: 0, world: p.world }];
  const all = ['temple', 'garden', 'forest', 'crystals', 'mandala', ...visionScenes.map(s => s[0]), ...odysseyScenes.map(s => s.id), 'library', 'chambers', 'ocean', 'observers', 'organic', 'orrery', 'cathedral', 'void', 'rebirth'];
  const count = Math.max(1, Math.min(all.length, Math.floor(p.duration / 12)));
  const worlds = count === 1 ? ['temple'] : Array.from({ length: count }, (_, i) => all[Math.round(i * (all.length - 1) / (count - 1))]);
  const rng = random(p.seed), weights = worlds.map(() => .8 + rng() * .4), total = weights.reduce((a, b) => a + b, 0);
  let cursor = 0;
  return worlds.map((world, i) => { const mark = { time: cursor, world }; cursor += p.duration * weights[i] / total; return mark; });
}
export function sceneAt(time: number, p: Project, automatic = generateShow(p)) {
  const show = [...new Map([...automatic, ...p.markers].map(m => [m.time, m])).values()].sort((a, b) => a.time - b.time);
  let index = 0; for (let i = 0; i < show.length; i++) if (show[i].time <= time) index = i;
  const current = show[index], next = show[index + 1];
  // Reveal the next world inside the current one, reaching it exactly at its marker.
  // The window is clipped to this interval, so dense/manual markers never overlap three worlds.
  const window = next ? Math.min(p.transition, next.time - current.time) : 0;
  const progress = next && window > 0 ? Math.max(0, Math.min(1, (time - next.time + window) / window)) : 0;
  const blend = progress * progress * (3 - 2 * progress);
  let intensity = p.intensity;
  if (p.keyframes.length) {
    let left = { time: 0, value: p.intensity }, right = null;
    for (const k of p.keyframes) { if (k.time <= time) left = k; else { right = k; break; } }
    intensity = right ? left.value + (right.value - left.value) * Math.max(0, Math.min(1, (time - left.time) / Math.max(.00001, right.time - left.time))) : left.value;
  }
  return { world: current.world, nextWorld: next?.world ?? current.world, blend, exposure: 1, intensity };
}
