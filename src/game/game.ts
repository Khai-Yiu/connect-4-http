import {
    Board,
    BoardDimensions,
    GameStatus,
    PlayerNumber,
    PlayerStats
} from '@/game/game-types.d';
import deepClone from '@/utils/deep-clone';

const DEFAULT_BOARD_DIMENSIONS = {
    rows: 6,
    columns: 7
};

export interface GameInterface {
    getBoard: () => Board;
}

export default class Game implements GameInterface {
    board: Board;
    boardDimensions: BoardDimensions;
    activePlayer: PlayerNumber;
    playerStats: Record<PlayerNumber, PlayerStats>;
    gameStatus: GameStatus;

    constructor(boardDimensions: BoardDimensions = DEFAULT_BOARD_DIMENSIONS) {
        this.board = this.#createBoard(boardDimensions);
        this.boardDimensions = boardDimensions;
        this.activePlayer = 1;
        this.playerStats = this.#createPlayerStats(boardDimensions);
        this.gameStatus = GameStatus.IN_PROGRESS;
    }

    #createBoard = ({ rows, columns }: BoardDimensions): Board =>
        [...Array(rows)].map(() => [...Array(columns)]);

    #createPlayerStats = ({
        rows,
        columns
    }: BoardDimensions): Record<PlayerNumber, PlayerStats> => {
        const remainingDiscs = (rows * columns) / 2;
        return {
            1: {
                playerNumber: 1,
                remainingDiscs
            },
            2: {
                playerNumber: 2,
                remainingDiscs
            }
        };
    };

    getBoard() {
        return deepClone(this.board);
    }

    getDetails() {
        return {
            board: this.board,
            boardDimensions: this.boardDimensions,
            activePlayer: this.activePlayer,
            playerStats: this.playerStats,
            gameStatus: this.gameStatus
        };
    }
}
