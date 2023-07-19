#!/usr/bin/env node

import { program } from "commander";

program
  .option(
    "-f, --config-file <file>",
    "应用程序配置文件，配置文件优先级低于选项"
  )
  .requiredOption("-r, --app-root <directory>", "应用程序根目录")
  .option("-p, --port <number>", "应用程序所监听的端口号", "1714")
  .option("-b, --build-dirs <string...>", "子项目的允许构建目录名字", [
    "build",
    "dist",
  ])
  .option("-d, --default-path <path>", "只访问域名时，默认项目对应的路径")
  .option("-m, --max-age <number>", "Cache-Control中的maxAge时间，单位为秒");
