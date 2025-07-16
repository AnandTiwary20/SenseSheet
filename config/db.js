const { Sequelize } = require('sequelize');
const config = require('./config');

let sequelize;

if (config.db.url) {
  // For production with connection string
  sequelize = new Sequelize(config.db.url, {
    ...config.db,
    logging: config.env === 'development' ? console.log : false
  });
} else {
  // For development with SQLite
  sequelize = new Sequelize({
    ...config.db,
    logging: config.env === 'development' ? console.log : false
  });
}

// Test the database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
    
    // Sync all models
    await sequelize.sync({ force: config.env === 'development' });
    console.log('✅ Database synchronized');
    
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection,
  DataTypes: Sequelize.DataTypes
};
