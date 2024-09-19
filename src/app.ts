import express, { RequestHandler } from 'express';
import { resolveRouters, RouterTypes } from '@/user/resolve-routers';
import { JwtPrivateKey, KeySet, Stage } from './global';
import { jwtDecrypt } from 'jose';
import createServerSideWebSocket, {
    ExpressWithPortAndSocket
} from './create-server-side-web-socket';
import { InviteEvents } from './invite/invite-service.d';
import createDispatchNotification from './notification/create-dispatch-notification';
import { Server } from 'socket.io';
import { InternalEventPublisher } from './app.d';
import { Subject } from 'rxjs';
import createInviteEventListener, {
    InviteCreatedEvent
} from './invite/create-invite-event-listener';

type AppParameters = {
    stage: Stage;
    keySet: KeySet;
    internalEventPublisher?: InternalEventPublisher<unknown, unknown>;
    internalEventSubscriber?: Subject<InviteCreatedEvent>;
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

const createExternalEventPublisher = (serverSocket: Server) => {
    const dispatchNotification = createDispatchNotification(serverSocket);

    return (eventDetails) => {
        let type = eventDetails.type;
        if (type === InviteEvents.INVITATION_CREATED) {
            type = 'invite_received';
        }

        dispatchNotification({
            ...eventDetails,
            type
        });

        return Promise.resolve();
    };
};

const appFactory = ({
    stage,
    keySet,
    internalEventPublisher,
    internalEventSubscriber = new Subject()
}: AppParameters) => {
    const app = express() as ExpressWithPortAndSocket;

    createServerSideWebSocket(app, '/notification', keySet.privateKey);
    createInviteEventListener(
        internalEventSubscriber,
        createDispatchNotification(app.serverSocket)
    );

    const routers = resolveRouters({
        stage,
        keySet,
        authority: `ws://localhost:${app.port}`,
        internalEventPublisher
    });

    app.use(express.json());
    app.use(createAuthenticationMiddleware(keySet.privateKey));
    app.use('/user', routers[RouterTypes.userRouter]);
    app.use('/invite', routers[RouterTypes.inviteRouter]);
    app.use('/session', routers[RouterTypes.sessionRouter]);

    return app;
};

export default appFactory;
