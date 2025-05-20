import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { RoomStatus, UserRole } from '@prisma/client';

export const createRoom = async (req: Request, res: Response) => {
  try {
    const { number, type, price, capacity, description, hotelId } = req.body;
    const userRole = req.user!.role;
    const userId = req.user!.userId;

    // Verify hotel exists
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
    });

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    // Check if user has permission to create room
    if (userRole === UserRole.MANAGER && hotel.managerId !== userId) {
      return res.status(403).json({ message: 'You can only create rooms for your assigned hotel' });
    }

    // Check if room number already exists in the hotel
    const existingRoom = await prisma.room.findFirst({
      where: {
        hotelId,
        number,
      },
    });

    if (existingRoom) {
      return res.status(400).json({ message: 'Room number already exists in this hotel' });
    }

    const room = await prisma.room.create({
      data: {
        number,
        type,
        price,
        capacity,
        description,
        hotelId,
        status: RoomStatus.AVAILABLE,
      },
      include: {
        hotel: {
          select: {
            name: true,
            address: true,
            city: true,
            country: true,
          },
        },
      },
    });

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: 'Error creating room' });
  }
};

export const getRooms = async (req: Request, res: Response) => {
  try {
    const { hotelId } = req.params;

    const rooms = await prisma.room.findMany({
      where: { hotelId },
      include: {
        hotel: {
          select: {
            name: true,
            address: true,
            city: true,
            country: true,
          },
        },
        reservations: {
          where: {
            status: 'CONFIRMED',
            checkOut: {
              gt: new Date(),
            },
          },
          select: {
            checkIn: true,
            checkOut: true,
          },
        },
      },
    });

    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rooms' });
  }
};

export const getRoomById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        hotel: {
          select: {
            name: true,
            address: true,
            city: true,
            country: true,
          },
        },
        reservations: {
          where: {
            status: 'CONFIRMED',
            checkOut: {
              gt: new Date(),
            },
          },
          select: {
            checkIn: true,
            checkOut: true,
          },
        },
      },
    });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching room' });
  }
};

export const updateRoom = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { number, type, price, capacity, description, status } = req.body;
    const userRole = req.user!.role;
    const userId = req.user!.userId;

    // Get room with hotel info
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        hotel: true,
      },
    });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if user has permission to update room
    if (userRole === UserRole.MANAGER && room.hotel.managerId !== userId) {
      return res.status(403).json({ message: 'You can only update rooms in your assigned hotel' });
    }

    // Check if room number already exists in the hotel
    if (number && number !== room.number) {
      const existingRoom = await prisma.room.findFirst({
        where: {
          hotelId: room.hotelId,
          number,
        },
      });

      if (existingRoom) {
        return res.status(400).json({ message: 'Room number already exists in this hotel' });
      }
    }

    const updatedRoom = await prisma.room.update({
      where: { id },
      data: {
        number,
        type,
        price,
        capacity,
        description,
        status,
      },
      include: {
        hotel: {
          select: {
            name: true,
            address: true,
            city: true,
            country: true,
          },
        },
      },
    });

    res.json(updatedRoom);
  } catch (error) {
    res.status(500).json({ message: 'Error updating room' });
  }
};

export const deleteRoom = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userRole = req.user!.role;
    const userId = req.user!.userId;

    // Get room with hotel info
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        hotel: true,
      },
    });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if user has permission to delete room
    if (userRole === UserRole.MANAGER && room.hotel.managerId !== userId) {
      return res.status(403).json({ message: 'You can only delete rooms in your assigned hotel' });
    }

    // Check if room has any active reservations
    const activeReservations = await prisma.reservation.findFirst({
      where: {
        roomId: id,
        status: 'CONFIRMED',
        checkOut: {
          gt: new Date(),
        },
      },
    });

    if (activeReservations) {
      return res.status(400).json({ message: 'Cannot delete room with active reservations' });
    }

    await prisma.room.delete({
      where: { id },
    });

    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting room' });
  }
};

export const checkRoomAvailability = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { checkIn, checkOut, guestCount } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({ message: 'Check-in and check-out dates are required' });
    }

    const checkInDate = new Date(checkIn as string);
    const checkOutDate = new Date(checkOut as string);

    // Get room with capacity
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if room has enough capacity
    if (guestCount && parseInt(guestCount as string) > room.capacity) {
      return res.status(400).json({ message: 'Room capacity exceeded' });
    }

    // Check for overlapping reservations
    const overlappingReservation = await prisma.reservation.findFirst({
      where: {
        roomId,
        status: 'CONFIRMED',
        OR: [
          {
            AND: [
              { checkIn: { lte: checkInDate } },
              { checkOut: { gt: checkInDate } },
            ],
          },
          {
            AND: [
              { checkIn: { lt: checkOutDate } },
              { checkOut: { gte: checkOutDate } },
            ],
          },
        ],
      },
    });

    const isAvailable = !overlappingReservation;

    // Calculate total price
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = room.price * nights;

    res.json({
      isAvailable,
      message: isAvailable ? 'Room is available for the selected dates' : 'Room is not available for the selected dates',
      totalPrice,
      nights,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error checking room availability' });
  }
}; 