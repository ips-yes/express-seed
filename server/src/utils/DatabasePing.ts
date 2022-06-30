import config from '../config/index';
import db from '../models';
import logger from './Logger';

const DB_PARAMS = config.db;

export default class DatabasePing {
  static instance;

  static databaseConnected = false;

  static isSearching;

  static promise : Promise<boolean>;

  static attemptConnect = async () : Promise<boolean> => {
    DatabasePing.isSearching = true;

    try {
      await db.sequelize.authenticate();
      if (DB_PARAMS.SYNC) {
        await db.sequelize.sync(); // If this is enabled in config.json it will sync the DB to the code
        // Create default user types if there are none
        const userTypes = await db.UserType.findAll({});
        if (userTypes.length === 0) {
          await db.UserType.create({ value: 'Admin' });
          await db.UserType.create({ value: 'User' });
        }

        DatabasePing.databaseConnected = true;
        logger.info('Database connected!');
      }
    } catch (e) {
      logger.warn(`Database configuration failed due to: ${e.message}`);
      DatabasePing.databaseConnected = false;
    }

    DatabasePing.isSearching = false;
    return DatabasePing.databaseConnected;
  }

  static getInstance() : DatabasePing {
    if (!DatabasePing.instance) {
      DatabasePing.instance = new DatabasePing();
    }
    return DatabasePing.instance;
  }

  static getPromise() : Promise<boolean> {
    if (DatabasePing.isSearching) {
      return DatabasePing.promise;
    }

    DatabasePing.promise = DatabasePing.attemptConnect();
    return DatabasePing.promise;
  }
}
