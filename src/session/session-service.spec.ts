import Game from '@/game/game';
import GameService from '@/game/game-service';
import InMemoryGameRepository from '@/game/in-memory-game-repository';
import InMemorySessionRepository, {
    SessionRepository
} from '@/session/in-memory-session-repository';
import SessionService, { NoSuchSessionError } from '@/session/session-service';

describe('session-service', () => {
    let sessionRepository: SessionRepository;
    let sessionService: SessionService;
    let gameService: GameService;

    beforeEach(() => {
        sessionRepository = new InMemorySessionRepository();
        gameService = new GameService(
            new InMemoryGameRepository(),
            (...args: ConstructorParameters<typeof Game>) => new Game(...args)
        );
        sessionService = new SessionService(sessionRepository, gameService);
    });
    describe('creating a session service', () => {
        describe('given a session repository', () => {
            it('creates a session service', () => {
                expect(sessionService).toBeInstanceOf(SessionService);
            });
        });
    });
    describe('creating a session', () => {
        describe('given the identities of two players', () => {
            it('creates a session', async () => {
                const sessionDetails = await sessionService.createSession({
                    inviterUuid: 'ac698d60-5f6e-4d89-be27-f12c9b054d22',
                    inviteeUuid: 'd5bcfb7a-b8a8-4274-afef-c5db4509813a'
                });

                expect(sessionDetails).toEqual(
                    expect.objectContaining({
                        uuid: expect.toBeUuid(),
                        inviter: expect.objectContaining({
                            uuid: 'ac698d60-5f6e-4d89-be27-f12c9b054d22'
                        }),
                        invitee: expect.objectContaining({
                            uuid: 'd5bcfb7a-b8a8-4274-afef-c5db4509813a'
                        }),
                        status: 'IN_PROGRESS'
                    })
                );
            });
        });
    });
    describe('retrieving a session', () => {
        describe('given a session has been created', () => {
            describe('when provided with the id of the session', () => {
                it('retrieves details of the session', async () => {
                    const { uuid } = await sessionService.createSession({
                        inviterUuid: 'ac698d60-5f6e-4d89-be27-f12c9b054d22',
                        inviteeUuid: 'd5bcfb7a-b8a8-4274-afef-c5db4509813a'
                    });
                    const retrievedSession = await sessionService.getSession(
                        uuid
                    );

                    expect(retrievedSession).toEqual(
                        expect.objectContaining({
                            uuid: expect.toBeUuid(),
                            inviter: expect.objectContaining({
                                uuid: 'ac698d60-5f6e-4d89-be27-f12c9b054d22'
                            }),
                            invitee: expect.objectContaining({
                                uuid: 'd5bcfb7a-b8a8-4274-afef-c5db4509813a'
                            }),
                            status: 'IN_PROGRESS'
                        })
                    );
                });
            });
        });
        describe('when provided with the id of a non-existent session', () => {
            it('throws a "NoSuchSessionError"', () => {
                const sessionUuid = 'b8633095-70cc-4b93-b2ef-e6a55a4341a9';
                expect(() =>
                    sessionService.getSession(sessionUuid)
                ).rejects.toThrow(new NoSuchSessionError());
            });
        });
    });
    describe('adding games', () => {
        describe('given an in-progress session', () => {
            describe('with no games', () => {
                it('adds a new game to the session', async () => {
                    const { uuid } = await sessionService.createSession({
                        inviterUuid: '34299162-58de-4e8a-9be3-19fded384c4e',
                        inviteeUuid: '0d559433-a243-489f-a08e-898460324ae6'
                    });
                    expect(sessionService.getGameUuids(uuid)).resolves.toEqual(
                        []
                    );
                    expect(
                        sessionService.getActiveGameUuid(uuid)
                    ).resolves.toBeUndefined();

                    await sessionService.addNewGame(uuid);
                    const activeGameUuid =
                        await sessionService.getActiveGameUuid(uuid);

                    expect(activeGameUuid).toBeUuid();
                    expect(sessionService.getGameUuids(uuid)).resolves.toEqual([
                        activeGameUuid
                    ]);
                });
            });
            describe('with previous games', () => {
                describe('no active games', () => {
                    it('adds a new game to the session', async () => {
                        const { uuid } = await sessionService.createSession({
                            inviterUuid: '34299162-58de-4e8a-9be3-19fded384c4e',
                            inviteeUuid: '0d559433-a243-489f-a08e-898460324ae6'
                        });

                        const firstActiveGameUuid =
                            await sessionService.addNewGame(uuid);
                        await sessionService.completeActiveGame(uuid);
                        const secondActiveGameUuid =
                            await sessionService.addNewGame(uuid);

                        expect(firstActiveGameUuid).not.toBe(
                            secondActiveGameUuid
                        );
                        expect(
                            sessionService.getGameUuids(uuid)
                        ).resolves.toEqual([
                            firstActiveGameUuid,
                            secondActiveGameUuid
                        ]);
                    });
                });
            });
        });
    });
});
