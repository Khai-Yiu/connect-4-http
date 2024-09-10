import toAsciiTable from '@/utils/to-ascii-table';
import Game from '@/game/game';

const createDefaultGameDetails = () => ({
    board: new Array(6).fill(undefined).map(() => new Array(7)),
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
        });
    });
    describe('retrieving game details', () => {
        it('returns the game details', () => {
            const game = new Game();
            expect(game.getDetails()).toEqual(createDefaultGameDetails());
        });
    });
});
