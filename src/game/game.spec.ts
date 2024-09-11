import _toAsciiTable from '@/utils/to-ascii-table';
import Game from '@/game/game';
import {
    BoardCell,
    GameParameters,
    PlayerMoveDetails,
    PlayerMoveResult
} from './game-types';
import { pipe } from 'ramda';

function toAsciiTable(board: Array<Array<BoardCell>>): string {
    const cellResolver = (cell: BoardCell) =>
        cell.player === undefined ? '' : `${cell.player}`;

    return _toAsciiTable(board, cellResolver);
}

const createDefaultGameDetails = () => ({
    board: new Array(6).fill(undefined).map(() =>
        new Array(7).fill(undefined).map(() => ({
            player: undefined
        }))
    ),
    boardDimensions: {
        rows: 6,
        columns: 7
    },
    activePlayer: 1,
    playerStats: {
        1: {
            playerNumber: 1,
            remainingDiscs: 21
        },
        2: {
            playerNumber: 2,
            remainingDiscs: 21
        }
    },
    gameStatus: 'IN_PROGRESS'
});

describe('game', () => {
    describe('creating a game', () => {
        describe('given no arguments', () => {
            it('creates a new Game instance', () => {
                const game = new Game();

                expect(game).toBeInstanceOf(Game);
            });
            it('creates a game with an empty board of default size', () => {
                const game = new Game();
                const board = game.getBoard();
                expect(toAsciiTable(board)).toMatchInlineSnapshot(`
                    "
                    |--|--|--|--|--|--|--|
                    |  |  |  |  |  |  |  |
                    |--|--|--|--|--|--|--|
                    |  |  |  |  |  |  |  |
                    |--|--|--|--|--|--|--|
                    |  |  |  |  |  |  |  |
                    |--|--|--|--|--|--|--|
                    |  |  |  |  |  |  |  |
                    |--|--|--|--|--|--|--|
                    |  |  |  |  |  |  |  |
                    |--|--|--|--|--|--|--|
                    |  |  |  |  |  |  |  |
                    |--|--|--|--|--|--|--|"
                `);
            });
            it('creates a game with a uuid', () => {
                const game = new Game();
                expect(game.getDetails().uuid).toBeUuid();
            });
        });
        describe('given game details', () => {
            it('does not mutate the passed in game details', () => {
                const originalGameDetails = createDefaultGameDetails();
                const game = new Game(originalGameDetails as GameParameters);
                const newGameDetails = game.getDetails();

                expect(originalGameDetails).toBeDeeplyUnequal(newGameDetails);
            });
        });
    });
    describe('retrieving game details', () => {
        it('returns the game details', () => {
            const game = new Game();
            expect(game.getDetails()).toEqual({
                uuid: expect.toBeUuid(),
                ...createDefaultGameDetails()
            });
        });
    });
    describe('making a move', () => {
        describe('given a currently active player', () => {
            describe("and a cell location that's not on the board", () => {
                it('player should not be able to move to a cell with a row number below the first row', () => {
                    const game = new Game({
                        boardDimensions: { rows: 2, columns: 2 }
                    });
                    expect(toAsciiTable(game.getBoard()))
                        .toMatchInlineSnapshot(`
                      "
                      |--|--|
                      |  |  |
                      |--|--|
                      |  |  |
                      |--|--|"
                    `);

                    const moveResult = game.move({
                        player: 1,
                        targetCell: { row: -1, column: 0 }
                    });
                    expect(moveResult).toEqual({
                        moveSuccessful: false,
                        message:
                            "Cell at row -1 and column 0 doesn't exist on the board. The row number must be >= 0 and <= 1"
                    });
                    expect(toAsciiTable(game.getBoard())).toMatchInlineSnapshot(
                        `
                      "
                      |--|--|
                      |  |  |
                      |--|--|
                      |  |  |
                      |--|--|"
                    `
                    );
                    expect(game.getDetails().activePlayer).toBe(1);
                });
                it('player should not be able to move to a cell with a row number above the last row', () => {
                    const game = new Game({
                        boardDimensions: { rows: 2, columns: 2 }
                    });
                    const moveResult = game.move({
                        player: 1,
                        targetCell: {
                            row: 2,
                            column: 0
                        }
                    });

                    expect(toAsciiTable(game.getBoard()))
                        .toMatchInlineSnapshot(`
                      "
                      |--|--|
                      |  |  |
                      |--|--|
                      |  |  |
                      |--|--|"
                    `);
                    expect(game.getDetails().activePlayer).toBe(1);
                    expect(moveResult).toEqual({
                        moveSuccessful: false,
                        message:
                            "Cell at row 2 and column 0 doesn't exist on the board. The row number must be >= 0 and <= 1"
                    });
                });
                it('player should not be able to move to a cell with a column number to the left of the first column', () => {
                    const game = new Game({
                        boardDimensions: { rows: 2, columns: 2 }
                    });

                    const moveResult = game.move({
                        player: 1,
                        targetCell: {
                            row: 0,
                            column: -1
                        }
                    });

                    expect(toAsciiTable(game.getBoard()))
                        .toMatchInlineSnapshot(`
                      "
                      |--|--|
                      |  |  |
                      |--|--|
                      |  |  |
                      |--|--|"
                    `);
                    expect(game.getDetails().activePlayer).toBe(1);
                    expect(moveResult).toEqual({
                        moveSuccessful: false,
                        message:
                            "Cell at row 0 and column -1 doesn't exist on the board. The column number must be >= 0 and <= 1"
                    });
                });
                it('player should not be able to move to a cell with a column number to the right of the last column', () => {
                    const game = new Game({
                        boardDimensions: { rows: 2, columns: 2 }
                    });

                    const moveResult = game.move({
                        player: 1,
                        targetCell: {
                            row: 0,
                            column: 2
                        }
                    });

                    expect(toAsciiTable(game.getBoard()))
                        .toMatchInlineSnapshot(`
                      "
                      |--|--|
                      |  |  |
                      |--|--|
                      |  |  |
                      |--|--|"
                    `);
                    expect(game.getDetails().activePlayer).toBe(1);
                    expect(moveResult).toEqual({
                        moveSuccessful: false,
                        message:
                            "Cell at row 0 and column 2 doesn't exist on the board. The column number must be >= 0 and <= 1"
                    });
                });
                it('player should not be able to move to a cell with a row and column number out of bounds', () => {
                    const game = new Game({
                        boardDimensions: { rows: 2, columns: 3 }
                    });

                    const moveResult = game.move({
                        player: 1,
                        targetCell: {
                            row: -1,
                            column: -1
                        }
                    });

                    expect(toAsciiTable(game.getBoard()))
                        .toMatchInlineSnapshot(`
                          "
                          |--|--|--|
                          |  |  |  |
                          |--|--|--|
                          |  |  |  |
                          |--|--|--|"
                        `);
                    expect(game.getDetails().activePlayer).toBe(1);
                    expect(moveResult).toEqual({
                        moveSuccessful: false,
                        message:
                            "Cell at row -1 and column -1 doesn't exist on the board. The row number must be >= 0 and <= 1 and the column number must be >= 0 and <= 2"
                    });
                });
            });
            describe('and the cell is on the first row', () => {
                describe('and the cell is unoccupied', () => {
                    it('player should be able to move a disc into the cell', () => {
                        const game = new Game({
                            boardDimensions: { rows: 1, columns: 2 }
                        });

                        expect(toAsciiTable(game.getBoard()))
                            .toMatchInlineSnapshot(`
                        "
                        |--|--|
                        |  |  |
                        |--|--|"
                        `);
                        expect(game.getDetails().activePlayer).toBe(1);

                        const moveResult = game.move({
                            player: 1,
                            targetCell: {
                                row: 0,
                                column: 0
                            }
                        });

                        expect(moveResult).toEqual({
                            moveSuccessful: true
                        });
                        expect(toAsciiTable(game.getBoard()))
                            .toMatchInlineSnapshot(`
                          "
                          |---|--|
                          | 1 |  |
                          |---|--|"
                        `);
                        expect(game.getDetails().activePlayer).toBe(2);
                    });
                });
                describe('and the cell is occupied', () => {
                    it('the move fails', () => {
                        const game = new Game({
                            boardDimensions: { rows: 1, columns: 2 }
                        });

                        game.move({
                            player: 1,
                            targetCell: {
                                row: 0,
                                column: 0
                            }
                        });

                        expect(toAsciiTable(game.getBoard()))
                            .toMatchInlineSnapshot(`
                              "
                              |---|--|
                              | 1 |  |
                              |---|--|"
                            `);

                        const moveResult = game.move({
                            player: 2,
                            targetCell: {
                                row: 0,
                                column: 0
                            }
                        });

                        expect(moveResult).toEqual({
                            moveSuccessful: false,
                            message:
                                'The cell of row 0 and column 0 is already occupied'
                        });
                        expect(game.getDetails().activePlayer).toBe(2);
                    });
                });
            });
            describe('and the cell is on the second row', () => {
                describe('and the cell below is occupied', () => {
                    it('player should be able to move a disc into the cell', () => {
                        const game = new Game({
                            boardDimensions: { rows: 2, columns: 2 }
                        });

                        game.move({
                            player: 1,
                            targetCell: {
                                row: 0,
                                column: 0
                            }
                        });

                        expect(toAsciiTable(game.getBoard()))
                            .toMatchInlineSnapshot(`
                              "
                              |---|--|
                              | 1 |  |
                              |---|--|
                              |   |  |
                              |---|--|"
                            `);

                        game.move({
                            player: 2,
                            targetCell: {
                                row: 1,
                                column: 0
                            }
                        });

                        expect(toAsciiTable(game.getBoard()))
                            .toMatchInlineSnapshot(`
                              "
                              |---|--|
                              | 1 |  |
                              |---|--|
                              | 2 |  |
                              |---|--|"
                            `);
                    });
                });
                describe('and the cell below is unoccupied', () => {
                    it('player should not be able to move a disc into the cell', () => {
                        const game = new Game({
                            boardDimensions: { rows: 2, columns: 2 }
                        });

                        const moveResult = game.move({
                            player: 1,
                            targetCell: {
                                row: 1,
                                column: 0
                            }
                        });

                        expect(moveResult).toEqual({
                            moveSuccessful: false,
                            message:
                                'The cell of row 1 and column 0 cannot be placed as there is no disc below it'
                        });
                        expect(toAsciiTable(game.getBoard()))
                            .toMatchInlineSnapshot(`
                              "
                              |--|--|
                              |  |  |
                              |--|--|
                              |  |  |
                              |--|--|"
                            `);
                    });
                });
            });
        });
        describe('given a player is currently inactive', () => {
            it('the player is unable to make a move', () => {
                const game = new Game({
                    boardDimensions: { rows: 2, columns: 2 }
                });

                expect(game.getDetails().activePlayer).toBe(1);
                const moveResult = game.move({
                    player: 2,
                    targetCell: {
                        row: 0,
                        column: 0
                    }
                });

                expect(moveResult).toEqual({
                    moveSuccessful: false,
                    message:
                        'Player 2 cannot move as player 1 is currently active'
                });
            });
        });
        describe('given a valid move', () => {
            it("decrements the moving player's tokens by one", () => {
                const game = new Game();
                expect(game.getDetails().playerStats[1].remainingDiscs).toBe(
                    21
                );

                game.move({
                    player: 1,
                    targetCell: {
                        row: 0,
                        column: 0
                    }
                });

                expect(game.getDetails().playerStats[1].remainingDiscs).toBe(
                    20
                );
            });
        });
        describe('given the game is over', () => {
            describe('as player one has won', () => {
                it('returns a move failed event', () => {
                    const game = new Game({
                        boardDimensions: { rows: 2, columns: 4 }
                    });

                    const payloads = [
                        { player: 1, targetCell: { row: 0, column: 0 } },
                        { player: 2, targetCell: { row: 1, column: 0 } },
                        { player: 1, targetCell: { row: 0, column: 1 } },
                        { player: 2, targetCell: { row: 1, column: 1 } },
                        { player: 1, targetCell: { row: 0, column: 2 } },
                        { player: 2, targetCell: { row: 1, column: 2 } },
                        { player: 1, targetCell: { row: 0, column: 3 } }
                    ] satisfies PlayerMoveDetails[];

                    payloads.forEach(
                        pipe<[PlayerMoveDetails], PlayerMoveResult>(
                            (playerMoveDetails: PlayerMoveDetails) =>
                                game.move(playerMoveDetails)
                        )
                    );

                    const moveResult = game.move({
                        player: 2,
                        targetCell: {
                            row: 1,
                            column: 3
                        }
                    });

                    expect(toAsciiTable(game.getBoard()))
                        .toMatchInlineSnapshot(`
                          "
                          |---|---|---|---|
                          | 1 | 1 | 1 | 1 |
                          |---|---|---|---|
                          | 2 | 2 | 2 |   |
                          |---|---|---|---|"
                        `);

                    expect(moveResult).toEqual({
                        moveSuccessful: false,
                        message:
                            'You cannot make a move, player 1 has already won the game'
                    });
                });
            });
            describe('as player two has won', () => {
                it('returns a move failed event', () => {
                    const game = new Game({
                        boardDimensions: {
                            rows: 2,
                            columns: 6
                        }
                    });

                    const payloads = [
                        { player: 1, targetCell: { row: 0, column: 0 } },
                        { player: 2, targetCell: { row: 1, column: 0 } },
                        { player: 1, targetCell: { row: 0, column: 1 } },
                        { player: 2, targetCell: { row: 1, column: 1 } },
                        { player: 1, targetCell: { row: 0, column: 2 } },
                        { player: 2, targetCell: { row: 1, column: 2 } },
                        { player: 1, targetCell: { row: 0, column: 4 } },
                        { player: 2, targetCell: { row: 0, column: 3 } },
                        { player: 1, targetCell: { row: 1, column: 4 } },
                        { player: 2, targetCell: { row: 1, column: 3 } }
                    ] satisfies PlayerMoveDetails[];

                    payloads.forEach(
                        pipe<[PlayerMoveDetails], PlayerMoveResult>(
                            (playerMoveDetails: PlayerMoveDetails) =>
                                game.move(playerMoveDetails)
                        )
                    );

                    const moveResult = game.move({
                        player: 1,
                        targetCell: {
                            row: 0,
                            column: 5
                        }
                    });

                    expect(toAsciiTable(game.getBoard()))
                        .toMatchInlineSnapshot(`
                          "
                          |---|---|---|---|---|--|
                          | 1 | 1 | 1 | 2 | 1 |  |
                          |---|---|---|---|---|--|
                          | 2 | 2 | 2 | 2 | 1 |  |
                          |---|---|---|---|---|--|"
                        `);

                    expect(moveResult).toEqual({
                        moveSuccessful: false,
                        message:
                            'You cannot make a move, player 2 has already won the game'
                    });
                });
            });
            describe('as a game is tied', () => {
                it('returns a move failed event', () => {
                    const game = new Game({
                        boardDimensions: { rows: 2, columns: 3 }
                    });

                    const payloads = [
                        { player: 1, targetCell: { row: 0, column: 0 } },
                        { player: 2, targetCell: { row: 1, column: 0 } },
                        { player: 1, targetCell: { row: 0, column: 1 } },
                        { player: 2, targetCell: { row: 1, column: 1 } },
                        { player: 1, targetCell: { row: 0, column: 2 } },
                        { player: 2, targetCell: { row: 1, column: 2 } }
                    ] satisfies PlayerMoveDetails[];

                    payloads.forEach(
                        pipe<[PlayerMoveDetails], PlayerMoveResult>(
                            (playerMoveDetails: PlayerMoveDetails) =>
                                game.move(playerMoveDetails)
                        )
                    );

                    const moveResult = game.move({
                        player: 1,
                        targetCell: {
                            row: 0,
                            column: 0
                        }
                    });

                    expect(toAsciiTable(game.getBoard()))
                        .toMatchInlineSnapshot(`
                          "
                          |---|---|---|
                          | 1 | 1 | 1 |
                          |---|---|---|
                          | 2 | 2 | 2 |
                          |---|---|---|"
                        `);

                    expect(moveResult).toEqual({
                        moveSuccessful: false,
                        message:
                            'You cannot make a move, the game has already ended in a draw'
                    });
                });
            });
        });
    });
});
