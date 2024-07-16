import express from 'express';
import { resolveRouters, RouterTypes } from '@/user/resolve-routers';
import { Env } from '@/global';

const routers = resolveRouters(process.env.NODE_ENV as Env);
const app = express();
app.use(express.json());
app.use('/user', routers[RouterTypes.userRouter]);

export default app;
