export enum FileType {
  Unknown = 0,
  File = 1,
  Directory = 2,
  SymbolicLink = 64,
}
export type DirItem = [string, FileType];

export interface Stat {
  dev: number;
  mode: number;
  nlink: number;
  uid: number;
  gid: number;
  rdev: number;
  blksize: number;
  ino: number;
  size: number;
  blocks: number;
  atimeMs: number;
  mtimeMs: number;
  ctimeMs: number;
  birthtimeMs: number;
  atime: string;
  mtime: string;
  ctime: string;
  birthtime: string;
  isDirectory: boolean;
  isFile: boolean;
  isSymbolicLink: boolean;
}
