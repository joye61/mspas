import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import path from "node:path";
import { dirExists, fileExists, normalize } from "./functions";

export interface SearchResult {
  fullPath: string;
  extension: string;
}

@Injectable()
export class Parser {
  private root: string;
  private default: string = "";
  private buildDirs: Array<string> = ["dist", "build"];

  private cache: Record<string, string> = {};

  constructor(private config: ConfigService) {
    this.root = this.config.get<string>("root");
    const defaultPath = this.config.get<string>("defaultProject");
    if (defaultPath) {
      this.default = normalize(defaultPath);
    }
    const builds = this.config.get<Array<string>>("buildDirs");
    if (builds) {
      this.buildDirs = builds;
    }
  }

  async search(pathname: string): Promise<string> | null {
    console.log(this.cache);
    let searchPath = normalize(pathname);
    if (!searchPath) {
      searchPath = this.default;
    }

    // 到了这一步，仍然没有任何值，返回空
    if (!searchPath) {
      return null;
    }

    // 如果缓存存在且文件也存在，直接返回
    let possibleFile: string | undefined = this.cache[searchPath];
    let exists = await fileExists(possibleFile);
    if (possibleFile && exists) {
      this.cache[searchPath] = possibleFile;
      return possibleFile;
    }

    // 查找静态文件是否存在，如果存在，直接返回
    possibleFile = path.resolve(this.root, searchPath);
    exists = await fileExists(possibleFile);
    if (exists) {
      this.cache[searchPath] = possibleFile;
      return possibleFile;
    }

    // 查找可能存在的SPA项目
    const parts = searchPath.split(path.sep);
    let project = "";
    let assetPart: Array<string> = [];
    let hasFind = false;
    for (let i = 0; i < parts.length; i++) {
      if (hasFind) {
        assetPart.push(parts[i]);
        continue;
      }

      project += parts[i] + path.sep;
      const packageFile = path.resolve(this.root, project + "package.json");
      if (await fileExists(packageFile)) {
        hasFind = true;
      }
    }

    // 如果没有找到项目，返回空
    if (!hasFind) {
      return null;
    }

    // 查找构建目录
    let buildName = "";
    for (let name of this.buildDirs) {
      const buildDir = path.resolve(this.root, project, name);
      if (await dirExists(buildDir)) {
        buildName = name;
        break;
      }
    }

    // 如果没有找到构建目录，返回空
    if (!buildName) {
      return null;
    }

    // 如果没有资源路径，则认为是入口文件index.html
    if (assetPart.length === 0) {
      possibleFile = path.resolve(this.root, project, buildName, "index.html");
      exists = await fileExists(possibleFile);
      if (exists) {
        this.cache[searchPath] = possibleFile;
        return possibleFile;
      }
      return null;
    }

    // 如果有资源路径，则查找静态资源
    possibleFile = path.resolve(
      this.root,
      project,
      buildName,
      assetPart.join(path.sep),
    );
    exists = await fileExists(possibleFile);
    if (exists) {
      this.cache[searchPath] = possibleFile;
      return possibleFile;
    }
    return null;
  }
}
