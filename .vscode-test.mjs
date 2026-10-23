import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
  // The client's tests, as `tsc -b` compiles them.
  files: 'client/out/test/**/*.test.js',
  // Only this extension, whatever else the machine has installed.
  launchArgs: ['--disable-extensions'],
  mocha: { timeout: 60000 },
});
