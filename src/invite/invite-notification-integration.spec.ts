import appFactory from '@/app';
import { generateKeyPair } from 'jose';
import { Response } from 'supertest';
import { createServer } from 'http';
import { Express } from 'express';
import { AddressInfo } from 'net';
import { io as ioc, Socket as ClientSocket } from 'socket.io-client';
import { Server, Socket as ServerSocket } from 'socket.io';
import { InviteStatus } from './invite-service.d';
import TestFixture from '@/test-fixture';

type InviteReceivedMessage = {
    inviter: string;
    invitee: string;
    exp: number;
    uuid: string;
    status: InviteStatus;
};

function waitFor(socket: ServerSocket | ClientSocket, event: string) {
    return new Promise((resolve) => {
        socket.once(event, resolve);
    });
}

describe('invite-notification-integration', () => {
    const jwtKeyPair = generateKeyPair('RS256');
    let app: Express;
    let io: Server;
    let connectionAddress: string;

    beforeAll((done) => {
        jwtKeyPair.then((jwtKeyPair) => {
            app = appFactory({
                routerParameters: {
                    stage: 'test',
                    keySet: jwtKeyPair
                }
            });

            const httpServer = createServer(app);
            io = new Server(httpServer);
            io.on('connection', (socket) => {});

            httpServer.listen(() => {
                connectionAddress = `http://localhost:${(httpServer.address() as AddressInfo).port}`;
                done();
            });
        });
    });

    afterAll(() => {
        io.close();
    });

    describe('given a user is logged in', () => {
        describe('when another user sends them an invite', () => {
            it('they receive a notification', async () => {
                const testFixture = new TestFixture(app);
                await testFixture
                    .createUser('player1@gmail.com', 'Hello123')
                    .createUser('player2@gmail.com', 'Hello123')
                    .login('player1@gmail.com', 'Hello123')
                    .login('player2@gmail.com', 'Hello123')
                    .run();

                const inviteeResponse = testFixture.getResponses(3) as Response;
                const inviteeAuthorizationField =
                    inviteeResponse.headers.authorization;

                const clientSocket = ioc(connectionAddress, {
                    extraHeaders: {
                        Authorization: inviteeAuthorizationField
                    }
                });

                clientSocket.connect();
                clientSocket.on(
                    'invite_received',
                    (inviteReceivedMessage: InviteReceivedMessage) => {
                        expect(inviteReceivedMessage).toEqual({
                            inviter: 'player1@gmail.com',
                            invitee: 'player2@gmail.com',
                            exp: expect.any(Number),
                            uuid: expect.toBeUuid(),
                            status: 'PENDING'
                        });
                        clientSocket.disconnect();
                        clientSocket.close();
                    }
                );

                await testFixture
                    .createInvite('player1@gmail.com', 'player2@gmail.com')
                    .run();
                const inviteDetailsResponse = testFixture.getResponses(
                    4
                ) as Response;
                io.emit('invite_received', inviteDetailsResponse.body.invite);

                return waitFor(clientSocket, 'invite_received');
            });
        });
    });
});
