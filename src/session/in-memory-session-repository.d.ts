import { Uuid } from '@/global.d';

export enum SessionStatus {
    IN_PROGRESS = 'IN_PROGRESS'
}

export type GameMetadata = {
    gameUuid: Uuid;
    playerOneUuid: Uuid;
    playerTwoUuid: Uuid;
};

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
    games: Map<Uuid, GameMetadata>;
    activeGameUuid?: Uuid;
};
