import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async getHello(): Promise<string> {
    const account = await this.prisma.account.findFirst();

    return `Hello World! DB connection: ${account ? 'Successful' : 'Failed'}`;
  }
}
