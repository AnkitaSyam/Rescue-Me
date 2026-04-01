import React, { useState, useEffect } from 'react';
import { Users, Shield, MapPin, CheckCircle, ArrowRight, Heart, Award, Zap,
         LogIn, UserPlus, Navigation, Phone, Clock, AlertTriangle, X,
         ChevronRight, Loader, LogOut, Lock, Eye, EyeOff, User, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API = `${API_BASE_URL}/api`;

const SKILLS = [
  { id: 'First Aid',     label: 'First Aid',     emoji: '🩹' },
  { id: 'Swimming',      label: 'Swimming',       emoji: '🏊' },
  { id: 'Climbing',      label: 'Climbing',       emoji: '🧗' },
  { id: 'Medical',       label: 'Medical',        emoji: '🏥' },
  { id: 'Boat Owner',    label: 'Boat Owner',     emoji: '⛵' },
  { id: 'Heavy Driving', label: 'Heavy Driving',  emoji: '🚛' },
  { id: 'Fire Safety',   label: 'Fire Safety',    emoji: '🔥' },
  { id: 'Search & Rescue', label: 'Search & Rescue', emoji: '🔦' },
];

const severityStyle = {
  Critical: 'bg-red-100 text-red-600 border-red-300',
  Trapped:  'bg-orange-100 text-orange-600 border-orange-300',
  Injured:  'bg-blue-100 text-blue-600 border-blue-300',
  Safe:     'bg-emerald-100 text-emerald-600 border-emerald-300',
};

// ─── helpers ────────────────────────────────────────────────
const openGoogleMaps = (lat, lng) =>
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`, '_blank');

const fmtTime = (dt) =>
  new Date(dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// ════════════════════════════════════════════════════════════
const VolunteerPortal = ({ socket }) => {
  // ── session ──
  const [volunteer, setVolunteer] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rescuemap_volunteer')); } catch { return null; }
  });

  // ── auth form ──
  const [authMode, setAuthMode]       = useState('login');   // 'login' | 'register'
  const [showPwd, setShowPwd]         = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError]     = useState('');
  const [form, setForm] = useState({ name: '', phone: '', password: '', dob: '', skills: [] });

  // ── main view ──
  const [view, setView]               = useState('alerts');   // 'alerts' | 'tracking'
  const [nearbyAlerts, setNearbyAlerts] = useState([]);
  const [activeRescue, setActiveRescue] = useState(null);
  const [enRouteId, setEnRouteId]     = useState(null);

  // ─── real-time & initial load ───────────────────────────
  useEffect(() => {
    if (!volunteer) return;
    fetchAlerts();
    refreshVolunteer();
    if (socket) {
      const onNew = () => fetchAlerts();
      socket.on('new-emergency', onNew);
      socket.on('emergency-broadcast', onNew);
      return () => { socket.off('new-emergency', onNew); socket.off('emergency-broadcast', onNew); };
    }
  }, [volunteer, socket]);

  const fetchAlerts = async () => {
    try {
      const { data } = await axios.get(`${API}/victims`);
      setNearbyAlerts(data.filter(v => v.status === 'Pending'));
    } catch {}
  };

  const refreshVolunteer = async () => {
    if (!volunteer?._id) return;
    try {
      const { data } = await axios.get(`${API}/volunteers/${volunteer._id}`);
      if (data.success) {
        save(data.volunteer);
        if (data.volunteer.activeTasks?.length)
          setActiveRescue(data.volunteer.activeTasks.at(-1));
      }
    } catch {}
  };

  const save = (vol) => {
    setVolunteer(vol);
    localStorage.setItem('rescuemap_volunteer', JSON.stringify(vol));
  };

  // ─── auth ────────────────────────────────────────────────
  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const toggleSkill = (id) =>
    setField('skills', form.skills.includes(id)
      ? form.skills.filter(s => s !== id)
      : [...form.skills, id]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      if (authMode === 'login') {
        if (!form.phone || !form.password) { setAuthError('Phone and password are required.'); return; }
        const { data } = await axios.post(`${API}/volunteers/login`, { phone: form.phone, password: form.password });
        if (!data.success) return setAuthError(data.error);
        save(data.volunteer);
        if (data.volunteer.activeTasks?.length) {
          setActiveRescue(data.volunteer.activeTasks.at(-1));
          setView('tracking');
        }
      } else {
        if (!form.name || !form.phone || !form.password || !form.dob)
          return setAuthError('All fields marked * are required.');

        // Age validation from DOB
        const dobDate = new Date(form.dob);
        const today = new Date();
        let calcAge = today.getFullYear() - dobDate.getFullYear();
        const m = today.getMonth() - dobDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) calcAge--;
        if (calcAge < 18)
          return setAuthError(`You must be 18 or older to register. Your age: ${calcAge}.`);

        let location = { lat: 0, lng: 0 };
        await new Promise(res => navigator.geolocation.getCurrentPosition(
          p => { location = { lat: p.coords.latitude, lng: p.coords.longitude }; res(); },
          () => res()
        ));

        const { data } = await axios.post(`${API}/volunteers/register`, {
          name: form.name, phone: form.phone, password: form.password,
          dob: form.dob, skills: form.skills, location
        });
        if (!data.success) return setAuthError(data.error);
        save(data.volunteer);
      }
    } catch (err) {
      setAuthError(err.response?.data?.error || 'Something went wrong. Try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('rescuemap_volunteer');
    setVolunteer(null);
    setActiveRescue(null);
    setView('alerts');
    setNearbyAlerts([]);
    setAuthMode('login');
    setForm({ name: '', phone: '', password: '', dob: '', skills: [] });
    setAuthError('');
  };

  // ─── en route ────────────────────────────────────────────
  const handleEnRoute = async (alert) => {
    if (!volunteer?._id) return;
    setEnRouteId(alert._id);
    try {
      const { data } = await axios.post(`${API}/volunteers/${volunteer._id}/assign/${alert._id}`);
      if (data.success) {
        setActiveRescue(alert);
        setView('tracking');
        setNearbyAlerts(prev => prev.filter(a => a._id !== alert._id));
        save(data.volunteer);
      }
    } catch {}
    finally { setEnRouteId(null); }
  };

  // ─── mark rescued ─────────────────────────────────────────
  const handleMarkResolved = async () => {
    if (!activeRescue?._id) return;
    try {
      await axios.patch(`${API}/victims/${activeRescue._id}`, { status: 'Rescued' });
      // Remove from volunteer's active tasks locally
      setActiveRescue(null);
      setView('alerts');
      // Refresh volunteer stats
      refreshVolunteer();
    } catch (err) {
      console.error('Failed to mark as rescued:', err);
    }
  };

  // ════════════════════════════════════════════════════════════
  // AUTH SCREEN
  // ════════════════════════════════════════════════════════════
  if (!volunteer) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
        <div className="w-full max-w-md">

          {/* Logo */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <div className="inline-block p-4 bg-red-100 border border-red-200 rounded-3xl mb-4">
              <Heart className="w-10 h-10 text-red-600 fill-red-200" />
            </div>
            <h1 className="text-4xl font-display font-black uppercase italic tracking-tighter text-gray-900">Volunteer Hub</h1>
            <p className="text-gray-500 mt-1 text-sm font-medium">Join and coordinate rescue efforts</p>
          </motion.div>

          {/* Tab toggle */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="flex bg-white border border-gray-200 rounded-2xl p-1 mb-6 shadow-sm"
          >
            {[['login', 'Login', LogIn], ['register', 'Register', UserPlus]].map(([mode, label, Icon]) => (
              <button key={mode} onClick={() => { setAuthMode(mode); setAuthError(''); setForm({ name: '', phone: '', password: '', age: '', skills: [] }); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  authMode === mode ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </motion.div>

          {/* Form card */}
          <motion.form key={authMode}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            onSubmit={handleAuth}
            className="bg-white border border-gray-200 rounded-3xl p-8 shadow-xl space-y-4"
          >
            {/* Error */}
            <AnimatePresence>
              {authError && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium"
                >
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {authError}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Register fields ── */}
            {authMode === 'register' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1">
                  <User className="w-3 h-3" /> Full Name <span className="text-red-600">*</span>
                </label>
                <input value={form.name} onChange={e => setField('name', e.target.value)} required type="text"
                  placeholder="Your full name"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 outline-none font-medium bg-gray-50"
                />
              </div>
            )}

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1">
                <Phone className="w-3 h-3" /> Phone Number <span className="text-red-600">*</span>
              </label>
              <input value={form.phone} onChange={e => setField('phone', e.target.value)} required type="tel"
                placeholder="+91 98765 43210"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 outline-none font-medium bg-gray-50"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Password <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <input value={form.password} onChange={e => setField('password', e.target.value)} required
                  type={showPwd ? 'text' : 'password'} placeholder="Enter password"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm focus:ring-2 focus:ring-red-500 outline-none font-medium bg-gray-50"
                />
                <button type="button" onClick={() => setShowPwd(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* DOB — register only */}
            {authMode === 'register' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Date of Birth <span className="text-red-600">*</span>
                </label>
                <input
                  value={form.dob}
                  onChange={e => {
                    setField('dob', e.target.value);
                  }}
                  required
                  type="date"
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 outline-none font-medium bg-gray-50"
                />
                {form.dob && (() => {
                  const d = new Date(form.dob);
                  const t = new Date();
                  let a = t.getFullYear() - d.getFullYear();
                  const m = t.getMonth() - d.getMonth();
                  if (m < 0 || (m === 0 && t.getDate() < d.getDate())) a--;
                  return (
                    <p className={`text-xs font-bold ${a < 18 ? 'text-red-500' : 'text-emerald-600'}`}>
                      {a < 18 ? `⚠ Under 18 — not eligible (age: ${a})` : `✓ Age: ${a} — eligible`}
                    </p>
                  );
                })()}
              </div>
            )}

            {/* Skills — register only */}
            {authMode === 'register' && (
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Specialized Skills
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SKILLS.map(({ id, label, emoji }) => {
                    const active = form.skills.includes(id);
                    return (
                      <button key={id} type="button" onClick={() => toggleSkill(id)}
                        className={`flex items-center gap-2.5 px-3 py-3 rounded-xl border text-left transition-all duration-200 ${
                          active
                            ? 'bg-red-600 border-red-600 text-white shadow-md shadow-red-600/20'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-md flex items-center justify-center text-xs flex-shrink-0 ${active ? 'bg-white/20' : 'bg-white border border-gray-300'}`}>
                          {active ? '✓' : emoji}
                        </span>
                        <span className="text-xs font-black uppercase tracking-tight leading-tight">{label}</span>
                      </button>
                    );
                  })}
                </div>
                {form.skills.length > 0 && (
                  <p className="text-xs text-red-600 font-bold">{form.skills.length} skill{form.skills.length > 1 ? 's' : ''} selected</p>
                )}
              </div>
            )}

            {/* Submit */}
            <motion.button type="submit" disabled={authLoading}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-gradient-to-r from-red-600 to-red-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest text-sm shadow-lg disabled:opacity-60 mt-2"
            >
              {authLoading
                ? <Loader className="w-5 h-5 animate-spin" />
                : authMode === 'login'
                  ? <><LogIn className="w-4 h-4" /> Sign In</>
                  : <><UserPlus className="w-4 h-4" /> Create Account</>
              }
            </motion.button>
          </motion.form>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // TRACKING VIEW
  // ════════════════════════════════════════════════════════════
  if (view === 'tracking' && activeRescue) {
    const v = activeRescue;
    return (
      <div className="min-h-screen py-12 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-red-600">Active Rescue</span>
              <h1 className="text-3xl font-display font-black uppercase italic text-gray-900 tracking-tighter">En Route</h1>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setView('alerts')}
                className="px-4 py-2 border border-gray-300 bg-white rounded-xl text-xs font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition shadow-sm"
              >← Alerts</button>
              <button onClick={handleLogout} title="Logout"
                className="flex items-center gap-2 px-4 py-2 border border-red-200 bg-red-50 rounded-xl text-xs font-black uppercase tracking-widest text-red-600 hover:bg-red-100 transition shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>
          </motion.div>

          {/* Victim Card */}
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            className="bg-white border border-gray-200 rounded-3xl p-8 shadow-xl space-y-6"
          >
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-black tracking-widest px-3 py-1.5 rounded-full uppercase border ${severityStyle[v.severity] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                {v.severity}
              </span>
              <span className="flex items-center gap-2 text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-widest">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Dispatched
              </span>
            </div>

            <div>
              <h2 className="text-3xl font-display font-black uppercase italic text-gray-900 tracking-tighter mb-1">{v.name}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Users className="w-4 h-4 text-red-600" />
                <span className="font-bold">{v.peopleCount} {v.peopleCount > 1 ? 'persons' : 'person'} involved</span>
              </div>
            </div>

            {v.description && (
              <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 text-sm text-gray-700 font-medium italic">
                "{v.description}"
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Contact</p>
                <p className="text-sm font-black text-gray-900">{v.phone || 'Not provided'}</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Reported At</p>
                <p className="text-sm font-black text-gray-900">{fmtTime(v.createdAt)}</p>
              </div>
            </div>

            {/* GPS */}
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-5 flex items-center gap-4">
              <div className="p-3 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-600/20 flex-shrink-0">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">GPS Location</p>
                <p className="text-sm font-black text-emerald-800 font-mono">
                  {v.location.lat.toFixed(6)}, {v.location.lng.toFixed(6)}
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              {/* Resolve */}
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleMarkResolved}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest text-xs shadow-lg shadow-blue-600/20"
              >
                <CheckCircle className="w-4 h-4" /> Mark as Rescued
              </motion.button>

              <div className="grid grid-cols-2 gap-3">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => openGoogleMaps(v.location.lat, v.location.lng)}
                  className="py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest text-xs shadow-lg shadow-emerald-600/20"
                >
                  <Navigation className="w-4 h-4" /> Navigate
                </motion.button>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => v.phone && window.open(`tel:${v.phone}`)}
                  disabled={!v.phone}
                  className="py-4 bg-gray-100 text-gray-700 border border-gray-200 font-black rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest text-xs hover:bg-gray-200 transition disabled:opacity-40"
                >
                  <Phone className="w-4 h-4 text-red-600" /> Call Victim
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Volunteer badge */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="flex items-center gap-4 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm"
          >
            <div className="p-3 bg-red-100 rounded-xl flex-shrink-0">
              <Shield className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Responding</p>
              <p className="text-base font-black text-gray-900">{volunteer.name}</p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // MAIN ALERTS VIEW (logged in)
  // ════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen py-12 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">

        {/* ── Left sidebar ── */}
        <div className="lg:col-span-1 space-y-5">

          {/* Profile card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-600 to-red-700" />
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute -right-16 -bottom-16 w-36 h-36 bg-white/10 rounded-full"
            />
            <div className="relative z-10 p-7 text-white">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-200 mb-0.5">Volunteer</p>
                  <h2 className="text-2xl font-display font-black tracking-tighter uppercase leading-none">{volunteer.name}</h2>
                  {volunteer.age && <p className="text-red-200 text-xs mt-1 font-bold">Age {volunteer.age}</p>}
                </div>
              </div>

              {/* Skills */}
              {volunteer.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {volunteer.skills.map(s => (
                    <span key={s} className="text-[9px] font-black uppercase tracking-widest bg-white/15 rounded-lg px-2 py-1">{s}</span>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="space-y-3 border-t border-white/20 pt-4">
                {[['Rescues', volunteer.activeTasks?.length || 0], ['Efficiency', '94%'], ['Points', (volunteer.activeTasks?.length || 0) * 50]].map(([lbl, val]) => (
                  <div key={lbl} className="flex justify-between items-end pb-3 border-b border-white/20 last:border-0 last:pb-0">
                    <span className="text-[10px] font-black text-red-200 uppercase tracking-widest">{lbl}</span>
                    <span className="text-3xl font-display font-black italic leading-none">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Resume active rescue */}
          {activeRescue && (
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              onClick={() => setView('tracking')}
              className="w-full text-left bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-5 hover:bg-emerald-100 transition group shadow-sm"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Active Rescue</span>
              </div>
              <p className="text-base font-black text-gray-900 uppercase italic">{activeRescue.name}</p>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{activeRescue.description}</p>
              <span className="flex items-center gap-1 text-emerald-700 text-[10px] font-black uppercase tracking-widest mt-3 group-hover:gap-2 transition-all">
                Resume Tracking <ChevronRight className="w-3 h-3" />
              </span>
            </motion.button>
          )}

          {/* Achievements */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"
          >
            <h3 className="text-[10px] font-black uppercase tracking-widest text-red-600 flex items-center gap-1.5 mb-3">
              <Award className="w-3.5 h-3.5" /> Achievements
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {['🚑', '🦉', '🌊', '🧗'].map((e, i) => (
                <motion.div key={i} whileHover={{ scale: 1.15, rotate: 8 }}
                  className="aspect-square rounded-xl bg-gray-100 flex items-center justify-center text-xl cursor-pointer grayscale hover:grayscale-0 transition"
                >{e}</motion.div>
              ))}
            </div>
          </motion.div>

          {/* Logout */}
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-red-200 text-red-600 font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-sm"
          >
            <LogOut className="w-4 h-4" /> Logout
          </motion.button>
        </div>

        {/* ── Alerts ── */}
        <div className="lg:col-span-2 space-y-5">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          >
            <div>
              <h2 className="text-4xl font-display font-black tracking-tight uppercase text-gray-900">Priority Alerts</h2>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Real-time distress notifications</p>
            </div>
            <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 rounded-full shadow-sm self-start"
            >
              <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                className="w-2 h-2 bg-red-600 rounded-full"
              />
              <span className="text-[10px] text-red-600 font-black uppercase tracking-widest">Scanning</span>
            </motion.div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4">
            <AnimatePresence>
              {nearbyAlerts.map((alert, idx) => (
                <motion.div key={alert._id}
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: idx * 0.04 }}
                  className="bg-white border border-gray-200 rounded-3xl p-6 shadow-md hover:shadow-xl hover:border-gray-300 transition-all relative overflow-hidden"
                >
                  {/* severity accent */}
                  <div className={`absolute top-0 left-0 w-1 h-full rounded-l-3xl ${
                    alert.severity === 'Critical' ? 'bg-red-600' :
                    alert.severity === 'Trapped'  ? 'bg-orange-500' :
                    alert.severity === 'Injured'  ? 'bg-blue-500' : 'bg-emerald-500'
                  }`} />

                  <div className="space-y-4 pl-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black tracking-widest px-3 py-1 rounded-full uppercase border ${severityStyle[alert.severity]}`}>
                        {alert.severity}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {fmtTime(alert.createdAt)}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-display font-black uppercase italic tracking-tight text-gray-900 mb-1">{alert.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-red-500 font-bold">
                        <MapPin className="w-3 h-3" />
                        {alert.location.lat.toFixed(5)}, {alert.location.lng.toFixed(5)}
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase border ${severityStyle[alert.severity]}`}>{alert.severity}</span>
                      <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200 uppercase">{alert.peopleCount} person{alert.peopleCount > 1 ? 's' : ''}</span>
                    </div>

                    {alert.description && (
                      <p className="text-xs text-gray-600 font-medium italic px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
                        "{alert.description}"
                      </p>
                    )}

                    <div className="flex gap-2 pt-1">
                      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={() => handleEnRoute(alert)}
                        className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-black rounded-xl flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest shadow-md"
                      >
                        {enRouteId === alert._id ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                        En Route
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.03 }}
                        onClick={() => openGoogleMaps(alert.location.lat, alert.location.lng)}
                        className="px-3 py-3 bg-emerald-50 text-emerald-700 font-black rounded-xl text-[10px] uppercase tracking-widest border border-emerald-200 hover:bg-emerald-100 transition flex items-center gap-1"
                      >
                        <Navigation className="w-3 h-3" /> Map
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.03 }}
                        onClick={() => alert.phone && window.open(`tel:${alert.phone}`)}
                        className="px-3 py-3 bg-gray-100 text-gray-600 font-black rounded-xl text-[10px] uppercase tracking-widest border border-gray-200 hover:bg-gray-200 transition"
                      >
                        Call
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {nearbyAlerts.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="col-span-full py-20 text-center bg-white border border-dashed border-gray-200 rounded-3xl"
              >
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }} className="mb-4">
                  <Shield className="w-14 h-14 text-gray-300 mx-auto" />
                </motion.div>
                <p className="text-gray-900 font-black text-xl uppercase tracking-tighter">All Clear</p>
                <p className="text-gray-400 text-sm font-medium mt-1">No active alerts in your sector</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerPortal;
