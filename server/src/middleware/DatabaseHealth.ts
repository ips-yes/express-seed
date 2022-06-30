import * as databasePing from '../utils/DatabasePing';

const ping = databasePing.default;

const databaseHealth = async (req, res, next) => {
  if (ping.databaseConnected) {
    try {
      return next();
    } catch {
      ping.databaseConnected = false;
      return res.status(500).json('Database could not be found. Please try again later.');
    }
  } else {
    return ping.getPromise().then((online) => {
      if (online) {
        try {
          return next();
        } catch {
          ping.databaseConnected = false;
          return res.status(500).json('Database could not be found. Please try again later.');
        }
      }

      ping.databaseConnected = false;
      return res.status(500).json('Database could not be found. Please try again later.');
    }).catch(() => {
      ping.databaseConnected = false;
      return res.status(500).json('Database could not be found. Please try again later.');
    });
  }
};

export default databaseHealth;
