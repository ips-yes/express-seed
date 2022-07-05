import * as databasePing from '../utils/DatabasePing';

const ping = databasePing.default;

const databaseHealth = async (req, res, next) => {
  if (ping.databaseConnected) {
    const { end } = res;

    res.end = function (a, b) {
      if (res.statusCode >= 500) {
        ping.databaseConnected = false;
      }

      res.end = end;
      res.end(a, b);
    };

    if (ping.databaseConnected) {
      return next();
    }

    ping.databaseConnected = false;
    return res.status(500).json('Database could not be found. Please try again later.');
  }
  return ping.getPromise().then((online) => {
    if (online) {
      const { end } = res;

      res.end = function (a, b) {
        if (res.statusCode >= 500) {
          ping.databaseConnected = false;
        }

        res.end = end;
        res.end(a, b);
      };

      if (ping.databaseConnected) {
        return next();
      }

      ping.databaseConnected = false;
      return res.status(500).json('Database could not be found. Please try again later.');
    }

    ping.databaseConnected = false;
    return res.status(500).json('Database could not be found. Please try again later.');
  }).catch(() => {
    ping.databaseConnected = false;
    return res.status(500).json('Database could not be found. Please try again later.');
  });
};

export default databaseHealth;
