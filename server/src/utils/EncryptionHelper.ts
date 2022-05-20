import Bcrypt from 'bcrypt';
import { config } from '../config';
import logger from './Logger';
import IHTTPResponse from './IHTTPResponse';

const BCRYPT_PARAMS = config.auth.bcrypt;

export async function HashPassword(password): Promise<string> {
  try {
    return await Bcrypt.hash(password, BCRYPT_PARAMS.costFactor);
  } catch (error) {
    const responseError: IHTTPResponse = {
      statusCode: 500,
      message: error.message,
    };
    logger.warn(responseError);
    throw responseError;
  }
}

export function ComparePassword(password: string, hash: string): Promise<boolean> {
  return Bcrypt.compare(password, hash);
}
