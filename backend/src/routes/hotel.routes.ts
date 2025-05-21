import { Router } from 'express';
import {
  createHotel,
  getHotels,
  getHotelById,
  updateHotel,
  deleteHotel,
  getHotelSummary,
} from '../controllers/hotel.controller';
import { getRooms } from '../controllers/room.controller';
import { authenticateToken, authorizeRoles, authorizeHotelManager } from '../middlewares/auth.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

// Public routes
router.get('/', getHotels);
router.get('/:id', getHotelById);
router.get('/:id/rooms', getRooms);

// Admin routes
router.post('/', authenticateToken, authorizeRoles(UserRole.ADMIN), createHotel);
router.put('/:id', authenticateToken, authorizeRoles(UserRole.ADMIN), updateHotel);
router.delete('/:id', authenticateToken, authorizeRoles(UserRole.ADMIN), deleteHotel);
router.get('/summary', authenticateToken, authorizeRoles(UserRole.ADMIN), getHotelSummary);

export default router; 