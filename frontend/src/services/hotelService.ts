import axios from 'axios';

interface ManagerData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface HotelData {
  name: string;
  address: string;
  city: string;
  country: string;
  description?: string;
  imageUrl?: string;
  rating?: number;
  managerData: ManagerData;
}

const hotelService = {
  getAll: async (): Promise<any[]> => {
    try {
      const response = await axios.get('/api/hotels');  // Backend API endpoint
      return response.data;
    } catch (error) {
      throw new Error('Error fetching hotels');
    }
  },

  createHotel: async (hotelData: HotelData): Promise<any> => {
    try {
      const response = await axios.post('/api/hotels', hotelData);  // Backend API endpoint
      return response.data;
    } catch (error) {
      throw new Error('Error creating hotel');
    }
  },

  delete: async (id: string): Promise<any> => {
    try {
      const response = await axios.delete(`/api/hotels/${id}`);  // Backend API endpoint
      return response.data;
    } catch (error) {
      throw new Error('Error deleting hotel');
    }
  },
};

export { hotelService };
