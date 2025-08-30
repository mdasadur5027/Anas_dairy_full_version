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
    if (isAuthenticated && user) {
      fetchOrders();
    }
  }, [isAuthenticated, user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        setOrders([]);
        return;
      }

      console.log('Fetching orders for user:', user.id, 'Role:', user.role); // Debug

      // For regular users, only fetch their orders
      if (user.role !== 'admin') {
        console.log('Fetching user orders...'); // Debug
        
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        console.log('Orders query result:', { ordersData, ordersError }); // Debug

        if (ordersError) {
          console.error('Orders error:', ordersError);
          throw ordersError;
        }

        // Get current user's data for the orders
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, name, phone, hall, room')
          .eq('id', user.id)
          .single();

        if (userError) throw userError;

        const formattedOrders: Order[] = (ordersData || []).map((order: any) => ({
          ...order,
          user_name: userData?.name || user.name || 'Unknown',
          user_phone: userData?.phone || user.phone || '',
          user_hall: userData?.hall || user.hall || '',
          user_room: userData?.room || user.room || '',
        }));

        console.log('Formatted orders:', formattedOrders); // Debug
        setOrders(formattedOrders);
      } else {
        // For admins, fetch all orders
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;

        if (!ordersData || ordersData.length === 0) {
          setOrders([]);
          return;
        }

        // Get unique user IDs from orders
        const userIds = [...new Set(ordersData.map(order => order.user_id))];

        // Fetch user details separately
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, name, phone, hall, room')
          .in('id', userIds);

        if (usersError) throw usersError;

        // Create a map of user data for quick lookup
        const usersMap = new Map(usersData?.map(user => [user.id, user]) || []);

        // Combine orders with user data
        const formattedOrders: Order[] = ordersData.map((order: any) => {
          const userData = usersMap.get(order.user_id);
          return {
            ...order,
            user_name: userData?.name || 'Unknown',
            user_phone: userData?.phone || '',
            user_hall: userData?.hall || '',
            user_room: userData?.room || '',
          };
        });

        setOrders(formattedOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
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
          notes: orderData.notes || null,
        });

      if (error) throw error;

      await fetchOrders(); // Refresh orders
      return { success: true };
    } catch (error: any) {
      console.error('Error adding order:', error);
      return { success: false, error: error.message };
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;

      await fetchOrders(); // Refresh orders
      return { success: true };
    } catch (error: any) {
      console.error('Error updating order status:', error);
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