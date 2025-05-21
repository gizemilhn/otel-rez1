import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { UserRole, ReservationStatus } from '@prisma/client';
import { sendReservationConfirmation, sendReservationCancellation } from '../services/email.service';

export const createReservation = async (req: Request, res: Response) => {
  try {
    const { roomId, checkIn, checkOut, guestCount, specialRequests } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if room exists and is available
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        hotel: true,
      },
    });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.status !== 'AVAILABLE') {
      return res.status(400).json({ message: 'Room is not available' });
    }

    // Check if room is already booked for the selected dates
    const existingReservation = await prisma.reservation.findFirst({
      where: {
        roomId,
        status: 'CONFIRMED',
        OR: [
          {
            AND: [
              { checkIn: { lte: new Date(checkIn) } },
              { checkOut: { gt: new Date(checkIn) } },
            ],
          },
          {
            AND: [
              { checkIn: { lt: new Date(checkOut) } },
              { checkOut: { gte: new Date(checkOut) } },
            ],
          },
        ],
      },
    });

    if (existingReservation) {
      return res.status(400).json({ message: 'Room is already booked for these dates' });
    }

    // Calculate total price
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = room.price * nights;

    // Create reservation
    const reservation = await prisma.reservation.create({
      data: {
        userId,
        roomId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guestCount,
        specialRequests,
        totalPrice,
        status: 'CONFIRMED',
      },
      include: {
        user: true,
        room: {
          include: {
            hotel: true,
          },
        },
      },
    });

    // Send confirmation email
    await sendReservationConfirmation(
      reservation.user.email,
      reservation.user.firstName,
      {
        hotelName: reservation.room.hotel.name,
        roomNumber: reservation.room.number,
        checkIn: reservation.checkIn,
        checkOut: reservation.checkOut,
        totalPrice: reservation.totalPrice,
      }
    );

    res.status(201).json(reservation);
  } catch (error) {
    console.error('Create reservation error:', error);
    res.status(500).json({ message: 'Error creating reservation' });
  }
};

export const getReservations = async (req: Request, res: Response) => {
  try {
    const { status, startDate, endDate } = req.query;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    let where: any = {};

    // Regular users can only see their own reservations
    if (userRole === UserRole.USER) {
      where.userId = userId;
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by date range
    if (startDate || endDate) {
      where.OR = [];
      if (startDate) {
        where.OR.push({ checkIn: { gte: new Date(startDate as string) } });
      }
      if (endDate) {
        where.OR.push({ checkOut: { lte: new Date(endDate as string) } });
      }
    }

    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        room: {
          include: {
            hotel: true,
          },
        },
      },
      orderBy: {
        checkIn: 'desc',
      },
    });

    res.json(reservations);
  } catch (error) {
    console.error('Get reservations error:', error);
    res.status(500).json({ message: 'Error fetching reservations' });
  }
};

export const getReservationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        room: {
          include: {
            hotel: true,
          },
        },
      },
    });

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Check if user has permission to view this reservation
    if (userRole === UserRole.USER && reservation.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to view this reservation' });
    }

    res.json(reservation);
  } catch (error) {
    console.error('Get reservation error:', error);
    res.status(500).json({ message: 'Error fetching reservation' });
  }
};

export const getAllReservations = async (req: Request, res: Response) => {
  try {
    const reservations = await prisma.reservation.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        room: {
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
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ message: 'Error fetching reservations' });
  }
};

export const updateReservation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, checkIn, checkOut, guestCount, specialRequests } = req.body;

    const reservation = await prisma.reservation.update({
      where: { id },
      data: {
        status,
        checkIn: checkIn ? new Date(checkIn) : undefined,
        checkOut: checkOut ? new Date(checkOut) : undefined,
        guestCount,
        specialRequests,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        room: {
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
        },
      },
    });

    // Update room status based on reservation status
    if (status === ReservationStatus.CONFIRMED) {
      await prisma.room.update({
        where: { id: reservation.roomId },
        data: { status: 'OCCUPIED' },
      });
    } else if (status === ReservationStatus.CANCELLED || status === ReservationStatus.COMPLETED) {
      await prisma.room.update({
        where: { id: reservation.roomId },
        data: { status: 'AVAILABLE' },
      });
    }

    res.json(reservation);
  } catch (error) {
    console.error('Error updating reservation:', error);
    res.status(500).json({ message: 'Error updating reservation' });
  }
};

export const deleteReservation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const reservation = await prisma.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Only allow deletion of pending or cancelled reservations
    if (reservation.status !== 'PENDING' && reservation.status !== 'CANCELLED') {
      return res.status(400).json({ message: 'Cannot delete confirmed or completed reservations' });
    }

    await prisma.reservation.delete({
      where: { id },
    });

    res.json({ message: 'Reservation deleted successfully' });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    res.status(500).json({ message: 'Error deleting reservation' });
  }
}; 