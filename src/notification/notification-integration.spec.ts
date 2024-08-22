import appFactory from '@/app';
import { KeySet } from '@/global';
import TestFixture from '@/test-fixture/test-fixture';
import { Express } from 'express';
import { generateKeyPair } from 'jose';
import { io as ioc } from 'socket.io-client';
import http from 'http';
import { Server } from 'socket.io';
import { Response } from 'supertest';

describe('notification-integration', () => {
    let app: Express;
    const jwtKeyPair: Promise<KeySet> = generateKeyPair('RS256');
    let testFixture: TestFixture;
    let connectionAddress: string;
    let httpServer: http.Server;
    let server: Server;

    beforeEach(async () => {
        app = appFactory({
            routerParameters: {
                stage: 'test',
                keySet: await jwtKeyPair,
                publishEvent: (queue, payload) => Promise.resolve()
            }
        });
        testFixture = new TestFixture(app);
    });
    describe('given the user exists and is logged in', () => {
        describe('when the user connects to the notification endpoint', () => {
            it('the connection succeeds', async () => {
                await testFixture
                    .createUser('player1@gmail.com', 'Hello123')
                    .login('player1@gmail.com', 'Hello123')
                    .run();
                const {
                    body: {
                        notification: { uri }
                    },
                    headers: { authorization }
                } = testFixture.getResponses(1) as Response;
                const notificationSocket = ioc(uri, {
                    auth: {
                        token: authorization.split(' ')[1]
                    }
                });

                notificationSocket.connect();
                expect(notificationSocket.connected).toBe(true);
            });
        });
    });
});
