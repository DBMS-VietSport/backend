import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { BookingService } from './booking.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles, ROLES } from '../auth/roles.decorator';

@ApiTags('booking')
@Controller('booking')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('calculate-slots-price')
  @ApiOperation({ summary: 'Calculate booking slot prices' })
  @ApiBody({
    description: 'Slot price calculation parameters',
    schema: {
      type: 'object',
      properties: {
        courtId: { type: 'number', description: 'Court ID' },
        date: { type: 'string', format: 'date', description: 'Booking date' },
        slots: { type: 'string', description: 'JSON array of time slots' },
      },
      required: ['courtId', 'date', 'slots'],
    },
  })
  @ApiResponse({ status: 200, description: 'Price calculation successful' })
  async calculateSlotsPrice(
    @Body() body: { courtId: number; date: string; slots: string },
  ) {
    return this.bookingService.calculateSlotsPrice(
      body.courtId,
      body.date,
      body.slots,
    );
  }

  @Post('court-bookings')
  @Roles(ROLES.CUSTOMER, ROLES.RECEPTIONIST, ROLES.MANAGER, ROLES.ADMIN)
  @ApiOperation({ summary: 'Create a new court booking' })
  @ApiBody({
    description: 'Court booking creation parameters',
    schema: {
      type: 'object',
      properties: {
        creator: {
          type: 'number',
          description: 'Employee ID creating the booking (optional)',
        },
        customerId: { type: 'number', description: 'Customer ID' },
        courtId: { type: 'number', description: 'Court ID' },
        bookingDate: {
          type: 'string',
          format: 'date',
          description: 'Booking date',
        },
        slots: { type: 'string', description: 'JSON array of time slots' },
        byMonth: { type: 'boolean', description: 'Monthly booking flag' },
        branchId: { type: 'number', description: 'Branch ID' },
        type: { type: 'string', description: 'Booking type' },
      },
      required: [
        'customerId',
        'courtId',
        'bookingDate',
        'slots',
        'byMonth',
        'branchId',
        'type',
      ],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Court booking created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createCourtBooking(
    @Body()
    body: {
      creator?: number;
      customerId: number | string;
      courtId: number;
      bookingDate: string;
      slots: string;
      byMonth: boolean;
      branchId: number;
      type: string;
    },
  ) {
    return this.bookingService.createCourtBooking(
      body.creator || null,
      body.customerId,
      parseInt(body.courtId.toString()),
      body.bookingDate,
      body.slots,
      body.byMonth,
      parseInt(body.branchId.toString()),
      body.type,
    );
  }

  @Post('service-bookings')
  @ApiOperation({ summary: 'Create a new service booking' })
  @ApiBody({
    description: 'Service booking creation parameters',
    schema: {
      type: 'object',
      properties: {
        courtBookingId: {
          type: 'number',
          description: 'Associated court booking ID',
        },
        employeeId: {
          type: 'number',
          description: 'Receptionist employee ID (optional)',
        },
        items: { type: 'string', description: 'JSON array of service items' },
      },
      required: ['courtBookingId', 'items'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Service booking created successfully',
  })
  async createServiceBooking(
    @Body()
    body: {
      courtBookingId: number;
      employeeId?: number;
      items: string;
    },
  ) {
    return this.bookingService.createServiceBooking(
      body.courtBookingId,
      body.employeeId || null,
      body.items,
    );
  }

  @Get('courts/:courtId/booking-slots')
  @ApiOperation({ summary: 'Get booked slots for a specific court on a date' })
  @ApiParam({ name: 'courtId', description: 'Court ID' })
  @ApiQuery({ name: 'date', description: 'Date to check bookings for' })
  @ApiResponse({
    status: 200,
    description: 'Booked slots retrieved successfully',
  })
  async getBookingSlotsOfCourt(
    @Param('courtId') courtId: number,
    @Query('date') date: string,
  ) {
    return this.bookingService.getBookingSlotsOfCourt(courtId, date);
  }

  @Get('customers/:customerId/court-bookings')
  @Roles(
    ROLES.CUSTOMER,
    ROLES.RECEPTIONIST,
    ROLES.MANAGER,
    ROLES.ADMIN,
    ROLES.CASHIER,
    ROLES.TECHNICAL,
    ROLES.TRAINER,
  )
  @ApiOperation({
    summary: 'Get all court bookings for a customer specific to a branch',
  })
  @ApiParam({ name: 'customerId', description: 'Customer ID' })
  @ApiQuery({ name: 'branchId', required: true, description: 'Branch ID' })
  @ApiResponse({
    status: 200,
    description: 'Customer court bookings retrieved successfully',
  })
  async getCustomerCourtBookings(
    @Param('customerId') customerId: number,
    @Query('branchId', ParseIntPipe) branchId: number,
  ) {
    return this.bookingService.getCustomerCourtBookings(customerId, branchId);
  }

  @Get('branches/:branchId/services')
  @ApiOperation({ summary: 'Get all services available at a branch' })
  @ApiParam({ name: 'branchId', description: 'Branch ID' })
  @ApiResponse({
    status: 200,
    description: 'Branch services retrieved successfully',
  })
  async getServices(@Param('branchId') branchId: number) {
    return this.bookingService.getServices(branchId);
  }

  @Get('service-bookings/:serviceBookingId/details')
  @ApiOperation({ summary: 'Get detailed information about a service booking' })
  @ApiParam({ name: 'serviceBookingId', description: 'Service booking ID' })
  @ApiResponse({
    status: 200,
    description: 'Service booking details retrieved successfully',
  })
  async getServiceBookingDetails(
    @Param('serviceBookingId') serviceBookingId: number,
  ) {
    return this.bookingService.getServiceBookingDetails(serviceBookingId);
  }

  @Get('court-bookings/:courtBookingId/service-bookings')
  @ApiOperation({ summary: 'Get all service bookings for a court booking' })
  @ApiParam({ name: 'courtBookingId', description: 'Court booking ID' })
  @ApiResponse({
    status: 200,
    description: 'Service bookings retrieved successfully',
  })
  async getServiceBookingInfo(@Param('courtBookingId') courtBookingId: number) {
    return this.bookingService.getServiceBookingInfo(courtBookingId);
  }

  @Get('court-bookings/:courtBookingId/trainer-referee')
  @ApiOperation({
    summary: 'Get available trainers/referees for a court booking',
  })
  @ApiParam({ name: 'courtBookingId', description: 'Court booking ID' })
  @ApiResponse({
    status: 200,
    description: 'Available trainers/referees retrieved successfully',
  })
  async getTrainerReferee(@Param('courtBookingId') courtBookingId: number) {
    return this.bookingService.getTrainerReferee(courtBookingId);
  }

  @Get('branches/:branchId/courts')
  @ApiOperation({
    summary: 'List all courts at a branch filtered by court type',
  })
  @ApiParam({ name: 'branchId', description: 'Branch ID' })
  @ApiQuery({ name: 'courtTypeId', description: 'Court type ID to filter by' })
  @ApiResponse({
    status: 200,
    description: 'Branch courts retrieved successfully',
  })
  async listCourtsOfBranch(
    @Param('branchId') branchId: number,
    @Query('courtTypeId') courtTypeId: number,
  ) {
    return this.bookingService.listCourtsOfBranch(branchId, courtTypeId);
  }

  @Put('court-bookings/:bookingId')
  @ApiOperation({ summary: 'Update an existing court booking' })
  @ApiParam({ name: 'bookingId', description: 'Court booking ID to update' })
  @ApiBody({
    description: 'Court booking update parameters',
    schema: {
      type: 'object',
      properties: {
        newCourtId: { type: 'number', description: 'New court ID' },
        newBookingDate: {
          type: 'string',
          format: 'date',
          description: 'New booking date',
        },
        newSlots: { type: 'string', description: 'New time slots JSON' },
        branchId: { type: 'number', description: 'Branch ID' },
      },
      required: ['newCourtId', 'newBookingDate', 'newSlots', 'branchId'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Court booking updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async updateCourtBooking(
    @Param('bookingId') bookingId: number,
    @Body()
    body: {
      newCourtId: number;
      newBookingDate: string;
      newSlots: string;
      branchId: number;
    },
  ) {
    return this.bookingService.updateCourtBooking(
      bookingId,
      body.newCourtId,
      body.newBookingDate,
      body.newSlots,
      body.branchId,
    );
  }

  @Get('branches/:branchId/court-bookings')
  @Roles(
    ROLES.RECEPTIONIST,
    ROLES.MANAGER,
    ROLES.ADMIN,
    ROLES.CASHIER,
    ROLES.TECHNICAL,
    ROLES.TRAINER,
    ROLES.CUSTOMER,
  )
  @ApiOperation({ summary: 'Get all court bookings for a branch' })
  @ApiParam({ name: 'branchId', description: 'Branch ID' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by booking status',
  })
  @ApiQuery({
    name: 'dateFrom',
    required: false,
    description: 'Filter from date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'dateTo',
    required: false,
    description: 'Filter to date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search in court name, customer name, employee name',
  })
  @ApiResponse({
    status: 200,
    description: 'Court bookings retrieved successfully',
  })
  async getBranchCourtBookings(
    @Param('branchId') branchId: number,
    @Query('status') status?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('search') search?: string,
  ) {
    return this.bookingService.getBranchCourtBookings(branchId, {
      status,
      dateFrom,
      dateTo,
      search,
    });
  }

  @Get('court-bookings/:bookingId/details')
  @ApiOperation({
    summary: 'Get a single court booking by ID with full details',
  })
  @ApiParam({ name: 'bookingId', description: 'Court booking ID' })
  @ApiResponse({
    status: 200,
    description: 'Booking details retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async getCourtBookingById(
    @Param('bookingId', ParseIntPipe) bookingId: number,
  ) {
    return this.bookingService.getCourtBookingById(bookingId);
  }

  @Delete('court-bookings/:bookingId')
  @Roles(ROLES.CUSTOMER, ROLES.RECEPTIONIST, ROLES.MANAGER, ROLES.ADMIN)
  @ApiOperation({ summary: 'Cancel a court booking' })
  @ApiParam({ name: 'bookingId', description: 'Court booking ID to cancel' })
  @ApiResponse({ status: 200, description: 'Booking cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async cancelCourtBooking(
    @Param('bookingId', ParseIntPipe) bookingId: number,
  ) {
    return this.bookingService.cancelCourtBooking(bookingId);
  }
}
