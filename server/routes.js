/*Created by anthonyg 01-05-2018*/
let express = require('express');
let router = express.Router();

//===============================================================================================//
//  ROUTES                                                                                       //
//===============================================================================================//
router.use('/users', require('./features/users/UserRoute'));

module.exports = router;