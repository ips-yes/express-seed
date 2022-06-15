/* Created by anthonyg 01-05-2018 */
import * as express from 'express';
import passport from 'passport';
import validate from '../../middleware/JoiValidator';
import constants from '../../utils/Constants';
import UserValidation from './UserValidation';
import checkProtocol from '../../middleware/CheckProtocol';
import logger from '../../utils/Logger';
import authenticationMiddleware from '../../middleware/Auth';
import UserController from './UserController';
import config from '../../config';

const router = express.Router();

const AUTH_PARAMS = config.auth;

//= ==============================================================================================//
//  ROUTES                                                                                        //
//= ==============================================================================================//

/**
 * This route will add a user.  IMPORTANT to create your first user remove the
 * authenticationMiddleware temporarily
 */
router.post('/', checkProtocol, authenticationMiddleware, validate(UserValidation.PostUser),
  (req, res, next) => {
    logger.info('POST User');
    UserController.Add(req.body)
      .then((response) => {
        res.status(201).json(response);
      })
      .catch((err) => next(err));
  });

/**
 * This route will fetch a user by id
 */
router.get('/:id', authenticationMiddleware, validate(UserValidation.GetUser), (req, res, next) => {
  logger.info('GET User');

  UserController.GetById(req.params.id)
    .then((user) => res.status(200).json(user))
    .catch((err) => next(err));
});

/**
 * This route will attempt to login the user with the given credentials
 */
router.post('/login', checkProtocol, validate(UserValidation.Login), passport.authenticate('local'), (req, res) => {
  logger.info('Login');
  const response = constants.AUTH.PASSWORD_SUCCESS;

  // Note that 3600000 converts our cookieLife param from hours to milliseconds
  const cookieOptions = { maxAge: AUTH_PARAMS.cookieLife * 3600000, secure: true, httpOnly: true };
  res.cookie('sessionId', req['session']['passport'].user.uuid, cookieOptions);
  return res.status(200).json(response);
});

// TODO: Add logout endpoint for DB Session table clean-up?

export default router;
