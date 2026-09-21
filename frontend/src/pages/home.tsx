"use client";

import { motion } from "framer-motion";
import { 
  IconTruck, 
  IconMapPin, 
  IconClock, 
  IconShieldCheck,
  IconBrandApple,
  IconBrandGooglePlay,
  IconPackage,
  IconUsers,
  IconCheck
} from "@tabler/icons-react";

export default function HomePage() {

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const scaleIn = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5 }
  };
  
  return (
    <>
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <IconTruck className="h-8 w-8 text-teal-600" />
              <span className="text-xl font-bold text-gray-900">My Truck</span>
            </div>
            
            {/* Right Side Buttons */}
            <div className="flex items-center gap-3">
              <motion.a
                href="/agent-login"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
              >
                Login Agent
              </motion.a>
              <motion.a
                href="/manager-login"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
              >
                Login Manager
              </motion.a>
              <motion.a
                href="/register"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2 text-sm font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
              >
                Get Started
              </motion.a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Full Height */}
      <section className="relative overflow-hidden min-h-screen flex items-center pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text Content */}
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainer}
              className="text-left"
            >
              <motion.div
                variants={fadeInUp}
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-medium mb-6"
              >
                <IconTruck className="h-4 w-4" />
                Fast & Reliable Delivery Service
              </motion.div>

              <motion.h1 
                variants={fadeInUp}
                className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6"
              >
                Track Your Delivery
                <br />
                <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                  With My Truck
                </span>
              </motion.h1>

              <motion.p 
                variants={fadeInUp}
                className="text-xl leading-8 text-gray-600 mb-12"
              >
                Real-time tracking, instant notifications, and professional drivers. 
                Your packages delivered safely and on time.
              </motion.p>

              {/* Download Buttons */}
              <motion.div 
                variants={fadeInUp}
                className="space-y-4"
              >
                <p className="text-sm text-gray-600 font-medium">Download our mobile app:</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <motion.a
                    href="https://play.google.com/store"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-3 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <IconBrandGooglePlay className="h-7 w-7" />
                    <div className="text-left">
                      <div className="text-xs">GET IT ON</div>
                      <div className="text-base font-semibold">Google Play</div>
                    </div>
                  </motion.a>
                  <motion.a
                    href="https://apps.apple.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-3 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <IconBrandApple className="h-7 w-7" />
                    <div className="text-left">
                      <div className="text-xs">Download on the</div>
                      <div className="text-base font-semibold">App Store</div>
                    </div>
                  </motion.a>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Side - Interactive Phone Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:flex justify-center items-center"
            >
              {/* Phone Frame */}
              <div className="relative">
                {/* Floating Elements */}
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -left-20 top-20 bg-white rounded-2xl shadow-2xl p-4 z-10"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <IconCheck className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Delivered!</p>
                      <p className="text-xs text-gray-600">Package arrived</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 20, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -right-20 bottom-32 bg-white rounded-2xl shadow-2xl p-4 z-10"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                      <IconTruck className="h-6 w-6 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">On the way</p>
                      <p className="text-xs text-gray-600">5 mins away</p>
                    </div>
                  </div>
                </motion.div>

                {/* Phone Mockup */}
                <div className="relative w-[300px] h-[600px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
                  <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                    {/* Phone Screen Content - Map Style */}
                    <div className="relative h-full bg-gray-200">
                      {/* Status Bar */}
                      <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center px-6 py-3 bg-white/90 backdrop-blur">
                        <span className="text-xs font-semibold">9:41</span>
                        <div className="flex gap-1">
                          <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                          <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                          <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                        </div>
                      </div>

                      {/* Map Background - Simulated */}
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300">
                        {/* Map Roads */}
                        <svg className="w-full h-full opacity-30" viewBox="0 0 300 600">
                          <path d="M 50 0 L 50 200 L 150 300 L 150 600" stroke="#666" strokeWidth="8" fill="none" />
                          <path d="M 0 150 L 200 150 L 250 200 L 300 200" stroke="#666" strokeWidth="6" fill="none" />
                          <path d="M 100 300 L 250 300 L 300 350" stroke="#666" strokeWidth="6" fill="none" />
                        </svg>
                        
                        {/* Map Markers */}
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute top-[30%] left-[20%] w-8 h-8 bg-teal-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center"
                        >
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                        </motion.div>
                        
                        <div className="absolute top-[60%] left-[50%] w-10 h-10 bg-red-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                          <IconMapPin className="h-5 w-5 text-white" />
                        </div>
                      </div>

                      {/* Top Controls - Removed hamburger button */}
                      <div className="absolute top-16 left-4 right-4 z-10">
                        {/* Empty space for cleaner look */}
                      </div>

                      {/* Right Side Controls */}
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-3">
                        <button className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                        <button className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <button className="w-12 h-12 bg-teal-500 rounded-xl shadow-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                      </div>

                      {/* Bottom Action Buttons */}
                      <div className="absolute bottom-6 left-4 right-4 z-10">
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
                        >
                          <div className="grid grid-cols-2 divide-x divide-gray-200">
                            <button className="flex items-center justify-center gap-2 py-4 bg-teal-500 text-white font-semibold">
                              <IconTruck className="h-5 w-5" />
                              <span className="text-sm">Delivery</span>
                            </button>
                            <button className="flex items-center justify-center gap-2 py-4 bg-white text-gray-700 font-semibold">
                              <IconPackage className="h-5 w-5" />
                              <span className="text-sm">Order</span>
                            </button>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Us?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-2xl mx-auto">
              We provide the best delivery experience with cutting-edge technology and professional service
            </motion.p>
          </motion.div>

          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              {
                icon: IconPackage,
                title: "Easy Booking",
                description: "Book your delivery in seconds with our simple mobile app",
                color: "teal"
              },
              {
                icon: IconMapPin,
                title: "Live Tracking",
                description: "Watch your package move in real-time on the map",
                color: "green"
              },
              {
                icon: IconUsers,
                title: "Professional Drivers",
                description: "Verified and trained drivers for safe delivery",
                color: "blue"
              },
              {
                icon: IconShieldCheck,
                title: "Secure Payment",
                description: "Multiple payment options with secure transactions",
                color: "orange"
              },
              {
                icon: IconClock,
                title: "24/7 Support",
                description: "Round-the-clock customer support for your needs",
                color: "purple"
              },
              {
                icon: IconTruck,
                title: "Reliable Delivery",
                description: "Your packages delivered safely and on time",
                color: "emerald"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:shadow-xl transition-shadow"
              >
                <div className={`w-16 h-16 bg-${feature.color}-100 rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                  <feature.icon className={`h-8 w-8 text-${feature.color}-600`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-teal-600 to-emerald-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center text-white"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Get Started?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl mb-10 max-w-2xl mx-auto opacity-90">
              Join thousands of satisfied customers who trust us with their deliveries
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="https://play.google.com/store"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 px-8 py-4 bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
              >
                <IconBrandGooglePlay className="h-8 w-8" />
                <div className="text-left">
                  <div className="text-xs">GET IT ON</div>
                  <div className="text-lg font-semibold">Google Play</div>
                </div>
              </motion.a>
              <motion.a
                href="https://apps.apple.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 px-8 py-4 bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
              >
                <IconBrandApple className="h-8 w-8" />
                <div className="text-left">
                  <div className="text-xs">Download on the</div>
                  <div className="text-lg font-semibold">App Store</div>
                </div>
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">My Track</h3>
              <p className="text-sm">Fast, reliable, and secure delivery service for all your needs.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors">Terms of Use</a></li>
                <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/delete-account" className="hover:text-white transition-colors">Delete Account</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Download App</h4>
              <div className="space-y-3">
                <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:text-white transition-colors">
                  <IconBrandGooglePlay className="h-5 w-5" />
                  Google Play
                </a>
                <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:text-white transition-colors">
                  <IconBrandApple className="h-5 w-5" />
                  App Store
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2026 My Truck. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}