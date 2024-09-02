import fs from 'fs';
import path from 'path';

import type { IApi } from 'dumi';

export default (api: IApi) => {
  const LIBRO_DEPLOY_ENV = process.env.LIBRO_DEPLOY_ENV;
  if (LIBRO_DEPLOY_ENV === 'vercel') {
    const exampleDir = path.resolve(__dirname, 'docs/examples');
    const targetDir = path.resolve(__dirname, 'docs/_examples');
    if (fs.existsSync(exampleDir)) {
      fs.renameSync(exampleDir, targetDir);
    }
  }
};
