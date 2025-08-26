import React from 'react';
import { Link } from 'react-router-dom';
import { Milk, Clock, MapPin, Phone, Star, CheckCircle, Truck } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="mb-8">
              <Milk className="h-20 w-20 text-blue-600 mx-auto mb-4" />
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Fresh Milk <span className="text-blue-600">Delivered</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Pure, fresh cow milk delivered daily to your hall room in RUET. 
                Quality you can taste, convenience you can trust.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-xl inline-block mb-8">
              <div className="flex items-center justify-center space-x-8 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">250ml</div>
                  <div className="text-gray-600">Fresh Milk</div>
                </div>
                <div className="h-12 w-px bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">30 ৳</div>
                  <div className="text-gray-600">Per Bottle</div>
                </div>
              </div>
              
              <Link
                to="/client/auth"
                className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-2"
              >
                <span>Order Now</span>
                <Milk className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose RUET Milk Delivery?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors">
              <Clock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Daily Fresh Delivery</h3>
              <p className="text-gray-600">Fresh milk delivered every morning directly to your hall room</p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-green-50 hover:bg-green-100 transition-colors">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Pure Quality</h3>
              <p className="text-gray-600">100% pure cow milk with no artificial additives or preservatives</p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors">
              <Truck className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Convenient Service</h3>
              <p className="text-gray-600">Easy online ordering with flexible delivery schedule</p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            We Deliver To All RUET Halls
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              'Titumir Hall', 'Bangabandhu Hall', 'Sher-e-Bangla Hall', 'Nazrul Hall',
              'Rokeya Hall', 'Suraiya Khatun Hall', 'New Hall', 'Guest House'
            ].map((hall, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-gray-900">{hall}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            What Students Say
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Rafiq Ahmed",
                hall: "Titumir Hall",
                review: "Best milk delivery service in RUET! Always fresh and on time.",
                rating: 5
              },
              {
                name: "Fatima Khatun", 
                hall: "Rokeya Hall",
                review: "Very convenient and the quality is excellent. Highly recommended!",
                rating: 5
              },
              {
                name: "Karim Rahman",
                hall: "Bangabandhu Hall", 
                review: "Perfect for busy student life. Never have to worry about milk anymore.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.review}"</p>
                <div className="font-semibold text-gray-900">{testimonial.name}</div>
                <div className="text-sm text-gray-500">{testimonial.hall}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            Ready to Start Your Daily Milk Delivery?
          </h2>
          <Link
            to="/client/auth"
            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
          >
            <span>Get Started Today</span>
            <Phone className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;