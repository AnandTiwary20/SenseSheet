const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const { OAuth2Client } = require('google-auth-library');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true
}));
app.use(bodyParser.json());

// Database Configuration
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false
});

// Test the database connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
    
    // Sync all models
    await sequelize.sync({ force: true }); // This will drop and recreate tables
    console.log('✅ Database synchronized');
    
    // Create test user
    await createTestUser();
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
}

testConnection();

// Initialize models
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  googleId: {
    type: DataTypes.STRING,
    unique: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  },
  methods: {
    comparePassword: async function(candidatePassword) {
      return bcrypt.compare(candidatePassword, this.password);
    }
  }
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_development';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// Initialize Google OAuth2 client
const oauth2Client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, 'http://localhost:3000/auth/google/callback');

// Create test user if not exists
async function createTestUser() {
  try {
    const testEmail = 'test@example.com';
    const testPassword = 'password123';
    
    // Check if test user already exists
    const existingUser = await User.findOne({ where: { email: testEmail } });
    
    if (!existingUser) {
      await User.create({
        name: 'Test User',
        email: testEmail,
        password: testPassword // The hook will hash this
      });
      console.log('✅ Test user created:', testEmail, 'with password:', testPassword);
    } else {
      console.log('ℹ️ Test user already exists');
    }
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  }
}

// Google OAuth Routes
app.get('/auth/google', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'],
    redirect_uri: 'http://localhost:3000/auth/google/callback'
  });
  res.redirect(authUrl);
});

app.post('/auth/google/callback', async (req, res) => {
  try {
    const { token: googleToken } = req.body;
    
    // Verify the Google token
    const ticket = await oauth2Client.verifyIdToken({
      idToken: googleToken,
      audience: GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const { email, name, sub } = payload;

    // Find or create user
    const [user, created] = await User.findOrCreate({
      where: { email },
      defaults: {
        name,
        email,
        googleId: sub,
      },
    });

    // Generate JWT token
    const authJwt = jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({ token: authJwt });
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.redirect('http://localhost:3000/login?error=auth_failed');
  }
});

// Auth Routes
// Register
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    
    // Create new user
    const user = await User.create({ name, email, password });
    
    // Generate auth token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: '7d'
    });
    
    // Get user data without password
    const userResponse = user.toJSON();
    
    res.status(201).json({ 
      user: userResponse,
      token 
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ 
      error: error.message || 'Registration failed. Please try again.' 
    });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  console.log('\n🔑 Login attempt - Start ====================');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    console.log('🔍 Looking for user:', email);
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('✅ User found, checking password...');
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      console.log('❌ Invalid password for user:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('🔑 Password match, generating token...');
    const token = jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: '7d'
    });

    // Get user data without password
    const userResponse = user.toJSON();

    console.log('🎉 Login successful for user:', email);
    console.log('======================================\n');
    res.json({ 
      user: userResponse, 
      token 
    });
    
  } catch (error) {
    console.error('🔥 Login error:', error);
    res.status(500).json({ 
      error: 'An error occurred during login. Please try again.' 
    });
  }
});

// Protected route example
app.get('/api/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Please authenticate' });
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
