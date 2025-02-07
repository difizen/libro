import { LogLevel } from '@opensumi/ide-core-common';
import { extProcessInit } from '@opensumi/ide-extension/lib/hosted/ext.process-base.js';

(async () => {
  await extProcessInit({
    builtinCommands: [],
    customVSCodeEngineVersion: '1.91.0',
    logDir: './logs',
    logLevel: LogLevel.Verbose,
  });
})();
