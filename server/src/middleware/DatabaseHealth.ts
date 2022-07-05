import * as databasePing from '../utils/DatabasePing';

const ping = databasePing.default;

const databaseHealth = async (req, res, next) => {
  // if the server thinks it's already connected, confirm the response is good, and then send it through.
  if (ping.databaseConnected) {
    const { end } = res;

    res.end = function (a, b) { // This checks the status code of the response, to check if a disconnect has occured.
      if (res.statusCode >= 500) {
        ping.databaseConnected = false;
      }

      res.end = end;
      res.end(a, b);
    };

    if (ping.databaseConnected) { // connected and good to go
      return next();
    }

    ping.databaseConnected = false; // not actually connected, send an error!
    return res.status(500).json('Database could not be found. Please try again later.');
  }
  // If the database isnt connected, ping it to try and connect!
  return ping.getPromise().then((online) => {
    if (online) { // Connection was successful, but lets check to make sure
      const { end } = res;

      res.end = function (a, b) { // This checks the status code of the response, to check if a disconnect has occured.
        if (res.statusCode >= 500) {
          ping.databaseConnected = false;
        }

        res.end = end;
        res.end(a, b);
      };

      if (ping.databaseConnected) { // connected and good to go
        return next();
      }

      ping.databaseConnected = false; // not actually successful, send an error!
      return res.status(500).json('Database could not be found. Please try again later.');
    }

    ping.databaseConnected = false; // (re)connect not successful, send an error!
    return res.status(500).json('Database could not be found. Please try again later.');
  }).catch(() => {
    ping.databaseConnected = false; // something went wrong trying to check for connection, send an error!
    return res.status(500).json('Database could not be found. Please try again later.');
  });
};

export default databaseHealth;
