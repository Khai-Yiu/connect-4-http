import { GameDetails, GameStatus } from '@/game/game-types.d';
import InMemoryGameRepository from '@/game/in-memory-game-repository';

describe('in-memory-game-repository', () => {
    let gameRepository: InMemoryGameRepository;

    beforeEach(() => {
        gameRepository = new InMemoryGameRepository();
    });

    describe('creating a game repository', () => {
        it('creates an in-memory game repository', () => {
            const gameRepository = new InMemoryGameRepository();

            expect(gameRepository).toBeInstanceOf(InMemoryGameRepository);
        });
    });
    describe('saving a game', () => {
        describe('when given a game to save', () => {
            it('saves the game', async () => {
                const gameDetails = {
                    activePlayer: 1,
                    playerStats: {
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
                const savedGameDetails = await gameRepository.saveGame(
                    gameDetails
                );
                expect(savedGameDetails).toEqual({
                    uuid: expect.toBeUuid(),
                    ...gameDetails
                });
            });
        });
    });
    describe('loading a game', () => {
        describe('given a game has been saved', () => {
            describe('when given an id of a game', () => {
                it('returns the details of the game', async () => {
                    const gameDetails = {
                        activePlayer: 1,
                        playerStats: {
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
        });
    });
});
