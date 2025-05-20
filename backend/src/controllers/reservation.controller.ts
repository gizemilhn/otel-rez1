import { Request, Response } from 'express';
import { PrismaClient, ReservationStatus, UserRole } from '@prisma/client';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../utils/errors';

const prisma = new PrismaClient();

export const createReservation = async (req: Request, res: Response) => {
  const { roomId, checkIn, checkOut, guestCount, specialRequests } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError('User not authenticated');
  }

  // Check if room exists and is available
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: { hotel: true },
  });

  if (!room) {
    throw new NotFoundError('Room not found');
  }

  if (room.status !== 'AVAILABLE') {
    throw new BadRequestError('Room is not available');
  }

  // Check if room has enough capacity
  if (guestCount > room.capacity) {
    throw new BadRequestError('Room capacity exceeded');
  }

  // Check for overlapping reservations
  const overlappingReservation = await prisma.reservation.findFirst({
    where: {
      roomId,
      status: {
        in: ['PENDING', 'CONFIRMED'],
      },
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

  if (overlappingReservation) {
    throw new BadRequestError('Room is not available for the selected dates');
  }

  // Calculate total price
  const nights = Math.ceil(
    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const totalPrice = room.price * nights;

  const reservation = await prisma.reservation.create({
    data: {
      userId,
      roomId,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      guestCount,
      specialRequests,
      totalPrice,
      status: 'PENDING',
    },
    include: {
      room: {
        include: {
          hotel: true,
        },
      },
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  res.status(201).json(reservation);
};

export const getReservations = async (req: Request, res: Response) => {
  const userRole = req.user?.role;
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError('User not authenticated');
  }

  let reservations;

  if (userRole === UserRole.ADMIN) {
    // Admin can see all reservations
    reservations = await prisma.reservation.findMany({
      include: {
        room: {
          include: {
            hotel: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  } else if (userRole === UserRole.MANAGER) {
    // Manager can see reservations for their hotels
    reservations = await prisma.reservation.findMany({
      where: {
        room: {
          hotel: {
            managerId: userId,
          },
        },
      },
      include: {
        room: {
          include: {
            hotel: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  } else {
    // Regular users can only see their own reservations
    reservations = await prisma.reservation.findMany({
      where: {
        userId,
      },
      include: {
        room: {
          include: {
            hotel: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  res.json(reservations);
};

export const getReservationById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userRole = req.user?.role;
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError('User not authenticated');
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      room: {
        include: {
          hotel: true,
        },
      },
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!reservation) {
    throw new NotFoundError('Reservation not found');
  }

  // Check if user has permission to view this reservation
  if (
    userRole !== UserRole.ADMIN &&
    userRole !== UserRole.MANAGER &&
    reservation.userId !== userId
  ) {
    throw new UnauthorizedError('Not authorized to view this reservation');
  }

  // If user is a manager, check if they manage the hotel
  if (userRole === UserRole.MANAGER) {
    const hotel = await prisma.hotel.findFirst({
      where: {
        id: reservation.room.hotelId,
        managerId: userId,
      },
    });

    if (!hotel) {
      throw new UnauthorizedError('Not authorized to view this reservation');
    }
  }

  res.json(reservation);
};

export const updateReservationStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const userRole = req.user?.role;
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError('User not authenticated');
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      room: {
        include: {
          hotel: true,
        },
      },
    },
  });

  if (!reservation) {
    throw new NotFoundError('Reservation not found');
  }

  // Check if user has permission to update this reservation
  if (userRole === UserRole.ADMIN) {
    // Admin can update any reservation
  } else if (userRole === UserRole.MANAGER) {
    // Manager can only update reservations for their hotels
    const hotel = await prisma.hotel.findFirst({
      where: {
        id: reservation.room.hotelId,
        managerId: userId,
      },
    });

    if (!hotel) {
      throw new UnauthorizedError('Not authorized to update this reservation');
    }
  } else {
    throw new UnauthorizedError('Not authorized to update reservations');
  }

  const updatedReservation = await prisma.reservation.update({
    where: { id },
    data: { status },
    include: {
      room: {
        include: {
          hotel: true,
        },
      },
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  res.json(updatedReservation);
};

export const cancelReservation = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userRole = req.user?.role;
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError('User not authenticated');
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      room: {
        include: {
          hotel: true,
        },
      },
    },
  });

  if (!reservation) {
    throw new NotFoundError('Reservation not found');
  }

  // Check if user has permission to cancel this reservation
  if (
    userRole !== UserRole.ADMIN &&
    userRole !== UserRole.MANAGER &&
    reservation.userId !== userId
  ) {
    throw new UnauthorizedError('Not authorized to cancel this reservation');
  }

  // If user is a manager, check if they manage the hotel
  if (userRole === UserRole.MANAGER) {
    const hotel = await prisma.hotel.findFirst({
      where: {
        id: reservation.room.hotelId,
        managerId: userId,
      },
    });

    if (!hotel) {
      throw new UnauthorizedError('Not authorized to cancel this reservation');
    }
  }

  // Check if reservation can be cancelled
  if (reservation.status === 'CANCELLED') {
    throw new BadRequestError('Reservation is already cancelled');
  }

  if (reservation.status === 'COMPLETED') {
    throw new BadRequestError('Cannot cancel a completed reservation');
  }

  const updatedReservation = await prisma.reservation.update({
    where: { id },
    data: { status: 'CANCELLED' },
    include: {
      room: {
        include: {
          hotel: true,
        },
      },
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  res.json(updatedReservation);
}; 