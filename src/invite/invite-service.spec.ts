import InMemoryUserRepositoryFactory from '@/user/in-memory-user-repository';
import UserService from '@/user/user-service';
import InviteService, { InvalidInvitationError } from '@/invite/invite-service';
import InMemoryInviteRepository from '@/invite/in-memory-invite-repository';

const createUserServiceWithInviterAndInvitee = () => {
    const repository = new InMemoryUserRepositoryFactory();
    const userService = new UserService(repository);
    const inviterDetails = {
        firstName: 'Player',
        lastName: 'One',
        email: 'player1@gmail.com',
        password: 'Hello123'
    };
    const inviteeDetails = {
        firstName: 'Player',
        lastName: 'Two',
        email: 'player2@gmail.com',
        password: 'Hello123'
    };
    userService.create(inviterDetails);
    userService.create(inviteeDetails);

    return userService;
};

describe('invite-service', () => {
    describe('given an inviter who is an existing user', () => {
        describe('and an invitee who is an existing user', () => {
            it('creates an invite', async () => {
                jest.useFakeTimers({ doNotFake: ['setImmediate'] });
                const currentTime = Date.now();
                jest.setSystemTime(currentTime);

                const userService = createUserServiceWithInviterAndInvitee();
                const inviteRepository = new InMemoryInviteRepository();
                const inviteService = new InviteService(
                    userService,
                    inviteRepository
                );
                const inviteDetails = await inviteService.create({
                    inviter: 'player1@gmail.com',
                    invitee: 'player2@gmail.com'
                });
                const lengthOfDayInMilliseconds = 60 * 60 * 24 * 1000;
                expect(inviteDetails).toEqual({
                    uuid: expect.toBeUuid(),
                    inviter: 'player1@gmail.com',
                    invitee: 'player2@gmail.com',
                    exp: currentTime + lengthOfDayInMilliseconds,
                    status: 'PENDING'
                });
                jest.useRealTimers();
            });
        });
        describe('and the inviter and invitee are the same user', () => {
            it('throws an InvalidInvitationError', () => {
                const userService = new UserService({
                    repository: new InMemoryUserRepositoryFactory()
                });
                const inviterDetails = {
                    firstName: 'Player',
                    lastName: 'One',
                    email: 'player1@gmail.com',
                    password: 'Hello123'
                };
                userService.create(inviterDetails);
                const repository = new InMemoryInviteRepository();
                const inviteService = new InviteService(
                    userService,
                    repository
                );
                const inviteCreationDetails = {
                    inviter: 'player1@gmail.com',
                    invitee: 'player1@gmail.com'
                };

                expect(
                    inviteService.create(inviteCreationDetails)
                ).rejects.toThrow(
                    new InvalidInvitationError(
                        'Users can not send invites to themselves.'
                    )
                );
            });
        });
        describe('and an invitee who is not an existing user', () => {
            it('throws an InvalidInvitationError', async () => {
                const userService = new UserService({
                    repository: new InMemoryUserRepositoryFactory()
                });
                const repository = new InMemoryInviteRepository();
                const inviteService = new InviteService(
                    userService,
                    repository
                );
                const inviteCreationDetails = {
                    inviter: 'player1@gmail.com',
                    invitee: 'player2@gmail.com'
                };
                expect(
                    inviteService.create(inviteCreationDetails)
                ).rejects.toThrow(
                    new InvalidInvitationError('Invitee does not exist.')
                );
            });
        });
    });
});
