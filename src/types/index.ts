export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  hall: string;
  room: string;
  role: 'client' | 'admin';
}

export interface Order {
  id: string;
  user_id: string;
  quantity: number;
  total_price: number;
  delivery_date: string;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  notes?: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields from users table
  user_name?: string;
  user_phone?: string;
  user_hall?: string;
  user_room?: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userHall: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}