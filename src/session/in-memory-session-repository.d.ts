import { Uuid } from '@/global.d';

export type SessionCreationDetails = {
    inviterUuid: Uuid;
    inviteeUuid: Uuid;
};

export type SessionPersistedDetails = {
    uuid: Uuid;
    inviter: {
        uuid: Uuid;
    };
    invitee: {
        uuid: Uuid;
    };
};
