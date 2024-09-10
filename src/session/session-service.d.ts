import { Uuid } from '@/global.d';
import { SessionStatus } from './in-memory-session-repository.d';

export type SessionCreationDetails = {
    inviterUuid: Uuid;
    inviteeUuid: Uuid;
};

export type SessionDetails = {
    uuid: Uuid;
    inviter: {
        uuid: Uuid;
    };
    invitee: {
        uuid: Uuid;
    };
    status: SessionStatus;
    gameUuids: Array<Uuid>;
    activeGameUuid: Uuid;
};
