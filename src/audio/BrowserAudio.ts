import { featuresFrom, type Features } from '../core/model';

export async function analyzeAudio(file: File, duration: number, signal: AbortSignal, progress: (value: number) => void): Promise<Features> {
  if (file.size > 64 * 1024 * 1024 || !Number.isFinite(duration) || duration <= 0 || duration > 1200) throw new Error('Browser analysis limit: 64 MiB and 20 minutes. Use a shorter track or import precomputed features.');
  signal.throwIfAborted();
  // Decode at the analysis rate; no server, microphone, upload or playback recording.
  const context = new OfflineAudioContext(1, 1, 20480);
  const bytes = await file.arrayBuffer(); signal.throwIfAborted();
  const decoded = await context.decodeAudioData(bytes); signal.throwIfAborted();
  if (decoded.duration > 1200) throw new Error('Decoded soundtrack exceeds 20 minutes');
  const mono = new Float32Array(decoded.length);
  for (let c = 0; c < decoded.numberOfChannels; c++) { const channel = decoded.getChannelData(c); for (let i = 0; i < mono.length; i++) mono[i] += channel[i] / decoded.numberOfChannels; }
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./analyzer.worker.ts', import.meta.url), { type: 'module' });
    const finish = () => { worker.terminate(); signal.removeEventListener('abort', abort); };
    const abort = () => { finish(); reject(new DOMException('Analysis cancelled', 'AbortError')); };
    signal.addEventListener('abort', abort, { once: true });
    worker.onerror = e => { finish(); reject(new Error(e.message)); };
    worker.onmessage = e => {
      if (e.data.error) { finish(); reject(new Error(e.data.error)); }
      else if (e.data.features) { finish(); try { resolve(featuresFrom(e.data.features)); } catch (err) { reject(err); } }
      else progress(e.data.progress);
    };
    worker.postMessage({ samples: mono }, [mono.buffer]);
  });
}
