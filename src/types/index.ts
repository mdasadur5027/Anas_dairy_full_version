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
  userId: string;
  userName: string;
  hall: string;
  room: string;
  phone: string;
  quantity: number;
  totalPrice: number;
  deliveryDate: string;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  createdAt: string;
  notes?: string;
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