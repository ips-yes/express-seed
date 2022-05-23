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
  AUTH_PARAMS = require('../config').auth,
  User = require('../features/users/UserRepository');


let authenticationMiddleware = async (req, res, next) => {
    if (!req.cookies || !req.cookies.sessionId) {
        let response = constants.AUTH.SESSION_MISSING;
        logger.warn(response);
        return res.status(response.statusCode).json(response);
    }
    //authenticate cookie
    try {
        let session = await validateSession(req.cookies.sessionId);
        //Successful, add the user id to the session
        if (!req.session) {
            req.session = {
                userId: session.userId
            }
        } else {
            req.session.userId = session.userId;
        }
        return next();

    } catch (err) {
        //if the session is invalid clear the cookie and redirect to login
        if (err.statusCode === 401) {
            res.clearCookie('sessionId');
            return res.redirect(parseInt(err.statusCode), '/');
        } else {
            return res.status(err.statusCode).json(err);
        }
    }
};


let validateSession = async (uuid) => {
    try{
        let session = await User.GetSession(uuid);
        if (!session) {
            let response = constants.AUTH.SESSION_FAIL;
            logger.warn(response);
            return Promise.reject(response);
        } else {
            let timeNow = moment();
            let timeThen = moment(session.expiresAt);
            let hoursDiff = moment.duration(timeNow.diff(timeThen)).asHours();
            if (hoursDiff > AUTH_PARAMS.cookieLife) {
                //Set the session expired and inactive
                let updateSession = {
                    uuid: session.uuid,
                    active: false,
                    expired: true
                };

                let result = await User.UpdateSession(updateSession);
                if (result) {
                    let response = constants.AUTH.SESSION_EXPIRED;
                    logger.warn(response);
                    return Promise.reject(response);
                } else {
                    let response = constants.HTTP.ERROR.NOT_FOUND;
                    logger.warn(response);
                    return Promise.reject(response);
                }
            } else {
                return Promise.resolve(session);
            }
        }
    }catch(err){
        return Promise.reject(err);
    }
};


passport.serializeUser(async (user, done) => {
    let expiration = new Date();
    expiration.setHours(expiration.getHours() + AUTH_PARAMS.cookieLife);
    let session = {
        uuid: crypto.randomBytes(32).toString('hex'),
        userId: user.id,
        expired: false,
        active: true,
        expires_at: expiration
    };
    try{
        await User.NewSession(session);
        session.userType = user.userType.value;
        return done(null, session);
    }catch(err){
        return done(err, null);
    }
});

passport.deserializeUser( async (id, done) => {
    try{
        let user = User.GetById(id);
        return done(null, user);
    }catch(err){
        return done(err);
    }
});


passport.use(new LocalStrategy({passReqToCallback: true, failWithError: true}, async (req, username, password, done) => {
      let ip = requestIp.getClientIp(req);
      try{
          let user = await User.Login(username);
          let result = await EncryptionHelper.ComparePassword(password, user.password);

          if (!result) {
              let err = constants.AUTH.PASSWORD_FAIL;
              logger.warn(err);
              return done(err);
          } else {
              return done(null, user);
          }
      } catch(err){
          done(err);
      }
  }
));

exports.passport = passport;
exports.authenticationMiddleware = authenticationMiddleware;
