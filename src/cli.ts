#!/usr/bin/env node

import { program } from "commander";
import path from "path";
import { runApp, type AppConfig } from ".";

program
  .option(
    "-f, --config-file <file>",
    "Application configuration files, have lower priority than options"
  )
  .option("-r, --app-root <directory>", "Application root directory")
  .option("-p, --port <number>", "Application listening port number", "1714")
  .option(
    "-b, --build-dirs <string...>",
    "List of allowed build directory names",
    ["build", "dist"]
  )
  .option(
    "-d, --default-project <path>",
    "Default project path for root path mapping"
  )
  .option(
    "-s, --public-dir <string>",
    "Resources that are publicly accessible through the root directory",
    "__public"
  )
  .option(
    "-m, --max-age <number>",
    "Static resource cache time, in seconds",
    String(30 * 24 * 60 * 60)
  )
  .parse();

// 解析命令行参数
const cwd = process.cwd();
const options = program.opts();

// 合成配置
const mainConfig: Partial<AppConfig> = {
  buildDirs: options.buildDirs,
  maxAge: Number(options.maxAge),
};
if (options.appRoot) {
  mainConfig.appRoot = path.resolve(cwd, options.appRoot);
}
if (options.port) {
  mainConfig.port = Number(options.port);
}
if (options.defaultPath) {
  mainConfig.defaultProject = options.defaultPath;
}

/**
 * 启动应用程序逻辑
 * @returns
 */
function startApp() {
  // 如果配置文件存在，解析配置文件
  if (options.configFile) {
    const configFile = path.resolve(cwd, options.configFile);
    const configData: AppConfig | Array<AppConfig> = require(configFile);

    // 多个应用配置
    if (Array.isArray(configData)) {
      // 启动多个应用程序
      for (let app of configData) {
        delete mainConfig.appRoot;
        delete mainConfig.port;
        runApp({ ...app, ...mainConfig });
      }
      return;
    }

    // 单个应用配置
    if (typeof configData === "object") {
      runApp({ ...configData, ...mainConfig });
      return;
    }

    console.log(`Invalid configuration file`);
    return;
  }

  // 基于CLI的参数配置
  runApp(mainConfig);
}

// 启动应用程序
startApp();
