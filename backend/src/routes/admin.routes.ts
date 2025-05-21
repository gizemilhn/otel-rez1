import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';
import { UserRole } from '@prisma/client';
import {
  getAllHotels,
  createHotel,
  updateHotel,
  deleteHotel,
  assignManager,
} from '../controllers/hotel.controller';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/user.controller';
import {
  getAllRooms,
  createRoom,
  updateRoom,
  deleteRoom,
} from '../controllers/room.controller';
import {
  getAllReservations,
  updateReservation,
  deleteReservation,
} from '../controllers/reservation.controller';

const router = Router();

// Apply authentication and admin role check to all routes
router.use(authenticateToken);
router.use(authorizeRoles(UserRole.ADMIN));

// Hotel routes
router.get('/hotels', getAllHotels);
router.post('/hotels', createHotel);
router.put('/hotels/:id', updateHotel);
router.delete('/hotels/:id', deleteHotel);
router.post('/hotels/:id/assign-manager', assignManager);

// User routes
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Room routes
router.get('/rooms', getAllRooms);
router.post('/rooms', createRoom);
router.put('/rooms/:id', updateRoom);
router.delete('/rooms/:id', deleteRoom);

// Reservation routes
router.get('/reservations', getAllReservations);
router.put('/reservations/:id', updateReservation);
router.delete('/reservations/:id', deleteReservation);

export default router; 