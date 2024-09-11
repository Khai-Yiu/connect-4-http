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
            describe('and a uuid to save the game', () => {
                describe('which no other game has been saved under', () => {
                    it('saves the game', async () => {
                        const gameUuid = '3507af63-cc71-43ad-93ea-dc06eaef70b2';
                        const gameDetailsWithUuid = {
                            uuid: gameUuid,
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
                        } as GameDetails;

                        await gameRepository.saveGame(gameDetailsWithUuid);
                        const retrievedGameDetails =
                            await gameRepository.loadGame(gameUuid);

                        expect(retrievedGameDetails).toEqual({
                            ...gameDetailsWithUuid
                        });
                    });
                });
                describe('which a game has already been saved under', () => {
                    it('replaces the saved game with the updated game', async () => {
                        const gameUuid = '3507af63-cc71-43ad-93ea-dc06eaef70b2';
                        const gameDetailsWithUuid = {
                            uuid: gameUuid,
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
                        } as GameDetails;

                        await gameRepository.saveGame(gameDetailsWithUuid);
                        await gameRepository.saveGame({
                            ...gameDetailsWithUuid,
                            activePlayer: 2
                        });
                        const retrievedGameDetails =
                            await gameRepository.loadGame(gameUuid);

                        expect(retrievedGameDetails).toEqual({
                            ...gameDetailsWithUuid,
                            activePlayer: 2
                        });
                    });
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
