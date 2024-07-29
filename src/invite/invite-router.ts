import express from 'express';
import { RequestHandler } from 'express-serve-static-core';
import InviteService from '@/invite/invite-service';

const createInvitationRequestHandler =
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

const inviteRouterFactory = (inviteService: InviteService) => {
    const inviteRouter = express.Router();
    inviteRouter.post('/', createInvitationRequestHandler(inviteService));

    return inviteRouter;
};

export default inviteRouterFactory;
