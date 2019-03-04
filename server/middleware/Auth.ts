/**
 * Created by anthonyg on 5/1/2018
 */
import * as Passport from 'passport'
import * as  moment from 'moment'
import {Strategy as LocalStrategy} from 'passport-local'
import {getClientIp} from "request-ip"
import {randomBytes} from "crypto"
import {ComparePassword} from "../utils/EncryptionHelper"
import logger from '../utils/Logger'
import constants from '../utils/Constants'
import {config} from '../config'
import UserRepository from '../features/users/UserRepository'
import ISession from "../features/session/ISession";
import IUser from "../features/users/IUser";
import IHTTPResponse from "../utils/IHTTPResponse";

const AUTH_PARAMS = config.auth;
export const passport = Passport;

export const authenticationMiddleware = async (req, res, next) => {
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
                user_id: session.user_id
            }
        } else {
            req.session.user_id = session.user_id;
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


const validateSession = async (uuid: string): Promise<ISession> => {
    try{
        const session: ISession = await UserRepository.GetSession(uuid);
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

                const result: ISession = await UserRepository.UpdateSession(updateSession);
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


passport.serializeUser(async (user: IUser, done) => {
    let expiration = new Date();
    expiration.setHours(expiration.getHours() + AUTH_PARAMS.cookieLife);
    let session: ISession = {
        uuid: randomBytes(32).toString('hex'),
        user_id: user._id,
        expired: false,
        active: true,
        expires_at: expiration
    };
    try{
        await UserRepository.NewSession(session);
        session.user_type = user.user_type.value;
        return done(null, session);
    }catch(err){
        return done(err, null);
    }
});

passport.deserializeUser( async (id: number, done) => {
    try{
        const user: IUser = await UserRepository.GetById(id);
        return done(null, user);
    }catch(err){
        return done(err);
    }
});


passport.use(new LocalStrategy({passReqToCallback: true}, (req, username, password, done) => {
      const ip: string = getClientIp(req);
      UserRepository.Login(username)
          .then((user: IUser) => {
              ComparePassword(password, user.password)
                  .then((result?: any) => {
                      if (!result) {
                          let err: IHTTPResponse = constants.AUTH.PASSWORD_FAIL;
                          err._ip = ip;
                          logger.warn(err);
                          return done(err);
                      } else {
                          return done(null, user);
                      }
                  })
          }).catch((err) => {
              done(err);
          });
  }
));

