import type { Container } from '@difizen/mana-app';

import { MonacoEnvironment } from './monaco-environment.js';

export default async (container: Container): Promise<void> => {
  MonacoEnvironment.setContainer(container);
  await MonacoEnvironment.init();
};
