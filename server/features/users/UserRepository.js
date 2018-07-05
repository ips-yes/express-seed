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

let self = module.exports={


    Add(user){
        return models.users.create(user)
            .catch(err=>{
                standardError(err.name+' '+err.message);
                return repoErr;
            })
    },

    GetById(_id){
      return models.users.find({
          where:{_id:_id},
          attributes: {exclude: ['password']},
          include: [
              {model: models.user_types, attributes: ['value']}
          ]
      })
          .catch(err=>{
              standardError(err.message);
              return Promise.reject(repoErr);
          })
    },

    Update(user){
        return models.users.update(user,
            {
                where: {_id: user._id}
            })
            .then(affectedRows => {
                if(affectedRows[0] >0){
                    return Promise.resolve(affectedRows)
                }else{
                    logger.warn(constants.HTTP.ERROR.NOT_FOUND);
                    return Promise.reject(constants.HTTP.ERROR.NOT_FOUND);
                }
            })
            .catch(err=>{
                standardError(err.message);
                return Promise.reject(repoErr);
            })
    },

    Login(email){
        return models.users.findAll({
            where: {
                [Op.and]: [ {
                    deleted: false
                },
                sequelize.where(sequelize.fn('lower', sequelize.col('email')), sequelize.fn('lower', email))]
            },
            include: [
                {model: models.user_types, attributes: ['value']}
            ]
        })
            .then(users => {
                if(users.length > 0) {
                    return Promise.resolve(users[0]);
                } else{
                    logger.warn(constants.HTTP.ERROR.NOT_FOUND);
                    return Promise.resolve(constants.HTTP.ERROR.NOT_FOUND);
                }
            })
    },

    GetSession(uuid){
        return models.sessions.find({
            where: {
                uuid: uuid,
                active: true,
                expired: false
            }
        })
            .catch(err => {
                standardError(err.message);
                return Promise.reject(repoErr);
            })
    },

    UpdateSession(session){
        return models.sessions.update(session, {
            where: {
                uuid: session.uuid
            }
        })
            .then(affectedRows => {
                if (affectedRows[0] > 0) {
                    return Promise.resolve(affectedRows);
                } else {
                    repoErr = constants.HTTP.ERROR.NOT_FOUND;
                    logger.warn(repoErr);
                    return Promise.reject(repoErr);
                }
            })
            .catch(err => {
                standardError(err.message);
                return Promise.reject(repoErr);
            })
    },

    NewSession(session){
        return models.sessions.create(session)
            .catch(err => {
                standardError(err.message);
                return Promise.reject(repoErr);
            })
    },

    /***
     * Deletes all sessions that are inactive active a given number of milliseconds
     * @param cutoffDate is the date object for the latest date to keep results
     * @param cb is the callback upon delete completion
     */
    ClearStaleSessions(cutoffDate, cb){
        models.sessions.destroy({
            where: {
                expires_at: {
                    [Op.lt]: cutoffDate
                }
            }
        })
            .catch(err => {
                standardError(err.message);
                return Promise.reject(repoErr);
            })
    }

};