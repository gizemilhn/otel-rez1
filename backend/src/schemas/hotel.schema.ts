import { z } from 'zod';

export const hotelSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Hotel name must be at least 2 characters'),
    address: z.string().min(5, 'Address must be at least 5 characters'),
    city: z.string().min(2, 'City must be at least 2 characters'),
    country: z.string().min(2, 'Country must be at least 2 characters'),
    description: z.string().optional(),
    imageUrl: z.string().url('Invalid image URL').optional(),
    rating: z.number().min(0).max(5).optional(),
    managerId: z.string().uuid('Invalid manager ID').optional(),
  }),
});

export const assignManagerSchema = z.object({
  body: z.object({
    managerId: z.string().uuid('Invalid manager ID'),
  }),
}); 