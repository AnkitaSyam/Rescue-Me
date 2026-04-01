const express = require('express');
const router = express.Router();
const Victim = require('../models/Victim');
const Volunteer = require('../models/Volunteer');

// Calculate Priority Score Utility
const calculatePriority = (severity, people, timeSince) => {
  const severityPoints = {
    'Critical': 100,
    'Trapped': 80,
    'Injured': 60,
    'Safe': 20
  };
  
  // Weights: Severity (50%), People (30%), Time (20%)
  const severityScore = (severityPoints[severity] || 0) * 0.5;
  const peopleScore = Math.min(people * 10, 30); // Max 30 points for people
  
  // Time points: 1 point per 5 minutes since alert, max 20
  const minutesSince = Math.floor((Date.now() - new Date(timeSince).getTime()) / 60000);
  const timeScore = Math.min(Math.floor(minutesSince / 5), 20);
  
  return severityScore + peopleScore + timeScore;
};

// POST Report Distress
router.post('/report', async (req, res) => {
  const { name, phone, location, severity, peopleCount, description, media } = req.body;
  
  try {
    const priorityScore = calculatePriority(severity, peopleCount, new Date());
    
    const newVictim = new Victim({
      name, phone, location, severity, peopleCount, description, media, priorityScore
    });
    
    await newVictim.save();
    
    // Emit real-time update to all coordinators via socket.io
    const io = req.app.get('socketio');
    io.emit('new-emergency', newVictim);
    
    res.status(201).json({ success: true, victim: newVictim });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET All Active Victims (exclude Rescued and Closed)
router.get('/victims', async (req, res) => {
  try {
    const victims = await Victim.find({ status: { $nin: ['Closed', 'Rescued'] } })
      .sort({ priorityScore: -1 })
      .populate('assignedVolunteer'); // Added populate
    res.json(victims);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH Update Victim Status
router.patch('/victims/:id', async (req, res) => {
  const { status, assignedTeam } = req.body;
  
  try {
    const victim = await Victim.findByIdAndUpdate(req.params.id, { status, assignedTeam }, { new: true });
    
    const io = req.app.get('socketio');
    io.emit('status-update', victim);
    
    res.json({ success: true, victim });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Broadcast Alerts
router.post('/broadcast', async (req, res) => {
  const { title, message, radius, center } = req.body;
  
  try {
    const io = req.app.get('socketio');
    io.emit('emergency-broadcast', { title, message, radius, center, timestamp: new Date() });
    res.json({ success: true, message: 'Broadcast sent' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST Register Volunteer
router.post('/volunteers/register', async (req, res) => {
  const { name, phone, password, dob, skills, location } = req.body;
  try {
    if (!name || !phone || !password || !dob) {
      return res.status(400).json({ success: false, error: 'Name, phone, password and date of birth are required.' });
    }

    // Calculate age from DOB and enforce 18+
    const dobDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const monthDiff = today.getMonth() - dobDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) age--;

    if (age < 18) {
      return res.status(400).json({ success: false, error: 'You must be 18 or older to register as a volunteer.' });
    }

    const existing = await Volunteer.findOne({ phone });
    if (existing) return res.status(400).json({ success: false, error: 'Phone already registered. Please login.' });

    const volunteer = new Volunteer({
      name, phone, password, dob: dobDate,
      skills: skills || [],
      location: location || { lat: 0, lng: 0 }
    });
    await volunteer.save();
    // Return without password, with calculated age
    const safe = volunteer.toObject();
    delete safe.password;
    safe.age = age;
    res.status(201).json({ success: true, volunteer: safe });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST Login Volunteer (phone + password)
router.post('/volunteers/login', async (req, res) => {
  const { phone, password } = req.body;
  try {
    if (!phone || !password) return res.status(400).json({ success: false, error: 'Phone and password are required.' });
    const volunteer = await Volunteer.findOne({ phone }).populate('activeTasks');
    if (!volunteer) return res.status(404).json({ success: false, error: 'No account found with this phone number.' });
    if (volunteer.password !== password) return res.status(401).json({ success: false, error: 'Incorrect password.' });
    const safe = volunteer.toObject();
    delete safe.password;
    res.json({ success: true, volunteer: safe });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST Assign victim to volunteer (En Route)
router.post('/volunteers/:id/assign/:victimId', async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer) return res.status(404).json({ success: false, error: 'Volunteer not found' });
    
    if (!volunteer.activeTasks.includes(req.params.victimId)) {
      volunteer.activeTasks.push(req.params.victimId);
      await volunteer.save();
    }

    // Update victim status and link the volunteer
    const victim = await Victim.findByIdAndUpdate(
      req.params.victimId,
      { status: 'Dispatched', assignedVolunteer: req.params.id }, // Added volunteer ID
      { new: true }
    ).populate('assignedVolunteer'); // Populate before emitting

    const io = req.app.get('socketio');
    io.emit('status-update', victim);

    res.json({ success: true, volunteer, victim });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET Volunteer with active tasks populated
router.get('/volunteers/:id', async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id).populate('activeTasks');
    if (!volunteer) return res.status(404).json({ success: false, error: 'Volunteer not found' });
    res.json({ success: true, volunteer });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
