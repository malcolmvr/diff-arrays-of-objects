import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['test/**/*.spec.ts'],
    // The vendored module retains its upstream compatibility suite; coverage
    // here focuses on this package's own implementation.
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['lib/**/*.ts'],
      exclude: ['lib/deep-diff/**'],
    },
  },
});
