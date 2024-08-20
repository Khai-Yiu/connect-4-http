import appFactory from '@/app';
import { generateKeyPair } from 'jose';
import { Response } from 'supertest';
import http from 'http';
import { Express } from 'express';
import { AddressInfo } from 'net';
import { io as ioc, Socket as ClientSocket } from 'socket.io-client';
import { Server, Socket as ServerSocket } from 'socket.io';
import { InviteDetails, InviteStatus } from './invite-service.d';
import TestFixture from '@/test-fixture/test-fixture';
import {
    RabbitMQContainer,
    StartedRabbitMQContainer
} from '@testcontainers/rabbitmq';
import amqp, { Channel, Connection } from 'amqplib';

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
    let app: Express;
    let httpServer: http.Server;
    let server: Server;
    let connectionAddress: string;
    let rabbitMQContainer: StartedRabbitMQContainer;
    let connection: Connection;
    let channel: Channel;
    let testFixture: TestFixture;

    beforeAll(async () => {
        const jwtKeyPair = generateKeyPair('RS256');
        rabbitMQContainer = await new RabbitMQContainer().start();
        connection = await amqp.connect(rabbitMQContainer.getAmqpUrl());
        channel = await connection.createChannel();

        app = appFactory({
            routerParameters: {
                stage: 'test',
                keySet: await jwtKeyPair,
                publishEvent: (queue, content: InviteDetails) =>
                    Promise.resolve(
                        channel.sendToQueue(
                            queue,
                            Buffer.from(JSON.stringify(content, null, 2))
                        )
                    )
            }
        });

        testFixture = new TestFixture(app);
        const q = await channel.assertQueue('invite_created', {
            durable: false
        });
        httpServer = http.createServer(app);
        server = new Server(httpServer);
        httpServer.listen(() => {
            const port = (httpServer.address() as AddressInfo).port;
            connectionAddress = `http://localhost:${port}`;
            // server.on('connection', async (socket) => {
            //     await channel.prefetch(1);
            //     channel.consume(q.queue, (msg) => {
            //         const parsedContent = JSON.parse(
            //             msg.content as unknown as string
            //         );
            //         socket.emit('invite_received', parsedContent);
            //     });
            // });
        });
    }, 1000000);

    afterAll(async () => {
        server.close();
        httpServer.close();
        await channel
            .close()
            .then(() => connection.close())
            .then(() => rabbitMQContainer.stop());
    });

    describe('given a user is logged in', () => {
        describe('when another user sends them an invite', () => {
            it.skip('they receive a notification', async () => {
                await testFixture
                    .createUser('player1@gmail.com', 'Hello123')
                    .createUser('player2@gmail.com', 'Hello123')
                    .login('player1@gmail.com', 'Hello123')
                    .login('player2@gmail.com', 'Hello123')
                    .run();

                const inviteeResponse = testFixture.getResponses(3) as Response;
                const inviteeAuthorizationField =
                    inviteeResponse.headers.authorization;

                const inviteeSocket = ioc(connectionAddress, {
                    extraHeaders: {
                        Authorization: inviteeAuthorizationField
                    }
                });

                inviteeSocket.connect();
                inviteeSocket.on(
                    'invite_received',
                    (inviteReceivedMessage: InviteReceivedMessage) => {
                        expect(inviteReceivedMessage).toEqual({
                            inviter: 'player1@gmail.com',
                            invitee: 'player2@gmail.com',
                            exp: expect.any(Number),
                            uuid: expect.toBeUuid(),
                            status: 'PENDING'
                        });
                        inviteeSocket.disconnect();
                    }
                );

                await testFixture
                    .createInvite('player1@gmail.com', 'player2@gmail.com')
                    .run();

                return waitFor(inviteeSocket, 'invite_received');
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
                            setTimeout(() => reject(new Error('Timeout')), 500)
                        )
                    ])
                ).rejects.toThrow('Timeout');
            });
        });
    });
});
