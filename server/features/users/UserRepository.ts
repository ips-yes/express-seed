import models from '../../models/Index';
import logger from '../../utils/Logger';
import constants from '../../utils/Constants';
import IRepoError from "./IRepoError";
import ISession from "../session/ISession";
import IUser from "./IUser";
import IHTTPResponse from "../../utils/IHTTPResponse";


////////////////////
//// INTERNALS /////
////////////////////
const sequelize = models.sequelize;
const Op = sequelize.Op;

const repoErr: IRepoError = {
    location: 'UserRepository.js',
    statusCode: 500
};

const standardError = (message: string) => {
    repoErr.message = message;
    logger.warn(repoErr);
};

export default class UserRepository {

    public static async Add(user): Promise<IUser> {
        try {
            return await models.users.create(user);
        } catch (err) {
            standardError(err.name + ' ' + err.message);
            throw repoErr;
        }
    }

    public static async GetById(_id: number): Promise<IUser> {
        try {
            return await models.users.find({
                where: {_id: _id},
                attributes: {exclude: ['password']},
                include: [
                    {model: models.user_types, attributes: ['value']}
                ]
            })
        } catch (err) {
            standardError(err.message);
            return Promise.reject(repoErr);
        }
    }

    async Update(user) {
        try {
            let affectedRows = await models.users.update(user,
              {
                  where: {_id: user._id}
              });

            if (affectedRows[0] > 0) {
                return affectedRows[0];
            } else {
                logger.warn(constants.HTTP.ERROR.NOT_FOUND);
                return Promise.reject(constants.HTTP.ERROR.NOT_FOUND);
            }
        } catch (err) {
            standardError(err.message);
            return Promise.reject(repoErr);
        }
    }

    public static async Login(email: string): Promise<IUser> {
        try {
            let users = await models.users.findAll({
                where: {
                    [Op.and]: [{
                        deleted: false
                    },
                        sequelize.where(sequelize.fn('lower', sequelize.col('email')), sequelize.fn('lower', email))]
                },
                include: [
                    {model: models.user_types, attributes: ['value']}
                ]
            });

            if (users.length > 0) {
                return users[0];
            } else {
                logger.warn(constants.HTTP.ERROR.NOT_FOUND);
                return Promise.reject(constants.HTTP.ERROR.NOT_FOUND);
            }

        } catch (err) {
            standardError(err.message);
            return Promise.reject(repoErr);
        }
    }

    public static async GetSession(uuid: string): Promise<ISession> {
        try {
            return await models.sessions.find({
                where: {
                    uuid: uuid,
                    active: true,
                    expired: false
                }
            })
        } catch (err) {
            standardError(err.message);
            return Promise.reject(repoErr);
        }
    }

    public static async UpdateSession(session): Promise<ISession> {
        try {
            let affectedRows = await models.sessions.update(session, {
                where: {
                    uuid: session.uuid
                }
            });

            if (affectedRows[0] > 0) {
                return Promise.resolve(affectedRows[0]);
            } else {
                const repoErr: IHTTPResponse = constants.HTTP.ERROR.NOT_FOUND;
                logger.warn(repoErr);
                return Promise.reject(repoErr);
            }
        } catch (err) {
            standardError(err.message);
            return Promise.reject(repoErr);
        }
    }

    public static async NewSession(session: ISession): Promise<ISession> {
        try {
            return await models.sessions.create(session)
        } catch (err) {
            standardError(err.message);
            return Promise.reject(repoErr);
        }
    }

    /***
     * Deletes all sessions that are inactive active a given number of milliseconds
     * @param cutoffDate is the date object for the latest date to keep results
     */
    public static async ClearStaleSessions(cutoffDate: Date): Promise<any[]> {
        try {
            let result = models.sessions.destroy({
                where: {
                    expires_at: {
                        [Op.lt]: cutoffDate
                    }
                }
            });

            return Promise.resolve(result);

        } catch (err) {
            standardError(err);
            return Promise.reject(repoErr);
        }
    }

};
