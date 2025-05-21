import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.reservation.deleteMany();
  await prisma.room.deleteMany();
  await prisma.hotel.deleteMany();
  await prisma.user.deleteMany();

  // Create test users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);
  const manager1Password = await bcrypt.hash('manager123', 10);
  const manager2Password = await bcrypt.hash('manager456', 10);

  // Create admin user
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      phone: '5551234567',
    },
  });

  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password: userPassword,
      firstName: 'Regular',
      lastName: 'User',
      role: 'USER',
      phone: '5559876543',
      tcNumber: '98765432109',
      birthDate: new Date('1995-05-15'),
    },
  });

  const manager1 = await prisma.user.create({
    data: {
      email: 'manager1@example.com',
      password: manager1Password,
      firstName: 'Hotel',
      lastName: 'Manager',
      role: 'MANAGER',
      phone: '5554567890',
      tcNumber: '45678912345',
      birthDate: new Date('1988-12-24'),
    },
  });

  const manager2 = await prisma.user.create({
    data: {
      email: 'manager2@example.com',
      password: manager2Password,
      firstName: 'Resort',
      lastName: 'Manager',
      role: 'MANAGER',
      phone: '5557890123',
      tcNumber: '78901234567',
      birthDate: new Date('1985-06-15'),
    },
  });

  // Create test hotels
  const hotel1 = await prisma.hotel.create({
    data: {
      name: 'Grand Hotel',
      description: 'Luxury hotel in the city center',
      address: '123 Main St',
      city: 'Istanbul',
      country: 'Turkey',
      imageUrl: 'https://example.com/hotel1.jpg',
      rating: 5,
      managerId: manager1.id,
    },
  });

  const hotel2 = await prisma.hotel.create({
    data: {
      name: 'Seaside Resort',
      description: 'Beautiful beachfront resort',
      address: '456 Beach Rd',
      city: 'Antalya',
      country: 'Turkey',
      imageUrl: 'https://example.com/hotel2.jpg',
      rating: 4,
      managerId: manager2.id,
    },
  });

  // Create test rooms
  const room1 = await prisma.room.create({
    data: {
      hotelId: hotel1.id,
      number: '101',
      type: 'Deluxe',
      capacity: 2,
      price: 200,
      description: 'Spacious deluxe room with city view',
      status: 'AVAILABLE',
    },
  });

  // Create suite room
  await prisma.room.create({
    data: {
      hotelId: hotel1.id,
      number: '102',
      type: 'Suite',
      capacity: 4,
      price: 400,
      description: 'Luxury suite with separate living area',
      status: 'AVAILABLE',
    },
  });

  const room3 = await prisma.room.create({
    data: {
      hotelId: hotel2.id,
      number: '201',
      type: 'Beach View',
      capacity: 2,
      price: 300,
      description: 'Room with direct beach view',
      status: 'AVAILABLE',
    },
  });

  // Create test reservations
  await prisma.reservation.create({
    data: {
      userId: user.id,
      roomId: room1.id,
      checkIn: new Date('2024-04-01'),
      checkOut: new Date('2024-04-05'),
      totalPrice: 800,
      status: 'CONFIRMED',
      guestCount: 2,
      specialRequests: 'Early check-in requested',
    },
  });

  await prisma.reservation.create({
    data: {
      userId: user.id,
      roomId: room3.id,
      checkIn: new Date('2024-05-15'),
      checkOut: new Date('2024-05-20'),
      totalPrice: 1500,
      status: 'PENDING',
      guestCount: 2,
      specialRequests: 'Late check-out requested',
    },
  });

  console.log('Database has been seeded!');
  console.log('\nTest Accounts:');
  console.log('Admin - Email: admin@example.com, Password: admin123');
  console.log('User - Email: user@example.com, Password: user123');
  console.log('Manager 1 - Email: manager1@example.com, Password: manager123');
  console.log('Manager 2 - Email: manager2@example.com, Password: manager456');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 