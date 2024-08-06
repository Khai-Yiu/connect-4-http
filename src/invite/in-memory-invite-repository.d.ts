import { PersistedInvite } from '@/invite/in-memory-invite-repository';
import { InviteStatus } from '@/invite/invite-service.d';

export interface InviteRepository {
    create: (
        inviteCreationDetails: InviteCreationDetails
    ) => Promise<PersistedInvite>;
    findInvitesByEmail: (email: string) => Promise<Array<PersistedInvite>>;
}

export type InviteCreationDetails = {
    inviter: string;
    invitee: string;
    exp: number;
    status: InviteStatus;
};
