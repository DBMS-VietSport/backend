import { Controller, Get, Query } from '@nestjs/common';
import { BranchesService } from './branches.service';

@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  async getBranches(@Query() query: any) {
    return this.branchesService.getBranches(query);
  }
}