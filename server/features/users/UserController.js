/*Created by anthonyg 01-05-2018*/
let User = require('./UserRepository'),
    logger = require('../../utils/Logger'),
    EncryptionHelper = require('../../utils/EncryptionHelper'),
    constants = require('../../utils/Constants'),
    SESSION_LIFE_PARAMS = require('../../config/env_config').sessionLife,
    moment = require('moment');


let self = module.exports = {

    /**
     * This function will add the given user
     * @param user The user to add
     * @returns {PromiseLike<>}
     * @constructor
     */
    Add(user){
        return EncryptionHelper.HashPassword(user.password)
            .then(hash=>{
                user.password = hash;
                return Promise.resolve(user);
            })
            .then(user=>User.Add(user))
            .then(newUser=>{
                //construct response
                let response = constants.HTTP.SUCCESS.CREATED;
                response._id = newUser._id;
                return Promise.resolve(response);
            })
    },

    /**
     * This function will fetch the user with the given _id
     * @param _id The id of the user to fetch
     * @returns JSON user
     */
    GetById(_id){
        return User.GetById(_id)
            .then(user=>{
                //construct response
                if(!user){
                    let response = constants.HTTP.ERROR.NOT_FOUND;
                    return Promise.resolve(response);
                }
                else{
                    return Promise.resolve(user);
                }
            })
    },

    /***
     * using the value from the config for stale session life, it will call the repository to delete old inactive sessions
     * @returns {Promise} with the result or error
     */
    ClearStaleSessions(){
        let cutoffDate = moment().subtract(SESSION_LIFE_PARAMS.staleSessionTimeToLiveInDays,'days').toDate();
        return new Promise((resolve, reject) => {
            User.ClearStaleSessions(cutoffDate, (err, result) => {
                if(err) {
                    return reject(err);
                } else {
                    return resolve(result);
                }
            })
        })
    }
};