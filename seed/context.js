'use strict';

const { Pool } = require('pg');
require('dotenv').config();

class Context {
  constructor(databaseName, enableLogging) {
    this.db = new Pool({
      database: databaseName, 
      user: 'postgres', 
      password: process.env.POSTGRES_PASSWORD,
      host: 'localhost',
      port: '5432',
      dialect: 'postgres',
      max: 9,
      min: 0,
      idle: 10000
    });;
    this.enableLogging = enableLogging;
  }

  // Trims down excess whitespaces
  static prepareQuery(text) {
    return text
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Logs out query and params
  static log(text, params) {
    console.info(`\n\nRunning query: "${text}", \n\nwith params: ${JSON.stringify(params)}\n`);
  }

  // Prepare query and execute ( used to update, create etc )
  execute(text, params) {
    const sql = Context.prepareQuery(text);
    if (this.enableLogging) {
      Context.log(sql, params);
    }
    return new Promise((resolve, reject) => {
      this.db.query(sql, params, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  // Prepare query and execute, returns all rows with specific data
  query(text, params) {
    const sql = Context.prepareQuery(text);
    if (this.enableLogging) {
      Context.log(sql, params);
    }
    return new Promise((resolve, reject) => {
      this.db.query(sql, params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  // returns all data based on query
  async retrieve(text, params) {
    return this.query(text, params);
  }

  // returns one row of data based on query
  async retrieveSingle(text, params) {
    const data = await this.query(text, params);
    let record;
    if (data) {
      if (data.length === 1) {
        [record] = data;
      } else if (data.length > 1) {
        throw new Error('Unexpected number of rows encountered.');
      }
    }
    return record;
  }

  // returns one value of data based on query
  async retrieveValue(text, params) {
    const data = await this.query(text, params);
    let record;
    let value;
    if (data && data.length === 1) {
      [record] = data;
      const keys = Object.keys(record);
      if (keys.length === 1) {
        value = record[keys[0]];
      } else {
        throw new Error('Unexpected number of values encountered.');
      }
    } else {
      throw new Error('Unexpected number of rows encountered.');
    }
    return value;
  }
}

module.exports = Context;
