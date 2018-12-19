/**
 * Created by anthonyg on 5/1/2018
 */
let passport = require('passport'),
    moment = require('moment'),
    LocalStrategy = require('passport-local').Strategy,
    requestIp = require('request-ip'),
    crypto = require('crypto'),
    EncryptionHelper = require('../utils/EncryptionHelper'),
    logger = require('../utils/Logger'),
    constants = require('../utils/Constants'),
    AUTH_PARAMS = require('../config/env_config').auth,
    User = require('../features/users/UserRepository');


let authenticationMiddleware = (req, res, next) => {
    if (!req.cookies || !req.cookies.sessionId) {
        let response = constants.AUTH.SESSION_MISSING;
        logger.warn(response);
        return res.status(response.statusCode).json(response);
    }
    //authenticate cookie
    validateSession(req.cookies.sessionId)
        .then(session => {
            //Successful, add the user id to the session
            if (!req.session) {
                req.session = {
                    user_id: session.user_id
                }
            } else {
                req.session.user_id = session.user_id;
            }
            return next();
        })
        .catch(err => {
            //if the session is invalid clear the cookie and redirect to login
            if (err.statusCode === 401) {
                res.clearCookie('sessionId');
                return res.redirect(parseInt(err.statusCode), '/');
            } else {
                return res.status(err.statusCode).json(err);
            }
        });
};


let validateSession = (uuid) => {
    return User.GetSession(uuid)
        .then((session) => {
            if (!session) {
                let response = constants.AUTH.SESSION_FAIL;
                logger.warn(response);
                return Promise.reject(response);
            } else {

                let timeNow = moment();
                let timeThen = moment(session.expires_at);
                let hoursDiff = moment.duration(timeNow.diff(timeThen)).asHours();
                if (hoursDiff > AUTH_PARAMS.cookieLife) {
                    //Set the session expired and inactive
                    let updateSession = {
                        uuid: session.uuid,
                        active: false,
                        expired: true
                    };

                    return User.UpdateSession(updateSession)
                        .then(result => {
                            if (result) {
                                let response = constants.AUTH.SESSION_EXPIRED;
                                logger.warn(response);
                                return Promise.reject(response);
                            } else {
                                let response = constants.HTTP.ERROR.NOT_FOUND;
                                logger.warn(response);
                                return Promise.reject(response);
                            }
                        })
                } else {
                    return Promise.resolve(session);
                }

            }
        })
};


passport.serializeUser((user, cb) => {

    let expiration = new Date();
    expiration.setHours(expiration.getHours() + AUTH_PARAMS.cookieLife);
    let session = {
        uuid: crypto.randomBytes(32).toString('hex'),
        user_id: user._id,
        expired: false,
        active: true,
        expires_at: expiration
    };
    return User.NewSession(session)
        .then(gotSession => {
            gotSession.user_type = user.user_type.value;
            return cb(null, gotSession);
        })
        .catch(err => {
            return cb(err, null);
        })
});

passport.deserializeUser((id, cb) => {
    User.GetById(id)
        .then(user => {
            return cb(null, user);
        })
        .catch(err => {
            return cb(err);
        })
});


passport.use(new LocalStrategy({passReqToCallback: true, failWithError: true}, (req, username, password, cb) => {
        let ip = requestIp.getClientIp(req);
        let user;
        User.Login(username)
            .then(gotUser => {
                user = gotUser;
                return EncryptionHelper.ComparePassword(password, user.password)
            })
            .then(result => {
                if (!result) {
                    let err = constants.AUTH.PASSWORD_FAIL;
                    err._ip = ip;
                    logger.warn(err);
                    return cb(err);
                } else {
                    return cb(null, user);
                }
            })
            .catch(err => {
                //error was caught at the repo level
                return cb(err);
            })
    }
));

exports.passport = passport;
exports.authenticationMiddleware = authenticationMiddleware;
