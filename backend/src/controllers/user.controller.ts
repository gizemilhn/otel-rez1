import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, tcNumber, birthDate, phone } = req.body;

    // Check if user already exists,

    console.log('backend register çalıştı!');
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if TC number is unique if provided
    if (tcNumber) {
      const existingTcNumber = await prisma.user.findUnique({
        where: { tcNumber },
      });

      if (existingTcNumber) {
        return res.status(400).json({ message: 'TC number already registered' });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        tcNumber,
        birthDate: birthDate ? new Date(birthDate) : null,
        phone,
        role: UserRole.USER,
      },
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        tcNumber: user.tcNumber,
        birthDate: user.birthDate,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user' });
  }
};

export const createManager = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create manager
    const manager = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: UserRole.MANAGER,
      },
    });

    res.status(201).json({
      message: 'Hotel manager created successfully',
      manager: {
        id: manager.id,
        email: manager.email,
        firstName: manager.firstName,
        lastName: manager.lastName,
        phone: manager.phone,
        role: manager.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating hotel manager' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        tcNumber: user.tcNumber,
        birthDate: user.birthDate,
        phone: user.phone,
        role: user.role,
        managedHotel: user.managedHotel,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in' });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        tcNumber: true,
        birthDate: true,
        phone: true,
        role: true,
        createdAt: true,
        managedHotel: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, tcNumber, birthDate } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        phone,
        tcNumber,
        birthDate: birthDate ? new Date(birthDate) : undefined,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        tcNumber: true,
        birthDate: true,
        phone: true,
        role: true,
      },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if user is a manager with an assigned hotel
    const user = await prisma.user.findUnique({
      where: { id },
      include: { managedHotel: true },
    });

    if (user?.role === UserRole.MANAGER && user.managedHotel) {
      return res.status(400).json({
        message: 'Cannot delete hotel manager with an assigned hotel. Please reassign the hotel first.',
      });
    }

    await prisma.user.delete({
      where: { id },
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
}; 