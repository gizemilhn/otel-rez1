import { Request, Response, NextFunction } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../middlewares/errorHandler';

const prisma = new PrismaClient();

interface JwtPayload {
  userId: string;
  role: UserRole;
}

export const kayit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, email, telefon, password } = req.body;

    const mevcutKullanici = await prisma.user.findUnique({
      where: { email }
    });

    if (mevcutKullanici) {
      throw new AppError(400, 'Bu e-posta adresi zaten kullanılıyor');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: 'USER',
        // telefon alanı şemada varsa ekleyin
      }
    });

    const payload: JwtPayload = { userId: user.id, role: user.role };
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      mesaj: 'Kayıt başarılı',
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

export const giris = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new AppError(401, 'Geçersiz e-posta veya şifre');
    }

    const sifreGecerli = await bcrypt.compare(password, user.password);

    if (!sifreGecerli) {
      throw new AppError(401, 'Geçersiz e-posta veya şifre');
    }

    const payload: JwtPayload = { userId: user.id, role: user.role };
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.json({
      mesaj: 'Giriş başarılı',
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};