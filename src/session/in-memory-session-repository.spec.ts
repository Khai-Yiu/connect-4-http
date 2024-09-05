describe('in-memory-session-repository', () => {
    let inMemorySessionRepository;

    beforeEach(() => {
        inMemorySessionRepository = new inMemorySessionRepository();
    });

    describe('given details about a session', () => {
        it('creates the session', () => {
            const sessionDetails = {
                inviterUuid: 'Bob',
                inviteeUuid: 'Alice'
            };

            const createdSession =
                inMemorySessionRepository.create(sessionDetails);
            expect(createdSession).toEqual(
                expect.objectContaining({
                    inviter: expect.objectContaining({
                        uuid: 'Bob'
                    }),
                    invitee: expect.objectContaining({
                        uuid: 'Alice'
                    })
                })
            );
        });
    });
});
