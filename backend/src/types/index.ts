import { User, UserRole, Hotel, Room, Reservation, ReservationStatus, RoomStatus } from '@prisma/client';

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  firstName: string;
  lastName: string;
}

export interface CreateHotelData {
  name: string;
  address: string;
  city: string;
  country: string;
  description?: string;
  imageUrl?: string;
  rating?: number;
}

export interface CreateRoomData {
  number: string;
  type: string;
  price: number;
  capacity: number;
  description?: string;
  hotelId: string;
}

export interface CreateReservationData {
  roomId: string;
  checkIn: Date;
  checkOut: Date;
  guestCount: number;
  specialRequests?: string;
}

export interface AssignManagerData {
  hotelId: string;
  managerId: string;
}

export type SafeUser = Omit<User, 'password'>;

export {
  User,
  UserRole,
  Hotel,
  Room,
  Reservation,
  ReservationStatus,
  RoomStatus,
}; 