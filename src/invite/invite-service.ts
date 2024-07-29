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
}

export default class InviteService implements InviteServiceInterface {
    userService: UserService;
    inviteRepository: InviteRepository;

    constructor(userService: UserService, inviteRepository: InviteRepository) {
        this.userService = userService;
        this.inviteRepository = inviteRepository;
    }

    async create({ inviter, invitee }: InviteCreationDetails) {
        const lengthOfDayInMilliseconds = 60 * 60 * 24 * 1000;
        const exp = Date.now() + lengthOfDayInMilliseconds;
        const { uuid } = await this.inviteRepository.create({
            inviter,
            invitee,
            exp
        });

        return {
            uuid,
            inviter,
            invitee,
            exp,
            status: InviteStatus.PENDING
        };
    }
}
