/*Created by anthonyg 01-05-2018*/
let User = require('./UserRepository'),
  logger = require('../../utils/Logger'),
  EncryptionHelper = require('../../utils/EncryptionHelper'),
  constants = require('../../utils/Constants'),
  SESSION_LIFE_PARAMS = require('../../config').sessionLife,
  moment = require('moment');


let self = module.exports = {

    /**
     * This function will add the given user
     * @param user The user to add
     * @returns {PromiseLike<>}
     * @constructor
     */
    async Add(user) {
        try {
            user.password = await EncryptionHelper.HashPassword(user.password);
            user = await User.Add(user);
            let response = constants.HTTP.SUCCESS.CREATED;
            response.id = user.id;
            return response;
        } catch (err) {
            return Promise.reject(err);
        }

    },

    /**
     * This function will fetch the user with the given id
     * @param id The id of the user to fetch
     * @returns JSON user
     */
    async GetById(id) {
        try {
            let user = await User.GetById(id);
            if (!user) {
                let response = constants.HTTP.ERROR.NOT_FOUND;
                return Promise.reject(response);
            }
            else {
                return user
            }
        } catch (err) {
            return Promise.reject(err);
        }
    },

    async GetAllUsers(){
        try{
            let users = User.GetUsers();
            if(!users){
                let response = constants.HTTP.ERROR.NOT_FOUND;
            }
            else{
                return users;
            }
        }catch(err){
            return Promise.reject(err);
        }
    },

    /***
     * using the value from the config for stale session life, it will call the repository to delete old inactive sessions
     * @returns {Promise} with the result or error
     */
    async ClearStaleSessions() {
        let cutoffDate = moment().subtract(SESSION_LIFE_PARAMS.staleSessionTimeToLiveInDays, 'days').toDate();
        try {
            return await User.ClearStaleSessions(cutoffDate);
        } catch (err) {
            return err;
        }
    }
};