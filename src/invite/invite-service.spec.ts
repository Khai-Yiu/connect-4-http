import InMemoryUserRepositoryFactory from '@/user/in-memory-user-repository';
import userRouterFactory from '@/user/user-router';
import UserService from '@/user/user-service';
import InviteService from './invite-service';

const createUserServiceWithInviterAndInvitee = () => {
    const repository = new InMemoryUserRepositoryFactory();
    const userService = new UserService(repository);
    const inviterDetails = {
        firstName: 'Player',
        lastName: 'Two',
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
            it('creates an invite', () => {
                jest.useFakeTimers({ doNotFake: ['setImmediate'] });
                const currentTime = Date.now();
                jest.setSystemTime(currentTime);

                const userService = createUserServiceWithInviterAndInvitee();
                const inviteRepository = new InMemoryInviteRepository();
                const inviteService = new InviteService(
                    userService,
                    inviteRepository
                );
                const inviteDetails = inviteService.create({
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
            });
        });
    });
});
