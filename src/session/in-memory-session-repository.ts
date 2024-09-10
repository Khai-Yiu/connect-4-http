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
}

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
            status: SessionStatus.IN_PROGRESS
        };
        this.sessions.set(sessionUuid, sessionDetails);

        return sessionDetails;
    }

    async getSession(sessionUuid: Uuid) {
        return this.sessions.get(sessionUuid);
    }
}
