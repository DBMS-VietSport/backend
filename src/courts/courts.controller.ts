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
import { CourtsService } from './courts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('courts')
@UseGuards(JwtAuthGuard)
export class CourtsController {
  constructor(private readonly courtsService: CourtsService) {}

  @Get()
  async getCourts(@Query() query: any) {
    return this.courtsService.getCourts(query);
  }

  @Get(':id')
  async getCourtById(@Param('id') id: string) {
    return this.courtsService.getCourtById(parseInt(id));
  }

  @Post()
  async createCourt(@Body() body: any) {
    return this.courtsService.createCourt(body);
  }

  @Put(':id')
  async updateCourt(@Param('id') id: string, @Body() body: any) {
    const {
      name,
      status,
      capacity,
      base_hourly_price,
      maintenance_date,
    } = body;

    return this.courtsService.updateCourt(
      parseInt(id),
      name,
      status,
      capacity,
      base_hourly_price,
      maintenance_date,
    );
  }

  @Delete(':id')
  async deleteCourt(@Param('id') id: string) {
    return this.courtsService.deleteCourt(parseInt(id));
  }
}
