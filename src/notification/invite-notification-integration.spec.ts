import appFactory from '@/app';
import { generateKeyPair } from 'jose';
import { Response } from 'supertest';
import { io as ioc, Socket } from 'socket.io-client';
import { Server } from 'socket.io';
import { InviteStatus } from '@/invite/invite-service.d';
import TestFixture from '@/test-fixture/test-fixture';
import { ExpressWithPortAndSocket } from '@/create-server-side-web-socket';
import { Subject } from 'rxjs';
import { InviteCreatedEvent } from '@/invite/create-invite-event-listener';
import { InternalEventPublisher } from '@/app.d';

type InviteReceivedMessage = {
    inviter: string;
    invitee: string;
    exp: number;
    uuid: string;
    status: InviteStatus;
};

describe('invite-notification-integration', () => {
    let app: ExpressWithPortAndSocket;
    let port: number;
    let socketServer: Server;
    let testFixture: TestFixture;
    let internalEventPublisher: InternalEventPublisher<any, any>;

    beforeAll(async () => {
        const jwtKeyPair = generateKeyPair('RS256');
        const messageSubject: Subject<InviteCreatedEvent> = new Subject();
        internalEventPublisher = jest.fn((content: InviteCreatedEvent) =>
            Promise.resolve(messageSubject.next(content))
        );
        app = appFactory({
            stage: 'test',
            keySet: await jwtKeyPair,
            internalEventPublisher,
            internalEventSubscriber: messageSubject
        });

        port = app.port;
        socketServer = app.serverSocket;
        testFixture = new TestFixture(app);
    });

    afterAll(async () => {
        socketServer.close();
    });

    describe('given a user is logged in', () => {
        describe('and connected to the notification service', () => {
            let inviteeSocket: Socket;
            let inviteePromise: Promise<void>;

            beforeEach(async () => {
                let resolveInviteeSocketConnects: (value: unknown) => void;
                const inviteeSocketConnectedPromise = new Promise((resolve) => {
                    resolveInviteeSocketConnects = resolve;
                });
                let resolveInviteePromise: (value: unknown) => void;
                inviteePromise = new Promise((resolve) => {
                    resolveInviteePromise = resolve;
                });

                await testFixture
                    .createUser('player1@gmail.com', 'Hello123')
                    .createUser('player2@gmail.com', 'Hello123')
                    .login('player1@gmail.com', 'Hello123')
                    .login('player2@gmail.com', 'Hello123')
                    .run();

                const {
                    body: {
                        links: { notifications }
                    },
                    headers: { authorization: inviteeAuth }
                } = testFixture.getResponses(3) as Response;

                const inviteeSocket = ioc(notifications, {
                    auth: {
                        token: inviteeAuth.split(' ')[1]
                    }
                });

                inviteeSocket.on('connect', () => {
                    resolveInviteeSocketConnects('Connected');
                });

                inviteeSocket.on(
                    'invite_received',
                    (inviteReceivedMessage: InviteReceivedMessage) => {
                        resolveInviteePromise(inviteReceivedMessage);
                        inviteeSocket.disconnect();
                    }
                );

                inviteeSocket.connect();
                await inviteeSocketConnectedPromise;
            });
            describe('when another user sends them an invite', () => {
                it('they receive a notification', async () => {
                    await testFixture
                        .createInvite('player1@gmail.com', 'player2@gmail.com')
                        .run();

                    return expect(inviteePromise).resolves.toEqual({
                        inviter: 'player1@gmail.com',
                        invitee: 'player2@gmail.com',
                        exp: expect.any(Number),
                        uuid: expect.toBeUuid(),
                        status: 'PENDING'
                    });
                });
            });
        });
        describe('when an inviter sends an invite to an invitee who is not the user', () => {
            it.skip('the user does not receive a notification', async () => {
                await testFixture
                    .createUser('player1@gmail.com', 'Hello123')
                    .createUser('player2@gmail.com', 'Hello123')
                    .createUser('player3@gmail.com', 'Hello123')
                    .login('player1@gmail.com', 'Hello123')
                    .login('player2@gmail.com', 'Hello123')
                    .login('player3@gmail.com', 'Hello123')
                    .run();

                const inviteeResponse = testFixture.getResponses(4) as Response;
                const inviteeAuthorizationField =
                    inviteeResponse.headers.authorization;
                const thirdPartyResponse = testFixture.getResponses(
                    5
                ) as Response;
                const thirdPartyAuthorizationField =
                    thirdPartyResponse.headers.authorization;

                const inviteeSocket = ioc(connectionAddress, {
                    extraHeaders: {
                        Authorization: inviteeAuthorizationField
                    }
                });
                const thirdPartySocket = ioc(connectionAddress, {
                    extraHeaders: {
                        Authorization: thirdPartyAuthorizationField
                    }
                });

                let resolveInviteDetailsReceivedPromise: (
                    inviteReceivedMessage: InviteReceivedMessage
                ) => void;
                const inviteDetailsReceivedPromise = new Promise((resolve) => {
                    resolveInviteDetailsReceivedPromise = resolve;
                });

                let resolveThirdPartyPromise: (
                    inviteReceivedMessage: InviteReceivedMessage
                ) => void;
                const thirdPartyPromise = new Promise((resolve) => {
                    resolveThirdPartyPromise = resolve;
                });

                inviteeSocket.connect();
                thirdPartySocket.connect();

                inviteeSocket.on(
                    'invite_received',
                    (inviteReceivedMessage: InviteReceivedMessage) => {
                        resolveInviteDetailsReceivedPromise(
                            inviteReceivedMessage
                        );
                        inviteeSocket.disconnect();
                    }
                );

                thirdPartySocket.on(
                    'invite_received',
                    (inviteReceivedMessage: InviteReceivedMessage) => {
                        resolveThirdPartyPromise(inviteReceivedMessage);
                        thirdPartySocket.disconnect();
                    }
                );

                await testFixture
                    .createInvite('player1@gmail.com', 'player2@gmail.com')
                    .run();

                await expect(
                    Promise.race([
                        thirdPartyPromise,
                        new Promise((ignore, reject) =>
                            setTimeout(
                                () => reject(new Error('Timeout')),
                                500
                            ).unref()
                        )
                    ])
                ).rejects.toThrow('Timeout');
            });
        });
    });
});
