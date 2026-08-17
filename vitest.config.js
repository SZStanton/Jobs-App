import { defineConfig } from 'vitest/config';

// Pinned to a negative utc offset on purpose. The due date logic is correct at
// UTC+2 either way, so tests run in local time here would never catch a
// regression to the timezone bugs they exist to guard
const TZ = 'America/New_York';

// Two projects so one 'npm test' covers both sides. Server validation is the
// most valuable thing to test here and it lives outside client
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'server',
          environment: 'node',
          include: ['server/**/*.test.js'],
          env: { TZ },
        },
      },
      {
        test: {
          name: 'client',
          environment: 'jsdom',
          include: ['client/**/*.test.{js,jsx}'],
          globals: true,
          setupFiles: ['./client/src/test-setup.js'],
          env: { TZ },
        },
      },
    ],
  },
});
