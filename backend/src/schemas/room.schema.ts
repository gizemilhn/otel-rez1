import { z } from 'zod';
import { RoomStatus } from '@prisma/client';

export const roomSchema = z.object({
  body: z.object({
    number: z.string().min(1, 'Room number is required'),
    type: z.string().min(2, 'Room type must be at least 2 characters'),
    price: z.number().positive('Price must be positive'),
    capacity: z.number().int().positive('Capacity must be a positive integer'),
    description: z.string().optional(),
    hotelId: z.string().uuid('Invalid hotel ID'),
    status: z.nativeEnum(RoomStatus).optional(),
  }),
});

export const checkAvailabilitySchema = z.object({
  query: z.object({
    checkIn: z.string().datetime('Invalid check-in date'),
    checkOut: z.string().datetime('Invalid check-out date'),
    guestCount: z.string().optional().transform((val) => (val ? parseInt(val) : undefined)),
  }).refine((data) => new Date(data.checkIn) < new Date(data.checkOut), {
    message: 'Check-out date must be after check-in date',
  }),
}); 