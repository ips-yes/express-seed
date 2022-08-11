import express from 'express';
import userRouter from './features/users/UserRoute';
import databaseHealth from './middleware/DatabaseHealth';

const router = express.Router();

// =============================================================================================== //
// ROUTES                                                                                          //
// =============================================================================================== //

router.use('/users', databaseHealth, userRouter);
router.use('/check', (req, res) => res.json('OK'));

export = router;
