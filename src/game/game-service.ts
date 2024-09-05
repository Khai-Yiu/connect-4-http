import { GameRepository } from "./in-memory-game-repository";

export interface GameServiceInterface {}

export default class GameService implements GameServiceInterface {
    constructor(repository: GameRepository, gameFactory: (...args: ConstructorParameters<typeof Game>) => Game) {
        
    }) {}
}
