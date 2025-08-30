import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Milk, Mail, Lock, User, Phone, MapPin, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ClientAuth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    hall: '',
    room: ''
  });

  const navigate = useNavigate();
  const { login, register } = useAuth();

  const halls = [
    'Shahid President Ziaur Rahman Hall',
    'Shahid Lt. Selim Hall',
    'Shahid Shahidul Islam Hall', 
    'Shahid Abdul Hamid Hall',
    'Bangabandhu Sheikh Mujibur Rahman Hall',
    'Nawab Foyzunnessa Chowdhurani Hall',
    'Tin Shed Hall (Extension)'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // --- LOGIN ---
        const result = await login(formData.email, formData.password);
        if (!result.success) {
          setError(result.error || 'Login failed');
          return;
        }

        // Check user role and navigate accordingly
        console.log('Login result:', result.user); // Debug log
        console.log('User role from result:', result.user?.role); // Debug log
        
        // Small delay to ensure state is updated
        setTimeout(() => {
          if (result.user?.role === 'admin') {
            console.log('Redirecting to admin dashboard'); // Debug log
            navigate('/admin/dashboard');
          } else {
            console.log('Redirecting to client dashboard'); // Debug log
            navigate('/client/dashboard');
          }
        }, 100);
      } else {
        // --- SIGNUP ---
        if (!formData.name.trim()) {
          setError('Name is required');
          return;
        }
        if (!formData.phone.trim()) {
          setError('Phone number is required');
          return;
        }
        if (!formData.hall) {
          setError('Please select a hall');
          return;
        }
        if (!formData.room.trim()) {
          setError('Room number is required');
          return;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          return;
        }

        const result = await register({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          hall: formData.hall,
          room: formData.room,
          password: formData.password
        });

        if (!result.success) {
          setError(result.error || 'Registration failed');
          return;
        }

        // After signup, go to login page
        setIsLogin(true);
        setFormData(prev => ({ ...prev, password: '' })); // clear password
        setError('Registration successful! Please sign in.');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Milk className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {isLogin ? 'Welcome to RUET Milk' : 'Join RUET Milk'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin 
              ? 'Sign in to access your dashboard' 
              : 'Create your account for fresh milk delivery'
            }
          </p>
        </div>

        {error && (
          <div className={`border px-4 py-3 rounded-lg ${
            error.includes('successful') 
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white p-8 rounded-xl shadow-lg space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="01XXXXXXXXX"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hall Name
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <select
                      name="hall"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                      value={formData.hall}
                      onChange={handleInputChange}
                    >
                      <option value="">Select your hall</option>
                      {halls.map(hall => (
                        <option key={hall} value={hall}>{hall}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Number
                  </label>
                  <div className="relative">
                    <Home className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="room"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., A-101"
                      value={formData.room}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
              {!isLogin && (
                <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              disabled={loading}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"
              }
            </button>
          </div>
        </form>

        {isLogin && (
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Both admin and client users can sign in here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientAuth;