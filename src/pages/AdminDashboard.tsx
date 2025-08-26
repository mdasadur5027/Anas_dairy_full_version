import React, { useState } from 'react';
import { Package, CheckCircle, X, Printer, Calendar, Users, DollarSign, Filter } from 'lucide-react';
import { useOrders } from '../context/OrderContext';

const AdminDashboard: React.FC = () => {
  const { orders, updateOrderStatus, getTodayOrders, getPendingOrders, loading } = useOrders();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updating, setUpdating] = useState<string | null>(null);

  const todayOrders = getTodayOrders();
  const pendingOrders = getPendingOrders();
  const totalRevenue = orders.reduce((sum, order) => sum + order.total_price, 0);
  const totalBottles = orders.reduce((sum, order) => sum + order.quantity, 0);

  const getFilteredOrders = () => {
    let filtered = orders;
    
    if (selectedDate) {
      filtered = filtered.filter(order => order.delivery_date === selectedDate);
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  const handleStatusUpdate = async (orderId: string, status: string) => {
    setUpdating(orderId);
    await updateOrderStatus(orderId, status as any);
    setUpdating(null);
  };

  const handlePrintOrders = () => {
    const ordersToPrint = getFilteredOrders();
    const printContent = `
      <html>
        <head>
          <title>Daily Orders - ${selectedDate}</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .header { text-align: center; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>RUET Milk Delivery</h1>
            <h2>Daily Orders Report - ${new Date(selectedDate).toLocaleDateString()}</h2>
          </div>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Hall</th>
                <th>Room</th>
                <th>Phone</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${ordersToPrint.map(order => `
                <tr>
                  <td>${order.id}</td>
                  <td>${order.user_name}</td>
                  <td>${order.user_hall}</td>
                  <td>${order.user_room}</td>
                  <td>${order.user_phone}</td>
                  <td>${order.quantity}</td>
                  <td>${order.total_price} ৳</td>
                  <td>${order.status}</td>
                  <td>${order.notes || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="margin-top: 20px;">
            <p><strong>Total Orders:</strong> ${ordersToPrint.length}</p>
            <p><strong>Total Bottles:</strong> ${ordersToPrint.reduce((sum, order) => sum + order.quantity, 0)}</p>
            <p><strong>Total Revenue:</strong> ${ordersToPrint.reduce((sum, order) => sum + order.total_price, 0)} ৳</p>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-md">
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Manage orders and track delivery status
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Today's Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{todayOrders.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Pending Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{pendingOrders.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">{totalRevenue} ৳</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            
            <button
              onClick={handlePrintOrders}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors inline-flex items-center space-x-2"
            >
              <Printer className="h-5 w-5" />
              <span>Print Orders</span>
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Orders Management ({getFilteredOrders().length} orders)
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getFilteredOrders().map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          Order #{order.id.slice(-6)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.quantity} bottles × 30৳ = {order.total_price}৳
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.user_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.user_phone}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.user_hall}
                        </div>
                        <div className="text-sm text-gray-500">
                          Room {order.user_room}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(order.delivery_date).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                            disabled={updating === order.id}
                            className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                            title="Confirm Order"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                        )}
                        
                        {order.status === 'confirmed' && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'delivered')}
                            disabled={updating === order.id}
                            className="text-green-600 hover:text-green-800 disabled:opacity-50"
                            title="Mark as Delivered"
                          >
                            <Package className="h-5 w-5" />
                          </button>
                        )}
                        
                        {(order.status === 'pending' || order.status === 'confirmed') && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                            disabled={updating === order.id}
                            className="text-red-600 hover:text-red-800 disabled:opacity-50"
                            title="Cancel Order"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {getFilteredOrders().length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No orders found for the selected filters.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;