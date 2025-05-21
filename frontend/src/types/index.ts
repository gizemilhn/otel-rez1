export const UserRole = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER'
} as const;

export type UserRole = 'ADMIN' | 'MANAGER' | 'USER';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  birthDate?: Date;
  tcNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isManager: boolean;
  isUser: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  birthDate?: Date;
  tcNumber?: string;
} 