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
  getUserStreak: () => number;
  getTotalDeliveredBottles: () => number;
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
    } else {
      setOrders([]);
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        setOrders([]);
        return;
      }

      console.log('Fetching orders for user:', user.id, 'Role:', user.role);

      // For regular users, only fetch their orders
      if (user.role !== 'admin') {
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (ordersError) {
          console.error('Orders error:', ordersError);
          throw ordersError;
        }

        // Format orders with current user's data
        const formattedOrders: Order[] = (ordersData || []).map((order: any) => ({
          ...order,
          user_name: user.name || 'Unknown',
          user_phone: user.phone || '',
          user_hall: user.hall || '',
          user_room: user.room || '',
        }));

        setOrders(formattedOrders);
      } else {
        // For admins, fetch all orders with user details
        const { data: ordersData, error: ordersError } = await supabase
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

        if (ordersError) throw ordersError;

        // Format orders with user data from join
        const formattedOrders: Order[] = (ordersData || []).map((order: any) => ({
          id: order.id,
          user_id: order.user_id,
          quantity: order.quantity,
          total_price: order.total_price,
          delivery_date: order.delivery_date,
          status: order.status,
          notes: order.notes,
          created_at: order.created_at,
          updated_at: order.updated_at,
          user_name: order.users?.name || 'Unknown',
          user_phone: order.users?.phone || '',
          user_hall: order.users?.hall || '',
          user_room: order.users?.room || '',
        }));

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
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Validate delivery date is not in the past
      const deliveryDate = new Date(orderData.delivery_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (deliveryDate < today) {
        return { success: false, error: 'Delivery date cannot be in the past' };
      }

      // Check if user already has an order for this date
      const existingOrder = orders.find(
        order => order.user_id === user.id && 
        order.delivery_date === orderData.delivery_date &&
        order.status !== 'cancelled'
      );

      if (existingOrder) {
        return { success: false, error: 'You already have an order for this date' };
      }

      const { data, error } = await supabase
        .from('orders')
        .insert({
          user_id: orderData.user_id,
          quantity: orderData.quantity,
          total_price: orderData.total_price,
          delivery_date: orderData.delivery_date,
          status: orderData.status || 'pending',
          notes: orderData.notes || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Add the new order to local state with user data
      const newOrder: Order = {
        ...data,
        user_name: user.name || 'Unknown',
        user_phone: user.phone || '',
        user_hall: user.hall || '',
        user_room: user.room || '',
      };

      setOrders(prevOrders => [newOrder, ...prevOrders]);
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

      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status, updated_at: new Date().toISOString() }
            : order
        )
      );

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

  const getUserStreak = () => {
    if (!user) return 0;
    
    const userOrders = getUserOrders()
      .filter(order => order.status === 'delivered')
      .sort((a, b) => new Date(b.delivery_date).getTime() - new Date(a.delivery_date).getTime());

    if (userOrders.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < userOrders.length; i++) {
      const orderDate = new Date(userOrders[i].delivery_date);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      // Check if order is within the expected consecutive day
      if (orderDate.toDateString() === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const getTotalDeliveredBottles = () => {
    if (!user) return 0;
    return getUserOrders()
      .filter(order => order.status === 'delivered')
      .reduce((total, order) => total + order.quantity, 0);
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
      getUserStreak,
      getTotalDeliveredBottles,
    }}>
      {children}
    </OrderContext.Provider>
  );
};