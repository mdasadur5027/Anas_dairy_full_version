import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Milk, Clock, MapPin, Phone, Star, CheckCircle, Truck, MessageCircle, Shield, Award, Users, Mail, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Review } from '../types';

const HomePage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          users!inner(
            name,
            hall
          )
        `)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;

      const formattedReviews: Review[] = data?.map((review: any) => ({
        id: review.id,
        userId: review.user_id,
        userName: review.users.name,
        userHall: review.users.hall,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.created_at,
      })) || [];

      setReviews(formattedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            {/* Hero Content */}
            <div className="mb-12">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full mb-8">
                <Milk className="h-12 w-12 text-blue-600" />
              </div>
              
              <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Fresh Milk
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
                  Delivered Daily
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
                Premium quality cow milk delivered fresh to your hall room every morning. 
                <span className="block mt-2 font-medium text-gray-800">
                  Pure, healthy, and convenient for RUET students.
                </span>
              </p>
            </div>
            
            {/* Pricing Card */}
            <div className="inline-block mb-12">
              <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-center space-x-12 mb-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">250ml</div>
                    <div className="text-gray-600 font-medium">Fresh Cow Milk</div>
                  </div>
                  <div className="h-16 w-px bg-gradient-to-b from-blue-200 to-green-200"></div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">৳30</div>
                    <div className="text-gray-600 font-medium">Per Bottle</div>
                  </div>
                </div>
                
                <Link
                  to="/client/auth"
                  className="group bg-gradient-to-r from-blue-600 to-blue-700 text-white px-10 py-4 rounded-2xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-3 shadow-lg hover:shadow-xl"
                >
                  <span>Order Now</span>
                  <Milk className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                </Link>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-gray-600">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="font-medium">100% Pure</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Quality Assured</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Trusted by Students</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose RUET Milk?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're committed to delivering the freshest, highest quality milk directly to your doorstep
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-200 transition-colors">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Daily Fresh Delivery</h3>
              <p className="text-gray-600 leading-relaxed">
                Fresh milk delivered every morning at 7 AM directly to your hall room. Never miss your daily nutrition.
              </p>
            </div>
            
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-200 transition-colors">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Premium Quality</h3>
              <p className="text-gray-600 leading-relaxed">
                100% pure cow milk with no artificial additives. Sourced from local farms and quality tested daily.
              </p>
            </div>
            
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-200 transition-colors">
                <Truck className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Convenient Service</h3>
              <p className="text-gray-600 leading-relaxed">
                Easy online ordering with flexible delivery schedules. Manage your orders through our user-friendly app.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              We Deliver To All RUET Halls
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive coverage across all residential halls
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              'Shahid President Ziaur Rahman Hall',
              'Shahid Lt. Selim Hall', 
              'Shahid Shahidul Islam Hall',
              'Shahid Abdul Hamid Hall',
              'Bangabandhu Sheikh Mujibur Rahman Hall',
              'Nawab Foyzunnessa Chowdhurani Hall',
              'Tin Shed Hall (Extension)'
            ].map((hall, index) => (
              <div key={index} className="group bg-gradient-to-br from-blue-50 to-green-50 p-6 rounded-xl border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center space-x-4">
                  <div className="bg-white p-3 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="font-semibold text-gray-900 text-lg">{hall}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              What Students Say
            </h2>
            {reviews.length === 0 && !loading && (
              <div className="bg-white p-8 rounded-2xl shadow-lg max-w-2xl mx-auto">
                <MessageCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <p className="text-xl text-gray-600 mb-4">
                  Be the first to share your experience!
                </p>
                <Link 
                  to="/client/auth" 
                  className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-semibold text-lg transition-colors"
                >
                  <span>Sign up and leave a review</span>
                  <Star className="h-5 w-5" />
                </Link>
              </div>
            )}
          </div>
          
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-8 rounded-2xl shadow-lg animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-20 bg-gray-200 rounded mb-6"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : reviews.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center mb-4">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-6 italic text-lg leading-relaxed">
                      "{review.comment}"
                    </p>
                    <div className="border-t pt-4">
                      <div className="font-bold text-gray-900 text-lg">{review.userName}</div>
                      <div className="text-blue-600 font-medium">{review.userHall}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-12">
                <Link
                  to="/client/auth"
                  className="inline-flex items-center space-x-2 bg-green-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  <MessageCircle className="h-6 w-6" />
                  <span>Share Your Experience</span>
                </Link>
              </div>
            </>
          ) : null}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-green-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
              Ready to Start Your
              <span className="block">Daily Milk Delivery?</span>
            </h2>
            <p className="text-xl md:text-2xl text-blue-100 mb-12 leading-relaxed">
              Join hundreds of RUET students who trust us for their daily nutrition needs
            </p>
            <Link
              to="/client/auth"
              className="group bg-white text-blue-600 px-12 py-5 rounded-2xl font-bold text-xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-3 shadow-2xl"
            >
              <span>Get Started Today</span>
              <Phone className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <Milk className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold">RUET Milk</span>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Premium quality cow milk delivered fresh to RUET students every morning. 
                Pure, healthy, and convenient.
              </p>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Phone className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-300">+880 1XXX-XXXXXX</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-300">info@ruetmilk.com</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-6">Service Areas</h3>
              <ul className="space-y-3 text-gray-300">
                <li>Shahid President Ziaur Rahman Hall</li>
                <li>Shahid Lt. Selim Hall</li>
                <li>Shahid Shahidul Islam Hall</li>
                <li>Bangabandhu Sheikh Mujibur Rahman Hall</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-6">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/client/auth" className="text-gray-300 hover:text-white transition-colors">
                    Order Now
                  </Link>
                </li>
                <li>
                  <Link to="/client/auth" className="text-gray-300 hover:text-white transition-colors">
                    Customer Login
                  </Link>
                </li>
                <li>
                  <a href="#features" className="text-gray-300 hover:text-white transition-colors">
                    Our Services
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2025 RUET Milk Delivery. All rights reserved.
              </p>
              
              {/* Discrete Admin Access */}
              <div className="mt-4 md:mt-0">
                <Link
                  to="/admin/auth"
                  className="text-gray-500 hover:text-gray-300 transition-colors text-xs opacity-50 hover:opacity-100"
                  title="Admin Access"
                >
                  <Settings className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;