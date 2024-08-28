import appFactory from '@/app';
import { ExpressWithPortAndSocket } from '@/create-server-side-web-socket';
import { KeySet } from '@/global';
import TestFixture from '@/test-fixture/test-fixture';
import { generateKeyPair } from 'jose';
import { io as ioc } from 'socket.io-client';
import { Response } from 'supertest';
import createDispatchNotification from './create-dispatch-notification';
import { Server } from 'socket.io';

describe('notification-integration', () => {
    let app: ExpressWithPortAndSocket;
    let port: number;
    let server: Server;
    const jwtKeyPair: Promise<KeySet> = generateKeyPair('RS256');
    let testFixture: TestFixture;

    beforeEach(async () => {
        app = appFactory({
            routerParameters: {
                stage: 'test',
                keySet: await jwtKeyPair,
                publishEvent: (queue, payload) => Promise.resolve()
            }
        });
        port = app.port;
        server = app.serverSocket;
        testFixture = new TestFixture(app);
    });

    describe('given the user exists and is logged in', () => {
        describe('when the user connects to the notification endpoint', () => {
            it('the connection succeeds', async () => {
                let resolveUserPromise: (value: unknown) => void;
                const userPromise = new Promise((resolve) => {
                    resolveUserPromise = resolve;
                });

                await testFixture
                    .createUser('player1@gmail.com', 'Hello123')
                    .login('player1@gmail.com', 'Hello123')
                    .run();
                const {
                    body: {
                        links: { notifications }
                    },
                    headers: { authorization }
                } = testFixture.getResponses(1) as Response;

                const notificationSocket = ioc(`${notifications}`, {
                    auth: {
                        token: authorization.split(' ')[1]
                    }
                });

                notificationSocket.connect();
                notificationSocket.on('connect', () => {
                    resolveUserPromise('Connected');
                    notificationSocket.disconnect();
                });

                return expect(userPromise).resolves.toBe('Connected');
            });
        });
        describe('and they are connected to the notification endpoint', () => {
            describe('when a notification is dispatched to the user', () => {
                it('they receive the notification', async () => {
                    let resolveUserConnectedPromise: (value: unknown) => void;
                    const userConnectedPromise = new Promise((resolve) => {
                        resolveUserConnectedPromise = resolve;
                    });
                    let resolveUserNotificationPromise: (
                        value: unknown
                    ) => void;
                    const userReceivedNotificationPromise = new Promise(
                        (resolve) => {
                            resolveUserNotificationPromise = resolve;
                        }
                    );

                    await testFixture
                        .createUser('player1@gmail.com', 'Hello123')
                        .login('player1@gmail.com', 'Hello123')
                        .run();
                    const {
                        body: {
                            links: { notifications }
                        },
                        headers: { authorization }
                    } = testFixture.getResponses(1) as Response;

                    const notificationSocket = ioc(notifications, {
                        auth: {
                            token: authorization.split(' ')[1]
                        }
                    });

                    notificationSocket.connect();
                    notificationSocket.on('connect', () => {
                        resolveUserConnectedPromise('Connected');
                    });

                    notificationSocket.on('event', (details) => {
                        resolveUserNotificationPromise(details);
                        notificationSocket.disconnect();
                    });

                    await userConnectedPromise;
                    const dispatchNotification =
                        createDispatchNotification(server);

                    dispatchNotification({
                        recipient: 'player1@gmail.com',
                        type: 'event',
                        payload: {
                            message: 'Hello'
                        }
                    });

                    return expect(
                        userReceivedNotificationPromise
                    ).resolves.toEqual({
                        message: 'Hello'
                    });
                });
            });
            describe('when a notification is dispatched to another user', () => {
                it('only the designated recipient is notified', async () => {
                    let resolveUserConnectedPromise: (value: unknown) => void;
                    const userConnectedPromise = new Promise((resolve) => {
                        resolveUserConnectedPromise = resolve;
                    });
                    let resolveThirdPartyConnectedPromise: (
                        value: unknown
                    ) => void;
                    const thirdPartyConnectedPromise = new Promise(
                        (resolve) => {
                            resolveThirdPartyConnectedPromise = resolve;
                        }
                    );
                    let resolveUserNotificationPromise: (
                        value: unknown
                    ) => void;
                    const userReceivedNotificationPromise = new Promise(
                        (resolve) => {
                            resolveUserNotificationPromise = resolve;
                        }
                    );
                    let resolveThirdPartyUserNotificationPromise: (
                        value: unknown
                    ) => void;
                    const thirdPartyUserReceivedReceivedNotificationPromise =
                        new Promise((resolve) => {
                            resolveThirdPartyUserNotificationPromise = resolve;
                        });

                    await testFixture
                        .createUser('player1@gmail.com', 'Hello123')
                        .createUser('thirdParty@gmail.com', 'Hello123')
                        .login('player1@gmail.com', 'Hello123')
                        .login('thirdParty@gmail.com', 'Hello123')
                        .run();
                    const {
                        body: {
                            links: { notifications }
                        },
                        headers: { authorization: userAuth }
                    } = testFixture.getResponses(2) as Response;
                    const {
                        headers: { authorization: thirdPartyAuth }
                    } = testFixture.getResponses(3) as Response;

                    const recipientSocket = ioc(notifications, {
                        auth: {
                            token: userAuth.split(' ')[1]
                        }
                    });

                    recipientSocket.on('connect', () => {
                        resolveUserConnectedPromise('Connected');
                    });
                    recipientSocket.connect();

                    recipientSocket.on('event', (details) => {
                        resolveUserNotificationPromise(details);
                    });

                    const thirdPartySocket = ioc(notifications, {
                        auth: {
                            token: thirdPartyAuth.split(' ')[1]
                        }
                    });
                    thirdPartySocket.on('connect', () => {
                        resolveThirdPartyConnectedPromise('Connected');
                    });

                    thirdPartySocket.connect();
                    thirdPartySocket.on('event', (details) => {
                        expect(true).toBeFalsy();
                    });

                    await userConnectedPromise;
                    await thirdPartyConnectedPromise;
                    const dispatchNotification =
                        createDispatchNotification(server);

                    dispatchNotification({
                        recipient: 'player1@gmail.com',
                        type: 'event',
                        payload: {
                            message: 'Hello'
                        }
                    });

                    await expect(
                        userReceivedNotificationPromise
                    ).resolves.toEqual({
                        message: 'Hello'
                    });

                    recipientSocket.disconnect();
                    thirdPartySocket.disconnect();
                });
            });
        });
    });
});
