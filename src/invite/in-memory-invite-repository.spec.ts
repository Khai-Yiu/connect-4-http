import InMemoryInviteRepository from '@/invite/in-memory-invite-repository';
import { InviteCreationDetails } from '@/invite/in-memory-invite-repository.d';

describe('in-memory-invite-repository', () => {
    describe('given details of an invite', () => {
        it('creates the invite', async () => {
            const repository = new InMemoryInviteRepository();
            const inviteDetails = {
                inviter: 'player1@gmail.com',
                invitee: 'player2@gmail.com',
                exp: 1000,
                status: 'PENDING'
            } as InviteCreationDetails;
            const createdInvite = await repository.create(inviteDetails);
            expect(createdInvite).toEqual({
                uuid: expect.toBeUuid(),
                inviter: 'player1@gmail.com',
                invitee: 'player2@gmail.com',
                exp: 1000,
                status: 'PENDING'
            });
        });
    });
    describe('given an invite exists', () => {
        describe('and an email is provided', () => {
            it('returns all invites associated with that email', async () => {
                const repository = new InMemoryInviteRepository();
                const receivedInviteDetails = {
                    inviter: 'player1@gmail.com',
                    invitee: 'player2@gmail.com',
                    exp: 1000,
                    status: 'PENDING'
                } as InviteCreationDetails;
                const forwardedInviteDetails = {
                    inviter: 'player2@gmail.com',
                    invitee: 'player1@gmail.com',
                    exp: 1000,
                    status: 'PENDING'
                } as InviteCreationDetails;
                await repository.create(receivedInviteDetails);
                await repository.create(forwardedInviteDetails);
                const invites =
                    await repository.findReceivedInvitesByEmail(
                        'player2@gmail.com'
                    );
                expect(invites).toEqual([
                    {
                        uuid: expect.toBeUuid(),
                        inviter: 'player1@gmail.com',
                        invitee: 'player2@gmail.com',
                        exp: 1000,
                        status: 'PENDING'
                    }
                ]);
            });
        });
    });
});
