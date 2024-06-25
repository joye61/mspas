import fs from 'node:fs/promises';

export async function fileExists(file: string) {
  try {
    const stat = await fs.stat(file);
    return stat.isFile();
  } catch (error) {
    return false;
  }
}
