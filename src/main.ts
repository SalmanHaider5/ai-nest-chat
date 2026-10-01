import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from '@nestjs/core';
import { ConfigService } from "@nestjs/config";
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: "http://localhost:3000",
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const configService = app.get(ConfigService);
   const port = configService.get<number>("port") ?? 4000;
  await app.listen(port);
}
await bootstrap();
