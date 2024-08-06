import {
    InviteRepository,
    InviteCreationDetails
} from '@/invite/in-memory-invite-repository.d';
import { Uuid } from '@/global';
import { InviteStatus } from '@/invite/invite-service.d';

export type PersistedInvite = {
    uuid: String;
    inviter: String;
    invitee: String;
    exp: number;
    status: InviteStatus;
};

export default class InMemoryInviteRepository implements InviteRepository {
    private invites: Map<Uuid, PersistedInvite>;

    constructor() {
        this.invites = new Map();
    }

    async create({ inviter, invitee, exp, status }: InviteCreationDetails) {
        const uuid = crypto.randomUUID();
        this.invites.set(uuid, { uuid, inviter, invitee, exp, status });

        return {
            uuid,
            inviter,
            invitee,
            exp,
            status
        };
    }

    async findInvitesByEmail(email: string) {
        return Array.from(this.invites.values()).filter(
            ({ inviter, invitee }) => email === inviter || email === invitee
        );
    }
}
