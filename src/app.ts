import express, { Router } from 'express';
import {
    resolveRouters,
    RouterParameters,
    RouterTypes
} from '@/user/resolve-routers';

type AppParameters = {
    routerParameters: RouterParameters;
};

const appFactory = ({ routerParameters }: AppParameters) => {
    const routers = resolveRouters(routerParameters);
    const app = express();
    app.use(express.json());
    app.use('/user', routers[RouterTypes.userRouter]);
    app.use('/invite', routers[RouterTypes.inviteRouter]);

    return app;
};

export default appFactory;
