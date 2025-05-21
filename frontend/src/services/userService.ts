import axios from 'axios';

// Kullanıcı Verileri İçin Tip Tanımları
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
}

interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}

interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
}

// UserService API İsteklerini Yöneten Servis
const userService = {
  // Kullanıcıları listeleme
  get: async (url: string): Promise<User[]> => {
    try {
      const response = await axios.get<User[]>(url); // response.data doğrudan User[] türünde olacak
      return response.data; // Artık response.data User[] türünde olacak
    } catch (error) {
      throw new Error('Error fetching data');
    }
  },

  // Yeni kullanıcı oluşturma
  create: async (userData: CreateUserData): Promise<User> => {
    try {
      const response = await axios.post('/api/users', userData);
      return response.data;
    } catch (error) {
      throw new Error('Error creating user');
    }
  },

  // Kullanıcıyı silme
  delete: async (id: string): Promise<void> => {
    try {
      await axios.delete(`/api/users/${id}`);
    } catch (error) {
      throw new Error('Error deleting user');
    }
  },

  // Kullanıcıyı güncelleme
  update: async (id: string, userData: UpdateUserData): Promise<User> => {
    try {
      const response = await axios.put(`/api/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw new Error('Error updating user');
    }
  }
};

export { userService };
