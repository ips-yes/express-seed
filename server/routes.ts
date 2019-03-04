/*Created by anthonyg 01-05-2018*/
import * as express from 'express';
const router = express.Router();

//===============================================================================================//
//  ROUTES                                                                                       //
//===============================================================================================//
router.use('/users', require('./features/users/UserRoute'));

module.exports = router;
