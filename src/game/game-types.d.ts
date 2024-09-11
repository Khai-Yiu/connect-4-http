import { Uuid } from '@/global';
import Game from '@/game/game';

export enum GameEvents {
    PLAYER_MOVED = 'PLAYER_MOVED'
}

export type BoardDimensions = {
    rows: number;
    columns: number;
};

export type PlayerNumber = 1 | 2;
export type PlayerStats = {
    playerNumber: 1 | 2;
    remainingDiscs: number;
};

export type PlayerMoveDetails = {
    player: 1 | 2;
    targetCell: {
        row: number;
        column: number;
    };
};

export type PlayerMoveResult = {
    moveSuccessful: boolean;
    message?: string;
};

export type PlayerMoveEventDetails = {
    type: GameEvents;
    payload: PlayerMoveDetails;
};

export type PlayerMoveHandler = (
    playerMoveEventDetails: PlayerMoveEventDetails
) => Promise<unknown>;

export type ValidationResult = {
    isValid: boolean;
    message: string;
};

export type ValidCellOnBoard = {
    isValidRow: boolean;
    isValidColumn: boolean;
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
    uuid?: Uuid;
    board: Board;
    boardDimensions: BoardDimensions;
    activePlayer: PlayerNumber;
    playerStats: Record<PlayerNumber, PlayerStats>;
    gameStatus: GameStatus;
};

export type PersistedGameDetails = GameDetails & { uuid: Uuid };
export type GameParameters = Partial<GameDetails>;
export type GameFactory = (gameParameters?: GameParameters) => Game;
