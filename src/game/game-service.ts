import {
    GameDetails,
    GameEvents,
    GameFactory,
    PlayerMoveDetails as playerMoveDetails,
    PlayerMoveHandler,
    PlayerMoveResult
} from '@/game/game-types.d';
import { GameRepository } from '@/game/in-memory-game-repository';
import { Uuid } from '@/global';

export interface GameServiceInterface {
    createGame: () => Promise<Uuid>;
    getGameDetails: (gameUuid: Uuid) => Promise<GameDetails>;
    submitMove: (
        gameUuid: Uuid,
        playerMoveDetails: playerMoveDetails
    ) => Promise<PlayerMoveResult>;
}
export class NoSuchGameError extends Error {}

export default class GameService implements GameServiceInterface {
    repository: GameRepository;
    gameFactory: GameFactory;
    playerMoveHandler: PlayerMoveHandler;

    constructor(
        repository: GameRepository,
        gameFactory: GameFactory,
        playerMoveHandler: PlayerMoveHandler = () => Promise.resolve()
    ) {
        this.repository = repository;
        this.gameFactory = gameFactory;
        this.playerMoveHandler = playerMoveHandler;
    }

    async createGame() {
        const game = this.gameFactory();
        const { uuid } = await this.repository.saveGame(game.getDetails());

        return uuid;
    }

    async getGameDetails(gameUuid: Uuid) {
        return await this.repository.loadGame(gameUuid);
    }

    async submitMove(gameUuid: Uuid, playerMove: playerMoveDetails) {
        const gameDetails = await this.repository.loadGame(gameUuid);
        const game = this.gameFactory(gameDetails);
        const moveResult = game.move(playerMove);
        await this.repository.saveGame(game.getDetails());

        if (moveResult.moveSuccessful) {
            this.playerMoveHandler({
                type: GameEvents.PLAYER_MOVED,
                payload: {
                    player: playerMove.player,
                    targetCell: playerMove.targetCell
                }
            });
        }

        return moveResult;
    }
}
