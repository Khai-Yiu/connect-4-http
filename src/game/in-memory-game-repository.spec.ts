import { GameDetails, GameStatus } from './game-service.d';
import InMemoryGameRepository, {
    NoSuchGameError
} from './in-memory-game-repository';

describe('in-memory-game-repository', () => {
    let gameRepository: InMemoryGameRepository;

    beforeEach(() => {
        gameRepository = new InMemoryGameRepository();
    });

    describe('creating a game repository', () => {
        it('creates an in-memory game repository', () => {
            expect(gameRepository).toBeInstanceOf(InMemoryGameRepository);
        });
    });
    describe('saving a game', () => {
        describe('when given a game to save', () => {
            it('saves the game', async () => {
                const gameDetails = {
                    activePlayer: 1,
                    players: {
                        1: {
                            playerNumber: 1,
                            remainingDiscs: 2
                        },
                        2: {
                            playerNumber: 2,
                            remainingDiscs: 2
                        }
                    },
                    gameStatus: GameStatus.IN_PROGRESS
                } as GameDetails;
                const savedGameDetails =
                    await gameRepository.saveGame(gameDetails);
                expect(savedGameDetails).toEqual({
                    uuid: expect.toBeUuid(),
                    ...gameDetails
                });
            });
        });
    });
    describe('loading a game', () => {
        describe('when given an id of a game', () => {
            it('loads the game', async () => {
                const gameDetails = {
                    activePlayer: 1,
                    players: {
                        1: {
                            playerNumber: 1,
                            remainingDiscs: 2
                        },
                        2: {
                            playerNumber: 2,
                            remainingDiscs: 2
                        }
                    },
                    gameStatus: GameStatus.IN_PROGRESS
                } as GameDetails;
                const { uuid } = await gameRepository.saveGame(gameDetails);
                const loadedGame = await gameRepository.loadGame(uuid);
                expect(loadedGame).toEqual({
                    uuid: expect.toBeUuid(),
                    ...gameDetails
                });
            });
        });
        describe('when provided with the id of a non-existent game', () => {
            it('throws a "NoSuchGameError"', () => {
                const gameUuid = '464bdc93-98d8-4c50-af86-ccef0b61f74e';
                expect(() => gameRepository.loadGame(gameUuid)).rejects.toThrow(
                    new NoSuchGameError()
                );
            });
        });
    });
});
