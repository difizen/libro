import type { ContentsFileFormat } from '@difizen/libro-kernel';

interface ImageFormat {
  name: string;
  extensions: string[];
  format: ContentsFileFormat;
}

export const imageFileTypes: ImageFormat[] = [
  {
    name: 'jpeg',
    extensions: ['.jpg', '.jpeg'],
    format: 'base64',
  },
  {
    name: 'gif',
    extensions: ['.gif'],
    format: 'base64',
  },
  {
    name: 'png',
    extensions: ['.png'],
    format: 'base64',
  },
  {
    name: 'bmp',
    extensions: ['.bmp'],
    format: 'base64',
  },
  {
    name: 'webp',
    extensions: ['.webp'],
    format: 'base64',
  },
];

export const imageExtToTypes = new Map<string, ImageFormat>();

imageFileTypes.forEach((imageType) => {
  imageType.extensions.forEach((ext) => {
    imageExtToTypes.set(ext, imageType);
  });
});
