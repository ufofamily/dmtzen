import './style.css';
import { Engine } from './core/Engine';
import { projectFrom, featuresFrom, worldNames, transitionNames, routeNames, reactiveSample, type Project, type Features, type RouteTarget } from './core/model';
import { presets } from './settings/Presets';
import { analyzeAudio } from './audio/BrowserAudio';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
document.querySelector('#app')!.innerHTML = `
<header><div class="brand">B A R D O <small>BROWSER EDITION · 114 WORLDS</small></div><div class="header-actions"><button id="save">Save settings</button><label class="button">Open settings<input id="load" type="file" accept=".json"></label></div></header>
<main><nav><span class="eyebrow">SPACES / 114</span><h2>Выберите мир</h2><input id="world-search" type="search" placeholder="Поиск сцены" aria-label="Поиск сцены"><div id="worlds"></div>
<label class="button">Выбрать музыку<input id="audio" type="file" accept="audio/*"></label><audio id="player" controls></audio><p id="track">Музыка остаётся на вашем устройстве.</p><progress id="progress" hidden max="1"></progress><button id="cancel" hidden>Отменить анализ</button><div class="feature-actions"><label class="button">Загрузить признаки<input id="features" type="file" accept=".json"></label><button id="save-features" disabled>Сохранить признаки</button></div><p class="note">Локальный анализ: до 64 MiB / 20 минут. Для длинных треков импортируйте готовые признаки. После перезагрузки выберите музыку снова.</p></nav>
<section class="stage"><div class="viewer-toolbar"><span id="world-title"></span><button id="fullscreen">⛶ Полный экран</button></div><div id="viewport"><canvas id="scene"></canvas></div><div class="transport"><button id="play">▶ Play</button><output id="time">00:00</output><input id="seek" type="range" min="0" max="600" step=".01" value="0" aria-label="Позиция"><span id="duration">10:00</span></div><p id="status" role="status">Выберите музыку или нажмите Play для демонстрации.</p><p class="note">F / двойной щелчок — полный экран · Esc — выход · Пробел — воспроизведение</p></section>
<aside><span class="eyebrow">PERCEPTION / AUDIO</span><h2>Настройки</h2><label>Пресет<select id="preset"></select></label><label>Музыкальная динамика<select id="dynamicsMode"><option value="off">Выключена</option><option value="breathe">Медленное дыхание</option><option value="energy">Следовать энергии</option><option value="contrast">Нарастание / разрядка</option></select></label><label>Переход<select id="transitionStyle"></select></label><div id="settings"></div><label>Камера<select id="camera"><option value="dolly">Плавное движение</option><option value="orbit">Орбита</option><option value="static">Статичная</option></select></label><label>Качество<select id="quality"><option value="fast">Fast</option><option value="balanced">Balanced</option><option value="high">High</option></select></label><label class="check"><input id="safe" type="checkbox" checked> Reduced intensity</label><p class="note">Ограничивает силу эффектов, но не гарантирует безопасность при фоточувствительности. DMT — художественный стиль, не имитация действия вещества.</p><details><summary>Аудиомаршрутизация</summary><div id="meters"></div><div id="routing"></div></details><button id="reset">Сбросить настройки</button></aside></main>`;

