import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize, isHotelManager } from '../middleware/auth';
import { ROLES } from '../constants/roles';

const router = Router();
const prisma = new PrismaClient();

// Get manager's hotel
router.get(
  '/my-hotel',
  authenticate,
  authorize(ROLES.MANAGER),
  async (req, res) => {
    try {
      const hotel = await prisma.hotel.findFirst({
        where: { managerId: req.user!.userId },
        include: {
          rooms: {
            include: {
              reservations: {
                where: {
                  status: {
                    in: ['PENDING', 'CONFIRMED'],
                  },
                },
                include: {
                  user: {
                    select: {
                      id: true,
                      email: true,
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!hotel) {
        return res.status(404).json({ message: 'No hotel assigned' });
      }

      res.json(hotel);
    } catch (error) {
      console.error('Error fetching hotel:', error);
      res.status(500).json({ message: 'Error fetching hotel' });
    }
  }
);

// Update hotel details
router.put(
  '/hotels/:hotelId',
  authenticate,
  authorize(ROLES.MANAGER),
  isHotelManager,
  async (req, res) => {
    const { hotelId } = req.params;
    const { name, address, city, country, description, imageUrl } = req.body;

    try {
      const hotel = await prisma.hotel.update({
        where: { id: hotelId },
        data: {
          name,
          address,
          city,
          country,
          description,
          imageUrl,
        },
      });
      res.json(hotel);
    } catch (error) {
      console.error('Error updating hotel:', error);
      res.status(500).json({ message: 'Error updating hotel' });
    }
  }
);

// Create room
router.post(
  '/hotels/:hotelId/rooms',
  authenticate,
  authorize(ROLES.MANAGER),
  isHotelManager,
  async (req, res) => {
    const { hotelId } = req.params;
    const { number, type, price, capacity, description } = req.body;

    try {
      // Check if room number already exists in the hotel
      const existingRoom = await prisma.room.findFirst({
        where: {
          hotelId,
          number,
        },
      });

      if (existingRoom) {
        return res.status(400).json({
          message: 'Room number already exists in this hotel',
        });
      }

      const room = await prisma.room.create({
        data: {
          number,
          type,
          price,
          capacity,
          description,
          hotelId,
          status: 'AVAILABLE',
        },
      });
      res.status(201).json(room);
    } catch (error) {
      console.error('Error creating room:', error);
      res.status(500).json({ message: 'Error creating room' });
    }
  }
);

// Update room
router.put(
  '/hotels/:hotelId/rooms/:roomId',
  authenticate,
  authorize(ROLES.MANAGER),
  isHotelManager,
  async (req, res) => {
    const { roomId } = req.params;
    const { number, type, price, capacity, description, status } = req.body;

    try {
      // Check if room exists and belongs to the hotel
      const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
          reservations: {
            where: {
              status: {
                in: ['PENDING', 'CONFIRMED'],
              },
            },
          },
        },
      });

      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }

      // If trying to set room to maintenance, check for active reservations
      if (status === 'MAINTENANCE' && room.reservations.length > 0) {
        return res.status(400).json({
          message: 'Cannot set room to maintenance with active reservations',
          activeReservations: room.reservations.length,
        });
      }

      const updatedRoom = await prisma.room.update({
        where: { id: roomId },
        data: {
          number,
          type,
          price,
          capacity,
          description,
          status,
        },
      });
      res.json(updatedRoom);
    } catch (error) {
      console.error('Error updating room:', error);
      res.status(500).json({ message: 'Error updating room' });
    }
  }
);

// Get hotel reservations
router.get(
  '/hotels/:hotelId/reservations',
  authenticate,
  authorize(ROLES.MANAGER),
  isHotelManager,
  async (req, res) => {
    const { hotelId } = req.params;
    const { status } = req.query;

    try {
      const reservations = await prisma.reservation.findMany({
        where: {
          room: {
            hotelId,
          },
          ...(status ? { status: status as string } : {}),
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          room: true,
        },
        orderBy: {
          checkIn: 'asc',
        },
      });
      res.json(reservations);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      res.status(500).json({ message: 'Error fetching reservations' });
    }
  }
);

export default router; 