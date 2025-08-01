# Ride Booking System API

A **secure, scalable, and role-based backend API** for a ride booking platform (similar to Uber/Pathao) built with **Express.js** and **Mongoose**. This system enables riders to request rides, drivers to accept and complete rides, and admins to manage the overall platform.

## Project Overview

This ride booking system implements a complete backend solution with JWT-based authentication, role-based authorization, and comprehensive ride management functionality. The system supports three user roles with distinct capabilities and responsibilities.

### Key Features

- **JWT Authentication** with secure password hashing
- **Role-Based Authorization** (Admin, Driver, Rider)
- **Complete Ride Management** with status tracking
- **Real-time Status Updates** for ride lifecycle
- **Comprehensive History Tracking**
- **Secure Route Protection**
- **Modular Architecture** for scalability

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcrypt
- **Validation**: Custom middleware & Mongoose validators
- **Documentation**: Postman collection


## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Step-by-Step Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/saminul-amin/ride-booking-server
   cd ride-booking-server
   ```

2. **Install dependencies**
   ```bash
   npm i
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/ride-booking-db
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   
   # Other Configuration
   BCRYPT_SALT_ROUNDS=12
   ```

4. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Verify installation**
   - Open your browser and navigate to `http://localhost:3000`
   - You should see a welcome message from the API

## User Roles & Capabilities

### Admin
- View all users, drivers, and rides
- Approve/suspend driver accounts
- Block/unblock user accounts
- Generate system reports
- Manage overall platform operations

### Driver
- Accept/reject ride requests
- Update ride status throughout journey
- View earnings and ride history
- Set availability status (Online/Offline)
- Manage profile and vehicle information

### Rider
- Request rides with pickup & destination
- Cancel rides (within allowed timeframe)
- View complete ride history
- Track current ride status
- Manage profile information


### Status Definitions
- **REQUESTED**: Rider has requested a ride, waiting for driver
- **ACCEPTED**: Driver has accepted the ride request
- **PICKED_UP**: Driver has arrived and picked up the rider
- **IN_TRANSIT**: Ride is in progress to destination
- **COMPLETED**: Ride has been successfully completed
- **CANCELLED**: Ride was cancelled by rider or system


## Database Schema

### User Model
- Basic user information (name, email, phone)
- Role assignment (rider, driver, admin)
- Account status (active, blocked, suspended)
- Registration and profile data

### Ride Model
- Pickup and destination coordinates/addresses
- Rider and driver references
- Status tracking with timestamps
- Fare calculation and payment status
- Complete ride history

### Driver-Specific Fields
- Approval status
- Availability status
- Earnings tracking
- Rating system

## Testing

### Using Postman
1. Import the provided Postman collection
2. Set up environment variables for base URL and tokens
3. Test the complete user journey:
   - Register users with different roles
   - Login and obtain JWT tokens
   - Create ride requests as rider
   - Accept and complete rides as driver
   - Manage system as admin

### Test Scenarios
- **Authentication Flow**: Registration, login, token refresh
- **Rider Journey**: Request ride, track status, view history
- **Driver Journey**: Accept rides, update status, check earnings
- **Admin Operations**: User management, driver approval, system oversight

## Business Rules & Validations

### Ride Management
- Riders can only have one active ride at a time
- Drivers can only accept rides when online and available
- Rides can only be cancelled before pickup
- Status updates must follow the defined lifecycle

### User Management
- Suspended drivers cannot accept new rides
- Blocked users cannot access the system
- Email and phone numbers must be unique
- Password strength requirements enforced

## Configuration Options

### Environment Variables
- `PORT`: Server port (default: 3000)
- `MONGODB_URI`: Database connection string
- `JWT_ACCESS_SECRET`: Secret key for JWT signing
- `JWT_ACCESS_EXPIRES`: Token expiration time
- `JWT_REFRESH_SECRET`: Secret key for JWT refresh token
- `JWT_REFRESH_EXPIRES`: Refresh token expiration time
- `BCRYPT_SALT_ROUNDS`: Password hashing strength


## Future Enhancements

- **Real-time Updates**: WebSocket integration for live tracking
- **Geolocation**: GPS-based driver matching and route optimization
- **Payment Integration**: Stripe/PayPal integration
- **Rating System**: Driver and rider rating functionality
- **Analytics Dashboard**: Advanced reporting and insights
- **Mobile App**: React Native companion apps
- **Notification System**: Push notifications and SMS alerts

## Development Notes

### Code Quality
- ESLint configuration for code consistency
- Modular architecture for maintainability
- Comprehensive error handling
- Input validation and sanitization
- Security best practices implemented

### Performance Considerations
- Database indexing for optimized queries
- JWT token optimization
- Efficient MongoDB aggregation pipelines
- Proper HTTP caching headers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request


## Author

**Md. Saminul Amin**
- GitHub: [@Md. Saminul Amin](https://github.com/saminul-amin)
- Email: [saminul.amin@gmail.com](mailto:saminul.amin@gmail.com)
- LinkedIn: [Md. Saminul Amin](https://www.linkedin.com/in/md-saminul-amin-91605730a/)

---

## Demo Video

Check out the [5-10 minute demo video](link-to-your-video) showcasing:
- Project overview and architecture
- Authentication and authorization flow
- Complete ride booking journey
- Admin management features
- Postman API testing demonstration

---

**⭐ If you find this project helpful, please give it a star on GitHub!**