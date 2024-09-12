import InMemorySessionRepository from '@/session/in-memory-session-repository';

describe('in-memory-session-repository', () => {
    let inMemorySessionRepository;

    beforeEach(() => {
        inMemorySessionRepository = new InMemorySessionRepository();
    });

    describe('given details about a session', () => {
        it('creates the session', async () => {
            const sessionCreationDetails = {
                inviterUuid: '010f712b-7b31-420b-bd40-f23584fac148',
                inviteeUuid: 'd36e91c5-5c0d-481d-b929-5dab0267257a'
            };

            const createdSession = await inMemorySessionRepository.create(
                sessionCreationDetails
            );
            expect(createdSession).toEqual(
                expect.objectContaining({
                    uuid: expect.toBeUuid(),
                    inviter: expect.objectContaining({
                        uuid: '010f712b-7b31-420b-bd40-f23584fac148'
                    }),
                    invitee: expect.objectContaining({
                        uuid: 'd36e91c5-5c0d-481d-b929-5dab0267257a'
                    }),
                    status: 'IN_PROGRESS'
                })
            );
        });
    });
    describe('given a session has been created', () => {
        describe('when provided with the session ID', () => {
            it('returns the session', async () => {
                const sessionCreationDetails = {
                    inviterUuid: '010f712b-7b31-420b-bd40-f23584fac148',
                    inviteeUuid: 'd36e91c5-5c0d-481d-b929-5dab0267257a'
                };
                const { uuid } = await inMemorySessionRepository.create(
                    sessionCreationDetails
                );
                const retrievedSession =
                    await inMemorySessionRepository.getSession(uuid);

                expect(retrievedSession).toEqual(
                    expect.objectContaining({
                        uuid: expect.toBeUuid(),
                        inviter: expect.objectContaining({
                            uuid: '010f712b-7b31-420b-bd40-f23584fac148'
                        }),
                        invitee: expect.objectContaining({
                            uuid: 'd36e91c5-5c0d-481d-b929-5dab0267257a'
                        }),
                        status: 'IN_PROGRESS'
                    })
                );
            });
        });
    });
    describe('updating session details', () => {
        describe('given the uuid of an existing session', () => {
            describe('and the uuid of a game to add to the session', () => {
                it('adds the game to the session details', async () => {
                    const gameUuid = 'c944743d-3f06-4ee6-a697-669e3cb02655';
                    const { uuid } = await inMemorySessionRepository.create({
                        inviterUuid: '0dbb264d-3979-483a-a579-e849d79e9c85',
                        inviteeUuid: '02ca8ef5-716d-4421-92e4-ff94682d0b33'
                    });

                    await inMemorySessionRepository.addGame(
                        uuid,
                        gameUuid,
                        '0dbb264d-3979-483a-a579-e849d79e9c85'
                    );

                    const sessionDetails =
                        await inMemorySessionRepository.getSession(uuid);

                    expect(sessionDetails.games.get(gameUuid)).toEqual({
                        gameUuid,
                        playerOneUuid: '0dbb264d-3979-483a-a579-e849d79e9c85',
                        playerTwoUuid: '02ca8ef5-716d-4421-92e4-ff94682d0b33'
                    });
                });
            });
            describe('and the uuid of a game to set as the active game', () => {
                it('sets the active game of the session', async () => {
                    const gameUuid = 'c944743d-3f06-4ee6-a697-669e3cb02655';
                    const { uuid } = await inMemorySessionRepository.create({
                        inviterUuid: '0dbb264d-3979-483a-a579-e849d79e9c85',
                        inviteeUuid: '02ca8ef5-716d-4421-92e4-ff94682d0b33'
                    });
                    await inMemorySessionRepository.setActiveGame(
                        uuid,
                        gameUuid
                    );
                    const sessionDetails =
                        await inMemorySessionRepository.getSession(uuid);

                    expect(sessionDetails.activeGameUuid).toBe(gameUuid);
                });
            });
            describe('and a game has completed', () => {
                it('unset the active game of the session', async () => {
                    const gameUuid = 'c944743d-3f06-4ee6-a697-669e3cb02655';
                    const { uuid } = await inMemorySessionRepository.create({
                        inviterUuid: '0dbb264d-3979-483a-a579-e849d79e9c85',
                        inviteeUuid: '02ca8ef5-716d-4421-92e4-ff94682d0b33'
                    });
                    await inMemorySessionRepository.setActiveGame(
                        uuid,
                        gameUuid
                    );
                    await inMemorySessionRepository.unsetActiveGame(uuid);
                    const sessionDetails =
                        await inMemorySessionRepository.getSession(uuid);

                    expect(sessionDetails.activeGameUuid).toBeUndefined;
                });
            });
        });
    });
});
