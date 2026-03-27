import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";

import { FindingsService } from "./findings.service";

@Controller("findings")
export class FindingsController {
  constructor(private readonly findingsService: FindingsService) {}

  @Get()
  getFindings() {
    return this.findingsService.listFindings();
  }

  @Get(":id")
  getFinding(@Param("id") id: string) {
    return this.findingsService.getFindingDetail(id);
  }

  @Get(":id/history")
  getFindingHistory(@Param("id") id: string) {
    return this.findingsService.getFindingHistory(id);
  }

  @Patch(":id/status")
  updateFindingStatus(
    @Param("id") id: string,
    @Body() body: { status?: string; author?: string; note?: string }
  ) {
    return this.findingsService.updateFindingStatus(id, body);
  }

  @Patch(":id/assign")
  assignFinding(
    @Param("id") id: string,
    @Body() body: { owner?: string; author?: string }
  ) {
    return this.findingsService.assignFinding(id, body);
  }

  @Post(":id/comments")
  addFindingComment(
    @Param("id") id: string,
    @Body() body: { body?: string; author?: string }
  ) {
    return this.findingsService.addFindingComment(id, body);
  }
}
