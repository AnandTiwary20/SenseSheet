const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Configuration
const mongoURI = 'mongodb://0.0.0.0:27017/dataviz'; 
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Data Schema and Model
const dataSchema = new mongoose.Schema({
  // Define the data schema here
  name: String,
  age: Number,
});

const Data = mongoose.model('Data', dataSchema);

// API Routes
app.post('/api/saveData', async (req, res) => {
  try {
    const { data } = req.body;

  
    await Data.insertMany(data);
    console.log('Data saved to MongoDB');

    res.status(200).json({ message: 'Data saved to MongoDB' });
  } catch (error) {
    console.error('Error saving data to MongoDB:', error);
    res.status(500).json({ error: 'Error saving data to MongoDB' });
  }
});


const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
