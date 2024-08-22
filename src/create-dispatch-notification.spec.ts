import createDispatchNotification from '@/create-dispatch-notification';
import TestFixture from './test-fixture/test-fixture';
import { io as ioc, Socket as ClientSocket } from 'socket.io-client';
import http from 'http';
import { Server } from 'socket.io';
import { generateKeyPair, jwtDecrypt } from 'jose';
import appFactory from './app';
import { Express } from 'express';
import { AddressInfo } from 'net';
import { Response } from 'supertest';
import { KeySet } from './global';

let testFixture: TestFixture;
let jwtKeyPair: Promise<KeySet>;
let app: Express;
let httpServer: http.Server;
let server: Server;
let connectionAddress: string;
let callCreatedDispatchNotificationWhenPromiseResolves: (
    value: unknown
) => void = () => {};

beforeEach(async () => {
    jwtKeyPair = generateKeyPair('RS256');
    app = appFactory({
        routerParameters: {
            stage: 'test',
            keySet: await jwtKeyPair,
            publishEvent: (queue, payload) => Promise.resolve()
        }
    });
    testFixture = new TestFixture(app);
    httpServer = http.createServer(app);
    server = new Server(httpServer);
    httpServer.listen(() => {
        const port = (httpServer.address() as AddressInfo).port;
        connectionAddress = `http://localhost:${port}`;
    });
    server.on('connection', async (socket) => {
        const token = socket.handshake.auth.token;
        const { privateKey } = await jwtKeyPair;
        const { payload } = await jwtDecrypt(token, privateKey);
        const { username } = payload;

        callCreatedDispatchNotificationWhenPromiseResolves('Resolved');
        socket.join(username as string);
    });
});

afterEach(() => {
    server.close();
    httpServer.close();
    httpServer.removeAllListeners();
});

