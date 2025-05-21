import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { UserRole, RoomStatus } from '@prisma/client';

export const getAllRooms = async (req: Request, res: Response) => {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
            city: true,
            country: true,
          },
        },
      },
    });
    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ message: 'Error fetching rooms' });
  }
};

export const createRoom = async (req: Request, res: Response) => {
  try {
    const { number, type, price, capacity, description, imageUrl, hotelId } = req.body;

    // Check if hotel exists
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
    });

    if (!hotel) {
      return res.status(400).json({ message: 'Hotel not found' });
    }

    const room = await prisma.room.create({
      data: {
        number,
        type,
        price,
        capacity,
        description,
        imageUrl,
        hotelId,
        status: RoomStatus.AVAILABLE,
      },
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
            city: true,
            country: true,
          },
        },
      },
    });

    res.status(201).json(room);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ message: 'Error creating room' });
  }
};

export const getRooms = async (req: Request, res: Response) => {
  try {
    const { hotelId, status, type, minPrice, maxPrice, minCapacity } = req.query;
    const where: any = {};

    if (hotelId) where.hotelId = hotelId;
    if (status) where.status = status;
    if (type) where.type = type;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }
    if (minCapacity) where.capacity = { gte: parseInt(minCapacity as string) };

    const rooms = await prisma.room.findMany({
      where,
      include: {
        hotel: {
          select: {
            name: true,
            city: true,
            country: true,
          },
        },
      },
    });

    res.json(rooms);
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ message: 'Error fetching rooms' });
  }
};

export const getRoomById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        hotel: true,
        reservations: {
          where: {
            status: 'CONFIRMED',
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
    console.error('Get room error:', error);
    res.status(500).json({ message: 'Error fetching room' });
  }
};

export const updateRoom = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { number, type, price, capacity, description, imageUrl, status } = req.body;

    const room = await prisma.room.update({
      where: { id },
      data: {
        number,
        type,
        price,
        capacity,
        description,
        imageUrl,
        status,
      },
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
            city: true,
            country: true,
          },
        },
      },
    });

    res.json(room);
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ message: 'Error updating room' });
  }
};

export const deleteRoom = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if room has any active reservations
    const activeReservations = await prisma.reservation.findFirst({
      where: {
        roomId: id,
        status: {
          in: ['PENDING', 'CONFIRMED'],
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
    console.error('Error deleting room:', error);
    res.status(500).json({ message: 'Error deleting room' });
  }
}; 