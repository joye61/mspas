import fs from "node:fs/promises";
import path from "node:path";

export async function fileExists(file: string) {
  try {
    const stat = await fs.stat(file);
    return stat.isFile();
  } catch (error) {
    return false;
  }
}

export async function dirExists(file: string) {
  try {
    const stat = await fs.stat(file);
    return stat.isDirectory();
  } catch (error) {
    return false;
  }
}

export function normalize(pathanme: string) {
  return pathanme.replace(/^\/*|\/*$/g, "").replace("/", path.sep);
}
