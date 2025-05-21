import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: UserRole;
  };
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true }
    });

    if (!user) {
      throw new Error();
    }

    req.user = { userId: user.id, role: user.role as UserRole };
    next();
  } catch (error) {
    res.status(401).json({ hata: 'Lütfen giriş yapın.' });
  }
};

export const rolKontrol = (izinliRoller: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !izinliRoller.includes(req.user.role)) {
      return res.status(403).json({ hata: 'Bu işlem için yetkiniz yok.' });
    }
    next();
  };
};