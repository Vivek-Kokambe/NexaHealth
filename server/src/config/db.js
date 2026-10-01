const mongoose = require('mongoose');
const mockDb = require('../utils/mockStore');

let isConnected = false;
let useMock = process.env.USE_MOCK_DB === 'true';
let connectionPromise;
let mockInitPromise;

const connectDB = async () => {
  if (process.env.VERCEL && process.env.USE_MOCK_DB === 'true') {
    throw new Error('USE_MOCK_DB is not supported on Vercel. Configure MONGODB_URI for persistent data.');
  }

  if (process.env.VERCEL && !process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI must be configured in the Vercel project environment.');
  }

  if (useMock) {
    console.log('[DB] USE_MOCK_DB is true. Running on memory fallback database.');
    if (!mockInitPromise) mockInitPromise = mockDb.init();
    await mockInitPromise;
    return false;
  }

  if (isConnected) return true;
  if (connectionPromise) return connectionPromise;

  connectionPromise = mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smartcare_health_network', {
    serverSelectionTimeoutMS: 3000,
  }).then((conn) => {
    isConnected = true;
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
    return true;
  }).catch(async (error) => {
    connectionPromise = null;
    if (process.env.VERCEL) throw error;

    console.warn(`[MongoDB Warning] Could not connect to local MongoDB (${error.message}).`);
    console.log('[DB Fallback] Gracefully switching to built-in Mock Database store.');
    useMock = true;
    mockInitPromise = mockDb.init();
    await mockInitPromise;
    return false;
  });

  return connectionPromise;
};

const getIsMock = () => useMock;

module.exports = {
  connectDB,
  getIsMock,
};
