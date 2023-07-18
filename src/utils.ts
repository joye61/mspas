import fs from "fs";

/**
 * 检测是否是目录
 * @param pathname
 * @returns
 */
export function isDirectory(pathname: string) {
  const stat = fs.statSync(pathname, { throwIfNoEntry: false });
  if (!stat) return false;
  return stat.isDirectory();
}

/**
 * 检测是否是文件
 * @param pathname
 * @returns
 */
export function isFile(pathname: string) {
  const stat = fs.statSync(pathname, { throwIfNoEntry: false });
  if (!stat) return false;
  return stat.isFile();
}
