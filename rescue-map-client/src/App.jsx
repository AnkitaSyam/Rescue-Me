import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Map as MapIcon, Users, BarChart3, Menu, X, PhoneCall, HelpCircle, Phone, LifeBuoy, Heart, Truck, Zap, Bell, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import io from 'socket.io-client';

// Simple Component Imports (to be expanded)
import LandingPage from './pages/LandingPage';
import EmergencyReport from './pages/EmergencyReport';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import VolunteerPortal from './pages/VolunteerPortal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const socket = io(API_BASE_URL);

function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [alerts, setAlerts] = useState([]);

  const EMERGENCY_NUMBERS = [
    { id: '112', label: 'All-In-One Emergency', number: '112', icon: Bell, color: 'bg-red-600', desc: 'National Emergency Number' },
    { id: 'police', label: 'Police', number: '100', icon: Shield, color: 'bg-blue-600', desc: 'Direct Police Help' },
    { id: 'fire', label: 'Fire Brigade', number: '101', icon: Zap, color: 'bg-orange-600', desc: 'Fire & Rescue Services' },
    { id: 'ambulance', label: 'Ambulance', number: '102', icon: Activity, color: 'bg-emerald-600', desc: 'Medical Emergency' },
    { id: 'disaster', label: 'Disaster Management', number: '108', icon: LifeBuoy, color: 'bg-purple-600', desc: 'NDRF / Disaster Relief' },
    { id: 'women', label: 'Women Helpline', number: '1091', icon: Heart, color: 'bg-pink-600', desc: 'Safety & Protection' },
  ];

  useEffect(() => {
    socket.on('emergency-broadcast', (alert) => {
      setAlerts(prev => [alert, ...prev]);
    });

    return () => socket.off('emergency-broadcast');
  }, []);

  const navItems = [
    { id: 'landing', label: 'Home', icon: Shield },
    { id: 'report', label: 'I Need Help', icon: AlertTriangle, color: 'text-red-500' },
    { id: 'dashboard', label: 'Rescue Dashboard', icon: MapIcon },
    { id: 'volunteer', label: 'Volunteer', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-red-200">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white border-b border-red-200 shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="bg-gradient-to-br from-red-600 to-red-700 p-2 rounded-lg shadow-lg shadow-red-600/30 group-hover:scale-110 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-display font-black tracking-tighter uppercase italic bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
              RescueMap
            </span>
          </motion.button>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest transition-all duration-200 ${
                  activeTab === item.id 
                    ? 'bg-red-100 text-red-600 border border-red-300 shadow-md' 
                    : 'text-gray-600 hover:text-red-600 hover:bg-red-50 border border-transparent'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowEmergencyModal(true)}
              className="hidden sm:flex items-center gap-2 px-4 py-2 border-2 border-red-600 text-red-600 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-md"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Emergency Line
            </motion.button>
            
            <motion.button 
              whileHover={{ rotate: 90 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-0 z-40 bg-white/95 backdrop-blur-md pt-20 px-4 md:hidden border-t border-red-200"
          >
            <div className="flex flex-col gap-2 max-w-md mx-auto">
              {navItems.map((item) => (
                <motion.button
                  key={item.id}
                  whileHover={{ x: 5 }}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center gap-4 p-4 rounded-xl text-lg font-bold transition-all ${
                    activeTab === item.id 
                      ? 'bg-red-100 text-red-600 border border-red-300 shadow-md' 
                      : 'text-gray-600 hover:text-red-600 hover:bg-red-50 border border-transparent'
                  }`}
                >
                  <item.icon className="w-6 h-6" />
                  <span className="uppercase tracking-wider">{item.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-20 pb-12 px-4">
        <AnimatePresence mode="wait">
          {activeTab === 'landing' && (
            <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <LandingPage onStart={() => setActiveTab('report')} onDash={() => setActiveTab('dashboard')} />
            </motion.div>
          )}
          {activeTab === 'report' && (
            <motion.div key="report" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <EmergencyReport onComplete={() => setActiveTab('landing')} />
            </motion.div>
          )}
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <CoordinatorDashboard socket={socket} />
            </motion.div>
          )}
          {activeTab === 'volunteer' && (
            <motion.div key="volunteer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <VolunteerPortal socket={socket} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Global Alerts Toasts */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {alerts.slice(0, 3).map((alert, idx) => (
            <motion.div
              key={idx}
              initial={{ x: 400, opacity: 0, scale: 0.8 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: 400, opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
              className="card-base border-l-4 border-l-red-600 rounded-2xl shadow-2xl shadow-red-600/20 flex items-center gap-4 min-w-[340px] relative overflow-hidden group pointer-events-auto"
            >
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="bg-gradient-to-br from-red-600 to-red-700 p-3 rounded-xl shadow-lg shadow-red-600/40 flex-shrink-0"
              >
                <AlertTriangle className="w-5 h-5 text-white" />
              </motion.div>
              
              <div className="flex-1 min-w-0">
                <p className="font-display font-black text-xs uppercase tracking-widest text-red-600 mb-1">
                  Emergency Alert
                </p>
                <p className="text-gray-900 font-medium text-sm leading-snug truncate">
                  {alert.description || alert.message}
                </p>
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setAlerts(prev => prev.filter((_, i) => i !== idx))}
                className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded-lg text-gray-400 hover:text-red-600 transition-all flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </motion.button>

              <motion.div 
                animate={{ scaleX: [1, 0] }}
                transition={{ duration: 5, ease: "linear" }}
                onAnimationComplete={() => setAlerts(prev => prev.filter((_, i) => i !== idx))}
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-red-600 to-red-400 origin-left"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {/* Emergency Modal */}
      <AnimatePresence>
        {showEmergencyModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            onClick={() => setShowEmergencyModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              {/* Close Header */}
              <div className="absolute top-6 right-6 z-10">
                <button 
                  onClick={() => setShowEmergencyModal(false)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 md:p-12">
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <PhoneCall className="w-5 h-5 text-red-600" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600">Quick Assistance</span>
                  </div>
                  <h2 className="text-4xl font-display font-black text-gray-900 uppercase italic tracking-tighter">Emergency Lines</h2>
                  <p className="text-gray-500 text-sm mt-1 font-medium">Standard verified helpline numbers in India for immediate rescue.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {EMERGENCY_NUMBERS.map((item) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ y: -5 }}
                      className="group flex items-center gap-4 p-5 bg-gray-50 border border-gray-100 rounded-2xl transition-all shadow-sm relative overflow-hidden"
                    >
                      <div className={`p-4 rounded-xl text-white shadow-lg ${item.color} group-hover:scale-110 transition-transform`}>
                        <item.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-black uppercase tracking-widest text-gray-400">{item.label}</span>
                          <span className="text-2xl font-display font-black text-gray-900">{item.number}</span>
                        </div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight mt-0.5">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-10 p-6 bg-red-50 border border-red-100 rounded-3xl text-center">
                  <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-1 italic">Notice</p>
                  <p className="text-[10px] text-red-800 font-medium">These numbers are for **Emergency use only**. Abuse of emergency services is a punishable offense. Stay safe.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
