import constants from '../utils/Constants';
import logger from '../utils/Logger';

const checkProtocol = async (req, res, next) => {
  if (req.protocol !== 'https') {
    logger.info('User sent HTTPS only request over HTTP');
    return res.status(403).json(constants.AUTH.BAD_PROTOCOL);
  }

  return next();
};

export default checkProtocol;
