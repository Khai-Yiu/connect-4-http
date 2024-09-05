import { Uuid } from '@/global';

type PlayerNumber = 1 | 2;
type PlayerStats = {
    playerNumber: 1 | 2;
    remainingDiscs: number;
};

type BoardCell = {
    player?: PlayerNumber;
};

export enum GameStatus {
    IN_PROGRESS = 'IN_PROGRESS',
    PLAYER_ONE_WON = 'PLAYER_ONE_WON',
    PLAYER_TWO_WON = 'PLAYER_TWO_WON',
    DRAW = 'DRAW'
}
type Board = Array<Array<BoardCell>>;
type GameDetails = {
    board: Board;
    activePlayer: PlayerNumber;
    players: Record<PlayerNumber, PlayerStats>;
    gameStatus: GameStatus;
};

type PersistedGameDetails = GameDetails & { uuid: Uuid };
