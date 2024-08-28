import express, { RequestHandler } from 'express';
import {
    resolveRouters,
    RouterParameters,
    RouterTypes
} from '@/user/resolve-routers';
import { JwtPrivateKey } from './global';
import { jwtDecrypt } from 'jose';
import createServerSideWebSocket, {
    ExpressWithPortAndSocket
} from './create-server-side-web-socket';

type AppParameters = {
    routerParameters: RouterParameters;
};

const createAuthenticationMiddleware =
    (privateKey: JwtPrivateKey): RequestHandler =>
    async (req, res, next) => {
        const authorizationField = req.headers.authorization;

        if (authorizationField) {
            try {
                const { payload } = await jwtDecrypt(
                    authorizationField.split(' ')[1],
                    privateKey
                );

                res.locals.claims = {
                    email: payload.username
                };
            } catch (error) {
                res.locals.claims = {
                    email: undefined
                };
            }
        } else {
            res.locals.claims = {
                email: undefined
            };
        }

        next();
    };

const appFactory = ({ routerParameters }: AppParameters) => {
    const app = express() as ExpressWithPortAndSocket;

    createServerSideWebSocket(
        app,
        '/notification',
        routerParameters.keySet.privateKey
    );
    const routers = resolveRouters(
        routerParameters,
        `ws://localhost:${app.port}`
    );

    app.use(express.json());
    app.use(createAuthenticationMiddleware(routerParameters.keySet.privateKey));
    app.use('/user', routers[RouterTypes.userRouter]);
    app.use('/invite', routers[RouterTypes.inviteRouter]);

    return app;
};

export default appFactory;
