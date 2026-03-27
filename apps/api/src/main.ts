import "reflect-metadata";

import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";

function resolveCorsOrigins() {
  const localOrigins = [
    "http://localhost:4173",
    "http://127.0.0.1:4173",
    "http://localhost:5173",
    "http://127.0.0.1:5173"
  ];
  const configuredOrigins =
    process.env.CORS_ORIGIN?.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean) ?? [];

  return [...new Set([...localOrigins, ...configuredOrigins])];
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: resolveCorsOrigins()
  });
  app.setGlobalPrefix("api");

  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000, "0.0.0.0");
}

bootstrap();
