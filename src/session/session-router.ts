import express, { RequestHandler } from 'express';
import SessionService from './session-service';
import { Uuid } from '@/global';
import halson from 'halson';
import UserService from '@/user/user-service';

const createRetrieveSessionRequestHandler =
    (
        sessionService: SessionService,
        userService: UserService
    ): RequestHandler =>
    async (req, res, next) => {
        const { uuid, inviter, invitee, status } =
            await sessionService.getSession(req.params.sessionUuid as Uuid);
        const { email: inviterEmail } = await userService.getUserDetailsByUuid(
            inviter.uuid
        );
        const { email: inviteeEmail } = await userService.getUserDetailsByUuid(
            invitee.uuid
        );

        res.status(200).json(
            halson({
                sessionUuid: uuid,
                inviter: inviterEmail,
                invitee: inviteeEmail,
                status
            })
                .addLink('self', req.originalUrl)
                .addLink('startGame', {
                    href: `/session/${uuid}/game`,
                    method: 'POST'
                })
                .addLink('leave', {
                    href: `/session/${uuid}/leave`,
                    method: 'GET'
                })
        );
    };

const sessionRouterFactory = (
    sessionService: SessionService,
    userService: UserService
) => {
    const sessionRouter = express.Router();

    sessionRouter.get(
        '/:sessionUuid',
        createRetrieveSessionRequestHandler(sessionService, userService)
    );

    return sessionRouter;
};

export default sessionRouterFactory;
