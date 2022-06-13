import constants from '../utils/Constants';
import logger from '../utils/Logger';

const checkProtocol = async (req, res) => {
    if(req.protocol != 'https'){
        logger.info('Unsecure login attempt');
        return res.status(401).json(constants.AUTH.BAD_PROTOCOL);
    }

    return res;
}

export default checkProtocol;