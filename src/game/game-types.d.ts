import { Uuid } from '@/global';
import Game from '@/game/game';

export type BoardDimensions = {
    rows: number;
    columns: number;
};

export type PlayerNumber = 1 | 2;
export type PlayerStats = {
    playerNumber: 1 | 2;
    remainingDiscs: number;
};

export type BoardCell = {
    player?: PlayerNumber;
};

export enum GameStatus {
    IN_PROGRESS = 'IN_PROGRESS',
    PLAYER_ONE_WON = 'PLAYER_ONE_WON',
    PLAYER_TWO_WON = 'PLAYER_TWO_WON',
    DRAW = 'DRAW'
}

export type Board = Array<Array<BoardCell>>;
export type GameDetails = {
    board: Board;
    boardDimensions: BoardDimensions;
    activePlayer: PlayerNumber;
    playerStats: Record<PlayerNumber, PlayerStats>;
    gameStatus: GameStatus;
};

export type PersistedGameDetails = GameDetails & { uuid: Uuid };
export type GameFactory = (...args: ConstructorParameters<typeof Game>) => Game;
