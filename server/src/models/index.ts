/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */

import * as Sequelize from 'sequelize';
import fs from 'fs';
import path from 'path';
import config from '../config';

const db: any = {};
const DB_PARAMS = config.db;

const sequelize = new Sequelize.Sequelize(DB_PARAMS.NAME, DB_PARAMS.USER, DB_PARAMS.PASSWORD, {
  host: DB_PARAMS.HOST,
  dialect: 'postgres',
  logging: false,
  define: {
    timestamps: true,
  },
  pool: {
    max: 5,
    min: 0,
    idle: 10000,
  },
});

// Add models from models dir to db object for later use in repositories
fs
  .readdirSync(path.join(__dirname, '..', 'models'))
  .filter((file) => (file.indexOf('.') !== 0) && (file !== 'index.ts'))
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Associate tables
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
