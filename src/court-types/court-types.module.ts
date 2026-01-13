import { Module } from '@nestjs/common';
import { CourtTypesController } from './court-types.controller';
import { CourtTypesService } from './court-types.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [CourtTypesController],
  providers: [CourtTypesService, PrismaService],
  exports: [CourtTypesService],
})
export class CourtTypesModule {}
