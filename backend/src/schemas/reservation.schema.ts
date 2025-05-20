import { z } from 'zod';
import { ReservationStatus } from '@prisma/client';

export const reservationSchema = z.object({
  body: z.object({
    roomId: z.string().uuid('Invalid room ID'),
    checkIn: z.string().transform((str) => new Date(str)),
    checkOut: z.string().transform((str) => new Date(str)),
    guestCount: z.number().int().positive('Guest count must be a positive integer'),
    specialRequests: z.string().optional(),
  }).refine((data) => data.checkIn < data.checkOut, {
    message: 'Check-out date must be after check-in date',
  }),
});

export const updateReservationStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(ReservationStatus),
  }),
}); 