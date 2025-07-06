const mongoose = require('mongoose');

// MongoDB Configuration - using the same connection string as server.js
const mongoURI = 'mongodb+srv://anandtiwari0019:pOCwoE4cZp1Xr0UL@cluster0.naadg17.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

console.log('Testing MongoDB connection...');
console.log('Connection string:', mongoURI);

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Successfully connected to MongoDB!');
  console.log('Database name:', mongoose.connection.name);
  console.log('Host:', mongoose.connection.host);
  console.log('Port:', mongoose.connection.port);
  process.exit(0);
})
.catch((error) => {
  console.error('❌ MongoDB connection error:');
  console.error(error.message);
  console.log('\nTroubleshooting tips:');
  console.log('1. Check if your MongoDB Atlas cluster is running');
  console.log('2. Verify your connection string in .env file');
  console.log('3. Make sure your IP is whitelisted in MongoDB Atlas Network Access');
  console.log('4. Check if your database user has the correct permissions');
  process.exit(1);
});
