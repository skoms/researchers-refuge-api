require('dotenv').config();

module.exports = {
  database: 'ResearchersRefuge',
  host: 'localhost',
  dialect: 'postgres',
  username: 'postgres',
  password: process.env.POSTGRES_PASSWORD,
  pool: {
    max: 9,
    min: 0, 
    idle: 300000,
    acquire: 300000,
    port: 5000
  }
}
