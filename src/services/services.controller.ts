import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('services')
@UseGuards(JwtAuthGuard)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  async getServices(@Query() query: any) {
    return this.servicesService.getServices(query);
  }

  @Get(':id')
  async getServiceById(@Param('id') id: string) {
    return this.servicesService.getServiceById(parseInt(id));
  }

  @Post()
  async createService(@Body() body: any) {
    return this.servicesService.createService(body);
  }

  @Put(':serviceId/base')
  async updateServiceBase(
    @Param('serviceId') serviceId: string,
    @Body() body: any,
  ) {
    return this.servicesService.updateService(parseInt(serviceId), body);
  }

  @Put(':branchServiceId')
  async updateBranchService(
    @Param('branchServiceId') branchServiceId: string,
    @Body() body: any,
  ) {
    const {
      unit_price,
      stock_adjustment,
      min_stock_threshold,
      status,
    } = body;

    return this.servicesService.updateBranchService(
      parseInt(branchServiceId),
      unit_price,
      stock_adjustment,
      min_stock_threshold,
      status,
    );
  }

  @Delete(':id')
  async deleteService(@Param('id') id: string) {
    return this.servicesService.deleteService(parseInt(id));
  }
}
