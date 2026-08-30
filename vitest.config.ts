import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.spec.ts'],
    // The vendored UMD module has no meaningful coverage value and makes the
    // v8 provider emit noisy reports.
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['lib/**/*.ts'],
      exclude: ['lib/deep-diff.ts'],
    },
  },
});
