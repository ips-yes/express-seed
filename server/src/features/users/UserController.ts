/* Created by anthonyg 01-05-2018 */
import moment from 'moment';
import UserRepository from './UserRepository';
import { HashPassword } from '../../utils/EncryptionHelper';
import constants from '../../utils/Constants';
import config from '../../config';
import IHTTPResponse from '../../utils/IHTTPResponse';
import IUser from './IUser';

const SESSION_LIFE_PARAMS = config.sessionLife;

export default class UserController {
  /**
     * This function will add the given user
     * @param user The user to add
     * @returns {PromiseLike<>}
     * @constructor
     */
  public static async Add(user: IUser): Promise<IHTTPResponse> {
    let _user = { ...user };
    try {
      _user.password = await HashPassword(user.password);
      _user = await UserRepository.Add(_user);
      return {
        ...constants.HTTP.SUCCESS.CREATED,
        id: user.id,
      };
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
     * This function will fetch the user with the given _id
     * @param id The id of the user to fetch
     * @returns JSON user
     */

  public static async GetById(id): Promise<IUser> {
    try {
      const user: IUser = await UserRepository.GetById(id);
      if (!user) {
        const response = constants.HTTP.ERROR.NOT_FOUND;
        return Promise.reject(response);
      }

      return user;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
    * using the value from the config for stale session life,
    * it will call the repository to delete old inactive sessions
    *
    * @returns {Promise} with the result or error
   */
  public static async ClearStaleSessions(): Promise<any[]> {
    const cutoffDate = moment().subtract(SESSION_LIFE_PARAMS.staleSessionTimeToLiveInDays, 'days').toDate();
    try {
      return await UserRepository.ClearStaleSessions(cutoffDate);
    } catch (err) {
      return err;
    }
  }
}
