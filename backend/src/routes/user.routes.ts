import express from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import { getUserReservations, cancelReservation } from '../controllers/user.controller';

const router = express.Router();

// Protected routes
router.use(authenticateToken);

// Get user's reservations
router.get('/reservations', getUserReservations);

// Cancel a reservation
router.put('/reservations/:id/cancel', cancelReservation);

export default router; 