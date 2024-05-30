const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI || 'mongodb://0.0.0.0:27017/googlebooks';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Connection error:', err);
})

module.exports = mongoose.connection;
