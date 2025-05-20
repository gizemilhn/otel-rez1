import { Router } from 'express';
import {
  createHotel,
  getHotels,
  getHotelById,
  updateHotel,
  deleteHotel,
  assignManager,
} from '../controllers/hotel.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';
import { UserRole } from '@prisma/client';
import { validateRequest } from '../middlewares/validate.middleware';
import { hotelSchema, assignManagerSchema } from '../schemas/hotel.schema';

const router = Router();

// Public routes
router.get('/', getHotels);
router.get('/:id', getHotelById);

// Protected routes
router.use(authenticateToken);

// Admin only routes
router.post(
  '/',
  authorizeRoles(UserRole.ADMIN),
  validateRequest(hotelSchema),
  createHotel
);

router.put(
  '/:id',
  authorizeRoles(UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(hotelSchema),
  updateHotel
);

router.delete(
  '/:id',
  authorizeRoles(UserRole.ADMIN),
  deleteHotel
);

router.post(
  '/:hotelId/assign-manager',
  authorizeRoles(UserRole.ADMIN),
  validateRequest(assignManagerSchema),
  assignManager
);

export default router; 