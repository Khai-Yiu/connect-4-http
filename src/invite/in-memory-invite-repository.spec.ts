import InMemoryInviteRepository from '@/invite/in-memory-invite-repository';

describe('in-memory-invite-repository', () => {
    describe('given details of an invite', () => {
        it('creates the invite', async () => {
            const repository = new InMemoryInviteRepository();
            const inviteDetails = {
                inviter: 'player1@gmail.com',
                invitee: 'player2@gmail.com',
                exp: 1000
            };
            const createdInvite = await repository.create(inviteDetails);
            expect(createdInvite).toEqual({
                uuid: expect.toBeUuid(),
                inviter: 'player1@gmail.com',
                invitee: 'player2@gmail.com',
                exp: 1000
            });
        });
    });
});
