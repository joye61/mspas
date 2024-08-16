import { NestFactory } from "@nestjs/core";
import { AppModule } from "./module";
import { ConfigService } from "@nestjs/config";

(async () => {
  const app = await NestFactory.create(AppModule);
  const config = app.get<ConfigService>(ConfigService);
  const port = config.get<string>("PORT");
  await app.listen(port);
})();
