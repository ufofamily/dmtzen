export type Marker = { time: number; world: string };
export type Keyframe = { time: number; value: number };
export const defaultExportSettings = { width: 1280, height: 720, fps: 24, start: 0, end: null as number | null, segmentSeconds: 30, crf: 20, renderScale: 1, codec: 'auto', software: false };
export type ExportConfiguration = typeof defaultExportSettings;
export const worldNames: Record<string, string> = { temple: 'Temple of Stillness', garden: 'Infinite Zen Garden', mandala: 'Mandala Palace', chambers: 'Hyperdimensional Chambers', observers: 'Multiple Observers', organic: 'Organic Visions', void: 'The Void', rebirth: 'Return / Rebirth' };
Object.assign(worldNames, { forest: 'Forest of Light', crystals: 'Crystal Caverns', library: 'Infinite Archive', ocean: 'Celestial Ocean', orrery: 'Astral Orrery', cathedral: 'Floating Cathedral' });
// Original geometric interpretations, not reconstructions of sacred sites or iconography.
export const visionScenes = [
  ['lotusLake', 'Lotus Lake / Озеро лотосов', 'lotus', 0], ['thousandPetals', 'Thousand-Petal Sanctuary / Тысяча лепестков', 'lotus', 1], ['lotusTunnel', 'Lotus Birth Canal / Лотосовый тоннель', 'lotus', 2],
  ['stupaField', 'Stupa Constellation / Созвездие ступ', 'stupa', 0], ['levitatingStupa', 'Levitating Reliquary / Парящая ступа', 'stupa', 1], ['stupaSpiral', 'Spiral Pilgrimage / Спираль паломника', 'stupa', 2],
  ['dharmaSun', 'Dharma Sun / Солнце Дхармы', 'wheel', 0], ['wheelCorridor', 'Wheel Corridor / Коридор колёс', 'wheel', 1], ['wheelCosmos', 'Interlocking Dharma / Переплетение колёс', 'wheel', 2],
  ['endlessKnot', 'Endless Knot / Бесконечный узел', 'knot', 0], ['knotBridge', 'Knot Bridge / Мост узлов', 'knot', 1], ['wovenSpace', 'Woven Emptiness / Ткань пустоты', 'knot', 2],
  ['cloudPagodas', 'Cloud Pagodas / Облачные пагоды', 'pagoda', 0], ['invertedPagoda', 'Inverted Monastery / Перевёрнутый монастырь', 'pagoda', 1], ['pagodaGate', 'Gate of Roofs / Врата крыш', 'pagoda', 2],
  ['lanternRiver', 'Lantern River / Река фонарей', 'lantern', 0], ['lanternVault', 'Lantern Vault / Свод фонарей', 'lantern', 1], ['offeringSpiral', 'Spiral of Offerings / Спираль подношений', 'lantern', 2],
  ['vajraCore', 'Vajra Core / Алмазное ядро', 'vajra', 0], ['diamondRain', 'Diamond Rain / Алмазный дождь', 'vajra', 1], ['vajraLattice', 'Vajra Lattice / Алмазная решётка', 'vajra', 2],
  ['indrasNet', 'Indra’s Net / Сеть Индры', 'net', 0], ['jewelCavern', 'Jewel Cavern / Пещера самоцветов', 'net', 1], ['mirrorBardo', 'Mirror Bardo / Зеркальное бардо', 'net', 2],
  ['meruMountain', 'Mount Meru / Гора Меру', 'terrace', 0], ['mandalaSteps', 'Mandala Steps / Ступени мандалы', 'terrace', 1], ['floatingIslands', 'Islands of Silence / Острова тишины', 'terrace', 2],
  ['bodhiTree', 'Bodhi Dream / Сон Бодхи', 'bodhi', 0], ['rootCathedral', 'Cathedral of Roots / Собор корней', 'bodhi', 1], ['seedUniverse', 'Seed Universe / Вселенная семени', 'bodhi', 2],
] as const;
for (const [id, name] of visionScenes) worldNames[id] = name;
export const odysseyFamilies = [
  ['torus', 'Тороидальные врата', ['Кольца Самадхи', 'Алмазный экватор', 'Спираль возвращения', 'Обитель торов', 'Сердце тора']],
  ['helix', 'Спирали сознания', ['Двойная бесконечность', 'Спиральная корона', 'Лестница сновидений', 'Лес спиралей', 'Ось пробуждения']],
  ['flame', 'Пламена мудрости', ['Огненный проход', 'Венец мудрости', 'Вихрь светильников', 'Сад языков пламени', 'Внутренний огонь']],
  ['drum', 'Молитвенные барабаны', ['Аллея молитв', 'Небесное вращение', 'Барабанная спираль', 'Зал резонанса', 'Пульс монастыря']],
  ['scroll', 'Свитки пустоты', ['Коридор сутр', 'Созвездие свитков', 'Лента памяти', 'Архив безмолвия', 'Раскрытая сутра']],
  ['cloud', 'Облачные обители', ['Облачный проход', 'Венец тумана', 'Спираль облаков', 'Архипелаг сна', 'Облако пустоты']],
  ['bridge', 'Мосты бардо', ['Мост паломника', 'Кольцевой мост', 'Восходящие мосты', 'Перекрёсток миров', 'Мост без берегов']],
  ['maze', 'Лабиринты мандалы', ['Квадратный лабиринт', 'Лабиринт горизонтов', 'Изломы пути', 'Дворцы лабиринта', 'Центр без выхода']],
  ['bell', 'Колокола тишины', ['Звон пустоты', 'Небесная звонница', 'Спираль обертонов', 'Колокольный сад', 'Великий резонатор']],
  ['parasol', 'Небесные зонты', ['Проход под зонтами', 'Корона защиты', 'Спираль шелка', 'Сад балдахинов', 'Зонт вселенной']],
  ['aurora', 'Шёлковые сияния', ['Река сияния', 'Полярная мандала', 'Ленты перерождения', 'Тканый горизонт', 'Шёлковый источник']],
  ['gyroid', 'Ячеистые миры', ['Пористый тоннель', 'Клеточная сфера', 'Спираль мембран', 'Архитектура клеток', 'Дышащая ячейка']],
  ['shell', 'Раковины бесконечности', ['Путь раковин', 'Жемчужная корона', 'Золотая спираль', 'Сад раковин', 'Первичный звук']],
  ['eye', 'Созерцающие сферы', ['Аллея созерцания', 'Круг свидетелей', 'Спираль восприятия', 'Зал наблюдателей', 'Око пустоты']],
] as const;
export const odysseyScenes = odysseyFamilies.flatMap(([family, , names]) => names.map((name, variant) => ({ id: `odyssey_${family}_${variant}`, name, family, variant })));
for (const s of odysseyScenes) worldNames[s.id] = s.name;
export const transitionNames: Record<string, string> = { auto: 'Automatic / varied', portal: 'Soft portal', lotus: 'Lotus aperture', vortex: 'Vortex', dissolve: 'Cellular dissolve', prism: 'Prismatic facets', ripple: 'Concentric ripples', silk: 'Silk curtain', spiral: 'Spiral petals', lattice: 'Lattice opening', horizon: 'Horizon split', iris: 'Iris breathing', mosaic: 'Mosaic', tunnel: 'Tunnel dive' };
export type AudioBand = 'bass' | 'rms' | 'high' | 'mix' | 'off';
export const routeNames = { geometry: 'Geometry / масштаб', light: 'Lighting / свет', particles: 'Particles / частицы', surface: 'Surfaces / узоры', camera: 'Camera / глубина', distortion: 'DMT / искажения', transition: 'Transitions / переходы' };
export type RouteTarget = keyof typeof routeNames;
export type AudioRouting = Record<RouteTarget, { band: AudioBand; amount: number }>;
export const defaultAudioRouting: AudioRouting = { geometry: { band: 'bass', amount: 1 }, light: { band: 'rms', amount: 1 }, particles: { band: 'high', amount: 1 }, surface: { band: 'mix', amount: 1 }, camera: { band: 'bass', amount: 1 }, distortion: { band: 'high', amount: 1 }, transition: { band: 'bass', amount: 1 } };
export const defaults = { schemaVersion: 1, seed: 1337, duration: 180, intensity: 0.7, speed: 0.3, fog: 0.035, exposure: 1.15, safeMode: true, world: 'temple', quality: 'balanced', audio: '', audioId: '', camera: 'dolly', transition: 4, audioGain: 1, bassGain: 1, rmsGain: 1, highGain: 1, audioSmoothing: .245, audioGate: 0, audioRouting: defaultAudioRouting, surfaceFx: .3, psychedelic: .25, dissociation: .15, fractal: 0, tunnelFx: 0, liquid: 0, iridescence: 0, symmetry: 6, dynamicsMode: 'off', dynamicsAmount: .65, dynamicsFloor: .35, dynamicsCeiling: 1.4, dynamicsWindow: 2, transitionStyle: 'auto', artisticPreset: 'Dark Ritual Meditation', markers: [] as Marker[], keyframes: [] as Keyframe[], exportSettings: { ...defaultExportSettings } };
export type Project = typeof defaults;
export function projectFrom(value: unknown): Project {
  if (!value || typeof value !== 'object') throw new Error('Project must be a JSON object');
  const v = value as Record<string, unknown>;
  if (v.schemaVersion !== undefined && v.schemaVersion !== 1) throw new Error('Unsupported project schema');
  const p = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof Project)[]) {
    if (v[key] !== undefined) {
      if (typeof v[key] !== typeof defaults[key]) throw new Error(`Invalid ${key}`);
      Object.assign(p, { [key]: v[key] });
    }
  }
  for (const [key, min, max] of [['seed', 0, 4294967295], ['duration', .1, 86400], ['intensity', 0, 2], ['speed', 0, 2], ['fog', 0, .15], ['exposure', .1, 3]] as const) {
    if (!Number.isFinite(p[key]) || p[key] < min || p[key] > max) throw new Error(`Out of range: ${key}`);
  }
  if (!Number.isInteger(p.seed)) throw new Error('Seed must be an integer');
  for (const key of ['audioGain', 'surfaceFx', 'psychedelic', 'dissociation'] as const) if (!Number.isFinite(p[key]) || p[key] < 0 || p[key] > (key === 'audioGain' ? 4 : 1)) throw new Error(`Invalid ${key}`);
  if (!Object.hasOwn(transitionNames, p.transitionStyle)) throw new Error('Invalid transition style');
  for (const key of ['fractal', 'tunnelFx', 'liquid', 'iridescence', 'dynamicsAmount'] as const) if (!Number.isFinite(p[key]) || p[key] < 0 || p[key] > 1) throw new Error(`Invalid ${key}`);
  for (const [key, min, max] of [['symmetry', 2, 16], ['dynamicsFloor', .1, 1], ['dynamicsCeiling', 1, 2], ['dynamicsWindow', .1, 8]] as const) if (!Number.isFinite(p[key]) || p[key] < min || p[key] > max) throw new Error(`Invalid ${key}`);
  if (!Number.isInteger(p.symmetry) || !['off', 'breathe', 'energy', 'contrast'].includes(p.dynamicsMode)) throw new Error('Invalid musical dynamics');
  for (const [key, max] of [['bassGain', 4], ['rmsGain', 4], ['highGain', 4], ['audioSmoothing', 2], ['audioGate', .2]] as const) if (!Number.isFinite(p[key]) || p[key] < 0 || p[key] > max) throw new Error(`Invalid ${key}`);
  if (!p.audioRouting || typeof p.audioRouting !== 'object' || Array.isArray(p.audioRouting)) throw new Error('Invalid audio routing');
  const routing = {} as AudioRouting;
  for (const key of Object.keys(routeNames) as RouteTarget[]) {
    const route = p.audioRouting[key] === undefined ? defaultAudioRouting[key] : p.audioRouting[key];
    if (!route || !['bass', 'rms', 'high', 'mix', 'off'].includes(route.band) || !Number.isFinite(route.amount) || route.amount < 0 || route.amount > 2) throw new Error(`Invalid audio route: ${key}`);
    routing[key] = { band: route.band, amount: route.amount };
  }
  p.audioRouting = routing;
  if (p.audioId && !/^[a-f0-9]{64}$/.test(p.audioId)) throw new Error('Invalid local audio reference');
  if (!Object.hasOwn(worldNames, p.world) && p.world !== 'journey') throw new Error('Unknown world');
  if (!Number.isFinite(p.transition) || p.transition < 0 || p.transition > 30) throw new Error('Invalid transition duration');
  if (!Array.isArray(p.markers) || !p.markers.every(m => m && Number.isFinite(m.time) && m.time >= 0 && m.time <= p.duration && typeof m.world === 'string' && Object.hasOwn(worldNames, m.world))) throw new Error('Invalid scene markers');
  if (!Array.isArray(p.keyframes) || !p.keyframes.every(k => k && Number.isFinite(k.time) && k.time >= 0 && k.time <= p.duration && Number.isFinite(k.value) && k.value >= 0 && k.value <= 2)) throw new Error('Invalid intensity keyframes');
  p.markers = [...p.markers].sort((a, b) => a.time - b.time); p.keyframes = [...p.keyframes].sort((a, b) => a.time - b.time);
  if (!['fast', 'balanced', 'high'].includes(p.quality)) throw new Error('Unknown quality');
  if (!['dolly', 'orbit', 'static'].includes(p.camera)) throw new Error('Unknown camera');
  if (!p.exportSettings || typeof p.exportSettings !== 'object' || Array.isArray(p.exportSettings)) throw new Error('Invalid export settings');
  p.exportSettings = { ...defaultExportSettings, ...p.exportSettings };
  const ex = p.exportSettings;
  for (const [key, min, max] of [['width', 64, 7680], ['height', 64, 4320], ['fps', 1, 120], ['crf', 0, 51], ['start', 0, p.duration], ['segmentSeconds', .1, 3600], ['renderScale', .25, 2]] as const) {
    if (!Number.isFinite(ex[key]) || ex[key] < min || ex[key] > max) throw new Error(`Invalid export ${key}`);
  }
  if (ex.width % 2 || ex.height % 2 || !Number.isInteger(ex.crf)) throw new Error('Export dimensions must be even and CRF must be an integer');
  if (ex.start >= p.duration || (ex.end !== null && (!Number.isFinite(ex.end) || ex.end <= ex.start || ex.end > p.duration))) throw new Error('Invalid export range');
  if (typeof ex.software !== 'boolean' || !['auto', 'libx264', 'h264_qsv', 'h264_nvenc', 'h264_amf'].includes(ex.codec)) throw new Error('Invalid export encoder');
  return p;
}
export function random(seed: number) {
  let a = seed >>> 0;
  return () => { a += 0x6d2b79f5; let t = Math.imul(a ^ a >>> 15, 1 | a); t ^= t + Math.imul(t ^ t >>> 7, 61 | t); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
export function frameTime(index: number, fps: number, start = 0) { return start + index / fps; }
export type Features = { rate: number; rms: number[]; bass: number[]; high: number[] };
export function featuresFrom(value: unknown): Features {
  const f = value as Features;
  if (!f || !Number.isFinite(f.rate) || f.rate <= 0 || f.rate > 1000 || !['rms', 'bass', 'high'].every(k => Array.isArray(f[k as keyof Features]) && (f[k as 'rms'] as number[]).every(v => Number.isFinite(v) && v >= 0))) throw new Error('Invalid audio features');
  if (!f.rms.length || f.rms.length !== f.bass.length || f.rms.length !== f.high.length) throw new Error('Audio feature lengths differ');
  return f;
}
export function sample(features: Features | null, time: number) {
  if (!features) return { rms: .25 + .12 * Math.sin(time * .21), bass: .15 + .2 * Math.pow(.5 + .5 * Math.sin(time * 2.1), 8), high: .15 };
  const at = Math.max(0, time * features.rate), i = Math.floor(at), f = at - i;
  const read = (arr: number[]) => (arr[i] ?? 0) * (1 - f) + (arr[i + 1] ?? arr[i] ?? 0) * f;
  return { rms: read(features.rms), bass: read(features.bass), high: read(features.high) };
}
// A finite, trailing smoothing window: no frame history, identical on seeks/export.
export function reactiveSample(features: Features | null, time: number, gain = 1, settings: Pick<Project, 'bassGain' | 'rmsGain' | 'highGain' | 'audioSmoothing' | 'audioGate'> = defaults) {
  const sums = { rms: 0, bass: 0, high: 0 }; let total = 0;
  for (let i = 0; i < 8; i++) {
    const weight = Math.exp(-i * .35), a = sample(features, Math.max(0, time - i * settings.audioSmoothing / 7)); total += weight;
    for (const key of ['rms', 'bass', 'high'] as const) sums[key] += a[key] * weight;
  }
  const envelope = (value: number, sensitivity: number) => 1 - Math.exp(-Math.max(0, value / total - settings.audioGate) * gain * sensitivity);
  return { rms: envelope(sums.rms, settings.rmsGain * 3), bass: envelope(sums.bass, settings.bassGain * 10), high: envelope(sums.high, settings.highGain * 18) };
}
export function routeAudio(a: ReturnType<typeof reactiveSample>, p: Project, target: RouteTarget) {
  const route = p.audioRouting[target];
  const value = route.band === 'off' ? 0 : route.band === 'mix' ? (a.bass + a.rms + a.high) / 3 : a[route.band];
  return Math.min(p.safeMode ? 1 : 2, value * route.amount);
}
