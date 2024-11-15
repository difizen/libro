import fs from 'fs';
import path from 'path';

import axios from 'axios';
import type { IApi } from 'dumi';

const fsPromises = fs.promises;
const PREFIX_URL = 'https://raw.githubusercontent.com/wiki/difizen/libro/';
const PUBLIC_DIR = path.join(__dirname, 'public');

// Recursively traverse the directory
async function traverseDirectory(
  dir: string,
  transformPathFn: (filePath: string, resourcePath: string) => string,
): Promise<void> {
  const files = await fsPromises.readdir(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = await fsPromises.lstat(fullPath);
    if (stat.isDirectory()) {
      await traverseDirectory(fullPath, transformPathFn);
    } else if (stat.isFile()) {
      await processFile(fullPath, transformPathFn);
    }
  }
}

// Process each file
async function processFile(
  filePath: string,
  transformPathFn: (filePath: string, resourcePath: string) => string,
): Promise<void> {
  let content = await fsPromises.readFile(filePath, 'utf8');

  const regex = new RegExp(`${PREFIX_URL}([^\\s'"]+)`, 'g');
  let match: RegExpExecArray | null;
  let shouldWrite = false;
  while ((match = regex.exec(content)) !== null) {
    const resourceUrl = match[0];
    const resourcePath = match[1];
    const resourceRelativePath = path.relative('/assets', `/${resourcePath}`);

    const localPath = path.join(PUBLIC_DIR, resourceRelativePath);

    const localDir = path.dirname(localPath);
    if (!fs.existsSync(localDir)) {
      await fsPromises.mkdir(localDir, { recursive: true });
    }

    if (!fs.existsSync(localPath)) {
      await downloadResource(resourceUrl, localPath);
    }

    const localUrl = transformPathFn(filePath, resourcePath);
    content = content.replace(resourceUrl, localUrl);
    shouldWrite = true;
  }
  if (shouldWrite) {
    await fsPromises.writeFile(filePath, content, 'utf8');
  }
}
// Download the resource and save it locally
async function downloadResource(url, destination) {
  try {
    console.info('[deploy] downloading:', url);
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream', // Ensures we get the response as a stream
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36',
      },
      // Uncomment the following line to ignore SSL certificate errors
      // httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
    });

    if (response.headers['content-type'] !== 'image/gif') {
      throw new Error(
        `Expected image/gif but received ${response.headers['content-type']}`,
      );
    }

    const writer = fs.createWriteStream(destination);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    console.error('Error downloading file:', error.message);
  }
}

const downloadPublicAssets = async () => {
  // Replace with simple root path
  const srcDirectory = path.join(__dirname, 'src');
  await traverseDirectory(srcDirectory, (filePath, resourcePath) => `/${resourcePath}`);
  const dumiThemeDirectory = path.join(__dirname, '.dumi');
  await traverseDirectory(
    dumiThemeDirectory,
    (filePath, resourcePath) => `/${resourcePath}`,
  );

  // Replace with relative paths
  const docsDirectory = path.join(__dirname, 'docs');
  await traverseDirectory(docsDirectory, (filePath, resourcePath) => {
    const currentFileDir = path.dirname(filePath);
    const resourceRelativePath = path.relative('/assets', `/${resourcePath}`);
    const localResourcePath = path.join(PUBLIC_DIR, resourceRelativePath);
    return path.relative(currentFileDir, localResourcePath);
  });
};

const LIBRO_DEPLOY_ENV = process.env.LIBRO_DEPLOY_ENV;
const isVercelEnv = LIBRO_DEPLOY_ENV === 'vercel';

export default (api: IApi) => {
  if (isVercelEnv) {
    console.info('[deploy]: vercel environment');
    const exampleDir = path.resolve(__dirname, 'docs/examples');
    if (fs.existsSync(exampleDir)) {
      fs.rmdirSync(exampleDir, { recursive: true });
    }
    return downloadPublicAssets();
  }
};
