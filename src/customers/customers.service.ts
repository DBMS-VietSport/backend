import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async getCustomers() {
    return this.prisma.customer.findMany({
      select: {
        id: true,
        full_name: true,
        phone_number: true,
        email: true,
        bonus_point: true,
        customer_level_id: true,
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
        customer_level: {
          select: {
            id: true,
            name: true,
            discount_rate: true,
          },
        },
      },
    });
  }
}
