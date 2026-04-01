const mongoose = require('mongoose');
const Victim = require('./models/Victim');
const Volunteer = require('./models/Volunteer');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rescuemap';

const clearData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    
    const victimDeleteResult = await Victim.deleteMany({});
    console.log(`Deleted ${victimDeleteResult.deletedCount} victims`);
    
    const volunteerDeleteResult = await Volunteer.deleteMany({});
    console.log(`Deleted ${volunteerDeleteResult.deletedCount} volunteers`);
    
    console.log('Database cleared successfully');
    process.exit(0);
  } catch (err) {
    console.error('Clearing database failed:', err);
    process.exit(1);
  }
};

clearData();
