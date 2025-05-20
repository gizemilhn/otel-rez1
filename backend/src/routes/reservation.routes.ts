import { Router } from 'express';
import {
  createReservation,
  getReservations,
  getReservationById,
  updateReservationStatus,
  cancelReservation,
} from '../controllers/reservation.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';
import { UserRole } from '@prisma/client';
import { validateRequest } from '../middlewares/validate.middleware';
import { reservationSchema, updateReservationStatusSchema } from '../schemas/reservation.schema';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Create reservation (any authenticated user)
router.post(
  '/',
  validateRequest(reservationSchema),
  createReservation
);

// Get all reservations (filtered by role)
router.get('/', getReservations);

// Get reservation by ID (filtered by role)
router.get('/:id', getReservationById);

// Update reservation status (admin and manager only)
router.patch(
  '/:id/status',
  authorizeRoles(UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(updateReservationStatusSchema),
  updateReservationStatus
);

// Cancel reservation (admin, manager, or reservation owner)
router.post(
  '/:id/cancel',
  cancelReservation
);

export default router; 