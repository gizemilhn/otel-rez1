import { Router } from 'express';
import {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
} from '../controllers/room.controller';
import { authenticateToken, authorizeRoles, authorizeHotelManager } from '../middlewares/auth.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

// Public routes
router.get('/', getRooms);
router.get('/:id', getRoomById);

// Protected routes
router.use(authenticateToken);

// Admin only routes
router.post('/', authorizeRoles(UserRole.ADMIN), createRoom);
router.delete('/:id', authorizeRoles(UserRole.ADMIN), deleteRoom);

// Admin and manager routes
router.put('/:id', authorizeHotelManager, updateRoom);

export default router; 