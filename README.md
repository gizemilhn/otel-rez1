# Hotel Reservation Management System

A full-stack application for managing hotel reservations, built with React, TypeScript, Node.js, and PostgreSQL.

## Features

- User authentication and authorization (Admin, Manager, User roles)
- Hotel and room management
- Reservation system with email notifications
- Role-based access control
- Responsive design with TailwindCSS

## Tech Stack

### Frontend
- React with TypeScript
- TailwindCSS for styling
- React Router for navigation
- React Hook Form for form handling
- Axios for API requests
- Zustand for state management

### Backend
- Node.js with Express
- TypeScript
- Prisma ORM
- PostgreSQL database
- JWT for authentication
- Nodemailer for email notifications

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd hotel-reservation-system
```

2. Set up the backend:
```bash
cd backend
npm install
```

3. Create a `.env` file in the backend directory with the following variables:
```
DATABASE_URL="postgresql://user:password@localhost:5432/hotel_reservation?schema=public"
JWT_SECRET="your-jwt-secret-key"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="development"
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-smtp-username"
SMTP_PASS="your-smtp-password"
SMTP_FROM="noreply@hotelreservation.com"
```

4. Set up the database:
```bash
npx prisma migrate dev
npx prisma db seed
```

5. Set up the frontend:
```bash
cd ../frontend
npm install
```

6. Create a `.env` file in the frontend directory:
```
VITE_API_URL=http://localhost:3000/api
```

## Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- GET /api/auth/profile - Get user profile

### Hotels
- GET /api/hotels - Get all hotels
- GET /api/hotels/:id - Get hotel by ID
- POST /api/hotels - Create hotel (Admin only)
- PUT /api/hotels/:id - Update hotel (Admin only)
- DELETE /api/hotels/:id - Delete hotel (Admin only)
- POST /api/hotels/:hotelId/manager - Assign manager to hotel (Admin only)

### Rooms
- GET /api/rooms - Get all rooms
- GET /api/rooms/:id - Get room by ID
- POST /api/rooms - Create room (Admin/Manager)
- PUT /api/rooms/:id - Update room (Admin/Manager)
- DELETE /api/rooms/:id - Delete room (Admin/Manager)
- GET /api/rooms/:roomId/availability - Check room availability

### Reservations
- POST /api/reservations - Create reservation
- GET /api/reservations - Get all reservations
- GET /api/reservations/:id - Get reservation by ID
- PATCH /api/reservations/:id/status - Update reservation status (Admin/Manager)
- POST /api/reservations/:id/cancel - Cancel reservation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. 