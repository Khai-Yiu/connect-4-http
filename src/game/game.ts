import {
    Board,
    BoardCell,
    BoardDimensions,
    GameDetails,
    GameParameters,
    GameStatus,
    PlayerMoveDetails,
    PlayerMoveResult,
    PlayerNumber,
    PlayerStats,
    ValidationResult,
    ValidCellOnBoard
} from '@/game/game-types.d';
import deepClone from '@/utils/deep-clone';
import getIsWinningMove from './get-is-winning-move';
import { Uuid } from '@/global.d';

const DEFAULT_BOARD_DIMENSIONS = {
    rows: 6,
    columns: 7
};

export interface GameInterface {
    getBoard: () => Board;
    getDetails: () => GameDetails;
    move: (moveDetails: PlayerMoveDetails) => PlayerMoveResult;
}

export default class Game implements GameInterface {
    uuid: Uuid;
    board: Board;
    boardDimensions: BoardDimensions;
    activePlayer: PlayerNumber;
    playerStats: Record<PlayerNumber, PlayerStats>;
    gameStatus: GameStatus;

    constructor(
        {
            uuid,
            board,
            boardDimensions = DEFAULT_BOARD_DIMENSIONS,
            activePlayer = 1,
            playerStats,
            gameStatus = GameStatus.IN_PROGRESS
        }: GameParameters = {
            uuid: crypto.randomUUID(),
            boardDimensions: DEFAULT_BOARD_DIMENSIONS,
            activePlayer: 1,
            gameStatus: GameStatus.IN_PROGRESS
        }
    ) {
        this.uuid = uuid;
        this.board = board ?? this.#createBoard(boardDimensions);
        this.boardDimensions = boardDimensions;
        this.activePlayer = activePlayer;
        this.playerStats =
            playerStats ?? this.#createPlayerStats(boardDimensions);
        this.gameStatus = gameStatus;
    }

    #createBoard = ({
        rows,
        columns
    }: BoardDimensions): Array<Array<BoardCell>> =>
        new Array(rows).fill(undefined).map(() =>
            new Array(columns).fill(undefined).map(() => ({
                player: undefined
            }))
        );

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
            uuid: this.uuid,
            board: deepClone(this.board),
            boardDimensions: deepClone(this.boardDimensions),
            activePlayer: this.activePlayer,
            playerStats: deepClone(this.playerStats),
            gameStatus: this.gameStatus
        };
    }

    move = this.#createValidatedMove(this.#_move.bind(this));

    #_move({
        player,
        targetCell: { row, column }
    }: PlayerMoveDetails): PlayerMoveResult {
        const { isWin } = getIsWinningMove(this.getBoard(), {
            player,
            targetCell: { row, column }
        });

        this.board[row][column] = { player: player };
        this.playerStats[this.activePlayer].remainingDiscs--;
        this.activePlayer = this.activePlayer === 2 ? 1 : 2;

        if (isWin) {
            this.gameStatus =
                this.activePlayer === 2
                    ? GameStatus.PLAYER_ONE_WON
                    : GameStatus.PLAYER_TWO_WON;
        } else if (
            this.playerStats[1].remainingDiscs === 0 &&
            this.playerStats[2].remainingDiscs === 0
        ) {
            this.gameStatus = GameStatus.DRAW;
        }

        return {
            moveSuccessful: true
        };
    }

    #createValidatedMove(
        moveFunction: (playerMoveDetails: PlayerMoveDetails) => PlayerMoveResult
    ): (playerMoveDetails: PlayerMoveDetails) => PlayerMoveResult {
        return (playerMoveDetails): PlayerMoveResult => {
            const { isValid, message } = this.#validateMove(playerMoveDetails);

            return isValid
                ? moveFunction(playerMoveDetails)
                : { moveSuccessful: false, message };
        };
    }

    #validateMove({
        player,
        targetCell: { row, column }
    }: PlayerMoveDetails): ValidationResult {
        if (this.gameStatus === 'PLAYER_ONE_WON') {
            return {
                isValid: false,
                message:
                    'You cannot make a move, player 1 has already won the game'
            };
        } else if (this.gameStatus === GameStatus.PLAYER_TWO_WON) {
            return {
                isValid: false,
                message:
                    'You cannot make a move, player 2 has already won the game'
            };
        } else if (this.gameStatus === GameStatus.DRAW) {
            return {
                isValid: false,
                message:
                    'You cannot make a move, the game has already ended in a draw'
            };
        }

        if (this.activePlayer !== player) {
            return {
                isValid: false,
                message: `Player ${player} cannot move as player ${this.activePlayer} is currently active`
            };
        }

        const { isValidRow, isValidColumn } = this.#getIsCellOnBoard(
            row,
            column
        );

        if (!isValidRow && !isValidColumn) {
            return {
                isValid: false,
                message: `Cell at row ${row} and column ${column} doesn't exist on the board. The row number must be >= 0 and <= ${
                    this.board.length - 1
                } and the column number must be >= 0 and <= ${
                    this.board[0].length - 1
                }`
            };
        }

        if (!isValidRow || !isValidColumn) {
            return {
                isValid: false,
                message: `Cell at row ${row} and column ${column} doesn't exist on the board. ${
                    !isValidRow
                        ? `The row number must be >= 0 and <= ${
                              this.board.length - 1
                          }`
                        : ''
                }${
                    !isValidColumn
                        ? `The column number must be >= 0 and <= ${
                              this.board[0].length - 1
                          }`
                        : ''
                }`
            };
        }

        if (this.#getIsCellOccupied(row, column)) {
            return {
                isValid: false,
                message: `The cell of row ${row} and column ${column} is already occupied`
            };
        }

        if (!this.#getIsCellOccupied(row - 1, column)) {
            return {
                isValid: false,
                message: `The cell of row ${row} and column ${column} cannot be placed as there is no disc below it`
            };
        }

        return {
            isValid: true,
            message: ''
        };
    }

    #getIsCellOnBoard(row: number, column: number): ValidCellOnBoard {
        return {
            isValidRow: row >= 0 && row <= this.board.length - 1,
            isValidColumn: column >= 0 && column <= this.board[0].length - 1
        };
    }

    #getIsCellOccupied(row: number, column: number): boolean {
        if (row < 0) return true;
        return this.board[row][column].player !== undefined;
    }
}
