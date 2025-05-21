import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export const authorizeHotelManager = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Admins can access all hotels
    if (req.user.role === 'ADMIN') {
      return next();
    }

    // For managers, check if they're accessing their assigned hotel
    const hotelId = req.params.hotelId;
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
    });

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    if (hotel.managerId !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to manage this hotel' });
    }

    next();
  } catch (error) {
    console.error('Hotel authorization error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}; 