export default {
  base: './',
  server: { host: '127.0.0.1', port: 5177 },
  build: { rollupOptions: { output: { manualChunks: { three: ['three'] } } } },
};
