import { Parser, type ParserOption } from "./Parser";
import Server, { type Context } from "koa";
import send from "koa-send";
import { isDirectory } from "./utils";

/**
 * APP配置
 */
export interface AppConfig extends ParserOption {
  // 服务监听的端口，默认1714
  port?: number | string;
  // 是否是可信代理模式，一般是反向代理，默认true
  proxy?: boolean;
  // 静态资源缓存时间，默认30天，单位秒
  maxAge?: number;
}

/**
 * 启动并运行APP
 * @param option
 */
export function runApp(option: Partial<AppConfig>) {
  // 默认配置
  const defaultConfig: Partial<AppConfig> = {
    proxy: true,
    buildDirs: ["build", "dist"],
    maxAge: 30 * 24 * 60 * 60,
    publicDir: "__public",
  };

  // 合并默认配置和输入配置
  const config: Partial<AppConfig> = {
    ...defaultConfig,
    ...option,
  };

  // 如果没有指定应用程序根目录，提示错误
  if (!config.appRoot) {
    console.error("Application root not specified");
    return;
  }
  // 如果应用程序根目录不存在，提示错误
  if (!isDirectory(config.appRoot)) {
    console.error(
      "The application root directory does not exist：",
      config.appRoot
    );
    return;
  }

  const app = new Server();
  app.proxy = config.proxy ?? true;

  const parser = new Parser({
    appRoot: config.appRoot,
    buildDirs: config.buildDirs!,
    defaultProject: config.defaultProject,
    publicDir: config.publicDir!,
  });

  // 服务器信息解析
  const packageInfo = require("../package.json");
  const serverName: string = packageInfo.name;
  const serverInfo = `${serverName.toUpperCase()} v${packageInfo.version}`;

  app.use(async (context: Context) => {
    const result = parser.search(context.path);
    context.set("Server", serverInfo);
    // 如果资源没找到，返回404
    if (!result) {
      context.type = "html";
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
  console.log(`Start and listen: ${finalPort}`);
}
