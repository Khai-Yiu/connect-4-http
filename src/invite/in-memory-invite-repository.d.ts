import { PersistedInvite } from '@/invite/in-memory-invite-repository';

export interface InviteRepository {
    create: (
        inviteCreationDetails: InviteCreationDetails
    ) => Promise<PersistedInvite>;
}

export type InviteCreationDetails = {
    inviter: String;
    invitee: String;
    exp: number;
};
