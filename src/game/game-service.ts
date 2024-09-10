import { GameDetails, GameFactory } from '@/game/game-types';
import { GameRepository } from '@/game/in-memory-game-repository';
import { Uuid } from '@/global';

export interface GameServiceInterface {
    createGame: () => Promise<Uuid>;
    getGameDetails: (gameUuid: Uuid) => Promise<GameDetails>;
}
export class NoSuchGameError extends Error {}

export default class GameService implements GameServiceInterface {
    repository: GameRepository;
    gameFactory: GameFactory;

    constructor(repository: GameRepository, gameFactory: GameFactory) {
        this.repository = repository;
        this.gameFactory = gameFactory;
    }

    async createGame() {
        const game = this.gameFactory();
        const { uuid } = await this.repository.saveGame(game.getDetails());

        return uuid;
    }

    async getGameDetails(gameUuid: Uuid) {
        return await this.repository.loadGame(gameUuid);
    }
}
