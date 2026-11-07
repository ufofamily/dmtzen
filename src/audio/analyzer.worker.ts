import { analyzeFrame } from './AudioFFT';
self.onmessage = (event: MessageEvent<{ samples: Float32Array }>) => {
  try {
    const samples = event.data.samples, count = Math.ceil(samples.length / 1024);
    const features = { rate: 20, rms: [] as number[], bass: [] as number[], high: [] as number[] };
    for (let i = 0; i < count; i++) {
      const a = analyzeFrame(samples, i * 1024); features.rms.push(a.rms); features.bass.push(a.bass); features.high.push(a.high);
      if (i % 200 === 0) self.postMessage({ progress: i / count });
    }
    self.postMessage({ features });
  } catch (e) { self.postMessage({ error: String(e) }); }
};
