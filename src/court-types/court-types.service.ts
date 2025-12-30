import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CourtTypesService {
    constructor(private readonly prisma: PrismaService) { }

    async getCourtTypes() {
        return this.prisma.court_type.findMany({
            select: {
                id: true,
                name: true,
                rent_duration: true,
            },
            orderBy: {
                id: 'asc',
            },
        });
    }
}
