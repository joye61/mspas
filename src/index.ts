import { Parser, type ParserOption } from "./Parser";
import Server, { type Context } from "koa";
import send from "koa-send";

/**
 * APP配置
 */
export interface AppConfig extends ParserOption {
  // 服务监听的端口，默认1714
  port?: number | string;
  // 是否是可信代理模式，一般是反向代理，默认true
  proxy?: boolean;
  // 静态资源缓存时间，默认30天
  maxAge?: number;
}

/**
 * 启动并运行APP
 * @param option
 */
export function runApp(option: AppConfig) {
  // 默认配置
  const defaultConfig: Partial<AppConfig> = {
    proxy: true,
    buildDirs: ["build", "dist"],
    maxAge: 30 * 24 * 60 * 60,
  };

  // 合并默认配置和输入配置
  const config: AppConfig = {
    ...defaultConfig,
    ...option,
  };

  const app = new Server();
  app.proxy = config.proxy ?? true;

  const parser = new Parser({
    appRoot: config.appRoot,
    buildDirs: config.buildDirs,
    defaultProject: config.defaultProject,
  });

  app.use(async (context: Context) => {
    const result = parser.search(context.path);
    console.log(result);
    // 如果资源没找到，返回404
    if (!result) {
      context.status = 404;
      return;
    }

    // 如果找到资源，发送静态文件
    await send(context, result, {
      root: "/",
      maxage: (config.maxAge ?? 0) * 1000,
    });
  });

  // 启动并监听APP
  const finalPort = config.port ?? 1714;
  app.listen(finalPort);
  console.log(`APP启动：${finalPort}`);
}
