import {
    InviteRepository,
    InviteCreationDetails
} from '@/invite/in-memory-invite-repository.d';
import { Uuid } from '@/global';

export type PersistedInvite = {
    uuid: String;
    inviter: String;
    invitee: String;
    exp: number;
};

export default class InMemoryInviteRepository implements InviteRepository {
    private invites: Map<Uuid, PersistedInvite>;

    constructor() {
        this.invites = new Map();
    }

    async create({ inviter, invitee, exp }: InviteCreationDetails) {
        const uuid = crypto.randomUUID();
        this.invites.set(uuid, { uuid, inviter, invitee, exp });

        return {
            uuid,
            inviter,
            invitee,
            exp
        };
    }
}
