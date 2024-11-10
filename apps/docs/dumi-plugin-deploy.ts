import fs from 'fs';
import https from 'https';
import path from 'path';

import type { IApi } from 'dumi';

// URL prefix
const PREFIX_URL = 'https://raw.githubusercontent.com/wiki/difizen/libro/';
// Local storage directory
const PUBLIC_DIR = path.join(__dirname, 'public');

// Create public directory (if it doesn't exist)
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

// Recursive function to traverse directory
function traverseDirectory(
  dir: string,
  transformPathFn: (resourcePath: string) => string,
): void {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.lstatSync(fullPath);
    if (stat.isDirectory()) {
      traverseDirectory(fullPath, transformPathFn);
    } else if (stat.isFile()) {
      processFile(fullPath, transformPathFn);
    }
  });
}

// Process file
function processFile(
  filePath: string,
  transformPathFn: (resourcePath: string) => string,
): void {
  let content = fs.readFileSync(filePath, 'utf8');

  // Find all matching URLs
  const regex = new RegExp(`${PREFIX_URL}([^\\s'"]+)`, 'g');
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    const resourceUrl = match[0];
    const resourcePath = match[1];

    const localPath = path.join(PUBLIC_DIR, resourcePath);

    // Ensure directory exists
    const localDir = path.dirname(localPath);
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }

    // Download resource
    if (!fs.existsSync(localPath)) {
      downloadResource(resourceUrl, localPath);
    }

    // Replace content
    const localUrl = transformPathFn(resourcePath);
    content = content.replace(resourceUrl, localUrl);
  }

  // Write the updated file
  fs.writeFileSync(filePath, content, 'utf8');
}

// Download resource
function downloadResource(url: string, dest: string): void {
  const file = fs.createWriteStream(dest);

  https
    .get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
      } else {
        console.error(`Failed to download ${url}: ${response.statusCode}`);
        file.close();
        fs.unlinkSync(dest);
      }
    })
    .on('error', (err) => {
      console.error(`Error downloading ${url}: ${err.message}`);
      file.close();
      fs.unlinkSync(dest);
    });
}

const downloadPublicAssets = () => {
  // Replace with simple root path
  const srcDirectory = path.join(__dirname, 'src');
  traverseDirectory(srcDirectory, (resourcePath) => `/${resourcePath}`);
  const dumiThemeDirectory = path.join(__dirname, '.dumi');
  traverseDirectory(dumiThemeDirectory, (resourcePath) => `/${resourcePath}`);

  // Replace with relative paths
  const docsDirectory = path.join(__dirname, 'docs');
  traverseDirectory(docsDirectory, (resourcePath) => {
    const currentFileDir = path.dirname(__filename);
    const localResourcePath = path.join(PUBLIC_DIR, resourcePath);
    return path.relative(currentFileDir, localResourcePath);
  });
};

export default (api: IApi) => {
  const LIBRO_DEPLOY_ENV = process.env.LIBRO_DEPLOY_ENV;
  if (LIBRO_DEPLOY_ENV === 'vercel') {
    const exampleDir = path.resolve(__dirname, 'docs/examples');
    const targetDir = path.resolve(__dirname, 'docs/_examples');
    if (fs.existsSync(exampleDir)) {
      fs.renameSync(exampleDir, targetDir);
    }
    downloadPublicAssets();
  }
};
