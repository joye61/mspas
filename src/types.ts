export interface AppConfig {
  // MSPAS项目的根工程目录
  root: string;
  // 当直接访问域名时，默认访问的项目，默认项目建议不要带子路由
  defaultProject?: string;
  // 构建输出目录，可以有多个输出目录，顺序查找，找到立即终止
  buildDirs?: Array<string>;
}
