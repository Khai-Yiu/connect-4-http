import appFactory from '@/app';
import { generateKeyPair } from 'jose';
import { io } from 'socket.io-client';
import { createServer, Server } from 'http';
import { Express } from 'express';
import TestFixture from '@/test-fixture';
import { Response } from 'supertest';
import { last, pipe, split } from 'ramda';

describe('invite-notification-integration', () => {
    const jwtKeyPair = generateKeyPair('RS256');
    let app: Express;
    let server: Server;

    beforeEach(async () => {
        app = appFactory({
            routerParameters: {
                stage: 'test',
                keySet: { ...(await jwtKeyPair) }
            }
        });

        server = new Server(createServer(app));
        server.on('connection', (socket) => {
            socket.emit('received_invite', () => {});
        });
    });

    describe('given a user is logged in', () => {
        describe('when another user sends them an invite', () => {
            it.skip('they receive a notification', async () => {
                const testFixture = new TestFixture(app);
                await testFixture
                    .createUser('player1@gmail.com', 'Hello123')
                    .createUser('player2@gmail.com', 'Hello123')
                    .login('player1@gmail.com', 'Hello123')
                    .createInvite('player1@gmail.com', 'player2@gmail.com')
                    .login('player2@gmail.com', 'Hello123')
                    .run();
                const response = testFixture.getResponses(4) as Response;
                const authorizationField = response.headers.authorization;
                const token = pipe(split(' '), last)(authorizationField);
                const socket = io('ws://localhost', {
                    auth: {
                        token
                    }
                });
                server.on('connection', (socket) => {
                    socket.on(
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
                });
            });
        });
    });
});
