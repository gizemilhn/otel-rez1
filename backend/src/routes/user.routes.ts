import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';
import { sendReservationConfirmation, sendReservationCancellation } from '../services/emailService';

const router = Router();
const prisma = new PrismaClient();

// Get all hotels
router.get('/hotels', async (req, res) => {
  try {
    const hotels = await prisma.hotel.findMany({
      include: {
        rooms: {
          where: {
            status: 'AVAILABLE',
          },
        },
      },
    });
    res.json(hotels);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching hotels' });
  }
});

// Get hotel details
router.get('/hotels/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const hotel = await prisma.hotel.findUnique({
      where: { id },
      include: {
        rooms: {
          where: {
            status: 'AVAILABLE',
          },
        },
      },
    });
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    res.json(hotel);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching hotel' });
  }
});

// Create reservation
router.post(
  '/reservations',
  authenticate,
  async (req, res) => {
    const { roomId, checkIn, checkOut, guestCount, specialRequests } = req.body;
    const userId = req.user!.userId;

    try {
      // Check if room is available
      const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: { hotel: true },
      });

      if (!room || room.status !== 'AVAILABLE') {
        return res.status(400).json({ message: 'Room is not available' });
      }

      // Calculate total price
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      const totalPrice = room.price * nights;

      // Create reservation
      const reservation = await prisma.reservation.create({
        data: {
          userId,
          roomId,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          guestCount,
          specialRequests,
          totalPrice,
          status: 'CONFIRMED',
        },
        include: {
          user: true,
          room: {
            include: {
              hotel: true,
            },
          },
        },
      });

      // Update room status
      await prisma.room.update({
        where: { id: roomId },
        data: { status: 'OCCUPIED' },
      });

      // Send confirmation email
      await sendReservationConfirmation(
        reservation,
        reservation.user,
        reservation.room.hotel,
        reservation.room
      );

      res.json(reservation);
    } catch (error) {
      res.status(500).json({ message: 'Error creating reservation' });
    }
  }
);

// Get user's reservations
router.get(
  '/my-reservations',
  authenticate,
  async (req, res) => {
    try {
      const reservations = await prisma.reservation.findMany({
        where: { userId: req.user!.userId },
        include: {
          room: {
            include: {
              hotel: true,
            },
          },
        },
        orderBy: {
          checkIn: 'desc',
        },
      });
      res.json(reservations);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching reservations' });
    }
  }
);

// Cancel reservation
router.post(
  '/reservations/:id/cancel',
  authenticate,
  async (req, res) => {
    const { id } = req.params;
    const userId = req.user!.userId;

    try {
      const reservation = await prisma.reservation.findUnique({
        where: { id },
        include: {
          user: true,
          room: {
            include: {
              hotel: true,
            },
          },
        },
      });

      if (!reservation) {
        return res.status(404).json({ message: 'Reservation not found' });
      }

      if (reservation.userId !== userId) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const updatedReservation = await prisma.reservation.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: {
          user: true,
          room: {
            include: {
              hotel: true,
            },
          },
        },
      });

      // Update room status
      await prisma.room.update({
        where: { id: reservation.roomId },
        data: { status: 'AVAILABLE' },
      });

      // Send cancellation email
      await sendReservationCancellation(
        updatedReservation,
        updatedReservation.user,
        updatedReservation.room.hotel,
        updatedReservation.room
      );

      res.json(updatedReservation);
    } catch (error) {
      res.status(500).json({ message: 'Error cancelling reservation' });
    }
  }
);

export default router; 