describe('create-dispatch-notification', () => {
    describe('given a user connected to a socket', () => {
        let recipientSocket: ClientSocket;
        let thirdPartySocket: ClientSocket;

        afterEach(() => {
            if (recipientSocket instanceof ClientSocket) {
                recipientSocket.disconnect();
            }

            if (thirdPartySocket instanceof ClientSocket) {
                thirdPartySocket.disconnect();
            }
        });

        describe('and no other users are connected', () => {
            describe('when a message is dispatched to the user', () => {
                it('the user receives the message', async () => {
                    const singleUserPromise = new Promise((resolve) => {
                        callCreatedDispatchNotificationWhenPromiseResolves =
                            resolve;
                    });
                    let userResolver: (value: unknown) => void;
                    const userPromise = new Promise((resolve) => {
                        userResolver = resolve;
                    });
                    await testFixture
                        .createUser('player1@gmail.com', 'Hello123')
                        .login('player1@gmail.com', 'Hello123')
                        .run();
                    const recipientResponse = testFixture.getResponses(
                        1
                    ) as Response;
                    recipientSocket = ioc(connectionAddress, {
                        auth: {
                            token: recipientResponse.headers.authorization.split(
                                ' '
                            )[1]
                        }
                    });

                    recipientSocket.connect();
                    recipientSocket.on('event', (details) => {
                        userResolver(details);
                    });

                    await singleUserPromise;
                    const dispatchNotification =
                        createDispatchNotification(server);

                    dispatchNotification({
                        recipient: 'player1@gmail.com',
                        type: 'event',
                        payload: {
                            message: 'Hello'
                        }
                    });

                    await expect(userPromise).resolves.toEqual({
                        message: 'Hello'
                    });
                });
            });
            describe('when multiple messages are dispatched to the user', () => {
                it('the user receives all messages', async () => {
                    const singleUserPromise = new Promise((resolve) => {
                        callCreatedDispatchNotificationWhenPromiseResolves =
                            resolve;
                    });
                    let resolveUserReceiveMessagesPromise: (
                        value: unknown
                    ) => void;
                    const userReceivedMessagesPromise = new Promise(
                        (resolve) => {
                            resolveUserReceiveMessagesPromise = resolve;
                        }
                    );
                    await testFixture
                        .createUser('player1@gmail.com', 'Hello123')
                        .login('player1@gmail.com', 'Hello123')
                        .run();
                    const recipientResponse = testFixture.getResponses(
                        1
                    ) as Response;
                    recipientSocket = ioc(connectionAddress, {
                        auth: {
                            token: recipientResponse.headers.authorization.split(
                                ' '
                            )[1]
                        }
                    });

                    recipientSocket.connect();
                    const messages = [];
                    let messagesReceived = 0;
                    recipientSocket.on('event', (details) => {
                        messagesReceived++;
                        messages.push(details);
                        if (messagesReceived == 2) {
                            resolveUserReceiveMessagesPromise(messages);
                        }
                    });

                    await singleUserPromise;
                    const dispatchNotification =
                        createDispatchNotification(server);

                    dispatchNotification({
                        recipient: 'player1@gmail.com',
                        type: 'event',
                        payload: {
                            message: 'Hello'
                        }
                    });

                    dispatchNotification({
                        recipient: 'player1@gmail.com',
                        type: 'event',
                        payload: {
                            message: 'Bye'
                        }
                    });

                    await expect(userReceivedMessagesPromise).resolves.toEqual([
                        {
                            message: 'Hello'
                        },
                        {
                            message: 'Bye'
                        }
                    ]);
                });
            });
        });
        describe('and another user is connected to a socket', () => {
            describe('when a message is dispatched to the other user', () => {
                it('does not send the message to the user who is not the intended recipient', async () => {
                    const firstUserConnectPromise = new Promise((resolve) => {
                        callCreatedDispatchNotificationWhenPromiseResolves =
                            resolve;
                    });
                    let userResolver: (value: unknown) => void;
                    const userPromise = new Promise((resolve) => {
                        userResolver = resolve;
                    });

                    await testFixture
                        .createUser('player1@gmail.com', 'Hello123')
                        .createUser('thirdParty@gmail.com', 'Hello123')
                        .login('player1@gmail.com', 'Hello123')
                        .login('thirdParty@gmail.com', 'Hello123')
                        .run();

                    const recipientResponse = testFixture.getResponses(
                        2
                    ) as Response;
                    const thirdPartyResponse = testFixture.getResponses(
                        3
                    ) as Response;
                    recipientSocket = ioc(connectionAddress, {
                        auth: {
                            token: recipientResponse.headers.authorization.split(
                                ' '
                            )[1]
                        }
                    });
                    thirdPartySocket = ioc(connectionAddress, {
                        auth: {
                            token: thirdPartyResponse.headers.authorization.split(
                                ' '
                            )[1]
                        }
                    });

                    recipientSocket.on('event', (details) => {
                        userResolver(details);
                    });

                    await firstUserConnectPromise;
                    const secondUserConnectPromise = new Promise((resolve) => {
                        callCreatedDispatchNotificationWhenPromiseResolves =
                            resolve;
                    });

                    thirdPartySocket.on('event', (details) => {
                        expect(true).toBeFalsy();
                    });

                    await secondUserConnectPromise;
                    const dispatchNotification =
                        createDispatchNotification(server);

                    dispatchNotification({
                        recipient: 'player1@gmail.com',
                        type: 'event',
                        payload: {
                            message: 'Hello'
                        }
                    });

                    await expect(userPromise).resolves.toEqual({
                        message: 'Hello'
                    });
                });
            });
            describe('when a message is dispatched to each user', () => {
                let player1Socket;
                let player2Socket;

                afterEach(() => {
                    player1Socket.disconnect();
                    player2Socket.disconnect();
                });
                it('each user receives a message', async () => {
                    const firstUserConnectPromise = new Promise((resolve) => {
                        callCreatedDispatchNotificationWhenPromiseResolves =
                            resolve;
                    });
                    let resolvePlayer1ReceivesMessagePromise: (
                        value: unknown
                    ) => void;
                    const player1ReceivedMessagePromise = new Promise(
                        (resolve) => {
                            resolvePlayer1ReceivesMessagePromise = resolve;
                        }
                    );
                    let resolvePlayer2ReceivesMessagePromise: (
                        value: unknown
                    ) => void;
                    const player2ReceivedMessagePromise = new Promise(
                        (resolve) => {
                            resolvePlayer2ReceivesMessagePromise = resolve;
                        }
                    );

                    await testFixture
                        .createUser('player1@gmail.com', 'Hello123')
                        .createUser('player2@gmail.com', 'Hello123')
                        .login('player1@gmail.com', 'Hello123')
                        .login('player2@gmail.com', 'Hello123')
                        .run();

                    const player1Response = testFixture.getResponses(
                        2
                    ) as Response;
                    const player2Response = testFixture.getResponses(
                        3
                    ) as Response;
                    player1Socket = ioc(connectionAddress, {
                        auth: {
                            token: player1Response.headers.authorization.split(
                                ' '
                            )[1]
                        }
                    });
                    player2Socket = ioc(connectionAddress, {
                        auth: {
                            token: player2Response.headers.authorization.split(
                                ' '
                            )[1]
                        }
                    });

                    player1Socket.on('event', (details) => {
                        resolvePlayer1ReceivesMessagePromise(details);
                    });

                    await firstUserConnectPromise;
                    const secondUserConnectPromise = new Promise((resolve) => {
                        callCreatedDispatchNotificationWhenPromiseResolves =
                            resolve;
                    });

                    player2Socket.on('event', (details) => {
                        resolvePlayer2ReceivesMessagePromise(details);
                    });

                    await secondUserConnectPromise;
                    const dispatchNotification =
                        createDispatchNotification(server);

                    dispatchNotification({
                        recipient: 'player1@gmail.com',
                        type: 'event',
                        payload: {
                            message: 'Hello player 1'
                        }
                    });

                    dispatchNotification({
                        recipient: 'player2@gmail.com',
                        type: 'event',
                        payload: {
                            message: 'Hello player 2'
                        }
                    });

                    await expect(
                        player1ReceivedMessagePromise
                    ).resolves.toEqual({
                        message: 'Hello player 1'
                    });
                    await expect(
                        player2ReceivedMessagePromise
                    ).resolves.toEqual({
                        message: 'Hello player 2'
                    });
                });
            });
        });
    });
});
