import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all services with their branch_service info
   */
  async getServices(query: any) {
    const {
      search,
      branch_id,
      rental_type,
      status,
      page = 1,
      limit = 10,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (branch_id) {
      where.branch_id = parseInt(branch_id);
    }

    if (status) {
      where.status = status;
    }

    const branchServices = await this.prisma.branch_service.findMany({
      where,
      skip,
      take: parseInt(limit),
      include: {
        service: true,
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    });

    // Filter by service properties if needed
    let filteredServices = branchServices;
    if (search) {
      filteredServices = branchServices.filter((bs) =>
        bs.service.name.toLowerCase().includes(search.toLowerCase()),
      );
    }
    if (rental_type) {
      filteredServices = filteredServices.filter(
        (bs) => bs.service.rental_type === rental_type,
      );
    }

    const total = await this.prisma.branch_service.count({ where });

    // Transform to match frontend ServiceRow interface
    const transformedServices = filteredServices.map((bs) => ({
      id: bs.service.id,
      branch_service_id: bs.id,
      name: bs.service.name,
      rental_type: bs.service.rental_type,
      unit: bs.service.unit,
      unit_price: bs.unit_price,
      current_stock: bs.current_stock,
      min_stock_threshold: bs.min_stock_threshold,
      status: bs.status,
      branch_id: bs.branch_id,
      branch_name: bs.branch.name,
    }));

    return {
      data: transformedServices,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    };
  }

  /**
   * Get a single service by branch_service_id
   */
  async getServiceById(branchServiceId: number) {
    const branchService = await this.prisma.branch_service.findUnique({
      where: { id: branchServiceId },
      include: {
        service: true,
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!branchService) {
      throw new Error('Service not found');
    }

    return {
      id: branchService.service.id,
      branch_service_id: branchService.id,
      name: branchService.service.name,
      rental_type: branchService.service.rental_type,
      unit: branchService.service.unit,
      unit_price: branchService.unit_price,
      current_stock: branchService.current_stock,
      min_stock_threshold: branchService.min_stock_threshold,
      status: branchService.status,
      branch_id: branchService.branch_id,
      branch_name: branchService.branch.name,
    };
  }

  /**
   * Update a branch service using sp_update_branch_service stored procedure
   */
  async updateBranchService(
    branchServiceId: number,
    unitPrice?: number,
    stockAdjustment?: number,
    minStockThreshold?: number,
    status?: string,
  ) {
    // Build the SQL command with only provided parameters
    const params: string[] = [`@BranchServiceID = ${branchServiceId}`];

    if (unitPrice !== undefined) {
      params.push(`@UnitPrice = ${unitPrice}`);
    }

    if (stockAdjustment !== undefined) {
      params.push(`@StockQuantity = ${stockAdjustment}`);
    }

    if (minStockThreshold !== undefined) {
      params.push(`@MinStockThreshold = ${minStockThreshold}`);
    }

    if (status !== undefined) {
      params.push(`@Status = N'${status}'`);
    }

    const sql = `EXEC sp_update_branch_service ${params.join(', ')}`;

    try {
      const result: any = await this.prisma.$queryRawUnsafe(sql);

      // The stored procedure returns result set
      if (result && result.length > 0) {
        const spResult = result[0];
        
        if (spResult.Success === 0) {
          throw new Error(spResult.Message || 'Failed to update service');
        }

        return {
          success: true,
          message: spResult.Message,
          data: {
            branch_service_id: spResult.BranchServiceID,
            branch_name: spResult.BranchName,
            service_name: spResult.ServiceName,
            updated_fields: spResult.UpdatedFields,
            warnings: spResult.Warnings,
          },
        };
      }

      return {
        success: true,
        message: 'Service updated successfully',
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update service');
    }
  }

  /**
   * Update service base info (name, unit, rental_type)
   */
  async updateService(
    serviceId: number,
    data: {
      name?: string;
      unit?: string;
      rental_type?: string;
    },
  ) {
    const updateData: any = {};

    if (data.name) updateData.name = data.name;
    if (data.unit) updateData.unit = data.unit;
    if (data.rental_type) updateData.rental_type = data.rental_type;

    if (Object.keys(updateData).length === 0) {
      throw new Error('No fields to update');
    }

    await this.prisma.service.update({
      where: { id: serviceId },
      data: updateData,
    });

    return {
      success: true,
      message: 'Service base info updated successfully',
    };
  }

  /**
   * Create a new service and branch_service
   */
  async createService(data: {
    name: string;
    unit: string;
    rental_type: string;
    stock_type?: string;
    branch_id: number;
    unit_price: number;
    current_stock: number;
    min_stock_threshold: number;
    status: string;
  }) {
    // First create the service
    const service = await this.prisma.service.create({
      data: {
        name: data.name,
        unit: data.unit,
        rental_type: data.rental_type,
        stock_type: data.stock_type || 'Physical', // Default to 'Physical' if not provided
      },
    });

    // Then create the branch_service
    const branchService = await this.prisma.branch_service.create({
      data: {
        service_id: service.id,
        branch_id: data.branch_id,
        unit_price: data.unit_price,
        current_stock: data.current_stock,
        min_stock_threshold: data.min_stock_threshold,
        status: data.status,
      },
    });

    return {
      success: true,
      message: 'Service created successfully',
      data: {
        service_id: service.id,
        branch_service_id: branchService.id,
      },
    };
  }

  /**
   * Delete a service
   */
  async deleteService(serviceId: number) {
    // Delete branch_services first (due to foreign key)
    await this.prisma.branch_service.deleteMany({
      where: { service_id: serviceId },
    });

    // Then delete the service
    await this.prisma.service.delete({
      where: { id: serviceId },
    });

    return {
      success: true,
      message: 'Service deleted successfully',
    };
  }
}
