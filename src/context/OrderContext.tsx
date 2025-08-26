import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

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

interface OrderContextType {
  orders: Order[];
  loading: boolean;
  addOrder: (order: Omit<Order, 'id' | 'created_at' | 'updated_at'>) => Promise<{ success: boolean; error?: string }>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<{ success: boolean; error?: string }>;
  fetchOrders: () => Promise<void>;
  getUserOrders: () => Order[];
  getTodayOrders: () => Order[];
  getPendingOrders: () => Order[];
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('orders')
        .select(`
          *,
          users!inner(
            name,
            phone,
            hall,
            room
          )
        `)
        .order('created_at', { ascending: false });

      // If user is not admin, only fetch their orders
      if (user?.role !== 'admin') {
        query = query.eq('user_id', user?.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedOrders: Order[] = data?.map((order: any) => ({
        id: order.id,
        user_id: order.user_id,
        quantity: order.quantity,
        total_price: order.total_price,
        delivery_date: order.delivery_date,
        status: order.status,
        notes: order.notes,
        created_at: order.created_at,
        updated_at: order.updated_at,
        user_name: order.users.name,
        user_phone: order.users.phone,
        user_hall: order.users.hall,
        user_room: order.users.room,
      })) || [];

      setOrders(formattedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const addOrder = async (orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase
        .from('orders')
        .insert({
          user_id: orderData.user_id,
          quantity: orderData.quantity,
          total_price: orderData.total_price,
          delivery_date: orderData.delivery_date,
          status: orderData.status || 'pending',
          notes: orderData.notes,
        });

      if (error) throw error;

      await fetchOrders(); // Refresh orders
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      await fetchOrders(); // Refresh orders
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const getUserOrders = () => {
    if (!user) return [];
    return orders.filter(order => order.user_id === user.id);
  };

  const getTodayOrders = () => {
    const today = new Date().toISOString().split('T')[0];
    return orders.filter(order => order.delivery_date === today);
  };

  const getPendingOrders = () => {
    return orders.filter(order => order.status === 'pending');
  };

  return (
    <OrderContext.Provider value={{
      orders,
      loading,
      addOrder,
      updateOrderStatus,
      fetchOrders,
      getUserOrders,
      getTodayOrders,
      getPendingOrders,
    }}>
      {children}
    </OrderContext.Provider>
  );
};