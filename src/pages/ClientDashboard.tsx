import React, { useState } from 'react';
import { Milk, Plus, Calendar, Package, Clock, CheckCircle, X, Star, MessageCircle, Flame, Trophy, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { supabase } from '../lib/supabase';

const ClientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { addOrder, getUserOrders, getUserStreak, getTotalDeliveredBottles, loading } = useOrders();
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [orderData, setOrderData] = useState({
    quantity: 1,
    deliveryDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: ''
  });
  const [hasReviewed, setHasReviewed] = useState(false);

  const userOrders = getUserOrders();
  const userStreak = getUserStreak();
  const totalDeliveredBottles = getTotalDeliveredBottles();

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    const result = await addOrder({
      user_id: user.id,
      quantity: orderData.quantity,
      total_price: orderData.quantity * 30,
      delivery_date: orderData.deliveryDate,
      status: 'pending',
      notes: orderData.notes || null
    });

    if (result.success) {
      setShowOrderForm(false);
      setOrderData({
        quantity: 1,
        deliveryDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
      setSuccess('Order placed successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.error || 'Failed to place order');
    }

    setSubmitting(false);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          rating: reviewData.rating,
          comment: reviewData.comment
        });

      if (error) throw error;

      setShowReviewForm(false);
      setReviewData({ rating: 5, comment: '' });
      setHasReviewed(true);
      setSuccess('Review submitted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  // Check if user has already reviewed
  React.useEffect(() => {
    const checkUserReview = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from('reviews')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
          
        setHasReviewed(!!data);
      } catch (error) {
        console.error('Error checking user review:', error);
        setHasReviewed(false);
      }
    };
    
    checkUserReview();
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'delivered':
        return <Package className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
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

  const getStreakMessage = (streak: number) => {
    if (streak === 0) return "Start your streak today!";
    if (streak === 1) return "Great start! Keep it going!";
    if (streak < 7) return "Building momentum!";
    if (streak < 30) return "Impressive consistency!";
    return "Milk champion! 🏆";
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
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-600">
            {user?.hall} - Room {user?.room}
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{userOrders.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Pending Orders</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {userOrders.filter(o => o.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center">
              <Milk className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Bottles</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {totalDeliveredBottles}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl shadow-md border border-orange-100">
            <div className="flex items-center">
              <Flame className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Current Streak</p>
                <p className="text-2xl font-semibold text-gray-900">{userStreak} days</p>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xs text-orange-600 font-medium">
                {getStreakMessage(userStreak)}
              </p>
            </div>
          </div>
        </div>

        {/* Streak Achievement Section */}
        {userStreak > 0 && (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-xl shadow-lg mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white bg-opacity-20 p-3 rounded-full">
                  <Trophy className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    {userStreak} Day Streak! 🔥
                  </h3>
                  <p className="text-orange-100">
                    You've been consistent with your daily milk intake
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{userStreak}</div>
                <div className="text-sm text-orange-100">consecutive days</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setShowOrderForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="h-5 w-5" />
              <span>Place New Order</span>
            </button>
            
            {!hasReviewed && userOrders.some(order => order.status === 'delivered') && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors inline-flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Star className="h-5 w-5" />
                <span>Write Review</span>
              </button>
            )}
          </div>
        </div>

        {/* Order Form Modal */}
        {showOrderForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Place New Order</h2>
                <button
                  onClick={() => {
                    setShowOrderForm(false);
                    setError('');
                  }}
                  disabled={submitting}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmitOrder} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity (250ml bottles)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={orderData.quantity}
                    onChange={(e) => setOrderData({...orderData, quantity: parseInt(e.target.value) || 1})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={submitting}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Total: {orderData.quantity * 30} ৳
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Date
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={orderData.deliveryDate}
                    onChange={(e) => setOrderData({...orderData, deliveryDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={submitting}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Notes (Optional)
                  </label>
                  <textarea
                    value={orderData.notes}
                    onChange={(e) => setOrderData({...orderData, notes: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Any special delivery instructions..."
                    disabled={submitting}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Placing Order...' : 'Place Order'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Review Form Modal */}
        {showReviewForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Write a Review</h2>
                <button
                  onClick={() => {
                    setShowReviewForm(false);
                    setError('');
                  }}
                  disabled={submitting}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setReviewData({...reviewData, rating})}
                        className="focus:outline-none transition-transform hover:scale-110"
                        disabled={submitting}
                      >
                        <Star 
                          className={`h-8 w-8 transition-colors ${
                            rating <= reviewData.rating 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300 hover:text-yellow-200'
                          }`} 
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {reviewData.rating} out of 5 stars
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Review
                  </label>
                  <textarea
                    value={reviewData.comment}
                    onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                    rows={4}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Share your experience with RUET Milk Delivery..."
                    disabled={submitting}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {reviewData.comment.length}/500 characters
                  </p>
                </div>
                
                <button
                  type="submit"
                  disabled={submitting || !reviewData.comment.trim()}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting Review...' : 'Submit Review'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Orders List */}
        <div className="bg-white rounded-xl shadow-md">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Your Orders</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <TrendingUp className="h-4 w-4" />
                <span>{userOrders.length} total orders</span>
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {userOrders.length === 0 ? (
              <div className="p-12 text-center">
                <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Milk className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-500 mb-6">Place your first order to get started with fresh milk delivery!</p>
                <button
                  onClick={() => setShowOrderForm(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>Place Your First Order</span>
                </button>
              </div>
            ) : (
              userOrders.map((order) => (
                <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        {getStatusIcon(order.status)}
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          Order #{order.id.slice(-6)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">Quantity</p>
                          <p className="font-medium text-lg">{order.quantity} bottles</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Delivery Date</p>
                          <p className="font-medium text-lg">{new Date(order.delivery_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Price</p>
                          <p className="font-medium text-lg text-green-600">{order.total_price} ৳</p>
                        </div>
                      </div>
                      
                      {order.notes && (
                        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Special Notes:</p>
                          <p className="text-sm text-gray-800">{order.notes}</p>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>Ordered on {new Date(order.created_at).toLocaleDateString()}</span>
                        {order.status === 'delivered' && (
                          <span className="text-green-600 font-medium">✓ Delivered</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;