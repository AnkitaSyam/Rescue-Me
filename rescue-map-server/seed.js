const mongoose = require('mongoose');
const Victim = require('./models/Victim');
const Volunteer = require('./models/Volunteer');

const MONGO_URI = 'mongodb://localhost:27017/rescuemap';

const dummyVictims = [];

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    
    await Victim.deleteMany({});
    await Volunteer.deleteMany({});
    
    if (dummyVictims.length > 0) {
      await Victim.insertMany(dummyVictims);
      console.log('Seed data inserted successfully');
    } else {
      console.log('Database cleared. No seed data to insert.');
    }
    
    process.exit();
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seedData();
