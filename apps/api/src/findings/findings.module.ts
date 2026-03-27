import { Module } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import { FindingsController } from "./findings.controller";
import { FindingsService } from "./findings.service";

@Module({
  controllers: [FindingsController],
  providers: [FindingsService, PrismaService]
})
export class FindingsModule {}
