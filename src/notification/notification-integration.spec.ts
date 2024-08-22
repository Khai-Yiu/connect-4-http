import appFactory from '@/app';
import { ExpressWithPort } from '@/create-server-side-web-socket';
import { KeySet } from '@/global';
import TestFixture from '@/test-fixture/test-fixture';
import { generateKeyPair } from 'jose';
import { io as ioc } from 'socket.io-client';
import { Response } from 'supertest';

describe('notification-integration', () => {
    let app: ExpressWithPort;
    let port: number;
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
    });
});
