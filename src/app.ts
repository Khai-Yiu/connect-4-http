import express from 'express';
import userRouter from '@/user/user-router';

const app = express();

app.use('/user', userRouter);

export default app;
