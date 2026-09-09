const mongoose = require('mongoose');
const mockDb = require('../utils/mockStore');

let isConnected = false;
let useMock = process.env.USE_MOCK_DB === 'true';

const connectDB = async () => {
  if (useMock) {
    console.log('[DB] USE_MOCK_DB is true. Running on memory fallback database.');
    await mockDb.init();
    return false;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smartcare_health_network', {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`[MongoDB Warning] Could not connect to local MongoDB (${error.message}).`);
    console.log('[DB Fallback] Gracefully switching to built-in Mock Database store.');
    useMock = true;
    await mockDb.init();
    return false;
  }
};

const getIsMock = () => useMock;

module.exports = {
  connectDB,
  getIsMock,
};
