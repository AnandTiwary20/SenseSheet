const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const env = process.env.NODE_ENV || 'development';

const baseConfig = {
  env,
  port: parseInt(process.env.PORT, 10) || 5000,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:5000',
      'https://sensesheet-frontend.onrender.com',
      'https://sensesheet-backend.onrender.com'
    ],
    credentials: true
  },
  rateLimit: {
    max: 100,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Too many requests from this IP, please try again in an hour!'
  }
};

const environmentConfigs = {
  development: {
    db: {
      dialect: 'sqlite',
      storage: path.join(__dirname, '../database.sqlite'),
      logging: false
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'development_secret',
      expiresIn: process.env.JWT_EXPIRES_IN || '90d',
      cookieExpiresIn: parseInt(process.env.JWT_COOKIE_EXPIRES_IN, 10) || 90
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_REDIRECT_URI
    }
  },
  production: {
    db: {
      url: process.env.DATABASE_URL,
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      logging: false
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      cookieExpiresIn: parseInt(process.env.JWT_COOKIE_EXPIRES_IN, 10) || 7
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_REDIRECT_URI
    }
  }
};

// Merge base config with environment specific config
const config = {
  ...baseConfig,
  ...environmentConfigs[env]
};

// Validate required environment variables
const requiredEnvVars = [
  'JWT_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REDIRECT_URI'
];

if (env === 'production') {
  requiredEnvVars.push('DATABASE_URL');
}

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

module.exports = config;
