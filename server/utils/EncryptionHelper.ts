/**
 * Created by anthonyg on 4/29/2016.
 */
import { hash, compare } from 'bcrypt'
import { config } from './../config'
import logger from './Logger'
import IHTTPResponse from "./IHTTPResponse";

const BCRYPT_PARAMS = config.auth.bcrypt;

export async function HashPassword (password): Promise<string> {
  try {
      return await hash(password, BCRYPT_PARAMS.costFactor)
  } catch(error) {
      const responseError: IHTTPResponse = {
          statusCode: 500,
          message: error.message
      };
      logger.warn(responseError);
      throw responseError;
  }
}

export function ComparePassword (password: string, hash: string): Promise<boolean> {
  return compare(password, hash)
}
