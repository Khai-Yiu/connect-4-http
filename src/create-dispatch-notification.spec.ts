import createDispatchNotification from '@/create-dispatch-notification';
import TestFixture from './test-fixture/test-fixture';
import { io as ioc, Socket as ClientSocket } from 'socket.io-client';
import http from 'http';
import { Server, Socket } from 'socket.io';
import { generateKeyPair } from 'jose';
import appFactory from './app';
import { Express } from 'express';
import { AddressInfo } from 'net';
import { Response } from 'supertest';

let testFixture: TestFixture;
let app: Express;
let httpServer: http.Server;
let server: Server;
let connectionAddress: string;
let serverSideSocketPromise: Promise<Socket>;
let resolveServerSocket: (socket: Socket) => void;

beforeEach(async () => {
    const jwtKeyPair = generateKeyPair('RS256');
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
    serverSideSocketPromise = new Promise((resolve) => {
        resolveServerSocket = resolve;
    });
    httpServer.listen(() => {
        const port = (httpServer.address() as AddressInfo).port;
        connectionAddress = `http://localhost:${port}`;
    });
    server.on('connection', resolveServerSocket);
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

        describe('when a message is dispatched to the user', () => {
            it('the user receives the message', async () => {
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
                    extraHeaders: {
                        Authorization: recipientResponse.headers.authorization
                    }
                });
                recipientSocket.connect();
                recipientSocket.on('event', (details) => {
                    userResolver(details);
                });

                const dispatchNotification = createDispatchNotification(
                    await serverSideSocketPromise
                );

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
        describe('when a message is dispatched to another user', () => {
            it('does not send the message to the user who is not the intended recipient', async () => {
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
                    extraHeaders: {
                        Authorization: recipientResponse.headers.authorization
                    }
                });
                thirdPartySocket = ioc(connectionAddress, {
                    extraHeaders: {
                        Authorization: thirdPartyResponse.headers.authorization
                    }
                });

                recipientSocket.connect();
                recipientSocket.on('event', (details) => {
                    userResolver(details);
                });

                thirdPartySocket.connect();
                thirdPartySocket.on('event', (details) => {
                    expect(true).toBeFalsy();
                });

                const dispatchNotification = createDispatchNotification(
                    await serverSideSocketPromise
                );

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
    });
});
