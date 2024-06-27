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
  private packageFile = "package.json";
  private entryFile = "index.html";
  private root: string;
  private default: string = "";
  private buildDirs: Array<string> = ["dist", "build"];

  private cache: Record<string, string> = {};

  constructor(private config: ConfigService) {
    this.root = path.resolve(this.config.get<string>("root"));
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
      const packageFile = path.resolve(this.root, project, this.packageFile);
      if (await fileExists(packageFile)) {
        hasFind = true;
      }
    }

    // 如果没有找到项目，返回空
    if (!hasFind) {
      return null;
    }

    // 查找构建目录，找到第一个立即停止查找
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

    // 返回静态入口
    const returnEntry = async () => {
      possibleFile = path.resolve(
        this.root,
        project,
        buildName,
        this.entryFile,
      );
      exists = await fileExists(possibleFile);
      if (exists) {
        this.cache[searchPath] = possibleFile;
        return possibleFile;
      }
      return null;
    };

    // 如果没有资源路径，则认为是入口文件index.html
    const assetPath = assetPart.join(path.sep);
    if (!assetPath) {
      return returnEntry();
    }

    // 如果静态资源存在，则优先直接返回静态资源
    possibleFile = path.resolve(this.root, project, buildName, assetPath);
    exists = await fileExists(possibleFile);
    if (exists) {
      this.cache[searchPath] = possibleFile;
      return possibleFile;
    }

    // 静态资源不存在且路径不带后缀，则认为是本地路由，直接返回入口
    if (!path.extname(assetPath)) {
      return returnEntry();
    }

    // 静态资源不存在且路径带后缀，返回空（404）
    return null;
  }

  /**
   * Auto clear bad cache key
   */
  async autoClear() {
    const keys = Object.keys(this.cache);
    console.log(keys);
    for (let key of keys) {
      const file = this.cache[key];
      if (!(await fileExists(file))) {
        delete this.cache[key];
      }
    }
  }
}
