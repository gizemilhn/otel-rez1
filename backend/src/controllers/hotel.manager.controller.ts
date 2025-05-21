import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const hotelManagerController = {
  // Get manager's hotel details
  getMyHotel: async (req: Request, res: Response) => {
    try {
      const hotel = await prisma.hotel.findUnique({
        where: { managerId: req.user!.userId },
        include: {
          rooms: true,
        },
      });

      if (!hotel) {
        return res.status(404).json({ message: 'No hotel assigned to this manager' });
      }

      res.json(hotel);
    } catch (error) {
      console.error('Error fetching manager hotel:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Update manager's hotel details
  updateMyHotel: async (req: Request, res: Response) => {
    try {
      const { name, address, city, country, description, imageUrl } = req.body;

      const hotel = await prisma.hotel.update({
        where: { managerId: req.user!.userId },
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
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Get all rooms for manager's hotel
  getMyHotelRooms: async (req: Request, res: Response) => {
    try {
      const hotel = await prisma.hotel.findUnique({
        where: { managerId: req.user!.userId },
        include: {
          rooms: true,
        },
      });

      if (!hotel) {
        return res.status(404).json({ message: 'No hotel assigned to this manager' });
      }

      res.json(hotel.rooms);
    } catch (error) {
      console.error('Error fetching hotel rooms:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Add a new room to manager's hotel
  addRoom: async (req: Request, res: Response) => {
    try {
      const { number, type, price, capacity, description } = req.body;

      const hotel = await prisma.hotel.findUnique({
        where: { managerId: req.user!.userId },
      });

      if (!hotel) {
        return res.status(404).json({ message: 'No hotel assigned to this manager' });
      }

      const room = await prisma.room.create({
        data: {
          number,
          type,
          price,
          capacity,
          description,
          hotelId: hotel.id,
        },
      });

      res.status(201).json(room);
    } catch (error) {
      console.error('Error adding room:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Update a room in manager's hotel
  updateRoom: async (req: Request, res: Response) => {
    try {
      const { roomId } = req.params;
      const { number, type, price, capacity, description, status } = req.body;

      const hotel = await prisma.hotel.findUnique({
        where: { managerId: req.user!.userId },
        include: {
          rooms: true,
        },
      });

      if (!hotel) {
        return res.status(404).json({ message: 'No hotel assigned to this manager' });
      }

      const roomExists = hotel.rooms.some(room => room.id === roomId);
      if (!roomExists) {
        return res.status(404).json({ message: 'Room not found in your hotel' });
      }

      const room = await prisma.room.update({
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

      res.json(room);
    } catch (error) {
      console.error('Error updating room:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Delete a room from manager's hotel
  deleteRoom: async (req: Request, res: Response) => {
    try {
      const { roomId } = req.params;

      const hotel = await prisma.hotel.findUnique({
        where: { managerId: req.user!.userId },
        include: {
          rooms: true,
        },
      });

      if (!hotel) {
        return res.status(404).json({ message: 'No hotel assigned to this manager' });
      }

      const roomExists = hotel.rooms.some(room => room.id === roomId);
      if (!roomExists) {
        return res.status(404).json({ message: 'Room not found in your hotel' });
      }

      // Check if room has any active reservations
      const activeReservations = await prisma.reservation.findFirst({
        where: {
          roomId: roomId,
          status: {
            in: ['PENDING', 'CONFIRMED']
          }
        }
      });

      if (activeReservations) {
        return res.status(400).json({ 
          message: 'Cannot delete room with active reservations. Please cancel or complete all reservations first.' 
        });
      }

      await prisma.room.delete({
        where: { id: roomId },
      });

      res.json({ message: 'Room deleted successfully' });
    } catch (error) {
      console.error('Error deleting room:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Get all reservations for manager's hotel
  getMyHotelReservations: async (req: Request, res: Response) => {
    try {
      const hotel = await prisma.hotel.findUnique({
        where: { managerId: req.user!.userId },
        include: {
          rooms: {
            include: {
              reservations: {
                include: {
                  user: true,
                  room: true,
                },
              },
            },
          },
        },
      });

      if (!hotel) {
        return res.status(404).json({ message: 'No hotel assigned to this manager' });
      }

      // Flatten reservations from all rooms
      const reservations = hotel.rooms.flatMap(room => room.reservations);

      res.json(reservations);
    } catch (error) {
      console.error('Error fetching hotel reservations:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Update reservation status (approve/reject)
  updateReservationStatus: async (req: Request, res: Response) => {
    try {
      const { reservationId } = req.params;
      const { status } = req.body;

      const hotel = await prisma.hotel.findUnique({
        where: { managerId: req.user!.userId },
        include: {
          rooms: {
            include: {
              reservations: true,
            },
          },
        },
      });

      if (!hotel) {
        return res.status(404).json({ message: 'No hotel assigned to this manager' });
      }

      // Check if reservation exists in manager's hotel
      const reservationExists = hotel.rooms.some(room =>
        room.reservations.some(res => res.id === reservationId)
      );

      if (!reservationExists) {
        return res.status(404).json({ message: 'Reservation not found in your hotel' });
      }

      const reservation = await prisma.reservation.update({
        where: { id: reservationId },
        data: { status },
        include: {
          user: true,
          room: true,
        },
      });

      // Log the status change
      await prisma.reservationLog.create({
        data: {
          reservationId,
          action: 'UPDATE',
          oldStatus: reservation.status,
          newStatus: status,
          userId: req.user!.userId,
        },
      });

      res.json(reservation);
    } catch (error) {
      console.error('Error updating reservation status:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
}; 