import createDispatchNotification from '@/create-dispatch-notification';
import TestFixture from './test-fixture/test-fixture';
import { io as ioc } from 'socket.io-client';
import http from 'http';
import { Server, Socket } from 'socket.io';
import { generateKeyPair } from 'jose';
import appFactory from './app';
import { Express } from 'express';
import { AddressInfo } from 'net';
import { Response } from 'supertest';

let app: Express;
let httpServer: http.Server;
let server: Server;
let connectionAddress: string;
let serverSocket: Promise<Socket>;
let resolveServerSocket: (socket: Socket) => void;

beforeAll(async () => {
    httpServer = http.createServer(app);
    server = new Server(httpServer);
    serverSocket = new Promise((resolve) => {
        resolveServerSocket = resolve;
    });
    httpServer.listen(() => {
        const port = (httpServer.address() as AddressInfo).port;
        connectionAddress = `http://localhost:${port}`;
    });

    server.on('connection', resolveServerSocket);
});

beforeEach(async () => {
    const jwtKeyPair = generateKeyPair('RS256');
    app = appFactory({
        routerParameters: {
            stage: 'test',
            keySet: await jwtKeyPair,
            publishEvent: (queue, payload) => Promise.resolve()
        }
    });
});

afterAll(() => {
    httpServer.close();
});

describe('create-dispatch-notification', () => {
    describe('given a user connected to a socket', () => {
        describe('when a message is dispatched to the user', () => {
            it('the user receives the message', async () => {
                let promiseResolver: (value: unknown) => void;
                const userResolvePromise = new Promise((resolve) => {
                    promiseResolver = resolve;
                });
                const testFixture = new TestFixture(app);
                await testFixture
                    .createUser('player1@gmail.com', 'Hello123')
                    .login('player1@gmail.com', 'Hello123')
                    .run();
                const recipientResponse = testFixture.getResponses(
                    1
                ) as Response;
                const recipientSocket = ioc(connectionAddress, {
                    extraHeaders: {
                        Authorization: recipientResponse.headers.authorization
                    }
                });
                recipientSocket.connect();
                recipientSocket.on('event', (details) => {
                    promiseResolver(details);
                    recipientSocket.disconnect();
                });

                const dispatchNotification = createDispatchNotification(
                    await serverSocket
                );

                dispatchNotification({
                    recipient: 'player1@gmail.com',
                    type: 'event',
                    payload: {
                        message: 'Hello'
                    }
                });

                return expect(userResolvePromise).resolves.toEqual({
                    message: 'Hello'
                });
            });
        });
    });
});
