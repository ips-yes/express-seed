/*Created by anthonyg 01-05-2018*/
import UserRepository from './UserRepository'
import { HashPassword } from '../../utils/EncryptionHelper'
import constants from '../../utils/Constants';
import { config } from '../../config'
import IHTTPResponse from "../../utils/IHTTPResponse";
import IUser from "./IUser";
const SESSION_LIFE_PARAMS = config.sessionLife;
let moment = require('moment');

export default class UserController {

    /**
     * This function will add the given user
     * @param user The user to add
     * @returns {PromiseLike<>}
     * @constructor
     */
    public static async Add(user: IUser): Promise<IHTTPResponse> {
        try {
            user.password = await HashPassword(user.password);
            user = await UserRepository.Add(user);
            return Object.assign({},
                constants.HTTP.SUCCESS.CREATED,
                {_id: user._id});
        } catch (err) {
            return Promise.reject(err);
        }
    }

    /**
     * This function will fetch the user with the given _id
     * @param _id The id of the user to fetch
     * @returns JSON user
     */

    public static async GetById(_id): Promise<IUser> {
        try {
            const user: IUser = await UserRepository.GetById(_id);
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
    }

    /***
     * using the value from the config for stale session life, it will call the repository to delete old inactive sessions
     * @returns {Promise} with the result or error
     */
    public static async ClearStaleSessions(): Promise<any[]> {
        let cutoffDate = moment().subtract(SESSION_LIFE_PARAMS.staleSessionTimeToLiveInDays, 'days').toDate();
        try {
            return await UserRepository.ClearStaleSessions(cutoffDate);
        } catch (err) {
            return err;
        }
    }
}
