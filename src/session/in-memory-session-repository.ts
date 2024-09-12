import { Uuid } from '@/global';
import {
    SessionCreationDetails,
    SessionDetails,
    SessionStatus
} from '@/session/in-memory-session-repository.d';

export interface SessionRepository {
    create: (
        sessionCreationDetails: SessionCreationDetails
    ) => Promise<SessionDetails>;
    getSession: (sessionUuid: Uuid) => Promise<SessionDetails>;
    addGame: (
        sessionUuid: Uuid,
        gameUuid: Uuid,
        startingPlayerUuid: Uuid
    ) => Promise<SessionDetails>;
    setActiveGame: (
        sessionUuid: Uuid,
        gameUuid: Uuid
    ) => Promise<SessionDetails>;
    unsetActiveGame: (sessionUuid: Uuid) => Promise<SessionDetails>;
}

export class ActiveGameInProgressError extends Error {}

export default class InMemorySessionRepository {
    sessions: Map<Uuid, SessionDetails>;

    constructor() {
        this.sessions = new Map();
    }

    async create({ inviterUuid, inviteeUuid }: SessionCreationDetails) {
        const sessionUuid = crypto.randomUUID();
        const sessionDetails = {
            uuid: sessionUuid,
            inviter: {
                uuid: inviterUuid
            },
            invitee: {
                uuid: inviteeUuid
            },
            status: SessionStatus.IN_PROGRESS,
            games: new Map()
        };

        this.sessions.set(sessionUuid, sessionDetails);

        return sessionDetails;
    }

    async getSession(sessionUuid: Uuid) {
        return this.sessions.get(sessionUuid);
    }

    async addGame(sessionUuid: Uuid, gameUuid: Uuid, startingPlayerUuid: Uuid) {
        const sessionDetails = await this.getSession(sessionUuid);
        const gameMetadata = {
            gameUuid,
            playerOneUuid: startingPlayerUuid,
            playerTwoUuid:
                startingPlayerUuid === sessionDetails.inviter.uuid
                    ? sessionDetails.invitee.uuid
                    : sessionDetails.inviter.uuid
        };

        sessionDetails.games.set(gameUuid, gameMetadata);

        return sessionDetails;
    }

    async setActiveGame(sessionUuid: Uuid, gameUuid: Uuid) {
        const sessionDetails = await this.getSession(sessionUuid);
        sessionDetails.activeGameUuid = gameUuid;

        return sessionDetails;
    }

    async unsetActiveGame(sessionUuid: Uuid) {
        const sessionDetails = await this.getSession(sessionUuid);
        sessionDetails.activeGameUuid = undefined;

        return sessionDetails;
    }
}
