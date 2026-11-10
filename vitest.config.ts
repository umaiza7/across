import { defineConfig } from 'vitest/config'

// Kept apart from vite.config.ts: Vitest 2 ships its own Vite types.
export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
  },
})
