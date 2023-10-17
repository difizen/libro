import { defineConfig } from 'tsup';

export default defineConfig({
  format: ['esm'],
  entry: ['./src/index.mts'],
  dts: true,
  outDir: './es',
});
