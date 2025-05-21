import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { UserRole } from '@prisma/client';

export const getAllHotels = async (req: Request, res: Response) => {
  try {
    const hotels = await prisma.hotel.findMany({
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        rooms: true,
      },
    });
    res.json(hotels);
  } catch (error) {
    console.error('Error fetching hotels:', error);
    res.status(500).json({ message: 'Error fetching hotels' });
  }
};

export const createHotel = async (req: Request, res: Response) => {
  try {
    const { name, address, city, country, description, imageUrl, rating, managerId } = req.body;

    // Check if manager exists and has MANAGER role
    const manager = await prisma.user.findFirst({
      where: {
        id: managerId,
        role: 'MANAGER',
      },
    });

    if (!manager) {
      return res.status(400).json({ message: 'Invalid manager ID or user is not a manager' });
    }

    // Check if manager is already assigned to another hotel
    const existingHotel = await prisma.hotel.findFirst({
      where: {
        managerId,
      },
    });

    if (existingHotel) {
      return res.status(400).json({ message: 'Manager is already assigned to another hotel' });
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
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
    res.status(201).json(hotel);
  } catch (error) {
    console.error('Error creating hotel:', error);
    res.status(500).json({ message: 'Error creating hotel' });
  }
};

export const updateHotel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, address, city, country, description, imageUrl, rating, managerId } = req.body;

    // If managerId is being updated, validate it
    if (managerId) {
      // Check if manager exists and has MANAGER role
      const manager = await prisma.user.findFirst({
        where: {
          id: managerId,
          role: 'MANAGER',
        },
      });

      if (!manager) {
        return res.status(400).json({ message: 'Invalid manager ID or user is not a manager' });
      }

      // Check if manager is already assigned to another hotel
      const existingHotel = await prisma.hotel.findFirst({
        where: {
          managerId,
          id: { not: id },
        },
      });

      if (existingHotel) {
        return res.status(400).json({ message: 'Manager is already assigned to another hotel' });
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
        managerId: managerId || undefined, // Only update managerId if it's provided
      },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
    res.json(hotel);
  } catch (error) {
    console.error('Error updating hotel:', error);
    res.status(500).json({ message: 'Error updating hotel' });
  }
};

export const deleteHotel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.hotel.delete({
      where: { id },
    });
    res.json({ message: 'Hotel deleted successfully' });
  } catch (error) {
    console.error('Error deleting hotel:', error);
    res.status(500).json({ message: 'Error deleting hotel' });
  }
};

export const assignManager = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { managerId } = req.body;

    // Check if manager exists and has MANAGER role
    const manager = await prisma.user.findFirst({
      where: {
        id: managerId,
        role: 'MANAGER',
      },
    });

    if (!manager) {
      return res.status(400).json({ message: 'Invalid manager ID or user is not a manager' });
    }

    // Check if manager is already assigned to another hotel
    const existingHotel = await prisma.hotel.findFirst({
      where: {
        managerId,
        id: { not: id },
      },
    });

    if (existingHotel) {
      return res.status(400).json({ message: 'Manager is already assigned to another hotel' });
    }

    const hotel = await prisma.hotel.update({
      where: { id },
      data: { managerId },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.json(hotel);
  } catch (error) {
    console.error('Error assigning manager:', error);
    res.status(500).json({ message: 'Error assigning manager' });
  }
};

export const getHotels = async (req: Request, res: Response) => {
  try {
    const { city, country } = req.query;
    const where: any = {};

    if (city) where.city = city;
    if (country) where.country = country;

    const hotels = await prisma.hotel.findMany({
      where,
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        rooms: {
          where: {
            status: 'AVAILABLE',
          },
        },
      },
    });

    res.json(hotels);
  } catch (error) {
    console.error('Get hotels error:', error);
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
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        rooms: true,
      },
    });

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    // Add default features to the hotel data
    const hotelWithFeatures = {
      ...hotel,
      features: [
        { icon: 'Wifi', text: 'Ücretsiz Wi-Fi' },
        { icon: 'Parking', text: 'Ücretsiz Otopark' },
        { icon: 'Pool', text: 'Yüzme Havuzu' },
        { icon: 'Restaurant', text: 'Restoran' },
      ],
    };

    res.json(hotelWithFeatures);
  } catch (error) {
    console.error('Get hotel error:', error);
    res.status(500).json({ message: 'Error fetching hotel' });
  }
};

export const getHotelSummary = async (req: Request, res: Response) => {
  try {
    const summaries = await prisma.$queryRaw`
      SELECT * FROM "HotelSummary"
    `;

    res.json(summaries);
  } catch (error) {
    console.error('Get hotel summary error:', error);
    res.status(500).json({ message: 'Error fetching hotel summaries' });
  }
}; 