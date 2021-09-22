require('dotenv').config();

module.exports = {
  database: process.env.POSTGRES_DATABASE,
  host: 'localhost',
  dialect: 'postgres',
  username: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  pool: {
    max: 9,
    min: 0, 
    idle: 300000,
    acquire: 300000,
    port: process.env.PORT || 5000
  }
}
