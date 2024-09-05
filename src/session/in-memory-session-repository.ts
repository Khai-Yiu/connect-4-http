import { Uuid } from '@/global';
import {
    SessionCreationDetails,
    SessionPersistedDetails as SessionDetails
} from '@/session/in-memory-session-repository.d';

export interface SessionRepository {
    create: (sessionCreationDetails: SessionCreationDetails) => SessionDetails;
}

export default class InMemorySessionRepository {
    sessions: Map<Uuid, SessionDetails>;

    constructor() {
        this.sessions = new Map();
    }

    create({ inviterUuid, inviteeUuid }: SessionCreationDetails) {
        const sessionDetails = {
            inviter: {
                uuid: inviterUuid
            },
            invitee: {
                uuid: inviteeUuid
            }
        };
        const sessionUuid = crypto.randomUUID();
        this.sessions.set(sessionUuid, sessionDetails);

        return sessionDetails;
    }
}
