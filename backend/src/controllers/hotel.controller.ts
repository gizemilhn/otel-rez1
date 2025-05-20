import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { UserRole } from '@prisma/client';

export const createHotel = async (req: Request, res: Response) => {
  try {
    const { name, address, city, country, description, imageUrl, rating, managerId } = req.body;

    // If managerId is provided, verify the user exists and is a manager
    if (managerId) {
      const manager = await prisma.user.findUnique({
        where: { id: managerId },
      });

      if (!manager || manager.role !== UserRole.MANAGER) {
        return res.status(400).json({ message: 'Invalid manager ID or user is not a manager' });
      }

      // Check if manager is already assigned to another hotel
      const existingAssignment = await prisma.hotel.findUnique({
        where: { managerId },
      });

      if (existingAssignment) {
        return res.status(400).json({ message: 'Manager is already assigned to another hotel' });
      }
    }

    const hotel = await prisma.hotel.create({
      data: {
        name,
        address,
        city,
        country,
        description,
        imageUrl,
        rating,
        managerId,
      },
      include: {
        manager: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        rooms: true,
      },
    });

    res.status(201).json(hotel);
  } catch (error) {
    res.status(500).json({ message: 'Error creating hotel' });
  }
};

export const getHotels = async (req: Request, res: Response) => {
  try {
    const hotels = await prisma.hotel.findMany({
      include: {
        manager: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        rooms: {
          select: {
            id: true,
            number: true,
            type: true,
            price: true,
            capacity: true,
            status: true,
          },
        },
      },
    });

    res.json(hotels);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching hotels' });
  }
};

export const getHotelById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const hotel = await prisma.hotel.findUnique({
      where: { id },
      include: {
        manager: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        rooms: {
          select: {
            id: true,
            number: true,
            type: true,
            price: true,
            capacity: true,
            status: true,
            description: true,
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
};

export const updateHotel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, address, city, country, description, imageUrl, rating } = req.body;
    const userRole = req.user!.role;
    const userId = req.user!.userId;

    // Check if user has permission to update this hotel
    if (userRole === UserRole.MANAGER) {
      const hotel = await prisma.hotel.findUnique({
        where: { id },
      });

      if (!hotel || hotel.managerId !== userId) {
        return res.status(403).json({ message: 'You can only update your assigned hotel' });
      }
    }

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
      include: {
        manager: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        rooms: true,
      },
    });

    res.json(hotel);
  } catch (error) {
    res.status(500).json({ message: 'Error updating hotel' });
  }
};

export const deleteHotel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if hotel has any rooms with active reservations
    const hotel = await prisma.hotel.findUnique({
      where: { id },
      include: {
        rooms: {
          include: {
            reservations: {
              where: {
                status: 'CONFIRMED',
                checkOut: {
                  gt: new Date(),
                },
              },
            },
          },
        },
      },
    });

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    const hasActiveReservations = hotel.rooms.some(room => room.reservations.length > 0);
    if (hasActiveReservations) {
      return res.status(400).json({ message: 'Cannot delete hotel with active reservations' });
    }

    await prisma.hotel.delete({
      where: { id },
    });

    res.json({ message: 'Hotel deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting hotel' });
  }
};

export const assignManager = async (req: Request, res: Response) => {
  try {
    const { hotelId } = req.params;
    const { managerId } = req.body;

    // Verify the user exists and is a manager
    const manager = await prisma.user.findUnique({
      where: { id: managerId },
    });

    if (!manager || manager.role !== UserRole.MANAGER) {
      return res.status(400).json({ message: 'Invalid manager ID or user is not a manager' });
    }

    // Check if the manager is already assigned to another hotel
    const existingAssignment = await prisma.hotel.findUnique({
      where: { managerId },
    });

    if (existingAssignment && existingAssignment.id !== hotelId) {
      return res.status(400).json({ message: 'Manager is already assigned to another hotel' });
    }

    const hotel = await prisma.hotel.update({
      where: { id: hotelId },
      data: { managerId },
      include: {
        manager: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.json(hotel);
  } catch (error) {
    res.status(500).json({ message: 'Error assigning manager' });
  }
}; 