import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { BaseController } from "./BaseController";
import path from "node:path";
import { fileExists } from "./functions";
import { Parser } from "./Parser";
import { ScheduleModule } from "@nestjs/schedule";
import { Cache } from './Cache';

function createConfigModule() {
  const envFiles: Array<string> = [];
  const env = process.env.NODE_ENV;
  const envFile = path.resolve(__dirname, `../.env.${env}`);
  if (env && fileExists(envFile)) {
    envFiles.push(`.env.${env}`);
  }
  envFiles.push(".env");
  return ConfigModule.forRoot({
    isGlobal: true,
    load: [
      async () => {
        let result: Record<string, any> = {};
        try {
          const loadResult = await import(`./config.${env}.js`);
          result = loadResult.default.default;
        } catch (error) {}
        return result;
      },
    ],
    envFilePath: envFiles,
  });
}

@Module({
  imports: [createConfigModule(), ScheduleModule.forRoot()],
  controllers: [BaseController],
  providers: [Parser, Cache],
})
export class AppModule {}
