import InMemoryGameRepository, {
    GameRepository
} from '@/game/in-memory-game-repository';
import Game from '@/game/game';
import GameService from '@/game/game-service';
import _toAsciiTable from '@/utils/to-ascii-table';
import { BoardCell } from '@/game/game-types.d';

function toAsciiTable(board: Array<Array<BoardCell>>): string {
    const cellResolver = (cell: BoardCell) =>
        cell.player === undefined ? '' : `${cell.player}`;

    return _toAsciiTable(board, cellResolver);
}

describe('game-service', () => {
    let gameRepository: GameRepository;
    let gameService: GameService;

    beforeEach(() => {
        gameRepository = new InMemoryGameRepository();
        gameService = new GameService(
            gameRepository,
            (...args: ConstructorParameters<typeof Game>) => new Game(...args)
        );
    });
    describe('creating a game service', () => {
        describe('given a game repository', () => {
            describe('and a game constructor', () => {
                it('creates a game service', () => {
                    const gameRepository = new InMemoryGameRepository();
                    const gameService = new GameService(
                        gameRepository,
                        (...args: ConstructorParameters<typeof Game>) =>
                            new Game(...args)
                    );

                    expect(gameService).toBeInstanceOf(GameService);
                });
            });
        });
    });
    describe('creating a game', () => {
        let gameService: GameService;

        beforeEach(() => {
            const gameRepository = new InMemoryGameRepository();
            gameService = new GameService(
                gameRepository,
                (...args: ConstructorParameters<typeof Game>) =>
                    new Game(...args)
            );
        });
        describe('given no arguments', () => {
            it('creates a new game with a 6x7 board', async () => {
                const gameUuid = await gameService.createGame();
                expect(gameUuid).toBeUuid();
                const gameDetails = await gameService.getGameDetails(gameUuid);
                expect(gameDetails).toEqual(
                    expect.objectContaining({
                        boardDimensions: {
                            rows: 6,
                            columns: 7
                        }
                    })
                );
            });
        });
    });
    describe('making a move', () => {
        let mockedPlayerMovedEventHandler: jest.Mock;
        let gameService: GameService;

        beforeEach(() => {
            mockedPlayerMovedEventHandler = jest.fn();
            const gameRepository = new InMemoryGameRepository();
            gameService = new GameService(
                gameRepository,
                (...args: ConstructorParameters<typeof Game>) =>
                    new Game(...args),
                mockedPlayerMovedEventHandler
            );
        });
        describe('given the uuid of a game', () => {
            describe('and a valid move', () => {
                it('makes the move', async () => {
                    const gameUuid = await gameService.createGame();
                    const result = await gameService.submitMove(gameUuid, {
                        player: 1,
                        targetCell: {
                            row: 0,
                            column: 0
                        }
                    });
                    expect(result).toEqual({ moveSuccessful: true });
                    expect(mockedPlayerMovedEventHandler).toHaveBeenCalledWith({
                        type: 'PLAYER_MOVED',
                        payload: {
                            player: 1,
                            targetCell: {
                                row: 0,
                                column: 0
                            }
                        }
                    });
                    const board = (await gameService.getGameDetails(gameUuid))
                        .board;
                    expect(toAsciiTable(board)).toMatchInlineSnapshot(`
                        "
                        |---|--|--|--|--|--|--|
                        | 1 |  |  |  |  |  |  |
                        |---|--|--|--|--|--|--|
                        |   |  |  |  |  |  |  |
                        |---|--|--|--|--|--|--|
                        |   |  |  |  |  |  |  |
                        |---|--|--|--|--|--|--|
                        |   |  |  |  |  |  |  |
                        |---|--|--|--|--|--|--|
                        |   |  |  |  |  |  |  |
                        |---|--|--|--|--|--|--|
                        |   |  |  |  |  |  |  |
                        |---|--|--|--|--|--|--|"
                    `);
                });
            });
            describe('and an invalid move', () => {
                it('does not make the move', async () => {
                    const gameUuid = await gameService.createGame();
                    const result = await gameService.submitMove(gameUuid, {
                        player: 1,
                        targetCell: {
                            row: -1,
                            column: 0
                        }
                    });
                    expect(result).toEqual(
                        expect.objectContaining({ moveSuccessful: false })
                    );
                    expect(
                        mockedPlayerMovedEventHandler
                    ).not.toHaveBeenCalled();
                });
            });
        });
    });
});
