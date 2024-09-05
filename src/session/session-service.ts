import { SessionCreationDetails, SessionDetails } from './session-service.d';
import { SessionRepository } from './in-memory-session-repository';

export interface SessionServiceInterface {
    createSession: (
        sessionCreationDetails: SessionCreationDetails
    ) => Promise<SessionDetails>;
}

export default class SessionService {
    repository: SessionRepository;

    constructor(repository: SessionRepository) {
        this.repository = repository;
    }

    createSession(sessionCreationDetails: SessionCreationDetails) {
        return this.repository.create(sessionCreationDetails);
    }
}
