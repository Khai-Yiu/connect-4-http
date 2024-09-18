import UserService from '@/user/user-service';
import {
    InviteCreationDetails,
    InviteDetails,
    InviteEvents,
    InviteServiceEventHandlers,
    InviteStatus
} from '@/invite/invite-service.d';
import { InviteRepository } from '@/invite/in-memory-invite-repository.d';
import { Uuid } from '@/global';
import SessionService from '@/session/session-service';

interface InviteServiceInterface {
    create: (
        inviteCreationDetails: InviteCreationDetails
    ) => Promise<InviteDetails>;
    getReceivedInvites: (email: string) => Promise<Array<InviteDetails>>;
    acceptInvite: (uuid: Uuid) => Promise<Uuid>;
}

export class InvalidInvitationError extends Error {}

export default class InviteService implements InviteServiceInterface {
    userService: UserService;
    sessionService: SessionService;
    inviteRepository: InviteRepository;
    eventHandlers: InviteServiceEventHandlers;

    constructor(
        userService: UserService,
        sessionService: SessionService,
        inviteRepository: InviteRepository,
        eventHandlers: InviteServiceEventHandlers = {
            [InviteEvents.INVITATION_CREATED]: () => Promise.resolve()
        }
    ) {
        this.userService = userService;
        this.sessionService = sessionService;
        this.inviteRepository = inviteRepository;
        this.eventHandlers = eventHandlers;
    }

    async create(inviteCreationDetails: InviteCreationDetails) {
        if (inviteCreationDetails.invitee === inviteCreationDetails.inviter) {
            throw new InvalidInvitationError(
                'Users can not send invites to themselves.'
            );
        }

        const doesInviteeExist = !(await this.userService.getDoesUserExist(
            inviteCreationDetails.invitee
        ));

        if (doesInviteeExist) {
            throw new InvalidInvitationError('Invitee does not exist.');
        }

        const lengthOfDayInMilliseconds = 60 * 60 * 24 * 1000;
        const inviteDetails = await this.inviteRepository.create({
            ...inviteCreationDetails,
            exp: Date.now() + lengthOfDayInMilliseconds,
            status: InviteStatus.PENDING
        });

        await this.eventHandlers[InviteEvents.INVITATION_CREATED](
            inviteDetails as InviteDetails
        );

        return inviteDetails as InviteDetails;
    }

    async getReceivedInvites(email: string) {
        return (await this.inviteRepository.findReceivedInvitesByEmail(
            email
        )) as Array<InviteDetails>;
    }

    async acceptInvite(uuid: Uuid) {
        const inviteDetails = await this.inviteRepository.findInviteById(uuid);
        const { uuid: inviterUuid } = await this.userService.getUserDetails(
            inviteDetails.inviter
        );

        const { uuid: inviteeUuid } = await this.userService.getUserDetails(
            inviteDetails.invitee
        );

        if (inviteDetails) {
            inviteDetails.status = InviteStatus.ACCEPTED;
        }

        const sessionDetails = await this.sessionService.createSession({
            inviterUuid,
            inviteeUuid
        });

        return sessionDetails.uuid;
    }
}
