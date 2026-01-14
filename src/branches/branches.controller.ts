import {
  Controller,
  Get,
  Query,
  UseGuards,
  Post,
  Body,
  Request,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { BranchesService } from './branches.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('branches')
@UseGuards(JwtAuthGuard)
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  async getBranches(@Query() query: any) {
    return this.branchesService.getBranches(query);
  }

  @Get(':id')
  async getBranchById(@Param('id', ParseIntPipe) id: number) {
    return this.branchesService.getBranchById(id);
  }

  @Post('config')
  async configBranch(@Request() req, @Body() configDto: any) {
    const managerUserId = req.user.id;
    return this.branchesService.configBranch(managerUserId, configDto);
  }
}
