import { GameFactory } from '@/game/game-types';
import { GameRepository } from '@/game/in-memory-game-repository';

export interface GameServiceInterface {}
export class NoSuchGameError extends Error {}

export default class GameService implements GameServiceInterface {
    repository: GameRepository;
    gameFactory: GameFactory;

    constructor(repository: GameRepository, gameFactory: GameFactory) {
        this.repository = repository;
        this.gameFactory = gameFactory;
    }
}
