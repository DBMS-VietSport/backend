import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CourtTypesService } from './court-types.service';

@ApiTags('court-types')
@Controller('court-types')
export class CourtTypesController {
    constructor(private readonly courtTypesService: CourtTypesService) { }

    @Get()
    @ApiOperation({ summary: 'Get all court types' })
    @ApiResponse({ status: 200, description: 'Court types retrieved successfully' })
    async getCourtTypes() {
        return this.courtTypesService.getCourtTypes();
    }
}
