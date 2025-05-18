import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { JWTPayload } from '../types';
import { ROLES, hasRole } from '../constants/roles';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!hasRole(req.user.role, roles)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};

export const isHotelManager = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Allow admin to bypass hotel manager check
    if (req.user.role === ROLES.ADMIN) {
      return next();
    }

    const hotelId = req.params.hotelId || req.body.hotelId;
    if (!hotelId) {
      return res.status(400).json({ message: 'Hotel ID is required' });
    }

    const { prisma } = req.app.locals;
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
      select: { managerId: true },
    });

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    if (hotel.managerId !== req.user.userId) {
      return res.status(403).json({ message: 'Insufficient permissions: Not the manager of this hotel' });
    }

    next();
  } catch (error) {
    console.error('Hotel manager check error:', error);
    next(error);
  }
}; 