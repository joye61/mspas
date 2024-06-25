import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BaseController } from './BaseController';
import path from 'node:path';
import { fileExists } from './functions';
import { Parser } from './Parser';

function createConfigModule() {
  const envFiles: Array<string> = [];
  const env = process.env.NODE_ENV;
  const envFile = path.resolve(__dirname, `../.env.${env}`);
  if (env && fileExists(envFile)) {
    envFiles.push(`.env.${env}`);
  }
  envFiles.push('.env');
  return ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: envFiles,
  });
}

@Module({
  imports: [createConfigModule()],
  controllers: [BaseController],
  providers: [Parser],
})
export class AppModule {}
