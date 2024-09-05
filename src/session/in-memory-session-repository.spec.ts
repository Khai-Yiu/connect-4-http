import InMemorySessionRepository from '@/session/in-memory-session-repository';

describe('in-memory-session-repository', () => {
    let inMemorySessionRepository;

    beforeEach(() => {
        inMemorySessionRepository = new InMemorySessionRepository();
    });

    describe('given details about a session', () => {
        it('creates the session', () => {
            const sessionDetails = {
                inviterUuid: '010f712b-7b31-420b-bd40-f23584fac148',
                inviteeUuid: 'd36e91c5-5c0d-481d-b929-5dab0267257a'
            };

            const createdSession =
                inMemorySessionRepository.create(sessionDetails);
            expect(createdSession).toEqual(
                expect.objectContaining({
                    inviter: expect.objectContaining({
                        uuid: '010f712b-7b31-420b-bd40-f23584fac148'
                    }),
                    invitee: expect.objectContaining({
                        uuid: 'd36e91c5-5c0d-481d-b929-5dab0267257a'
                    })
                })
            );
        });
    });
});
