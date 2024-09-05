import { SessionRepository } from './in-memory-session-repository';

export default class SessionService {
    repository: SessionRepository;

    constructor(repository: SessionRepository) {
        this.repository = repository;
    }
}
