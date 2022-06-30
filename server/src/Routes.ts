import express from 'express';
import userRouter from './features/users/UserRoute';

const router = express.Router();

// =============================================================================================== //
// ROUTES                                                                                          //
// =============================================================================================== //

router.use('/users', userRouter);
router.use('/check', (req, res) => res.json('OK'));

export = router;
