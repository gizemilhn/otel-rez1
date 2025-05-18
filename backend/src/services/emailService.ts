import nodemailer from 'nodemailer';
import { Reservation, User, Hotel, Room } from '@prisma/client';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendReservationConfirmation = async (
  reservation: Reservation,
  user: User,
  hotel: Hotel,
  room: Room
) => {
  const emailContent = `
    Dear ${user.firstName} ${user.lastName},

    Your reservation has been confirmed!

    Reservation Details:
    - Hotel: ${hotel.name}
    - Room: ${room.number} (${room.type})
    - Check-in: ${reservation.checkIn.toLocaleDateString()}
    - Check-out: ${reservation.checkOut.toLocaleDateString()}
    - Total Price: $${reservation.totalPrice}

    Special Requests: ${reservation.specialRequests || 'None'}

    If you need to modify or cancel your reservation, please log in to your account.

    Thank you for choosing our service!
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: user.email,
    subject: 'Reservation Confirmation',
    text: emailContent,
  });
};

export const sendReservationCancellation = async (
  reservation: Reservation,
  user: User,
  hotel: Hotel,
  room: Room
) => {
  const emailContent = `
    Dear ${user.firstName} ${user.lastName},

    Your reservation has been cancelled.

    Cancelled Reservation Details:
    - Hotel: ${hotel.name}
    - Room: ${room.number} (${room.type})
    - Check-in: ${reservation.checkIn.toLocaleDateString()}
    - Check-out: ${reservation.checkOut.toLocaleDateString()}
    - Total Price: $${reservation.totalPrice}

    If this cancellation was not initiated by you, please contact our support team immediately.

    Thank you for using our service.
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: user.email,
    subject: 'Reservation Cancellation',
    text: emailContent,
  });
}; 