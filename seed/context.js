'use strict';

const sqlite3 = require('sqlite3');

class Context {
  constructor(filename, enableLogging) {
    this.db = new sqlite3.Database(filename);
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
    console.info(`Running query: "${text}", with params: ${JSON.stringify(params)}`);
  }

  // Prepare query and execute ( used to update, create etc )
  execute(text, ...params) {
    const sql = Context.prepareQuery(text);
    if (this.enableLogging) {
      Context.log(sql, params);
    }
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  // Prepare query and execute, returns all rows with specific data
  query(text, ...params) {
    const sql = Context.prepareQuery(text);
    if (this.enableLogging) {
      Context.log(sql, params);
    }
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  // returns all data based on query
  async retrieve(text, ...params) {
    return this.query(text, ...params);
  }

  // returns one row of data based on query
  async retrieveSingle(text, ...params) {
    const data = await this.query(text, ...params);
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
  async retrieveValue(text, ...params) {
    const data = await this.query(text, ...params);
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
