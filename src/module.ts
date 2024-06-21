import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BaseController } from './BaseController';

function createConfigModule() {
  const envFiles: Array<string> = ['.env'];
  const env = process.env.NODE_ENV;
  if (env) {
    envFiles.push(`.env.${env}`);
  }
  return ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: envFiles,
  });
}

@Module({
  imports: [createConfigModule()],
  controllers: [BaseController],
})
export class AppModule {}
