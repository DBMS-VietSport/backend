import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { ConfigModule } from '@nestjs/config';
import { BookingModule } from './booking/booking.module';
import { AuthModule } from './auth/auth.module';
import { CustomersModule } from './customers/customers.module';
import { EmployeesModule } from './employees/employees.module';
import { BranchesModule } from './branches/branches.module';
import { CourtTypesModule } from './court-types/court-types.module';
import { CourtsModule } from './courts/courts.module';
import { ServicesModule } from './services/services.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    BookingModule,
    AuthModule,
    CustomersModule,
    EmployeesModule,
    BranchesModule,
    CourtTypesModule,
    CourtsModule,
    ServicesModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
