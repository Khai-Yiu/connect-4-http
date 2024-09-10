import { SessionCreationDetails, SessionDetails } from './session-service.d';
import { SessionRepository } from './in-memory-session-repository';
import { Uuid } from '@/global';
import GameService from '@/game/game-service';

export interface SessionServiceInterface {
    createSession: (
        sessionCreationDetails: SessionCreationDetails
    ) => Promise<SessionDetails>;
    getSession: (sessionUuid: Uuid) => Promise<SessionDetails>;
    getGameUuids: (sessionUuid: Uuid) => Promise<Array<Uuid>>;
    getActiveGameUuid: (sessionUuid: Uuid) => Promise<Uuid>;
    addNewGame: (sessionUuid: Uuid) => Promise<Uuid>;
}

export class NoSuchSessionError extends Error {}
export default class SessionService {
    repository: SessionRepository;
    gameService: GameService;

    constructor(repository: SessionRepository, gameService: GameService) {
        this.repository = repository;
        this.gameService = gameService;
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

    async getGameUuids(sessionUuid: Uuid) {
        const sessionDetails = await this.getSession(sessionUuid);
        return sessionDetails.gameUuids;
    }

    async getActiveGameUuid(sessionUuid: Uuid) {
        const sessionDetails = await this.getSession(sessionUuid);
        return sessionDetails.getActiveGameUuid;
    }

    async addNewGame(sessionUuid: Uuid) {
        const newGameUuid = await this.gameService.createGame();
        await this.repository.addNewGame(sessionUuid, newGameUuid);
        await this.repository.setActiveGame(sessionUuid, newGameUuid);

        return newGameUuid;
    }
}
