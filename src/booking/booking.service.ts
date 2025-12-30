import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) { }

  async calculateSlotsPrice(courtId: number, date: string, slots: string) {
    // Direct parameter interpolation for MSSQL
    const result = await this.prisma.$queryRawUnsafe(
      `EXEC sp_receptionist_calculate_slots_price @court_id = ${courtId}, @date = '${date}', @slots = '${slots}'`
    );
    return result;
  }

  async createCourtBooking(
    creator: number | null,
    customerId: number,
    courtId: number,
    bookingDate: string,
    slots: string,
    byMonth: boolean,
    branchId: number,
    type: string,
  ) {
    const creatorParam = creator !== null ? creator : 'NULL';
    const byMonthParam = byMonth ? 1 : 0;
    const result = await this.prisma.$executeRawUnsafe(
      `EXEC sp_create_court_booking @creator = ${creatorParam}, @customer_id = ${customerId}, @court_id = ${courtId}, @booking_date = '${bookingDate}', @slots = '${slots}', @by_month = ${byMonthParam}, @branch_id = ${branchId}, @type = '${type}'`
    );
    return result;
  }

  async createServiceBooking(
    courtBookingId: number,
    employeeId: number | null,
    items: string,
  ) {
    const employeeParam = employeeId !== null ? employeeId : 'NULL';
    const result = await this.prisma.$executeRawUnsafe(
      `EXEC sp_create_service_booking @court_booking_id = ${courtBookingId}, @employee_id = ${employeeParam}, @items = '${items}'`
    );
    return result;
  }

  async getBookingSlotsOfCourt(courtId: number, date: string) {
    const result = await this.prisma.$queryRawUnsafe(
      `EXEC sp_receptionist_get_booking_slots_of_court @court_id = ${courtId}, @date = '${date}'`
    );
    return result;
  }

  async getCustomerCourtBookings(customerId: number, branchId: number) {
    const result = await this.prisma.$queryRawUnsafe(
      `EXEC sp_receptionist_get_customer_court_bookings @customer_id = ${customerId}, @branch_id = ${branchId}`
    );
    return result;
  }

  async getServices(branchId: number) {
    const result = await this.prisma.$queryRawUnsafe(
      `EXEC sp_receptionist_get_services @branch_id = ${branchId}`
    );
    return result;
  }

  async getServiceBookingDetails(serviceBookingId: number) {
    const result = await this.prisma.$queryRawUnsafe(
      `EXEC sp_receptionist_get_service_booking_details @service_booking_id = ${serviceBookingId}`
    );
    return result;
  }

  async getServiceBookingInfo(courtBookingId: number) {
    const result = await this.prisma.$queryRawUnsafe(
      `EXEC sp_receptionist_get_service_booking_info @court_booking_id = ${courtBookingId}`
    );
    return result;
  }

  async getTrainerReferee(courtBookingId: number) {
    const result = await this.prisma.$queryRawUnsafe(
      `EXEC sp_receptionist_get_trainer_referee @court_booking_id = ${courtBookingId}`
    );
    return result;
  }

  async listCourtsOfBranch(branchId: number, courtTypeId: number) {
    console.log(`[BookingService] listCourtsOfBranch: branchId=${branchId}, courtTypeId=${courtTypeId}`);
    // For MSSQL $queryRawUnsafe, we need to interpolate parameters directly
    const courtTypeParam = courtTypeId ? courtTypeId : 'NULL';
    const query = `EXEC sp_receptionist_list_courts_of_branch @branch_id = ${branchId}, @court_type_id = ${courtTypeParam}`;
    console.log(`[BookingService] query: ${query}`);
    const result = await this.prisma.$queryRawUnsafe(query);
    console.log(`[BookingService] result count: ${Array.isArray(result) ? (result as any[]).length : 'not an array'}`);
    return result;
  }

  async updateCourtBooking(
    bookingId: number,
    newCourtId: number,
    newBookingDate: string,
    newSlots: string,
    branchId: number,
  ) {
    const result = await this.prisma.$executeRawUnsafe(
      `EXEC sp_receptionist_update_court_booking @booking_id = ${bookingId}, @new_court_id = ${newCourtId}, @new_booking_date = '${newBookingDate}', @new_slots = '${newSlots}', @branch_id = ${branchId}`
    );
    return result;
  }

  async getBranchCourtBookings(branchId: number, filters?: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }) {
    let whereClause = `cb.court_id IN (SELECT id FROM court WHERE branch_id = ${branchId})`;

    if (filters?.status) {
      whereClause += ` AND cb.status = '${filters.status}'`;
    }

    if (filters?.dateFrom) {
      whereClause += ` AND cb.booking_date >= '${filters.dateFrom}'`;
    }

    if (filters?.dateTo) {
      whereClause += ` AND cb.booking_date <= '${filters.dateTo}'`;
    }

    let searchClause = '';
    if (filters?.search) {
      searchClause = ` AND (c.name LIKE '%${filters.search}%' OR cust.full_name LIKE '%${filters.search}%' OR emp.full_name LIKE '%${filters.search}%')`;
    }

    // Use $queryRawUnsafe for MSSQL compatibility
    const query = `
      SELECT
        cb.id,
        cb.created_at,
        cb.booking_date,
        cb.type,
        cb.status,
        cb.booked_base_price,
        cb.holiday_charge,
        cb.weekend_charge,
        c.name as court_name,
        ct.name as court_type_name,
        b.name as branch_name,
        cust.full_name as customer_name,
        emp.full_name as employee_name,
        STRING_AGG(CONVERT(varchar(5), bs.start_time, 108) + '-' + CONVERT(varchar(5), bs.end_time, 108), ', ') as time_range
      FROM court_booking cb
      JOIN court c ON cb.court_id = c.id
      JOIN court_type ct ON c.court_type_id = ct.id
      JOIN branch b ON c.branch_id = b.id
      JOIN customer cust ON cb.customer_id = cust.id
      LEFT JOIN employee emp ON cb.employee_id = emp.id
      LEFT JOIN booking_slots bs ON cb.id = bs.court_booking_id
      WHERE ${whereClause} ${searchClause}
      GROUP BY cb.id, cb.created_at, cb.booking_date, cb.type, cb.status, cb.booked_base_price, cb.holiday_charge, cb.weekend_charge, c.name, ct.name, b.name, cust.full_name, emp.full_name
      ORDER BY cb.created_at DESC
    `;

    const result = await this.prisma.$queryRawUnsafe(query);
    return result;
  }

  async getCourtBookingById(bookingId: number) {
    // Get booking details with related data
    const booking = await this.prisma.court_booking.findUnique({
      where: { id: bookingId },
      include: {
        court: {
          include: {
            court_type: true,
            branch: true,
          },
        },
        customer: {
          include: {
            account: {
              include: {
                role: true,
              },
            },
            customer_level: true,
          },
        },
        employee: {
          include: {
            account: {
              include: {
                role: true,
              },
            },
          },
        },
        booking_slots: true,
        invoice: true,
        service_booking: {
          include: {
            service_booking_item: {
              include: {
                branch_service: {
                  include: {
                    service: true,
                  },
                },
              },
            },
            invoice: true,
          },
        },
      },
    });

    return booking;
  }

  async cancelCourtBooking(
    bookingId: number,
    method: string = 'Chuyển khoản',
    type: string = 'CourtCancel',
    reason: string = 'Khách hàng hủy đặt sân'
  ) {
    // Use $executeRawUnsafe for MSSQL stored procedure with direct interpolation
    const result = await this.prisma.$executeRawUnsafe(
      `EXEC sp_CancelCourtBooking @CourtBookingId = ${bookingId}, @Method = '${method}', @Type = '${type}', @Reason = N'${reason}'`
    );
    return result;
  }
}
