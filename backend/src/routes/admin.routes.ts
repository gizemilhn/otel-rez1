import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';
import { ROLES } from '../constants/roles';
import { sendReservationCancellation } from '../services/emailService';

const router = Router();
const prisma = new PrismaClient();

// Get all users
router.get(
  '/users',
  authenticate,
  authorize(ROLES.ADMIN),
  async (req, res) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
          managedHotel: true,
        },
      });
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Error fetching users' });
    }
  }
);

// Create hotel
router.post(
  '/hotels',
  authenticate,
  authorize(ROLES.ADMIN),
  async (req, res) => {
    const { name, address, city, country, description, imageUrl, rating } = req.body;

    try {
      const hotel = await prisma.hotel.create({
        data: {
          name,
          address,
          city,
          country,
          description,
          imageUrl,
          rating,
        },
      });
      res.status(201).json(hotel);
    } catch (error) {
      console.error('Error creating hotel:', error);
      res.status(500).json({ message: 'Error creating hotel' });
    }
  }
);

// Update hotel
router.put(
  '/hotels/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  async (req, res) => {
    const { id } = req.params;
    const { name, address, city, country, description, imageUrl, rating } = req.body;

    try {
      const hotel = await prisma.hotel.update({
        where: { id },
        data: {
          name,
          address,
          city,
          country,
          description,
          imageUrl,
          rating,
        },
      });
      res.json(hotel);
    } catch (error) {
      console.error('Error updating hotel:', error);
      res.status(500).json({ message: 'Error updating hotel' });
    }
  }
);

// Delete hotel
router.delete(
  '/hotels/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  async (req, res) => {
    const { id } = req.params;

    try {
      // Check if hotel has any active reservations
      const activeReservations = await prisma.reservation.findMany({
        where: {
          room: {
            hotelId: id,
          },
          status: {
            in: ['PENDING', 'CONFIRMED'],
          },
        },
      });

      if (activeReservations.length > 0) {
        return res.status(400).json({
          message: 'Cannot delete hotel with active reservations',
          activeReservationsCount: activeReservations.length,
        });
      }

      // Delete all rooms and then the hotel
      await prisma.$transaction([
        prisma.room.deleteMany({
          where: { hotelId: id },
        }),
        prisma.hotel.delete({
          where: { id },
        }),
      ]);

      res.json({ message: 'Hotel deleted successfully' });
    } catch (error) {
      console.error('Error deleting hotel:', error);
      res.status(500).json({ message: 'Error deleting hotel' });
    }
  }
);

// Assign manager to hotel
router.post(
  '/hotels/:hotelId/manager',
  authenticate,
  authorize(ROLES.ADMIN),
  async (req, res) => {
    const { hotelId } = req.params;
    const { managerId } = req.body;

    try {
      // Check if user exists and is a manager
      const user = await prisma.user.findUnique({
        where: { id: managerId },
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.role !== ROLES.MANAGER) {
        return res.status(400).json({ message: 'User must be a manager' });
      }

      // Check if manager is already assigned to another hotel
      const existingHotel = await prisma.hotel.findFirst({
        where: { managerId },
      });

      if (existingHotel) {
        return res.status(400).json({
          message: 'Manager is already assigned to another hotel',
          hotelId: existingHotel.id,
        });
      }

      const hotel = await prisma.hotel.update({
        where: { id: hotelId },
        data: { managerId },
        include: { manager: true },
      });

      res.json(hotel);
    } catch (error) {
      console.error('Error assigning manager:', error);
      res.status(500).json({ message: 'Error assigning manager' });
    }
  }
);

// Get all reservations
router.get(
  '/reservations',
  authenticate,
  authorize(ROLES.ADMIN),
  async (req, res) => {
    try {
      const reservations = await prisma.reservation.findMany({
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          room: {
            include: {
              hotel: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      res.json(reservations);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      res.status(500).json({ message: 'Error fetching reservations' });
    }
  }
);

// Cancel reservation
router.post(
  '/reservations/:id/cancel',
  authenticate,
  authorize(ROLES.ADMIN),
  async (req, res) => {
    const { id } = req.params;

    try {
      const reservation = await prisma.reservation.update({
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
        reservation,
        reservation.user,
        reservation.room.hotel,
        reservation.room
      );

      res.json(reservation);
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      res.status(500).json({ message: 'Error cancelling reservation' });
    }
  }
);

export default router; 