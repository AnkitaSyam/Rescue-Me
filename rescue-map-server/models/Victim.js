const mongoose = require('mongoose');

const victimSchema = new mongoose.Schema({
  name: { type: String, default: 'Anonymous' },
  phone: { type: String },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String }
  },
  severity: {
    type: String,
    enum: ['Safe', 'Injured', 'Trapped', 'Critical'],
    default: 'Safe'
  },
  peopleCount: { type: Number, default: 1 },
  description: { type: String },
  media: [{ type: String }], // URLs to photos/videos
  status: {
    type: String,
    enum: ['Pending', 'Dispatched', 'Rescued', 'Closed'],
    default: 'Pending'
  },
  priorityScore: { type: Number, default: 0 },
  assignedTeam: { type: String, default: null },
  assignedVolunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer', default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Victim', victimSchema);
