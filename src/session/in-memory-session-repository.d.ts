import { Uuid } from '@/global.d';

export enum SessionStatus {
    IN_PROGRESS = 'IN_PROGRESS'
}

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
    gameUuids: Array<Uuid>;
    activeGameUuid?: Uuid;
};
