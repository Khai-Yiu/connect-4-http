import InMemoryUserRepositoryFactory from '@/user/in-memory-user-repository';
import UserService from '@/user/user-service';
import InviteService, { InvalidInvitationError } from '@/invite/invite-service';
import InMemoryInviteRepository from '@/invite/in-memory-invite-repository';
import {
    InviteServiceEventHandler,
    InviteEvents
} from '@/invite/invite-service.d';
import InMemorySessionRepository from '@/session/in-memory-session-repository';
import SessionService from '@/session/session-service';
import GameService from '@/game/game-service';
import Game from '@/game/game';
import InMemoryGameRepository from '@/game/in-memory-game-repository';

const createUserServiceWithInviterAndInvitee = async () => {
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
    await userService.create(inviterDetails);
    await userService.create(inviteeDetails);

    return userService;
};

const createSessionService = async () => {
    const gameRepository = new InMemoryGameRepository();
    const gameService = new GameService(
        gameRepository,
        (...args) => new Game(...args)
    );
    const sessionRepository = new InMemorySessionRepository();
    const sessionService = new SessionService(sessionRepository, gameService);

    return sessionService;
};

describe('invite-service', () => {
    let inviteService: InviteService;
    let currentTime: number;

    beforeEach(async () => {
        jest.useFakeTimers({ doNotFake: ['setImmediate'] });
        currentTime = Date.now();
        jest.setSystemTime(currentTime);

        inviteService = new InviteService(
            await createUserServiceWithInviterAndInvitee(),
            await createSessionService(),
            new InMemoryInviteRepository()
        );
    });

    afterEach(async () => {
        jest.useRealTimers();
    });

    describe('creating invites', () => {
        describe('given an inviter who is an existing user', () => {
            describe('and an invitee who is an existing user', () => {
                it('creates an invite', async () => {
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
                });
                describe('and the service was created with an invitation created callback', () => {
                    it('publishes an "invite created" message', async () => {
                        const mockedInvitationCreationCallback = jest.fn();
                        const inviteService = new InviteService(
                            await createUserServiceWithInviterAndInvitee(),
                            await createSessionService(),
                            new InMemoryInviteRepository(),
                            {
                                [InviteEvents.INVITATION_CREATED]:
                                    mockedInvitationCreationCallback as InviteServiceEventHandler
                            }
                        );

                        await inviteService.create({
                            inviter: 'player1@gmail.com',
                            invitee: 'player2@gmail.com'
                        });

                        expect(
                            mockedInvitationCreationCallback
                        ).toHaveBeenCalledWith({
                            uuid: expect.toBeUuid(),
                            inviter: 'player1@gmail.com',
                            invitee: 'player2@gmail.com',
                            exp: expect.any(Number),
                            status: 'PENDING'
                        });
                    });
                });
            });
            describe('and the inviter and invitee are the same user', () => {
                it('throws an InvalidInvitationError', async () => {
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
                    const userService = new UserService(
                        new InMemoryUserRepositoryFactory()
                    );
                    const inviterDetails = {
                        firstName: 'Player',
                        lastName: 'One',
                        email: 'player1@gmail.com',
                        password: 'Hello123'
                    };
                    await userService.create(inviterDetails);
                    const inviteService = new InviteService(
                        userService,
                        await createSessionService(),
                        new InMemoryInviteRepository()
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
    describe('retrieving invites', () => {
        describe('given an inviter who is an existing user', () => {
            describe('and an invitee who is an existing user', () => {
                describe('and the inviter invites the invitee', () => {
                    it('returns all invites', async () => {
                        const receivedInviteDetails =
                            await inviteService.create({
                                inviter: 'player1@gmail.com',
                                invitee: 'player2@gmail.com'
                            });
                        await inviteService.create({
                            inviter: 'player2@gmail.com',
                            invitee: 'player1@gmail.com'
                        });
                        const invites = await inviteService.getReceivedInvites(
                            'player2@gmail.com'
                        );
                        expect(invites).toEqual([receivedInviteDetails]);
                    });
                });
            });
        });
    });
    describe('retrieving an invite', () => {
        describe('given an inviter who is an existing user', () => {
            describe('and an invitee who is an existing user', () => {
                describe('and the inviter invites the invitee', () => {
                    describe('and the invite id is provided', () => {
                        it('returns details of the invite', async () => {
                            const { uuid, exp } = await inviteService.create({
                                inviter: 'player1@gmail.com',
                                invitee: 'player2@gmail.com'
                            });
                            const retrievedInviteDetails =
                                await inviteService.getInvite(uuid);

                            expect(retrievedInviteDetails).toEqual({
                                uuid,
                                inviter: 'player1@gmail.com',
                                invitee: 'player2@gmail.com',
                                exp,
                                status: 'PENDING'
                            });
                        });
                    });
                });
            });
        });
    });
    describe('accepting invites', () => {
        describe('given a pending invite', () => {
            describe('and the invitee accepts', () => {
                it('the invite is accepted', async () => {
                    const { uuid, exp } = await inviteService.create({
                        inviter: 'player1@gmail.com',
                        invitee: 'player2@gmail.com'
                    });

                    await inviteService.acceptInvite(uuid);
                    const retrievedInviteDetails =
                        await inviteService.getInvite(uuid);

                    expect(retrievedInviteDetails).toEqual({
                        uuid,
                        inviter: 'player1@gmail.com',
                        invitee: 'player2@gmail.com',
                        exp,
                        status: 'ACCEPTED'
                    });
                });
            });
        });
    });
});
