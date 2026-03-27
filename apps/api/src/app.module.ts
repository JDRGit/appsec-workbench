import { Module } from "@nestjs/common";

import { FindingsModule } from "./findings/findings.module";
import { HealthController } from "./health.controller";

@Module({
  imports: [FindingsModule],
  controllers: [HealthController]
})
export class AppModule {}
