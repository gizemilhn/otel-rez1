import { Router } from 'express';
import { hotelManagerController } from '../controllers/hotel.manager.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

// All routes require authentication and manager role
router.use(authenticateToken);
router.use(authorizeRoles('MANAGER'));

// Hotel management routes
router.get('/hotel', hotelManagerController.getMyHotel);
router.put('/hotel', hotelManagerController.updateMyHotel);

// Room management routes
router.get('/rooms', hotelManagerController.getMyHotelRooms);
router.post('/rooms', hotelManagerController.addRoom);
router.put('/rooms/:roomId', hotelManagerController.updateRoom);
router.delete('/rooms/:roomId', hotelManagerController.deleteRoom);

// Reservation management routes
router.get('/reservations', hotelManagerController.getMyHotelReservations);
router.put('/reservations/:reservationId/status', hotelManagerController.updateReservationStatus);

export default router; 