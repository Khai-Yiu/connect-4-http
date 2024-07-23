import express, { Router } from 'express';
import {
    resolveRouters,
    RouterParameters,
    RouterTypes
} from '@/user/resolve-routers';

type AppParameters = {
    routerParameters: RouterParameters;
};

const appFactory = (appParameters: AppParameters) => {
    const { routerParameters } = appParameters;
    const routers = resolveRouters(routerParameters);
    const app = express();
    app.use(express.json());
    app.use('/user', routers[RouterTypes.userRouter]);

    return app;
};

export default appFactory;
