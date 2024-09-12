import {
    MoveDetails,
    SessionCreationDetails,
    SessionDetails
} from '@/session/session-service.d';
import { SessionRepository } from '@/session/in-memory-session-repository';
import { Uuid } from '@/global';
import GameService from '@/game/game-service';
import {
    PlayerMoveDetails,
    PlayerMoveResult,
    PlayerNumber
} from '@/game/game-types';
import { GameMetadata } from '@/session/in-memory-session-repository.d';

export interface SessionServiceInterface {
    createSession: (
        sessionCreationDetails: SessionCreationDetails
    ) => Promise<SessionDetails>;
    getSession: (sessionUuid: Uuid) => Promise<SessionDetails>;
    getGameUuids: (sessionUuid: Uuid) => Promise<Array<Uuid>>;
    getActiveGameUuid: (sessionUuid: Uuid) => Promise<Uuid>;
    addNewGame: (sessionUuid: Uuid, startingPlayerUuid: Uuid) => Promise<Uuid>;
    completeActiveGame: (sessionUuid: Uuid) => Promise<Uuid>;
    submitMove: (
        sessionUuid: Uuid,
        playerMove: PlayerMoveDetails
    ) => PlayerMoveResult;
}

export class NoSuchSessionError extends Error {}
export class ActiveGameInProgressError extends Error {}

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

        return [...sessionDetails.games.keys()];
    }

    async getActiveGameUuid(sessionUuid: Uuid) {
        const sessionDetails = await this.getSession(sessionUuid);
        return sessionDetails.activeGameUuid;
    }

    async getActivePlayer(sessionUuid: Uuid) {
        const sessionDetails = await this.getSession(sessionUuid);
        const { activePlayer } = await this.gameService.getGameDetails(
            sessionDetails.activeGameUuid
        );
        return this.#mapPlayerNumberToPlayerUuid(
            activePlayer,
            sessionDetails.games.get(sessionDetails.activeGameUuid)
        );
    }

    async #mapPlayerNumberToPlayerUuid(
        playerNumber: PlayerNumber,
        gameMetadata: GameMetadata
    ) {
        return playerNumber === 1
            ? gameMetadata.playerOneUuid
            : gameMetadata.playerTwoUuid;
    }

    async addNewGame(sessionUuid: Uuid, startingPlayerUuid: Uuid) {
        const activeGameUuid = await this.getActiveGameUuid(sessionUuid);

        if (activeGameUuid !== undefined) {
            throw new ActiveGameInProgressError();
        }

        const newGameUuid = await this.gameService.createGame();
        await this.repository.addGame(
            sessionUuid,
            newGameUuid,
            startingPlayerUuid
        );
        await this.repository.setActiveGame(sessionUuid, newGameUuid);

        return newGameUuid;
    }

    async completeActiveGame(sessionUuid: Uuid) {
        const completeGameUuid = (await this.repository.getSession(sessionUuid))
            .uuid;
        this.repository.unsetActiveGame(sessionUuid);

        return completeGameUuid;
    }

    async submitMove(sessionUuid: Uuid, playerUuid: Uuid, move: MoveDetails) {
        const {
            inviter: { uuid },
            activeGameUuid
        } = await this.repository.getSession(sessionUuid);

        return await this.gameService.submitMove(activeGameUuid, {
            player: playerUuid === uuid ? 1 : 2,
            targetCell: move
        });
    }
}
