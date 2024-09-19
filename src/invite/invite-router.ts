import express from 'express';
import { RequestHandler } from 'express-serve-static-core';
import InviteService from '@/invite/invite-service';
import halson from 'halson';
import { Uuid } from '@/global';

const createGetInviteRequestHandler =
    (inviteService: InviteService): RequestHandler =>
    async (req, res, next) => {
        const inviteDetails = await inviteService.getInvite(
            req.params.inviteUuid as Uuid
        );

        res.status(200).send({ invite: inviteDetails });
    };

const createInviteAcceptMiddleware =
    (inviteService: InviteService): RequestHandler =>
    async (req, res, next) => {
        const sessionUuid = await inviteService.acceptInvite(
            req.params.inviteUuid as Uuid
        );

        res.status(200).send(
            halson({
                _links: {
                    related: [{ href: `/session/${sessionUuid}` }]
                }
            }).addLink('self', `/invite/${req.params.inviteUuid}`)
        );
    };

const createGetReceivedInvitesRequestHandler =
    (inviteService: InviteService): RequestHandler =>
    async (req, res, next) => {
        const email = res.locals.claims.email;
        const invites = await inviteService.getReceivedInvites(email);

        res.status(201).send({
            invites: invites.map((invite) =>
                halson({
                    ...invite,
                    _links: {
                        accept: {
                            href: `/invite/${invite.uuid}/accept`,
                            method: 'POST'
                        },
                        decline: {
                            href: `/invite/${invite.uuid}/decline`,
                            method: 'POST'
                        }
                    }
                })
            )
        });
    };

const createCreateInvitationRequestHandler =
    (inviteService: InviteService): RequestHandler =>
    async (req, res, next) => {
        const { inviter, invitee } = req.body;
        await inviteService
            .create({
                invitee,
                inviter
            })
            .then(({ uuid, exp, status }) => {
                const invitationDetails = {
                    uuid,
                    inviter,
                    invitee,
                    exp,
                    status
                };

                res.status(201).send({ invite: invitationDetails });
            })
            .catch((error) =>
                res.status(403).send({ errors: [error.message] })
            );

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

const authorizeRequest: RequestHandler = async (req, res, next) => {
    res.locals.claims.email
        ? next()
        : res.status(401).send({
              errors: ['You must be logged in to send an invite.']
          });
};

const inviteRouterFactory = (inviteService: InviteService) => {
    const inviteRouter = express.Router();

    inviteRouter.use(authorizeRequest);
    inviteRouter.post(
        '/',
        createInviteAuthorizationMiddleware,
        createCreateInvitationRequestHandler(inviteService)
    );
    inviteRouter.get(
        '/inbox',
        createGetReceivedInvitesRequestHandler(inviteService)
    );

    inviteRouter.post(
        '/:inviteUuid/accept',
        createInviteAcceptMiddleware(inviteService)
    );

    inviteRouter.get(
        '/:inviteUuid',
        createGetInviteRequestHandler(inviteService)
    );

    return inviteRouter;
};

export default inviteRouterFactory;
