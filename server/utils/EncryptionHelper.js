/**
 * Created by anthonyg on 4/29/2016.
 */
let bcrypt = require('bcrypt'),
    deployConfig = require('../config'),
    logger = require('./Logger');

let BCRYPT_PARAMS = deployConfig.auth.bcrypt;


module.exports = {
    HashPassword(password) {
        return bcrypt.hash(password, BCRYPT_PARAMS.costFactor)
            .then(res=>{
                return new Promise((resolve, reject)=>{
                    if(res){
                        return resolve(res);
                    }else{
                        let err = {
                                statusCode: 500,
                                message: res.message
                            };
                        logger.warn(err);
                        return reject(err);
                    }
                })

            })
    },

    ComparePassword(password, hash) {
        return bcrypt.compare(password, hash)
    }
};