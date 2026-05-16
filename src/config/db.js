const mongoose = require('mongoose');
const env = require('./env');

const connectDatabase = async () => {
  if (!env.mongoUri) {
    throw new Error('MONGODB_URI is missing in environment variables.');
  }

  await mongoose.connect(env.mongoUri, {
    dbName: env.dbName,
  });

  return mongoose.connection;
};

module.exports = connectDatabase;
