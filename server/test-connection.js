const mongoose = require('mongoose');

const mongoURI = 'mongodb+srv://anandtiwari0019:pOCwoE4cZp1Xr0UL@cluster0.naadg17.mongodb.net/sense_sheet?retryWrites=true&w=majority';

console.log('Attempting to connect to MongoDB Atlas...');

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // 5 second timeout
  socketTimeoutMS: 45000, // 45 second socket timeout
})
.then(() => {
  console.log('✅ Successfully connected to MongoDB Atlas!');
  console.log('Database name:', mongoose.connection.name);
  process.exit(0);
})
.catch((error) => {
  console.error('❌ MongoDB connection error:');
  console.error(error);
  process.exit(1);
});
