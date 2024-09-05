import { Board, BoardDimensions } from './game-types';
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

    constructor() {
        this.board = this.#createBoard(DEFAULT_BOARD_DIMENSIONS);
    }

    #createBoard = ({ rows, columns }: BoardDimensions): Board =>
        [...Array(rows)].map(() => [...Array(columns)]);

    getBoard = () => deepClone(this.board);
}
