/**
 * 项目的数据格式
 */
export interface ProjectData {
  // 项目路径，相对于根目录
  pathname: string;
  // 项目完整路径
  fullPath: string;
  // 项目构建路径名
  buildDir: string;
  // 项目构建完整路径名
  buildFullPath: string;
}

export class Parser {
  /**
   * 项目缓存，缓存以前的查找结果
   */
  private projectCache: Map<string, ProjectData>;

  /**
   * 构造函数，构造函数
   * @param appRoot
   * @param buildDirs
   */
  constructor(public appRoot: string, public buildDirs: Array<string>) {
    this.projectCache = new Map();
  }

  /**
   * 格式化路径，移除路径两侧的斜杠
   * @param pathname
   * @returns
   */
  normalize(pathname: string) {
    return pathname.replace(/^\/*|\/*$/g, "");
  }

  /**
   * 根据URL上的路径查找文件，返回文件的完整路径
   * @param pathname
   */
  public search(pathname: string) {}
}
