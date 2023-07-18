import path from "path";
import { Worker } from "worker_threads";
import { isDirectory, isFile } from "./utils";

/**
 * 解析器选项
 */
export interface ParserOption {
  // 当前APP根路径
  appRoot: string;
  // 可能的构建目录，一般是['build', 'dist']
  buildDirs: Array<string>;
  // 当前APP的默认项目，因为会冲突，默认项目不支持路由，只能访问入口
  defaultProject?: string;
}

export class Parser {
  /**
   * 项目缓存，缓存以前的查找结果
   */
  private cache: Record<string, string>;

  /**
   * 构造函数，构造函数
   * @param appRoot
   * @param buildDirs
   */
  constructor(private config: ParserOption) {
    this.cache = {};
    this.autoClear();
  }

  /**
   * 自动清理cache中无用的键，因为发布新项目可能会删除资源引用
   */
  private autoClear() {
    const script = path.resolve(__dirname, "./clear");
    const worker = new Worker(script);
    worker.on("message", (message) => {
      this.cache = message;
    });

    // 每隔7天执行一次清理
    setInterval(() => {
      worker.postMessage(this.cache);
    }, 7 * 24 * 60 * 60 * 1000);
  }

  /**
   * 格式化路径，移除路径两侧的斜杠
   * @param pathname
   * @returns
   */
  private normalize(pathname: string) {
    return pathname.replace(/^\/*|\/*$/g, "");
  }

  /**
   * 根据URL上的路径查找文件，返回文件的完整路径
   * @param pathname
   */
  public search(pathname: string): string | null {
    pathname = this.normalize(pathname);

    // 默认路径
    if (!pathname) {
      pathname = this.config.defaultProject ?? "";
      // 如果默认路径不存在，返回null
      if (!pathname) {
        return null;
      }
    }

    // 如果缓存存在，直接返回
    if (this.cache[pathname]) {
      return this.cache[pathname];
    }

    const segments = pathname.split("/");
    // 如果最后一段有后缀，先取出留待使用
    const last = segments[segments.length - 1];
    const hasSuffix = !!path.extname(last);
    if (hasSuffix) {
      segments.pop();
    }

    let projectPath = this.config.appRoot;
    let projectIndex = -1;
    for (let i = 0; i < segments.length; i++) {
      projectPath = path.join(projectPath, segments[i]);
      // 如果非目录，则直接返回，认为路径不存在
      if (!isDirectory(projectPath)) {
        delete this.cache[pathname];
        return null;
      }

      // 如果当前目录下存在 package.json，则认为当前目录是项目根目录
      const packageFile = path.join(projectPath, "package.json");
      if (isFile(packageFile)) {
        projectIndex = i;
        break;
      }
    }

    // 如果没有找到项目，直接退出
    if (projectIndex === -1) {
      delete this.cache[pathname];
      return null;
    }

    // 查找构建目录
    let finalDir: string | null = null;
    for (let build of this.config.buildDirs) {
      const result = path.join(projectPath, build);
      if (isDirectory(result)) {
        finalDir = result;
        break;
      }
    }

    // 如果构建目录不存在，返回空
    if (!finalDir) {
      delete this.cache[pathname];
      return null;
    }

    // 如果不是静态资源，则直接返回 index.html
    if (!hasSuffix) {
      return path.join(finalDir, "index.html");
    }

    // 如果是静态资源，继续查找构建目录下的其余目录
    for (let i = projectIndex + 1; i < segments.length; i++) {
      finalDir = path.join(finalDir, segments[i]);
      if (!isDirectory(finalDir)) {
        delete this.cache[pathname];
        return null;
      }
    }

    // 找到最终的路径
    const fullPath = path.join(finalDir, last);
    if (!isFile(fullPath)) {
      delete this.cache[pathname];
      return null;
    }

    // 返回之前先缓存
    this.cache[pathname] = fullPath;

    // 返回最终路径
    return fullPath;
  }
}
