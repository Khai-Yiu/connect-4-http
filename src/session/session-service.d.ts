import { Uuid } from '@/global.d';
import { SessionStatus } from '@/session/in-memory-session-repository.d';

export type MoveDetails = {
    row: number;
    column: number;
};

export type SessionCreationDetails = {
    inviterUuid: Uuid;
    inviteeUuid: Uuid;
};

export type GameMetadata = {
    gameUuid: Uuid;
    playerOneUuid: Uuid;
    playerTwoUuid: Uuid;
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
    activeGameUuid: Uuid;
};
