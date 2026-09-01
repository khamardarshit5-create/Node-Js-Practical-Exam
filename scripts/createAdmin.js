
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function run() {
  const [, , argUsername, argEmail, argPassword] = process.argv;

  const username = argUsername || process.env.ADMIN_USERNAME;
  const email = argEmail || process.env.ADMIN_EMAIL;
  const password = argPassword || process.env.ADMIN_PASSWORD;

  if (!username || !email || !password) {
    console.error(
      'Missing admin details. Provide ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD in .env,\n' +
        'or run: node scripts/createAdmin.js <username> <email> <password>'
    );
    process.exit(1);
  }

  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/task_manager';

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      if (existing.role === 'admin') {
        console.log(`User ${email} is already an admin.`);
      } else {
        existing.role = 'admin';
        await existing.save();
        console.log(`Existing user ${email} has been promoted to admin.`);
      }
    } else {
      const admin = new User({
        username,
        email: email.toLowerCase(),
        password,
        role: 'admin'
      });
      await admin.save();
      console.log(`Admin account created: ${email}`);
    }
  } catch (err) {
    console.error('Error creating admin:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
