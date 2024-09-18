import {
    InviteRepository,
    InviteCreationDetails
} from '@/invite/in-memory-invite-repository.d';
import { Uuid } from '@/global';
import { InviteStatus } from '@/invite/invite-service.d';

export type PersistedInvite = {
    uuid: string;
    inviter: string;
    invitee: string;
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

    async findReceivedInvitesByEmail(email: string) {
        return Array.from(this.invites.values()).filter(
            ({ inviter, invitee }) => email === invitee
        );
    }

    async findInviteById(uuid: Uuid) {
        return this.invites.get(uuid);
    }
}
