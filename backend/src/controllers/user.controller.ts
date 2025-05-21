import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { UserRole } from '@prisma/client';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        birthDate: true,
        tcNumber: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role, phone, birthDate, tcNumber } = req.body;

    console.log('Received user data:', { email, firstName, lastName, role, phone, birthDate, tcNumber });

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate role
    if (role && !Object.values(UserRole).includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Check if user with email already exists
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanılıyor' });
    }

    // Check if user with TC number already exists (if provided)
    if (tcNumber) {
      const existingUserByTc = await prisma.user.findUnique({
        where: { tcNumber },
      });

      if (existingUserByTc) {
        return res.status(400).json({ message: 'Bu TC kimlik numarası zaten kullanılıyor' });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with explicit type casting for role
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: (role || UserRole.USER) as UserRole,
        phone: phone || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        tcNumber: tcNumber || null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        birthDate: true,
        tcNumber: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log('Created user:', user);
    res.status(201).json(user);
  } catch (error) {
    console.error('Detailed error creating user:', error);
    
    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'field';
      return res.status(400).json({ 
        message: `Bu ${field} zaten kullanılıyor`
      });
    }

    // Handle other errors
    res.status(500).json({ 
      message: 'Kullanıcı oluşturulurken bir hata oluştu',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email, firstName, lastName, role, phone, birthDate, tcNumber } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        email,
        firstName,
        lastName,
        role,
        phone,
        birthDate: birthDate ? new Date(birthDate) : null,
        tcNumber,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        birthDate: true,
        tcNumber: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if user is a hotel manager
    const hotel = await prisma.hotel.findFirst({
      where: { managerId: id },
    });

    if (hotel) {
      return res.status(400).json({ message: 'Cannot delete user who is assigned as a hotel manager' });
    }

    await prisma.user.delete({
      where: { id },
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
};

export const getUserReservations = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const reservations = await prisma.reservation.findMany({
      where: {
        userId: userId
      },
      include: {
        room: {
          include: {
            hotel: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(reservations);
  } catch (error) {
    console.error('Error fetching user reservations:', error);
    res.status(500).json({ message: 'Error fetching reservations' });
  }
};

export const cancelReservation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    // Check if reservation exists and belongs to user
    const reservation = await prisma.reservation.findFirst({
      where: {
        id,
        userId,
        status: 'PENDING',
      },
      include: {
        room: true,
      },
    });

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found or cannot be cancelled' });
    }

    // Update reservation status
    await prisma.reservation.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    // Update room status back to available
    await prisma.room.update({
      where: { id: reservation.room.id },
      data: { status: 'AVAILABLE' },
    });

    res.json({ message: 'Reservation cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    res.status(500).json({ message: 'Error cancelling reservation' });
  }
}; 