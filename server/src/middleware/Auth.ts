import passport from 'passport';
import moment from 'moment';
import { Strategy as LocalStrategy } from 'passport-local';
import { getClientIp } from 'request-ip';
import { randomBytes } from 'crypto';
import { ComparePassword } from '../utils/EncryptionHelper';
import logger from '../utils/Logger';
import constants from '../utils/Constants';
import config from '../config';
import UserRepository from '../features/users/UserRepository';
import ISession from '../features/session/ISession';
import IUser from '../features/users/IUser';
import IHTTPResponse from '../utils/IHTTPResponse';

const AUTH_PARAMS = config.auth;

const validateSession = async (uuid: string): Promise<ISession> => {
  try {
    const session: ISession = await UserRepository.GetSession(uuid);
    if (!session) {
      const response = constants.AUTH.SESSION_FAIL;
      logger.warn(response);
      return Promise.reject(response);
    }
    const timeNow = moment();
    const timeThen = moment(session.expiresAt);
    const hoursDiff = moment.duration(timeNow.diff(timeThen)).asHours();
    if (hoursDiff > AUTH_PARAMS.cookieLife) {
      // Set the session expired and inactive
      const updateSession = {
        uuid: session.uuid,
        active: false,
        expired: true,
      };

      const result: ISession = await UserRepository.UpdateSession(updateSession);
      if (result) {
        const response = constants.AUTH.SESSION_EXPIRED;
        logger.warn(response);
        return Promise.reject(response);
      }
      const response = constants.HTTP.ERROR.NOT_FOUND;
      logger.warn(response);
      return Promise.reject(response);
    }
    return Promise.resolve(session);
  } catch (err) {
    return Promise.reject(err);
  }
};

const authenticationMiddleware = async (req, res, next) => {
  if (!req.cookies || !req.cookies.sessionId) {
    const response = constants.AUTH.SESSION_MISSING;
    logger.warn(response);
    return res.status(response.statusCode).json(response);
  }
  // authenticate cookie
  try {
    const session = await validateSession(req.cookies.sessionId);
    // Successful, add the user id to the session
    if (!req.session) {
      req.session = {
        userId: session.userId,
      };
    } else {
      req.session.userId = session.userId;
    }
    return next();
  } catch (err) {
    // if the session is invalid clear the cookie and redirect to login
    if (err.statusCode === 401) {
      res.clearCookie('sessionId');
      return res.redirect(parseInt(err.statusCode, 10), '/');
    }
    return res.status(err.statusCode).json(err);
  }
};

passport.serializeUser(async (user: IUser, done) => {
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + AUTH_PARAMS.cookieLife);
  const session: ISession = {
    uuid: randomBytes(32).toString('hex'),
    userId: user.id,
    expired: false,
    active: true,
    expiresAt: expiration,
  };
  try {
    await UserRepository.NewSession(session);
    session.UserType = user.UserType.value;
    return done(null, session);
  } catch (err) {
    return done(err, null);
  }
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user: IUser = await UserRepository.GetById(id);
    return done(null, user);
  } catch (err) {
    return done(err);
  }
});

passport.use(new LocalStrategy({ passReqToCallback: true }, (req, username, password, done) => {
  const ip: string = getClientIp(req);
  UserRepository.Login(username)
    .then((user: IUser) => {
      ComparePassword(password, user.password)
        .then((result?: any) => {
          if (!result) {
            const err: IHTTPResponse = constants.AUTH.PASSWORD_FAIL;
            err.ip = ip;
            logger.warn(err);
            return done(err);
          }
          return done(null, user);
        });
    }).catch((err) => {
      done(err);
    });
}));

export default authenticationMiddleware;
