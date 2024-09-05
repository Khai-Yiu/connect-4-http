import InMemorySessionRepository from './in-memory-session-repository';

describe('session-service', () => {
    describe('creating a session service', () => {
        describe('given a session repository', () => {
            it('creates a session service', () => {
                const sessionRepository = new InMemorySessionRepository();
                const sessionService = new SessionService(sessionRepository);
                expect(sessionService).toBeInstanceOf(SessionService);
            });
        });
    });
    describe('creating a session', () => {
        describe('given the ID of two players', () => {
            it.skip('creates a session', () => {
                const sessionID = sessionService.createSession({
                    inviterUuid: 'Bob',
                    inviteeUuid: 'Alice'
                });
                expect(sessionService.getSession(sessionID)).toEqual(
                    expect.objectContaining({
                        inviterUuid: expect.objectContaining({ uuid: 'Bob' }),
                        inviteeUuid: expect.objectContaining({ uuid: 'Alice' })
                    })
                );
            });
        });
    });
    describe('retrieving a session', () => {
        describe('given a session has been created', () => {
            describe('when provided with the ID', () => {
                it.skip('retrieves details about the session', () => {
                    const sessionID = sessionService.createSession({
                        inviterUuid: 'Bob',
                        inviteeUuid: 'Alice'
                    });
                    expect(sessionService.getSession(sessionID)).toEqual(
                        expect.objectContaining({
                            inviterUuid: expect.objectContaining({
                                uuid: 'Bob'
                            }),
                            inviteeUuid: expect.objectContaining({
                                uuid: 'Alice'
                            })
                        })
                    );
                });
            });
        });
    });
});
