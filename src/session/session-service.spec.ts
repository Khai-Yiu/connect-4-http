import InMemorySessionRepository, {
    SessionRepository
} from './in-memory-session-repository';
import SessionService from './session-service';

describe('session-service', () => {
    let sessionRepository: SessionRepository;
    let sessionService: SessionService;

    beforeEach(() => {
        sessionRepository = new InMemorySessionRepository();
        sessionService = new SessionService(sessionRepository);
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
            it('creates a session', () => {
                const sessionDetails = sessionService.createSession({
                    inviterUuid: 'ac698d60-5f6e-4d89-be27-f12c9b054d22',
                    inviteeUuid: 'd5bcfb7a-b8a8-4274-afef-c5db4509813a'
                });

                expect(sessionDetails).toEqual(
                    expect.objectContaining({
                        uuid: expect.toBeUuid(),
                        inviterUuid: expect.objectContaining({
                            uuid: 'ac698d60-5f6e-4d89-be27-f12c9b054d22'
                        }),
                        inviteeUuid: expect.objectContaining({
                            uuid: 'd5bcfb7a-b8a8-4274-afef-c5db4509813a'
                        })
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
