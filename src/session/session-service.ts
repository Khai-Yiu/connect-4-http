import { SessionCreationDetails, SessionDetails } from './session-service.d';
import { SessionRepository } from './in-memory-session-repository';
import { Uuid } from '@/global';

export interface SessionServiceInterface {
    createSession: (
        sessionCreationDetails: SessionCreationDetails
    ) => Promise<SessionDetails>;
    getSession: (sessionUuid: Uuid) => Promise<SessionDetails>;
}

export default class SessionService {
    repository: SessionRepository;

    constructor(repository: SessionRepository) {
        this.repository = repository;
    }

    createSession(sessionCreationDetails: SessionCreationDetails) {
        return this.repository.create(sessionCreationDetails);
    }

    getSession(sessionUuid: Uuid) {
        return this.repository.getSession(sessionUuid);
    }
}
