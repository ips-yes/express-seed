import { Express } from 'express';
import * as rateLimit from 'express-rate-limit';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import https from 'https';
import passport from 'passport';
import upload from 'express-fileupload';
import config from './config/index';
import db from './models';
import logger from './utils/Logger';
import router from './Routes';
import UserController from './features/users/UserController';

const DB_PARAMS = config.db;

export default class Server {
    private app: Express;

    constructor(app: Express) {
      this.app = app;
    }

    public async start(): Promise<void> {
      logger.info('****************************** Server Starting Up ******************************');
      // =============================================================================================== //
      //  SHUTDOWN EVENTS                                                                                //
      // =============================================================================================== //
      // listen for exiting on Windows or Linux
      const onServerClosed = () => {
        logger.info('############################## Server Shutting Down ##############################');
        process.exit();
      };

      process.on('SIGINT', onServerClosed);
      process.on('SIGTERM', onServerClosed);
      // =============================================================================================== //
      // SHUTDOWN EVENTS ^^^^^                                                                           //
      // =============================================================================================== //

      // Verify database connection and sync if we wish
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
        }
      } catch (e) {
        logger.error(`Database configuration failed due to: ${e.message}`);
        onServerClosed();
      }

      // =============================================================================================== //
      //  MIDDLEWARE                                                                                     //
      // =============================================================================================== //
      const LIMITER_PARAMS = config.limiter;

      // rate limit for throttling requests for IP addresses.
      if (LIMITER_PARAMS.enable) {
        const LIMITER_MESSAGE = 'Too many requests, please try again later';
        const LIMITER_CODE = 429;
        const limiter = rateLimit.default({
          windowMs: LIMITER_PARAMS.windowMS, // window in ms
          max: LIMITER_PARAMS.max, // limit each IP to requests per windowMs
          message: 'Too Many requests, please try again later',
          statusCode: 429,
          handler(req, res) {
            logger.warn(`Rate Limit Exceeded for IP:${req.connection.remoteAddress}`);
            res.format({
              json() {
                res.status(LIMITER_CODE).json({ message: LIMITER_MESSAGE });
              },
            });
          },
        });

        this.app.use(limiter);
      }

      // passport
      this.app.use(passport.initialize());

      // File upload
      this.app.use(upload());

      this.app.use(bodyParser.json());
      this.app.use(bodyParser.text({
        type: 'text/plain',
        limit: '10mb',
      }));
      this.app.use(cookieParser.default());
      this.app.use(bodyParser.urlencoded({ extended: true }));
      this.app.use(config.app.PATH, router);

      // General Exception Handler
      // eslint-disable-next-line no-unused-vars
      this.app.use((err, req, res, next) => {
        logger.warn(err.message);
        if (err.output) {
          return res.status(err.output.statusCode).json(err.output.payload);
        }
        if (err.statusCode) {
          return res.status(err.statusCode).json(err);
        } if (err.status) {
          return res.status(err.status).json(err);
        }
        return res.status(500).json(err);
      });
      // =============================================================================================== //
      //  MIDDLEWARE ^^^^^                                                                               //
      // =============================================================================================== //

      // =============================================================================================== //
      //  SESSION CLEANUP TASK                                                                           //
      // =============================================================================================== //

      const sessionCleanupTask = () => {
        try {
          UserController.ClearStaleSessions()
            .then((result) => {
              logger.info(`${result} stale sessions have been removed`);
            })
            .catch((err) => {
              logger.error(`An error occurred during cleanup:\n${err.stack || err}`);
            });
        } catch (e) {
          logger.error(`An error occurred during cleanup:\n${e.stack || e}`);
        }
      };

      // =============================================================================================== //
      // SESSION CLEANUP TASK  ^^^^^                                                                     //
      // =============================================================================================== //

      // =============================================================================================== //
      // SERVER STARTUP                                                                                  //
      // =============================================================================================== //
      // start the server
      try {

        const key = process.env.KEY;
        const cert = process.env.CERT;

        const options = {
          key: key,
          cert: cert
        };

        https.createServer(options, this.app).listen(config.app.PORT_SECURE, () => {
          logger.info(
            `****************************** HTTPS Server Listening on Port:${config.app.PORT_SECURE} ******************************`,
          );
        });

        this.app.listen(config.app.PORT, () => {
          logger.info(
            `****************************** HTTP Server Listening on Port:${config.app.PORT} ******************************`,
          );
        });

        // clean up stale sessions
        /**
         * Convert the number of days to millis and take the min of that and the max 32 bit signed integer.
         * setInterval caps at that value
         */
        let sessionCleanupIntervalTime = config.sessionLife.sessionCleanupFrequencyInDays * 1000 * 60 * 60 * 24;
        if (sessionCleanupIntervalTime > 2147483647) {
          sessionCleanupIntervalTime = 2147483647;
          logger.error(
            `The configuration for sessionCleanupFrequencyInDays is too
            large for setInterval, capping at: ${sessionCleanupIntervalTime} milliseconds`,
          );
        }
        logger.info(`Starting session cleanup interval every ${sessionCleanupIntervalTime} milliseconds\n`);
        sessionCleanupTask();
        setInterval(sessionCleanupTask, sessionCleanupIntervalTime);
      } catch (err) {
        logger.error(`${'error occurred starting express: '
              + '\n('}${err.toString()
        }).\nrestart the app when the database is ready to connect to`);
        onServerClosed();
      }

      // =============================================================================================== //
      //  SERVER STARTUP ^^^^^                                                                           //
      // =============================================================================================== //
    }
}
