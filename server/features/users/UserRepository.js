let models = require('../../models/Index'),
  logger = require('../../utils/Logger'),
  constants = require('../../utils/Constants'),
  sequelize = require('../../models/Index').sequelize;


////////////////////
//// INTERNALS /////
////////////////////

const Op = sequelize.Op;

let repoErr = {
    location: 'UserRepository.js',
    statusCode: 500
};

let standardError = (message) => {
    repoErr.message = message;
    logger.warn(repoErr);
};

let self = module.exports = {


    async Add(user) {
        try {
            return await models.users.create(user);
        } catch (err) {
            standardError(err.name + ' ' + err.message);
            return repoErr;
        }
    },

    async GetById(_id) {
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
    },

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

    },

    async Login(email) {
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
    },

    async GetSession(uuid) {
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
    },

    async UpdateSession(session) {
        try {
            let affectedRows = await models.sessions.update(session, {
                where: {
                    uuid: session.uuid
                }
            });

            if (affectedRows[0] > 0) {
                return Promise.resolve(affectedRows[0]);
            } else {
                repoErr = constants.HTTP.ERROR.NOT_FOUND;
                logger.warn(repoErr);
                return Promise.reject(repoErr);
            }
        } catch (err) {
            standardError(err.message);
            return Promise.reject(repoErr);
        }
    },

    async NewSession(session) {
        try {
            return await models.sessions.create(session)
        } catch (err) {
            standardError(err.message);
            return Promise.reject(repoErr);
        }

    },

    /***
     * Deletes all sessions that are inactive active a given number of milliseconds
     * @param cutoffDate is the date object for the latest date to keep results
     */
    async ClearStaleSessions(cutoffDate) {
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