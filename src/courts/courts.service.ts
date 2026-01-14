import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CourtsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all courts with pagination and filtering
   */
  async getCourts(query: any) {
    const {
      search,
      branch_id,
      court_type_id,
      status,
      page = 1,
      limit = 10,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.name = { contains: search };
    }

    if (branch_id) {
      where.branch_id = parseInt(branch_id);
    }

    if (court_type_id) {
      where.court_type_id = parseInt(court_type_id);
    }

    if (status) {
      where.status = status;
    }

    const courts = await this.prisma.court.findMany({
      where,
      skip,
      take: parseInt(limit),
      include: {
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
        court_type: {
          select: {
            id: true,
            name: true,
            rent_duration: true,
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    });

    const total = await this.prisma.court.count({ where });

    // Transform data to match frontend expectations
    const transformedCourts = courts.map((court) => ({
      id: court.id,
      name: court.name,
      status: court.status,
      capacity: court.capacity,
      base_hourly_price: court.base_hourly_price,
      maintenance_date: court.maintenance_date?.toISOString(),
      branch_id: court.branch_id,
      branch_name: court.branch.name,
      court_type_id: court.court_type_id,
      court_type_name: court.court_type.name,
    }));

    return {
      data: transformedCourts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    };
  }

  /**
   * Get a single court by ID
   */
  async getCourtById(id: number) {
    const court = await this.prisma.court.findUnique({
      where: { id },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
        court_type: {
          select: {
            id: true,
            name: true,
            rent_duration: true,
          },
        },
      },
    });

    if (!court) {
      throw new Error('Court not found');
    }

    return {
      id: court.id,
      name: court.name,
      status: court.status,
      capacity: court.capacity,
      base_hourly_price: court.base_hourly_price,
      maintenance_date: court.maintenance_date?.toISOString(),
      branch_id: court.branch_id,
      branch_name: court.branch.name,
      court_type_id: court.court_type_id,
      court_type_name: court.court_type.name,
    };
  }

  /**
   * Update a court using sp_UpdateCourt stored procedure
   */
  async updateCourt(
    courtId: number,
    name: string,
    status: string,
    capacity: number,
    baseHourlyPrice: number,
    maintenanceDate?: string,
  ) {
    const maintenanceDateParam = maintenanceDate
      ? `'${maintenanceDate}'`
      : 'NULL';

    try {
      await this.prisma.$executeRawUnsafe(`
        EXEC sp_UpdateCourt 
          @CourtID = ${courtId},
          @Name = N'${name.replace(/'/g, "''")}',
          @Status = N'${status}',
          @Capacity = ${capacity},
          @BaseHourlyPrice = ${baseHourlyPrice},
          @MaintenanceDate = ${maintenanceDateParam}
      `);

      return {
        success: true,
        message: 'Court updated successfully',
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update court');
    }
  }

  /**
   * Create a new court
   */
  async createCourt(data: {
    name: string;
    status: string;
    capacity: number;
    base_hourly_price: number;
    branch_id: number;
    court_type_id: number;
    maintenance_date?: string;
  }) {
    const court = await this.prisma.court.create({
      data: {
        name: data.name,
        status: data.status,
        capacity: data.capacity,
        base_hourly_price: data.base_hourly_price,
        branch_id: data.branch_id,
        court_type_id: data.court_type_id,
        maintenance_date: data.maintenance_date
          ? new Date(data.maintenance_date)
          : undefined,
      },
      include: {
        branch: true,
        court_type: true,
      },
    });

    return {
      success: true,
      message: 'Court created successfully',
      data: court,
    };
  }

  /**
   * Delete a court
   */
  async deleteCourt(id: number) {
    await this.prisma.court.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Court deleted successfully',
    };
  }
}
