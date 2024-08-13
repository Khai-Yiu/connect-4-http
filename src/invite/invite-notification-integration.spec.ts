import appFactory from '@/app';
import { generateKeyPair } from 'jose';
import { Response } from 'supertest';
import { createServer } from 'http';
import { Express } from 'express';
import { AddressInfo } from 'net';
import { last, pipe, split } from 'ramda';
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
    let httpServer;
    let serverSocket: ServerSocket;
    let clientSocket: ClientSocket;
    let port: number;

    beforeAll((done) => {
        jwtKeyPair.then((jwtKeyPair) => {
            app = appFactory({
                routerParameters: {
                    stage: 'test',
                    keySet: jwtKeyPair
                }
            });

            httpServer = createServer(app);
            io = new Server(httpServer);

            io.on('connection', (socket) => {
                socket.emit('invite_received', 1);
            });

            httpServer.listen(3003, () => {
                port = (httpServer.address() as AddressInfo).port;
                clientSocket = ioc(`http://localhost:${port}`);
                clientSocket.on('connect', done);
            });
        });
    });

    afterAll(() => {
        io.close();
        clientSocket.disconnect();
    });

    describe('given a user is logged in', () => {
        describe('when another user sends them an invite', () => {
            it.skip('they receive a notification', async () => {
                const testFixture = new TestFixture(app);
                await testFixture
                    .createUser('player1@gmail.com', 'Hello123')
                    .createUser('player2@gmail.com', 'Hello123')
                    .login('player1@gmail.com', 'Hello123')
                    .login('player2@gmail.com', 'Hello123')
                    .run();

                const inviteeResponse = testFixture.getResponses(3) as Response;
                const authorizationField =
                    inviteeResponse.headers.authorization;
                const inviteeToken = pipe(split(' '), last)(authorizationField);

                // ioc(`ws://localhost`, {
                //     auth: {
                //         token: inviteeToken
                //     }
                // });

                io.on(
                    'invite_received',
                    (inviteReceivedMessage: InviteReceivedMessage) => {
                        expect(inviteReceivedMessage).toEqual({
                            inviter: 'player1@gmail.com',
                            invitee: 'player2@gmail.com',
                            exp: expect.any(Number),
                            uuid: expect.toBeUuid(),
                            status: 'PENDING'
                        });
                    }
                );

                await testFixture
                    .createInvite('player1@gmail.com', 'player2@gmail.com')
                    .run();
                const inviteDetailsResponse = testFixture.getResponses(
                    4
                ) as Response;

                //c.emit('invite_received', inviteDetailsResponse.body.invite);

                return waitFor(clientSocket, 'invite_received');
            });
        });
    });
});
