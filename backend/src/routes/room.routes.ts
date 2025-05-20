import { Router } from 'express';
import {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  checkRoomAvailability,
} from '../controllers/room.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';
import { UserRole } from '@prisma/client';
import { validateRequest } from '../middlewares/validate.middleware';
import { roomSchema, checkAvailabilitySchema } from '../schemas/room.schema';

const router = Router();

// Public routes
router.get('/hotel/:hotelId', getRooms);
router.get('/:id', getRoomById);
router.get(
  '/:roomId/availability',
  validateRequest(checkAvailabilitySchema),
  checkRoomAvailability
);

// Protected routes
router.use(authenticateToken);

// Admin and manager routes
router.post(
  '/',
  authorizeRoles(UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(roomSchema),
  createRoom
);

router.put(
  '/:id',
  authorizeRoles(UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(roomSchema),
  updateRoom
);

router.delete(
  '/:id',
  authorizeRoles(UserRole.ADMIN, UserRole.MANAGER),
  deleteRoom
);

export default router; 