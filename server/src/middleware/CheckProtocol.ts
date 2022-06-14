import constants from '../utils/Constants';
import logger from '../utils/Logger';

const checkProtocol = async (req, res, next) => {
    if(req.protocol != 'https'){
        logger.info('Unsecure login attempt');
        return res.status(401).json(constants.AUTH.BAD_PROTOCOL);
    }

    return next();
}

export default checkProtocol;