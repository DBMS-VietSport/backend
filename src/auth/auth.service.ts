import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.prisma.account.findUnique({
      where: { username },
      include: {
        role: true,
        customer: true,
        employee: {
          include: {
            branch: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Check if password is hashed (bcrypt) or plain text (for development)
    let isPasswordValid = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$')) {
      // Bcrypt hash
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      // Plain text (fallback for development - should be removed in production)
      isPasswordValid = password === user.password;
    }

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = { 
      username: user.username, 
      sub: user.id, 
      role: user.role.name,
      branchId: this.getBranchId(user),
      branchName: this.getBranchName(user),
      customerId: this.getCustomerId(user),
      employeeId: this.getEmployeeId(user),
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        role: user.role.name,
        fullName: this.getFullName(user),
        branchId: this.getBranchId(user),
        branchName: this.getBranchName(user),
        customerId: this.getCustomerId(user),
        employeeId: this.getEmployeeId(user),
      },
    };
  }

  private getFullName(user: any): string {
    if (user.customer && user.customer.length > 0) {
      return user.customer[0].full_name;
    }
    if (user.employee && user.employee.length > 0) {
      return user.employee[0].full_name;
    }
    return user.username;
  }

  private getBranchId(user: any): number | undefined {
    if (user.employee && user.employee.length > 0) {
      return user.employee[0].branch?.id;
    }
    return undefined;
  }

  private getBranchName(user: any): string | undefined {
    if (user.employee && user.employee.length > 0) {
      return user.employee[0].branch?.name;
    }
    return undefined;
  }

  private getEmployeeId(user: any): number | undefined {
    if (user.employee && user.employee.length > 0) {
      return user.employee[0].id;
    }
    return undefined;
  }

  private getCustomerId(user: any): number | undefined {
    if (user.customer && user.customer.length > 0) {
      return user.customer[0].id;
    }
    return undefined;
  }
}
