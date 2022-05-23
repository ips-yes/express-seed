let models = require('../../models/Index'),
    logger = require('../../utils/Logger'),
    constants = require('../../utils/Constants'),
    sequelize = require('../../models/Index').sequelize,
    Sequelize = require('sequelize');


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
            throw repoErr;
        }
    },

    async GetById(id) {
        try {
            return await models.users.findOne({
                where: {id: id},
                attributes: {exclude: ['password']},
                include: [
                    {model: models.userTypes, attributes: ['value']}
                ]
            })
        } catch (err) {
            standardError(err.message);
          throw repoErr;
        }
    },

    async GetUsers(){
        try{
            return await models.users.findAll({
                attributes: {exclude: ['password']},
                include:[
                    {
                        model: models.userTypes, attributes: ['value']
                    }
                ]
            })
        }catch(err){
            standardError(err.message);
            throw repoErr;
        }
    },

    async Update(user) {
        try {
            let affectedRows = await models.users.update(user,
              {
                  where: {id: user.id}
              });

            if (affectedRows[0] > 0) {
                return affectedRows[0];
            } else {
                logger.warn(constants.HTTP.ERROR.NOT_FOUND);
                return Promise.reject(constants.HTTP.ERROR.NOT_FOUND);
            }
        } catch (err) {
            standardError(err.message);
          throw repoError;
        }

    },

    async Login(email) {
        try {
            let users = await models.users.findAll({
                where: {
                    [Sequelize.Op.and]: [{
                        deleted: false
                    },
                        sequelize.where(sequelize.fn('lower', sequelize.col('email')), sequelize.fn('lower', email))]
                },
                include: [
                    {model: models.userTypes, attributes: ['value']}
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
          throw repoError;

        }
    },

    async GetSession(uuid) {
        try {
            return await models.sessions.findOne({
                where: {
                    uuid: uuid,
                    active: true,
                    expired: false
                }
            })
        } catch (err) {
            standardError(err.message);
            throw repoError;
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
            throw repoError;
        }
    },

    async NewSession(session) {
        try {
            return await models.sessions.create(session)
        } catch (err) {
            standardError(err.message);
            throw repoError;
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
                    expiresAt: {
                        [Sequelize.Op.lt]: cutoffDate
                    }
                }
            });

            return Promise.resolve(result);

        } catch (err) {
            standardError(err);
            throw repoError;
        }
    }

};