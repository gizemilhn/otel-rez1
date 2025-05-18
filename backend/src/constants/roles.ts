import { UserRole } from '@prisma/client';

export const ROLES = {
  ADMIN: UserRole.ADMIN,
  MANAGER: UserRole.MANAGER,
  USER: UserRole.USER,
} as const;

export const isValidRole = (role: string): role is UserRole => {
  return Object.values(UserRole).includes(role as UserRole);
};

export const hasRole = (userRole: UserRole, requiredRoles: UserRole[]): boolean => {
  return requiredRoles.includes(userRole);
};

export const isManagerOrAdmin = (role: UserRole): boolean => {
  return role === UserRole.MANAGER || role === UserRole.ADMIN;
}; 