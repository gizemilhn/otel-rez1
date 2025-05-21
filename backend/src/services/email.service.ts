import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendWelcomeEmail = async (email: string, firstName: string) => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Welcome to Hotel Reservation System',
      html: `
        <h1>Welcome ${firstName}!</h1>
        <p>Thank you for registering with our hotel reservation system.</p>
        <p>You can now start making reservations and managing your bookings.</p>
      `,
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

export const sendReservationConfirmation = async (
  email: string,
  firstName: string,
  reservationDetails: {
    hotelName: string;
    roomNumber: string;
    checkIn: Date;
    checkOut: Date;
    totalPrice: number;
  }
) => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Reservation Confirmation',
      html: `
        <h1>Reservation Confirmed!</h1>
        <p>Dear ${firstName},</p>
        <p>Your reservation has been confirmed:</p>
        <ul>
          <li>Hotel: ${reservationDetails.hotelName}</li>
          <li>Room: ${reservationDetails.roomNumber}</li>
          <li>Check-in: ${reservationDetails.checkIn.toLocaleDateString()}</li>
          <li>Check-out: ${reservationDetails.checkOut.toLocaleDateString()}</li>
          <li>Total Price: $${reservationDetails.totalPrice}</li>
        </ul>
        <p>Thank you for choosing our service!</p>
      `,
    });
  } catch (error) {
    console.error('Error sending reservation confirmation email:', error);
  }
};

export const sendReservationCancellation = async (
  email: string,
  firstName: string,
  reservationDetails: {
    hotelName: string;
    roomNumber: string;
    checkIn: Date;
    checkOut: Date;
  }
) => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Reservation Cancelled',
      html: `
        <h1>Reservation Cancelled</h1>
        <p>Dear ${firstName},</p>
        <p>Your reservation has been cancelled:</p>
        <ul>
          <li>Hotel: ${reservationDetails.hotelName}</li>
          <li>Room: ${reservationDetails.roomNumber}</li>
          <li>Check-in: ${reservationDetails.checkIn.toLocaleDateString()}</li>
          <li>Check-out: ${reservationDetails.checkOut.toLocaleDateString()}</li>
        </ul>
        <p>If you did not request this cancellation, please contact us immediately.</p>
      `,
    });
  } catch (error) {
    console.error('Error sending reservation cancellation email:', error);
  }
};