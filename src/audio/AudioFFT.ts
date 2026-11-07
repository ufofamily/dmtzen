const N = 1024;
const window = Float64Array.from({ length: N }, (_, i) => .5 - .5 * Math.cos(2 * Math.PI * i / (N - 1)));
export function analyzeFrame(samples: Float32Array, offset: number) {
  const re = new Float64Array(N), im = new Float64Array(N); let sum = 0;
  for (let i = 0; i < N; i++) { const v = samples[offset + i] ?? 0; sum += v * v; re[i] = v * window[i]; }
  for (let i = 1, j = 0; i < N; i++) { let bit = N >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { const t = re[i]; re[i] = re[j]; re[j] = t; } }
  for (let len = 2; len <= N; len *= 2) {
    const wr = Math.cos(-2 * Math.PI / len), wi = Math.sin(-2 * Math.PI / len);
    for (let start = 0; start < N; start += len) {
      let ar = 1, ai = 0;
      for (let j = 0; j < len / 2; j++) {
        const u = start + j, v = u + len / 2, r = re[v] * ar - im[v] * ai, q = re[v] * ai + im[v] * ar;
        re[v] = re[u] - r; im[v] = im[u] - q; re[u] += r; im[u] += q;
        const next = ar * wr - ai * wi; ai = ar * wi + ai * wr; ar = next;
      }
    }
  }
  let bass = 0, high = 0;
  for (let k = 1; k < N / 2; k++) { const power = (re[k] ** 2 + im[k] ** 2) * 16 / (N * N); const hz = k * 20; if (hz <= 250) bass += power; if (hz >= 4000) high += power; }
  return { rms: Math.sqrt(sum / N), bass: Math.sqrt(bass), high: Math.sqrt(high) };
}
