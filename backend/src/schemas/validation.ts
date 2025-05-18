import { z } from 'zod';
import { UserRole, ReservationStatus, RoomStatus } from '@prisma/client';

// Auth schemas
export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});

// Hotel schemas
export const createHotelSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    address: z.string().min(5),
    city: z.string().min(2),
    country: z.string().min(2),
    description: z.string().optional(),
    imageUrl: z.string().url().optional(),
    rating: z.number().min(0).max(5).optional(),
  }),
});

export const updateHotelSchema = createHotelSchema;

// Room schemas
export const createRoomSchema = z.object({
  body: z.object({
    number: z.string().min(1),
    type: z.string().min(2),
    price: z.number().positive(),
    capacity: z.number().positive(),
    description: z.string().optional(),
  }),
  params: z.object({
    hotelId: z.string().uuid(),
  }),
});

export const updateRoomSchema = z.object({
  body: z.object({
    number: z.string().min(1),
    type: z.string().min(2),
    price: z.number().positive(),
    capacity: z.number().positive(),
    description: z.string().optional(),
    status: z.nativeEnum(RoomStatus),
  }),
  params: z.object({
    hotelId: z.string().uuid(),
    roomId: z.string().uuid(),
  }),
});

// Reservation schemas
export const createReservationSchema = z.object({
  body: z.object({
    roomId: z.string().uuid(),
    checkIn: z.string().datetime(),
    checkOut: z.string().datetime(),
    guestCount: z.number().positive(),
    specialRequests: z.string().optional(),
  }),
});

export const updateReservationSchema = z.object({
  body: z.object({
    status: z.nativeEnum(ReservationStatus),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

// Manager assignment schema
export const assignManagerSchema = z.object({
  body: z.object({
    managerId: z.string().uuid(),
  }),
  params: z.object({
    hotelId: z.string().uuid(),
  }),
}); 