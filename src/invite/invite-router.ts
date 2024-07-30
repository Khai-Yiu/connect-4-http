import express from 'express';
import { RequestHandler } from 'express-serve-static-core';
import InviteService from '@/invite/invite-service';
import { JwtPrivateKey, KeySet } from '@/global';

const createCreateInvitationRequestHandler =
    (inviteService: InviteService): RequestHandler =>
    async (req, res, next) => {
        const { inviter, invitee } = req.body;
        const { uuid, exp, status } = await inviteService.create({
            invitee,
            inviter
        });
        const invitationDetails = {
            uuid,
            inviter,
            invitee,
            exp,
            status
        };

        res.status(201).send({ invite: invitationDetails });

        next();
    };

const createInviteAuthorizationMiddleware: RequestHandler = (
    req,
    res,
    next
) => {
    const { inviter } = req.body;

    if (inviter === res.locals.claims.email) {
        next();
    } else {
        res.status(401).send({
            errors: ['You can not send an invite as another user.']
        });
    }
};

const createAuthorizationMiddleware =
    (privateKey: JwtPrivateKey): RequestHandler =>
    async (req, res, next) => {
        res.locals.claims.email
            ? next()
            : res.status(401).send({
                  errors: ['You must be logged in to send an invite.']
              });
    };

const inviteRouterFactory = (inviteService: InviteService, keySet: KeySet) => {
    const inviteRouter = express.Router();

    inviteRouter.use(createAuthorizationMiddleware(keySet.privateKey));
    inviteRouter.post(
        '/',
        createInviteAuthorizationMiddleware,
        createCreateInvitationRequestHandler(inviteService)
    );

    return inviteRouter;
};

export default inviteRouterFactory;
