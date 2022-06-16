import sequelize from 'sequelize';
import db from '../../models';
import logger from '../../utils/Logger';
import constants from '../../utils/Constants';
import IRepoError from './IRepoError';
import ISession from '../session/ISession';
import IUser from './IUser';
import IHTTPResponse from '../../utils/IHTTPResponse';

const { Op } = sequelize;

/// /////////////////
/// / INTERNALS /////
/// /////////////////

const repoErr: IRepoError = {
  location: 'UserRepository.js',
  statusCode: 500,
};

const dupeErr: IRepoError = {
  location: 'UserRepository.js',
  statusCode: 409,
  message: 'A user with that email already exists',
};

const standardError = (message: string) => {
  repoErr.message = message;
  logger.warn(repoErr);
};

export default class UserRepository {
  public static async Add(user): Promise<IUser> {
    try {
      const duplicate: IUser = await db.User.findOne({
        where: {
          email: user.email,
          deleted: false,
        },
      });
      if (duplicate != null) {
        return Promise.reject(dupeErr);
      }

      return await db.User.create(user);
    } catch (err) {
      standardError(`${err.name} ${err.message}`);
      throw repoErr;
    }
  }

  public static async GetById(id: number): Promise<IUser> {
    try {
      return await db.User.findOne({
        where: { id },
        attributes: { exclude: ['password'] },
        include: [
          { model: db.UserType, attributes: ['value'] },
        ],
      });
    } catch (err) {
      standardError(err.message);
      return Promise.reject(repoErr);
    }
  }

  public static async Update(user) {
    try {
      const affectedRows = await db.User.update(user,
        {
          where: { id: user.id },
        });

      if (affectedRows[0] > 0) {
        return affectedRows[0];
      }
      logger.warn(constants.HTTP.ERROR.NOT_FOUND);
      return Promise.reject(constants.HTTP.ERROR.NOT_FOUND);
    } catch (err) {
      standardError(err.message);
      return Promise.reject(repoErr);
    }
  }

  public static async Login(email: string): Promise<IUser> {
    try {
      const users = await db.User.findAll({
        where: {
          [Op.and]: [{
            deleted: false,
          },
          sequelize.where(sequelize.fn('lower', sequelize.col('email')), sequelize.fn('lower', email))],
        },
        include: [
          { model: db.UserType, attributes: ['value'] },
        ],
      });

      if (users.length > 0) {
        return users[0];
      }
      logger.warn(constants.HTTP.ERROR.NOT_FOUND);
      return Promise.reject(constants.HTTP.ERROR.NOT_FOUND);
    } catch (err) {
      standardError(err.message);
      return Promise.reject(repoErr);
    }
  }

  public static async GetSession(uuid: string): Promise<ISession> {
    try {
      return await db.Session.findOne({
        where: {
          uuid,
          active: true,
          expired: false,
        },
      });
    } catch (err) {
      standardError(err.message);
      return Promise.reject(repoErr);
    }
  }

  public static async UpdateSession(session): Promise<ISession> {
    try {
      const affectedRows = await db.Session.update(session, {
        where: {
          uuid: session.uuid,
        },
      });

      if (affectedRows[0] > 0) {
        return Promise.resolve(affectedRows[0]);
      }
      const error: IHTTPResponse = constants.HTTP.ERROR.NOT_FOUND;
      logger.warn(error);
      return Promise.reject(error);
    } catch (err) {
      standardError(`${err.name} ${err.message}`);
      return Promise.reject(repoErr);
    }
  }

  public static async NewSession(session: ISession): Promise<ISession> {
    try {
      return await db.Session.create(session);
    } catch (err) {
      standardError(err.message);
      return Promise.reject(repoErr);
    }
  }

  /** *
     * Deletes all sessions that are inactive active a given number of milliseconds
     * @param cutoffDate is the date object for the latest date to keep results
     */
  public static async ClearStaleSessions(cutoffDate: Date): Promise<any[]> {
    try {
      const result = db.Session.destroy({
        where: {
          expiresAt: {
            [Op.lt]: cutoffDate,
          },
        },
      });

      return Promise.resolve(result);
    } catch (err) {
      standardError(err);
      return Promise.reject(repoErr);
    }
  }
}
