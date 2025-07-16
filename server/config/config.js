require('dotenv').config();

const config = {
  // Server Configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    cookieExpiresIn: process.env.JWT_COOKIE_EXPIRES_IN || 30
  },
  
  // Database Configuration
  db: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/sensesheet',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    }
  },
  
  // CORS Configuration
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:5000',
      'https://sensesheet-frontend.onrender.com',
      'https://sensesheet-backend.onrender.com'
    ],
    credentials: true
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },
  
  // Security
  security: {
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      }
    }
  },
  
  // Google OAuth Configuration
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback'
  }
};

// Validate required environment variables
const requiredEnvVars = [
  'JWT_SECRET',
  'MONGO_URI'
];

if (config.nodeEnv === 'production') {
  requiredEnvVars.push('NODE_ENV');
}

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0 && config.nodeEnv === 'production') {
  console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`.red.bold);
  process.exit(1);
} else if (missingVars.length > 0) {
  console.warn(`⚠️  Missing recommended environment variables: ${missingVars.join(', ')}`.yellow.bold);
}

module.exports = config;
