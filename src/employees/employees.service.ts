import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  async getEmployees(role?: string) {
    const where: any = {};
    if (role) {
      where.account = {
        role: {
          name: role,
        },
      };
    }

    return this.prisma.employee.findMany({
      where,
      select: {
        id: true,
        full_name: true,
        phone_number: true,
        email: true,
        status: true,
        commission_rate: true,
        base_salary: true,
        branch_id: true,
        user_id: true,
        account: {
          select: {
            id: true,
            username: true,
            is_active: true,
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
}