let project = projectFrom({ world: 'journey', duration: 600, quality: 'fast', transition: 12, dynamicsMode: 'energy' });
try { const saved = localStorage.getItem('bardo-pages-v3'); if (saved) project = projectFrom(JSON.parse(saved)); } catch {}
let engine: Engine;
try { engine = new Engine($<HTMLCanvasElement>('scene')); }
catch (e) { $('status').textContent = `WebGL2 недоступен: ${String(e)}`; throw e; }
let time = 0, playing = false, last = performance.now(), lastDraw = -Infinity, objectURL = '', generation = 0;
let features: Features | null = null, analysis: AbortController | null = null;
const player = $<HTMLAudioElement>('player');
const status = (message: string) => { $('status').textContent = message; };
const format = (t: number) => `${Math.floor(t / 60).toString().padStart(2, '0')}:${Math.floor(t % 60).toString().padStart(2, '0')}`;
const controls = [
  ['intensity', 'Интенсивность', 0, 2, .01], ['speed', 'Скорость', 0, 2, .01], ['transition', 'Смешивание / сек', 0, 30, .5],
  ['dynamicsAmount', 'Сила музыкальной динамики', 0, 1, .01], ['dynamicsFloor', 'Минимум динамики', .1, 1, .05], ['dynamicsCeiling', 'Максимум динамики', 1, 2, .05], ['dynamicsWindow', 'Отклик динамики / сек', .1, 8, .1],
  ['audioGain', 'Общая чувствительность', 0, 4, .05], ['bassGain', 'Бас', 0, 4, .05], ['rmsGain', 'Энергия', 0, 4, .05], ['highGain', 'Высокие частоты', 0, 4, .05], ['audioSmoothing', 'Сглаживание / сек', 0, 2, .005], ['audioGate', 'Порог шума', 0, .2, .001],
  ['surfaceFx', 'Живые поверхности', 0, 1, .01], ['psychedelic', 'Калейдоскоп / DMT', 0, 1, .01], ['dissociation', 'Диссоциация', 0, 1, .01], ['fractal', 'Рекурсивные складки', 0, 1, .01], ['tunnelFx', 'Логарифмический тоннель', 0, 1, .01], ['liquid', 'Жидкая мембрана', 0, 1, .01], ['iridescence', 'Радужный спектр', 0, 1, .01], ['symmetry', 'Секторы симметрии', 2, 16, 1],
  ['fog', 'Туман', 0, .15, .001], ['exposure', 'Экспозиция', .1, 3, .01], ['seed', 'Seed', 0, 4294967295, 1],
] as const;
$('settings').innerHTML = controls.map(([key, label, min, max, step]) => `<label>${label}<output id="${key}-value"></output><input id="${key}" type="${key === 'seed' ? 'number' : 'range'}" min="${min}" max="${max}" step="${step}"></label>`).join('');
$('worlds').innerHTML = Object.entries({ journey: 'Автоматическое путешествие', ...worldNames }).map(([id, name], i) => `<button class="world" data-world="${id}"><small>${String(i + 1).padStart(3, '0')}</small>${name}</button>`).join('');
$('transitionStyle').innerHTML = Object.entries(transitionNames).map(([id, name]) => `<option value="${id}">${name}</option>`).join('');
$('preset').innerHTML = Object.keys(presets).map(name => `<option>${name}</option>`).join('');
$('routing').innerHTML = Object.entries(routeNames).map(([id, name]) => `<div class="route"><label>${name}<select id="route-${id}-band">${['bass', 'rms', 'high', 'mix', 'off'].map(b => `<option>${b}</option>`).join('')}</select></label><label>Amount<output id="route-${id}-value"></output><input id="route-${id}-amount" type="range" min="0" max="2" step=".05"></label></div>`).join('');
$('meters').innerHTML = ['bass', 'rms', 'high'].map(b => `<label>${b}<meter id="meter-${b}" min="0" max="1" value="0"></meter></label>`).join('');
function sync() {
  project = projectFrom(project); engine.configure(project, features);
  for (const [key] of controls) { $<HTMLInputElement>(key).value = String(project[key]); $(key + '-value').textContent = String(project[key]); }
  for (const key of ['camera', 'quality', 'transitionStyle', 'dynamicsMode'] as const) $<HTMLSelectElement>(key).value = project[key];
  for (const key of Object.keys(routeNames) as RouteTarget[]) { $<HTMLSelectElement>(`route-${key}-band`).value = project.audioRouting[key].band; $<HTMLInputElement>(`route-${key}-amount`).value = String(project.audioRouting[key].amount); $(`route-${key}-value`).textContent = project.audioRouting[key].amount.toFixed(2); }
  $<HTMLSelectElement>('preset').value = project.artisticPreset; $<HTMLInputElement>('safe').checked = project.safeMode;
  $<HTMLInputElement>('seek').max = String(project.duration); $('duration').textContent = format(project.duration);
  document.querySelectorAll<HTMLElement>('[data-world]').forEach(el => el.classList.toggle('active', el.dataset.world === project.world));
  try { localStorage.setItem('bardo-pages-v3', JSON.stringify(project)); } catch {}
  lastDraw = -Infinity;
}
function edit(value: Partial<Project>) { try { project = projectFrom({ ...project, ...value }); sync(); } catch (e) { status(String(e)); } }
for (const [key] of controls) $(key).oninput = () => edit({ [key]: Number($<HTMLInputElement>(key).value) });
for (const key of ['camera', 'quality', 'transitionStyle', 'dynamicsMode'] as const) $(key).onchange = () => edit({ [key]: $<HTMLSelectElement>(key).value });
for (const key of Object.keys(routeNames) as RouteTarget[]) {
  const update = () => edit({ audioRouting: { ...project.audioRouting, [key]: { band: $<HTMLSelectElement>(`route-${key}-band`).value, amount: Number($<HTMLInputElement>(`route-${key}-amount`).value) } } } as Partial<Project>);
  $(`route-${key}-band`).onchange = update; $(`route-${key}-amount`).oninput = update;
}
document.querySelectorAll<HTMLElement>('[data-world]').forEach(el => el.onclick = () => edit({ world: el.dataset.world! }));
$('world-search').oninput = () => { const q = $<HTMLInputElement>('world-search').value.toLocaleLowerCase(); document.querySelectorAll<HTMLElement>('[data-world]').forEach(el => { el.hidden = !el.textContent!.toLocaleLowerCase().includes(q); }); };
$('preset').onchange = () => { const name = $<HTMLSelectElement>('preset').value; edit({ ...presets[name], artisticPreset: name }); };
$('safe').onchange = () => edit({ safeMode: $<HTMLInputElement>('safe').checked });
$('reset').onclick = () => { project = projectFrom({ world: 'journey', duration: project.duration, audio: project.audio, quality: 'fast', transition: 12, dynamicsMode: 'energy' }); sync(); };
$('play').onclick = async () => { try { if (objectURL) { if (player.paused) await player.play(); else player.pause(); } else { if (time >= project.duration) time = 0; playing = !playing; } } catch (e) { status(String(e)); } };
player.onplay = () => { playing = true; }; player.onpause = () => { playing = false; }; player.onended = () => { playing = false; };
$('seek').oninput = () => { time = Number($<HTMLInputElement>('seek').value); if (objectURL) player.currentTime = time; lastDraw = -Infinity; };
async function fullscreen() { try { if (document.fullscreenElement) await document.exitFullscreen(); else await $('viewport').requestFullscreen(); } catch (e) { status(String(e)); } }
$('fullscreen').onclick = () => { void fullscreen(); }; $('viewport').ondblclick = () => { void fullscreen(); };
document.addEventListener('keydown', e => { if (e.repeat || e.ctrlKey || e.altKey || e.metaKey || (e.target instanceof Element && e.target.closest('input,select,textarea,[contenteditable="true"]'))) return; if (e.key.toLowerCase() === 'f') { e.preventDefault(); void fullscreen(); } if (e.code === 'Space' && !(e.target instanceof Element && e.target.closest('button'))) { e.preventDefault(); $('play').click(); } });
function busy(on: boolean) { $<HTMLInputElement>('audio').disabled = on; $('progress').hidden = !on; $('cancel').hidden = !on; }
function cancelAnalysis() { generation++; analysis?.abort(); analysis = null; busy(false); }
$('cancel').onclick = () => { cancelAnalysis(); status('Анализ отменён. Можно импортировать признаки или выбрать другой трек.'); };
$('audio').onchange = async () => {
  const file = $<HTMLInputElement>('audio').files?.[0]; if (!file) return;
  cancelAnalysis(); const current = generation; analysis = new AbortController(); const signal = analysis.signal;
  player.pause(); playing = false; time = 0; if (objectURL) URL.revokeObjectURL(objectURL); objectURL = URL.createObjectURL(file);
  features = { rate: 20, rms: [0], bass: [0], high: [0] }; engine.configure(project, features); $<HTMLButtonElement>('save-features').disabled = true;
  $('track').textContent = file.name; status('Декодирование музыки в браузере…'); busy(true); $<HTMLProgressElement>('progress').removeAttribute('value');
  try {
    const duration = await new Promise<number>((resolve, reject) => {
      const timer = setTimeout(() => finish(new Error('Не удалось прочитать длительность аудио')), 15000);
      const finish = (error?: Error) => { clearTimeout(timer); player.removeEventListener('loadedmetadata', ready); player.removeEventListener('error', failed); signal.removeEventListener('abort', aborted); error ? reject(error) : resolve(player.duration); };
      const ready = () => finish(), failed = () => finish(new Error('Формат аудио не поддерживается браузером')), aborted = () => finish(new DOMException('Cancelled', 'AbortError'));
      player.addEventListener('loadedmetadata', ready, { once: true }); player.addEventListener('error', failed, { once: true }); signal.addEventListener('abort', aborted, { once: true }); player.src = objectURL;
    });
    if (!Number.isFinite(duration) || duration < .1 || duration > 86400) throw new Error('Неподдерживаемая длительность');
    project = projectFrom({ ...project, duration, audio: file.name, audioId: '', markers: project.markers.filter(m => m.time <= duration), keyframes: project.keyframes.filter(k => k.time <= duration), exportSettings: { ...project.exportSettings, start: 0, end: null } }); sync();
    const result = await analyzeAudio(file, duration, signal, value => { if (current === generation) { $<HTMLProgressElement>('progress').value = value; status(`FFT-анализ в браузере: ${Math.floor(value * 100)}%`); } });
    if (current !== generation) return;
    features = result; sync(); $<HTMLButtonElement>('save-features').disabled = false; status('Музыка проанализирована локально. Нажмите Play.');
  } catch (e) { if (current === generation) status(`${String(e)} Аудиореактивность отключена до загрузки признаков.`); }
  finally { if (current === generation) busy(false); $<HTMLInputElement>('audio').value = ''; }
};
function download(name: string, value: unknown) { const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' })); const link = document.createElement('a'); link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
$('save').onclick = () => download('bardo-settings.json', project);
$('save-features').onclick = () => { if (features) download('bardo-features.json', features); };
$('features').onchange = async () => { try { const file = $<HTMLInputElement>('features').files?.[0]; if (!file) return; if (file.size > 32 * 1024 * 1024) throw new Error('Features JSON exceeds 32 MiB'); const loaded = featuresFrom(JSON.parse(await file.text())); cancelAnalysis(); features = loaded; sync(); $<HTMLButtonElement>('save-features').disabled = false; status('Признаки загружены.'); } catch (e) { status(String(e)); } };
$('load').onchange = async () => { try { const file = $<HTMLInputElement>('load').files?.[0]; if (!file) return; if (file.size > 2 * 1024 * 1024) throw new Error('Settings JSON exceeds 2 MiB'); const loaded = projectFrom({ ...JSON.parse(await file.text()), audioId: '' }); cancelAnalysis(); player.pause(); playing = false; if (objectURL) URL.revokeObjectURL(objectURL); objectURL = ''; player.removeAttribute('src'); player.load(); features = null; project = loaded; time = 0; sync(); $('track').textContent = project.audio || 'Демонстрация'; $<HTMLButtonElement>('save-features').disabled = true; status('Настройки открыты. Прикрепите музыку заново.'); } catch (e) { status(String(e)); } };
const resize = () => { const r = $('viewport').getBoundingClientRect(), scale = Math.min(1, 1440 / r.width, 900 / r.height); engine.resize(Math.max(2, Math.floor(r.width * scale)), Math.max(2, Math.floor(r.height * scale))); engine.renderFrameAt(time); };
new ResizeObserver(resize).observe($('viewport')); sync(); resize();
if (project.audio) status(`Настройки восстановлены. Прикрепите музыку: ${project.audio}`);
const tick = (now: number) => {
  const dt = Math.min(.25, (now - last) / 1000); last = now;
  if (objectURL) time = player.currentTime; else if (playing) { time = Math.min(project.duration, time + dt); if (time >= project.duration) playing = false; }
  if (!document.hidden && now - lastDraw >= (playing ? 1000 / 30 : 250)) { engine.renderFrameAt(time); lastDraw = now; const a = reactiveSample(features, time, project.audioGain, project); for (const key of ['bass', 'rms', 'high'] as const) $<HTMLMeterElement>(`meter-${key}`).value = a[key]; }
  $('world-title').textContent = worldNames[engine.activeWorld] ?? ''; $<HTMLInputElement>('seek').value = String(time); $('time').textContent = format(time); $('play').textContent = playing ? 'Ⅱ Pause' : '▶ Play'; requestAnimationFrame(tick);
};
requestAnimationFrame(tick);
