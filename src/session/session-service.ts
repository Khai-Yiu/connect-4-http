import { SessionCreationDetails, SessionDetails } from './session-service.d';
import { SessionRepository } from './in-memory-session-repository';
import { Uuid } from '@/global';

export interface SessionServiceInterface {
    createSession: (
        sessionCreationDetails: SessionCreationDetails
    ) => Promise<SessionDetails>;
    getSession: (sessionUuid: Uuid) => Promise<SessionDetails>;
}

export class NoSuchSessionError extends Error {}
export default class SessionService {
    repository: SessionRepository;

    constructor(repository: SessionRepository) {
        this.repository = repository;
    }

    async createSession(sessionCreationDetails: SessionCreationDetails) {
        return await this.repository.create(sessionCreationDetails);
    }

    async getSession(sessionUuid: Uuid) {
        const sessionDetails = await this.repository.getSession(sessionUuid);

        if (sessionDetails === undefined) {
            throw new NoSuchSessionError();
        }

        return sessionDetails;
    }
}
