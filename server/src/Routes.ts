import express from 'express';
import userRouter from './features/users/UserRoute';

const router = express.Router();

// =============================================================================================== //
// ROUTES                                                                                          //
// =============================================================================================== //

router.use('/users', userRouter);

export = router;
