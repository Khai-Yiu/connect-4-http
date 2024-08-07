import UserService from '@/user/user-service';
import {
    InviteCreationDetails,
    InviteDetails,
    InviteStatus
} from '@/invite/invite-service.d';
import { InviteRepository } from '@/invite/in-memory-invite-repository.d';

interface InviteServiceInterface {
    create: (
        inviteCreationDetails: InviteCreationDetails
    ) => Promise<InviteDetails>;
    getInvites: (email: string) => Promise<Array<InviteDetails>>;
}

export class InvalidInvitationError extends Error {}

export default class InviteService implements InviteServiceInterface {
    userService: UserService;
    inviteRepository: InviteRepository;

    constructor(userService: UserService, inviteRepository: InviteRepository) {
        this.userService = userService;
        this.inviteRepository = inviteRepository;
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
        const { uuid, inviter, invitee, exp, status } =
            await this.inviteRepository.create({
                ...inviteCreationDetails,
                exp: Date.now() + lengthOfDayInMilliseconds,
                status: InviteStatus.PENDING
            });

        return {
            uuid,
            inviter,
            invitee,
            exp,
            status
        } as InviteDetails;
    }

    async getInvites(email: string) {
        return (await this.inviteRepository.findInvitesByEmail(
            email
        )) as Array<InviteDetails>;
    }
}
