'use strict';
(async () => {
    // Library imports
    let express = require('express'),
        rateLimit = require('express-rate-limit'),
        app = express(),
        bodyParser = require('body-parser'),
        cookieParser = require('cookie-parser'),
        http = require('http'),
        UserController = require('./features/users/UserController');

    // Application imports
    let deployConfig = require('./config'),
        models = require('./models/Index'),
        passport = require('./middleware/Auth').passport,
        logger = require('./utils/Logger.js');

    let DB_PARAMS = deployConfig.db;



    logger.info('****************************** Server Starting Up ******************************');
    //===============================================================================================//
    //  SHUTDOWN EVENTS                                                                              //
    //===============================================================================================//
    //listen for exiting on Windows or Linux
    const onServerClosed = function () {
        logger.info('############################## Server Shutting Down ##############################');
        process.exit();
    };

    process.on('SIGINT', onServerClosed);
    process.on('SIGTERM', onServerClosed);
    //===============================================================================================//
    //  SHUTDOWN EVENTS ^^^^^                                                                        //
    //===============================================================================================//

    // Verify database connection and sync if we wish
    try {
        await models.sequelize.authenticate();
        if(DB_PARAMS.SYNC){
            await models.sequelize.sync(); //If this is enabled in config.json it will sync the DB to the code
        }
    } catch(e) {
        logger.error('Database configuration failed due to: ' + e.message);
        onServerClosed();
    }

    //===============================================================================================//
    //  MIDDLEWARE                                                                                   //
    //===============================================================================================//
    let LIMITER_PARAMS = deployConfig.limiter;

    //rate limit for throttling requests for IP addresses.
    if (LIMITER_PARAMS.enable) {
        let LIMITER_MESSAGE = 'Too many requests, please try again later';
        let LIMITER_CODE = 429;
        let limiter = new rateLimit({
            windowMs: LIMITER_PARAMS.windowMS, // window in ms
            max: LIMITER_PARAMS.max, // limit each IP to requests per windowMs
            delayMs: LIMITER_PARAMS.delayMs, // disable delaying - full speed until the max limit is reached,
            message: 'Too Many requests, please try again later',
            statusCode: 429,
            handler: function (req, res) {
                console.log('Rate Limit Exceeded for IP:' + req.connection.remoteAddress);
                res.format({
                    json: function () {
                        res.status(LIMITER_CODE).json({message: LIMITER_MESSAGE});
                    }
                })
            }
        });

        app.use(limiter);
    }

    //passport
    app.use(passport.initialize());

    app.use(bodyParser.json());
    app.use(bodyParser.text({
        type: 'text/plain',
        limit: '10mb'
    }));
    app.use(cookieParser());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(deployConfig.app.PATH, require('./routes'));

    //General Exception Handler
    app.use((err, req, res, next) => {
        logger.warn(err.message);
        if(err.statusCode){
            return res.status(err.statusCode).json(err);
        }else if(err.status){
            return res.status(err.status).json(err);
        }else{
            res.status(500).json(err);
        }
    });
    //===============================================================================================//
    //  MIDDLEWARE ^^^^^                                                                             //
    //===============================================================================================//

    //===============================================================================================//
    //  SESSION CLEANUP TASK                                                                       //
    //===============================================================================================//

    let sessionCleanupTask = () => {
        try {
            UserController.ClearStaleSessions()
              .then((result) => {
                  logger.info(result + ' stale sessions have been removed');
              })
              .catch((err) => {
                  logger.error("An error occurred during cleanup:\n" + (err.stack || err));
              });
        } catch (e) {
            logger.error("An error occurred during cleanup:\n" + (e.stack || e));
        }
    };

    //===============================================================================================//
    //  SESSION CLEANUP TASK  ^^^^^                                                                     //
    //===============================================================================================//


    //===============================================================================================//
    //  SERVER STARTUP                                                                               //
    //===============================================================================================//
    // start the server
    try {
        await new Promise(function (resolve) {
            http.createServer(app).listen(deployConfig.app.PORT, () => {
                logger.info('****************************** Server Listening on Port:' + deployConfig.app.PORT + ' ******************************');
                resolve();
            });
        });
        //clean up stale sessions
        // Convert the number of days to millis and take the min of that and the max 32 bit signed integer.  setInterval caps at that value
        let sessionCleanupIntervalTime = deployConfig.sessionLife.sessionCleanupFrequencyInDays * 1000*60*60*24;
        if(sessionCleanupIntervalTime > 2147483647) {
            sessionCleanupIntervalTime = 2147483647;
            logger.error('The configuration for sessionCleanupFrequencyInDays is too large for setInterval, capping at: ' + sessionCleanupIntervalTime + " milliseconds");
        }
        logger.info('Starting session cleanup interval every ' + sessionCleanupIntervalTime + " milliseconds\n");
        sessionCleanupTask();
        setInterval(sessionCleanupTask, sessionCleanupIntervalTime);

    } catch(err) {
        logger.error('error occurred starting express: ' +
            '\n(' + err.toString() +
            ').\nrestart the app when the database is ready to connect to');
        onServerClosed();
    }

    //===============================================================================================//
    //  SERVER STARTUP ^^^^^                                                                         //
    //===============================================================================================//
})();