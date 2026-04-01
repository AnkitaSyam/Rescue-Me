import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Filter, Users, Clock, AlertCircle, CheckCircle2, ChevronRight, Search, X, User, Phone, Calendar, Zap, Heart, Award, Shield, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const CoordinatorDashboard = ({ socket }) => {
  const [victims, setVictims] = useState([]);
  const [filter, setFilter] = useState('All');
  const [selectedVictim, setSelectedVictim] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingVolunteer, setViewingVolunteer] = useState(null);

  useEffect(() => {
    fetchVictims();
    
    if (socket) {
      // New report added
      socket.on('emergency-broadcast', (newReport) => {
        setVictims(prev => [newReport, ...prev]);
      });

      // Victim status updated (e.g. Rescued by volunteer)
      socket.on('status-update', (updatedVictim) => {
        if (updatedVictim.status === 'Rescued' || updatedVictim.status === 'Closed') {
          setVictims(prev => prev.filter(v => v._id !== updatedVictim._id));
          setSelectedVictim(prev => prev?._id === updatedVictim._id ? null : prev);
        } else {
          setVictims(prev => prev.map(v => v._id === updatedVictim._id ? updatedVictim : v));
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('emergency-broadcast');
        socket.off('status-update');
      }
    };
  }, [socket]);

  const fetchVictims = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/victims`);
      setVictims(res.data);
    } catch (err) {
      console.error('Failed to fetch victims:', err);
      setVictims([]);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`${API_BASE_URL}/api/victims/${id}`, { status });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredVictims = victims.filter(v => {
    const matchesFilter = filter === 'All' || v.severity === filter;
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         v.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getSeverityColor = (sev) => {
    switch (sev) {
      case 'Critical': return 'text-red-600';
      case 'Trapped': return 'text-orange-500';
      case 'Injured': return 'text-yellow-500';
      default: return 'text-emerald-500';
    }
  };

  // Map GPS coordinates to SVG 1000x800 space
  const getSVGCoords = (lat, lng) => {
    if (!victims.length) return { x: 500, y: 400 };
    
    // Define bounds (approximate area around reported victims)
    const padding = 0.05;
    const lats = victims.map(v => v.location.lat);
    const lngs = victims.map(v => v.location.lng);
    
    const minLat = Math.min(...lats) - padding;
    const maxLat = Math.max(...lats) + padding;
    const minLng = Math.min(...lngs) - padding;
    const maxLng = Math.max(...lngs) + padding;

    const x = ((lng - minLng) / (maxLng - minLng)) * 1000;
    const y = 800 - ((lat - minLat) / (maxLat - minLat)) * 800; // Invert Y for SVG

    return { x, y };
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
      {/* Sidebar - Priority List */}
      <div className="w-full lg:w-[400px] flex flex-col gap-5 overflow-hidden">
        <div className="glass-panel p-6 rounded-[2.5rem] border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-black text-2xl tracking-tighter italic text-gray-900">RESCUE FEED</h2>
            <div className="flex items-center gap-2 bg-red-100 px-3 py-1 rounded-full animate-pulse">
               <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
               <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Live Updates</span>
            </div>
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-red-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search reports or areas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-1 focus:ring-red-600 outline-none transition-all placeholder:text-gray-400 text-gray-900"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {['All', 'Critical', 'Trapped', 'Injured', 'Safe'].map(cat => (
              <button 
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === cat 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' 
                  : 'bg-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
          {filteredVictims.map((victim) => (
            <motion.div 
              key={victim._id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setSelectedVictim(victim)}
              className={`p-5 rounded-[2rem] border transition-all cursor-pointer relative overflow-hidden group ${
                selectedVictim?._id === victim._id 
                  ? 'bg-red-100 border-red-300 shadow-xl' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              {selectedVictim?._id === victim._id && (
                <div className="absolute top-0 left-0 w-1 h-full bg-red-600" />
              )}
              
              <div className="flex justify-between items-start mb-4">
                <span className={`text-[10px] font-black tracking-[0.2em] px-3 py-1 rounded-full uppercase ${
                   victim.severity === 'Critical' ? 'bg-red-100 text-red-600' :
                   victim.severity === 'Trapped' ? 'bg-amber-100 text-amber-600' :
                   victim.severity === 'Injured' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                }`}>
                  {victim.severity}
                </span>
                <span className="text-[10px] font-bold text-gray-600 flex items-center gap-1.5 uppercase tracking-widest">
                  <Clock className="w-3 h-3 text-red-600" /> {new Date(victim.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <h3 className="font-display font-black text-xl mb-1 group-hover:text-red-600 transition-colors uppercase tracking-tight italic text-gray-900">{victim.name}</h3>
              <p className="text-sm text-gray-600 font-medium line-clamp-2 mb-4">{victim.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-200 rounded-lg text-[10px] font-black text-gray-700 tracking-widest uppercase">
                    <Users className="w-3.5 h-3.5 text-red-600" /> {victim.peopleCount}
                  </div>
                  <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase ${
                    victim.status === 'Pending' ? 'bg-red-100 text-red-600' :
                    victim.status === 'Dispatched' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {victim.status}
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (victim.status === 'Dispatched') {
                      setViewingVolunteer(victim.assignedVolunteer || { _id: 'none', name: 'No one assigned', phone: '—', skills: [] });
                    } else {
                      setSelectedVictim(victim);
                    }
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-xl ${
                    victim.status === 'Dispatched' && victim.assignedVolunteer 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-200 group-hover:bg-red-600 group-hover:text-white'
                  }`}
                  title={victim.status === 'Dispatched' ? "View Assigned Volunteer" : "View Details"}
                >
                  <ChevronRight className={`w-4 h-4 ${selectedVictim?._id === victim._id ? 'rotate-90' : ''}`} />
                </button>
              </div>
            </motion.div>
          ))}
          {filteredVictims.length === 0 && (
            <div className="py-20 text-center text-gray-600">No active reports found</div>
          )}
        </div>
      </div>

      {/* Main Map View */}
      <div className="flex-1 rounded-[3rem] overflow-hidden border border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 shadow-2xl relative">
        {/* Map Image Placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full relative overflow-hidden">
            {/* Static Map Background */}
            <svg className="w-full h-full" viewBox="0 0 1000 800" xmlns="http://www.w3.org/2000/svg">
              {/* Map background */}
              <defs>
                <pattern id="water" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                  <path d="M0,50 Q25,40 50,50 T100,50" stroke="#e0f2fe" strokeWidth="2" fill="none" opacity="0.3"/>
                </pattern>
              </defs>
              
              {/* City grid */}
              <rect width="1000" height="800" fill="#f8fafc"/>
              <g stroke="#e2e8f0" strokeWidth="1">
                <line x1="0" y1="0" x2="1000" y2="0" />
                <line x1="0" y1="200" x2="1000" y2="200" />
                <line x1="0" y1="400" x2="1000" y2="400" />
                <line x1="0" y1="600" x2="1000" y2="600" />
                <line x1="0" y1="800" x2="1000" y2="800" />
                <line x1="0" y1="0" x2="0" y2="800" />
                <line x1="250" y1="0" x2="250" y2="800" />
                <line x1="500" y1="0" x2="500" y2="800" />
                <line x1="750" y1="0" x2="750" y2="800" />
                <line x1="1000" y1="0" x2="1000" y2="800" />
              </g>
              
              {/* Water features */}
              <circle cx="100" cy="700" r="60" fill="#bfdbfe" opacity="0.4"/>
              <circle cx="900" cy="150" r="80" fill="#bfdbfe" opacity="0.3"/>
              
              {/* Roads */}
              <path d="M0,350 Q250,300 500,350 T1000,350" stroke="#fbbf24" strokeWidth="8" fill="none" opacity="0.6"/>
              <path d="M400,100 L400,800" stroke="#fbbf24" strokeWidth="6" fill="none" opacity="0.5"/>
              
              {/* Buildings */}
              <rect x="150" y="100" width="60" height="80" fill="#cbd5e1" opacity="0.7"/>
              <rect x="250" y="150" width="70" height="100" fill="#cbd5e1" opacity="0.6"/>
              <rect x="150" y="250" width="80" height="90" fill="#cbd5e1" opacity="0.7"/>
              <rect x="700" y="250" width="90" height="110" fill="#cbd5e1" opacity="0.6"/>
              <rect x="750" y="450" width="75" height="95" fill="#cbd5e1" opacity="0.7"/>

              {/* Dynamic Victim Markers */}
              {filteredVictims.map((v) => {
                const { x, y } = getSVGCoords(v.location.lat, v.location.lng);
                const isSelected = selectedVictim?._id === v._id;
                
                return (
                  <g 
                    key={v._id} 
                    className="cursor-pointer" 
                    onClick={() => setSelectedVictim(v)}
                    onDoubleClick={() => window.open(`https://www.google.com/maps?q=${v.location.lat},${v.location.lng}`, '_blank')}
                  >
                    {isSelected && (
                      <motion.circle 
                        cx={x} cy={y} r={25} 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        fill={v.severity === 'Critical' ? '#dc2626' : '#d97706'}
                      />
                    )}
                    <motion.circle 
                      cx={x} cy={y} 
                      r={isSelected ? 10 : 6} 
                      fill={v.severity === 'Critical' ? '#dc2626' : 
                            v.severity === 'Trapped' ? '#d97706' : 
                            v.severity === 'Injured' ? '#2563eb' : '#059669'}
                      stroke="white"
                      strokeWidth={2}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      whileHover={{ scale: 1.2 }}
                    />
                  </g>
                );
              })}
            </svg>
            
            {/* Overlay content - Made non-blocking and conditional */}
            <div className={`absolute inset-0 flex items-center justify-center bg-black/5 pointer-events-none ${filteredVictims.length > 0 ? 'backdrop-blur-none' : 'backdrop-blur-sm'}`}>
              {filteredVictims.length === 0 && (
                <div className="text-center space-y-3">
                  <MapPin className="w-20 h-20 text-red-400 mx-auto opacity-40" />
                  <h3 className="text-2xl font-display font-black text-gray-600 uppercase tracking-tighter italic">Live Rescue Map</h3>
                  <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Scanning sector • No active reports</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Stats Overlay */}
        <div className="absolute top-6 right-6 z-10 bg-white/90 backdrop-blur-md border border-gray-200 rounded-2xl p-4 shadow-lg">
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-600"></div>
              <span className="font-bold text-gray-900">Critical: {victims.filter(v => v.severity === 'Critical').length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-600"></div>
              <span className="font-bold text-gray-900">Trapped: {victims.filter(v => v.severity === 'Trapped').length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-600"></div>
              <span className="font-bold text-gray-900">Safe: {victims.filter(v => v.severity === 'Safe').length}</span>
            </div>
          </div>
        </div>

        {/* Selected Victim Details Panel */}
        <AnimatePresence>
          {selectedVictim && (
            <motion.div 
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              className="absolute top-6 right-6 bottom-6 w-[400px] bg-white border border-gray-300 rounded-[2.5rem] shadow-2xl shadow-gray-300/30 z-20 flex flex-col p-8 overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-8">
                 <div>
                    <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] mb-2 block italic">Emergency Dossier</span>
                    <h2 className="text-3xl font-display font-black tracking-tight uppercase leading-none italic text-gray-900">{selectedVictim.name}</h2>
                    <p className="text-gray-600 text-xs font-bold uppercase tracking-widest mt-2">{selectedVictim._id.toUpperCase()}</p>
                 </div>
                 <button onClick={() => setSelectedVictim(null)} className="p-3 hover:bg-gray-100 rounded-2xl transition-colors">
                    <X className="w-5 h-5 text-gray-600" />
                 </button>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-100 p-5 rounded-2xl border border-gray-300">
                    <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest mb-2">Severity Index</p>
                    <p className={`font-display font-black text-xl uppercase italic ${
                       selectedVictim.severity === 'Critical' ? 'text-red-600' :
                       selectedVictim.severity === 'Trapped' ? 'text-amber-600' : 'text-blue-600'
                    }`}>{selectedVictim.severity}</p>
                  </div>
                  <div className="bg-gray-100 p-5 rounded-2xl border border-gray-300">
                    <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest mb-2">Soul Count</p>
                    <p className="text-gray-900 font-display font-black text-xl uppercase italic">{selectedVictim.peopleCount} TOTAL</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-4">Situational Intelligence</h4>
                  <div className="text-sm leading-relaxed bg-gray-100 p-6 rounded-[1.5rem] border border-gray-300 text-gray-700 font-medium italic">
                    "{selectedVictim.description}"
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-4">Command Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {['Pending', 'Dispatched', 'Rescued', 'Closed'].map(status => (
                      <button 
                        key={status}
                        onClick={() => updateStatus(selectedVictim._id, status)}
                        className={`py-4 px-4 rounded-xl text-[10px] font-black tracking-widest uppercase border transition-all flex flex-col items-center gap-1 ${
                          selectedVictim.status === status 
                          ? 'bg-red-600 border-red-500 text-white shadow-xl shadow-red-600/30' 
                          : 'bg-gray-200 border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {status}
                        {selectedVictim.status === status && <CheckCircle2 className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={() => window.open(`https://www.google.com/maps?q=${selectedVictim.location.lat},${selectedVictim.location.lng}`, '_blank')}
                    className="w-full py-5 bg-emerald-600/10 text-emerald-700 border-2 border-emerald-600/20 font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-emerald-600 hover:text-white transition-all uppercase tracking-[0.2em] text-sm shadow-xl"
                  >
                    <MapPin className="w-5 h-5" />
                    NAVIGATE VIA GPS
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* Volunteer Detail Modal */}
      <AnimatePresence>
        {viewingVolunteer && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setViewingVolunteer(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative h-32 bg-gradient-to-r from-blue-600 to-blue-500 flex items-center justify-center">
                <div className="absolute top-6 right-6">
                  <button 
                    onClick={() => setViewingVolunteer(null)}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="w-24 h-24 rounded-3xl bg-white flex items-center justify-center shadow-xl translate-y-12">
                  <User className="w-12 h-12 text-blue-600" />
                </div>
              </div>

              {/* Content */}
              <div className="pt-16 pb-12 px-8 text-center">
                {viewingVolunteer._id === 'none' ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-10"
                  >
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <AlertCircle className="w-10 h-10 text-gray-400" />
                    </div>
                    <h2 className="text-3xl font-display font-black text-gray-900 uppercase italic tracking-tighter mb-2">No One Assigned</h2>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Awaiting active volunteer response</p>
                  </motion.div>
                ) : (
                  <>
                    <div className="mb-6">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-2 block">Assigned Volunteer</span>
                      <h2 className="text-3xl font-display font-black text-gray-900 uppercase italic tracking-tighter">{viewingVolunteer.name}</h2>
                    </div>

                    <div className="grid grid-cols-1 mb-8">
                      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 w-full">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <Phone className="w-3.5 h-3.5 text-blue-600" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Contact Number</span>
                        </div>
                        <p className="font-bold text-gray-900 text-xl tracking-wider">{viewingVolunteer.phone}</p>
                      </div>
                    </div>

                    {viewingVolunteer.skills && viewingVolunteer.skills.length > 0 && (
                      <div className="text-left bg-gray-50 rounded-[1.5rem] p-6 border border-gray-100">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                          <Zap className="w-3.5 h-3.5 text-amber-500" /> Specialized Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {viewingVolunteer.skills.map(skill => (
                            <span key={skill} className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-[10px] font-black text-gray-700 uppercase tracking-tight">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <button 
                      onClick={() => window.open(`tel:${viewingVolunteer.phone}`)}
                      className="w-full mt-8 py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl flex items-center justify-center gap-2 uppercase tracking-[0.2em] text-xs shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                    >
                      <Phone className="w-4 h-4" /> Start Direct Call
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoordinatorDashboard;
