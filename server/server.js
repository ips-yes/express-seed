'use strict';
(async () => {
    // Library imports
    let express = require('express'),
        rateLimit = require('express-rate-limit'),
        app = express(),
        bodyParser = require('body-parser'),
        cookieParser = require('cookie-parser'),
        http = require('http'),
        validate = require('express-validation');

    // Application imports
    let config;
    let models = require('./models/Index'),
        passport = require('./middleware/Auth').passport,
        logger = require('./utils/Logger.js');
    try{
        config = require('./config/env_config');

    }catch(err){
        logger.error(err.message);
    }

    switch(config.env){
      case 'development':
        logger.info(' DEVELOPMENT '); // eslint-disable-line
        break;
      case 'staging':
      case 'qa':
        logger.warning(' STAGING / QA '); // eslint-disable-line
        break;
      case 'production':
        logger.error(' PRODUCTION '); // eslint-disable-line
        break;
      default:
        break;
    }

    let DB_PARAMS = config.db,
        APP_PARAMS = config.app;

    // sets up express validator with options
    // as of now these options do not allow parameters that are not specified in schema through
    // For more options go to: https://www.npmjs.com/package/express-validation#global-options
    validate.options({
        allowUnknownBody: false,
        allowUnknownQuery: false,
        allowUnknownParams: false
    });

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
        if(DB_PARAMS.sync){
            await models.sequelize.sync(); //If this is enabled in config.json it will sync the DB to the code
        }
    } catch(e) {
        logger.error('Database configuration failed due to: ' + e.message);
        onServerClosed();
    }

    //===============================================================================================//
    //  MIDDLEWARE                                                                                   //
    //===============================================================================================//
    let LIMITER_PARAMS = config.limiter;

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
    app.use(APP_PARAMS.path, require('./routes'));

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
    //  SERVER STARTUP                                                                               //
    //===============================================================================================//
    // start the server
    try {
        await new Promise(function (resolve) {
            http.createServer(app).listen(APP_PARAMS.port, () => {
                logger.info('****************************** Server Listening on Port:' + APP_PARAMS.port + ' ******************************');
                resolve();
            });
        });
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