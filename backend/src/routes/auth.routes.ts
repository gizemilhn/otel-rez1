import { Router } from 'express';
import { register, login, createManager } from '../controllers/user.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { registerSchema, loginSchema, createManagerSchema } from '../schemas/auth.schema';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';
import { UserRole } from '@prisma/client';
import { prisma } from '../lib/prisma';

const router = Router();

// Public routes
router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);

// Protected routes
router.use(authenticateToken);

// Admin only routes
router.post(
  '/create-manager',
  authorizeRoles(UserRole.ADMIN),
  validateRequest(createManagerSchema),
  createManager
);

// Get current user
router.get('/me', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        tcNumber: true,
        birthDate: true,
        phone: true,
        role: true,
        managedHotel: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

export default router; 