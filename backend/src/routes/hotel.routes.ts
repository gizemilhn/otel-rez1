import { Router } from 'express';
import {
  createHotel,
  getHotels,
  getHotelById,
  updateHotel,
  deleteHotel,
  getHotelSummary,
} from '../controllers/hotel.controller';
import { authenticateToken, authorizeRoles, authorizeHotelManager } from '../middlewares/auth.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

// Public routes
router.get('/', getHotels);
router.get('/summary', getHotelSummary);
router.get('/:id', getHotelById);

// Protected routes
router.use(authenticateToken);

// Admin only routes
router.post('/', authorizeRoles(UserRole.ADMIN), createHotel);
router.delete('/:id', authorizeRoles(UserRole.ADMIN), deleteHotel);

// Admin and manager routes
router.put('/:id', authorizeHotelManager, updateHotel);

export default router; 