# VietSport Backend - MSSQL Setup Guide

This backend application uses NestJS with Prisma to connect to a Microsoft SQL Server database for the VietSport sports center management system.

## MSSQL Server Configuration

To connect to MSSQL Server from your NestJS application using Prisma, follow these steps to configure the server:

### 1. Enable TCP/IP Protocol
- Open SQL Server Configuration Manager
- Navigate to SQL Server Network Configuration > Protocols for [Your Instance Name]
- Right-click TCP/IP and select Enable

### 2. Configure TCP/IP Port
- Double-click TCP/IP to open properties
- Go to the IP Addresses tab
- Scroll to the IPAll section
- Set the TCP Port to 1433 (or your preferred port)

### 3. Restart SQL Server Service
- In SQL Server Configuration Manager, go to SQL Server Services
- Right-click SQL Server ([Your Instance Name]) and select Restart

### 4. Enable Mixed Mode Authentication
- Open SQL Server Management Studio (SSMS)
- Right-click the server instance > Properties > Security
- Select "SQL Server and Windows Authentication mode"
- Click OK
- Restart the SQL Server service

### 5. Create a Database User
- In SSMS, expand Security > Logins
- Right-click Logins > New Login
- Enter a login name (e.g., 'nestjs_user')
- Select SQL Server authentication
- Set a strong password
- Uncheck "Enforce password policy" if needed for development
- In the User Mapping page, select your database
- Assign the db_owner role or appropriate permissions

### 6. Configure Firewall
- Open Windows Firewall with Advanced Security
- Create a new Inbound Rule
- Select Port > TCP > Specific local ports: 1433
- Allow the connection

### 7. Environment Configuration
Ensure your `.env` file contains the correct database connection string:

```env
DATABASE_URL="sqlserver://username:password@localhost:1433;database=SportsCenterDB;trustServerCertificate=true"
```

### 8. Database Setup
Run the database scripts in the `scripts-database` folder in this order:
1. `create_db.sql` - Creates the database and tables
2. `create_data.sql` - Inserts sample data
3. `create_constraints.sql` - Adds constraints and triggers
4. Execute the stored procedure files in `stored_procedure/` folders as needed

### 9. Prisma Setup
```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations (if any)
npx prisma db push
```

### 10. Start the Application
```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

## API Documentation

Once the application is running, you can access the Swagger API documentation at:
```
http://localhost:3000/api
```

The documentation provides interactive endpoints for testing all receptionist operations including:
- Court booking management
- Service booking management
- Price calculations
- Availability queries
- Trainer/referee assignments

## API Endpoints

The application provides REST endpoints for booking operations:

- `POST /booking/calculate-slots-price` - Calculate booking slot prices
- `POST /booking/court-bookings` - Create court bookings
- `POST /booking/service-bookings` - Create service bookings
- `GET /booking/courts/:courtId/booking-slots` - Get booked slots for a court
- `GET /booking/customers/:customerId/court-bookings` - Get customer court bookings
- `GET /booking/branches/:branchId/services` - Get available services
- `GET /booking/service-bookings/:serviceBookingId/details` - Get service booking details
- `GET /booking/court-bookings/:courtBookingId/service-bookings` - Get service bookings for court booking
- `GET /booking/court-bookings/:courtBookingId/trainer-referee` - Get available trainers/referees
- `GET /booking/branches/:branchId/courts` - List courts by branch and type
- `PUT /booking/court-bookings/:bookingId` - Update court booking

## Troubleshooting

- Ensure SQL Server is running and accessible
- Verify firewall settings allow connections on port 1433
- Check that the database user has appropriate permissions
- Confirm the connection string in `.env` is correct
- Make sure all stored procedures are created in the database
