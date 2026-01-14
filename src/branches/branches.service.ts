import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

interface ConfigBranchDto {
  lateTimeLimit?: number;
  maxCourtsPerUser?: number;
  shiftPay?: number;
  shiftAbsencePenalty?: number;
  loyaltyPointRate?: number;
  cancelFeeBefore24h?: number;
  cancelFeeWithin24h?: number;
  noShowFee?: number;
  nightCharge?: number;
  holidayCharge?: number;
  weekendCharge?: number;
}

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  async getBranches(query: any) {
    const { search, page = 1, limit = 10 } = query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (search) {
      where.OR = [
        { branchName: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    const branches = await this.prisma.branch.findMany({
      where,
      skip,
      take: limitNum,
    });

    const total = await this.prisma.branch.count({ where });

    return {
      data: branches,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async getBranchById(branchId: number) {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });
    return branch;
  }

  async configBranch(managerUserId: string, configDto: ConfigBranchDto) {
    const params = [
      `@ManagerUserID = '${managerUserId}'`,
      configDto.lateTimeLimit !== undefined
        ? `@LateTimeLimit = ${configDto.lateTimeLimit}`
        : null,
      configDto.maxCourtsPerUser !== undefined
        ? `@MaxCourtsPerUser = ${configDto.maxCourtsPerUser}`
        : null,
      configDto.shiftPay !== undefined
        ? `@ShiftPay = ${configDto.shiftPay}`
        : null,
      configDto.shiftAbsencePenalty !== undefined
        ? `@ShiftAbsencePenalty = ${configDto.shiftAbsencePenalty}`
        : null,
      configDto.loyaltyPointRate !== undefined
        ? `@LoyaltyPointRate = ${configDto.loyaltyPointRate}`
        : null,
      configDto.cancelFeeBefore24h !== undefined
        ? `@CancelFeeBefore24h = ${configDto.cancelFeeBefore24h}`
        : null,
      configDto.cancelFeeWithin24h !== undefined
        ? `@CancelFeeWithin24h = ${configDto.cancelFeeWithin24h}`
        : null,
      configDto.noShowFee !== undefined
        ? `@NoShowFee = ${configDto.noShowFee}`
        : null,
      configDto.nightCharge !== undefined
        ? `@NightCharge = ${configDto.nightCharge}`
        : null,
      configDto.holidayCharge !== undefined
        ? `@HolidayCharge = ${configDto.holidayCharge}`
        : null,
      configDto.weekendCharge !== undefined
        ? `@WeekendCharge = ${configDto.weekendCharge}`
        : null,
    ]
      .filter((p) => p !== null)
      .join(', ');

    const query = `EXEC sp_config_branch ${params}`;

    const result = await this.prisma.$queryRawUnsafe(query);
    return result;
  }
}
