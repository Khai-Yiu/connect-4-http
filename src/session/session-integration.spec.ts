import appFactory from '@/app';
import { KeySet } from '@/global';
import TestFixture from '@/test-fixture/test-fixture';
import { generateKeyPair } from 'jose';
import { App } from 'supertest/types';
import request, { Response } from 'supertest';
import halson from 'halson';

const gameUriRegex =
    /^\/game\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

const sessionUuidRegex =
    /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}/;

describe('session-integration', () => {
    let app: App;
    let jwtKeyPair: KeySet;
    let testFixture: TestFixture;
    let currentDateInMilliseconds: number;

    beforeAll(async () => {
        jwtKeyPair = await generateKeyPair('RS256');
    });

    beforeEach(() => {
        jest.useFakeTimers({
            doNotFake: ['setImmediate']
        });
        currentDateInMilliseconds = Date.now();
        jest.setSystemTime(currentDateInMilliseconds);

        app = appFactory({
            stage: 'test',
            keySet: jwtKeyPair
        });

        testFixture = new TestFixture(app);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('retrieving a session', () => {
        describe('given a session exists', () => {
            it('retrieves the session', async () => {
                await testFixture
                    .createUser('inviter@gmail.com', 'Hello123')
                    .createUser('invitee@gmail.com', 'Hello123')
                    .login('inviter@gmail.com', 'Hello123')
                    .login('invitee@gmail.com', 'Hello123')
                    .createInvite('inviter@gmail.com', 'invitee@gmail.com')
                    .getReceivedInvites('invitee@gmail.com')
                    .acceptInvite('invitee@gmail.com')
                    .run();

                const loginResponse = testFixture.getResponses(3) as Response;
                const acceptInviteResponse = testFixture.getResponses(
                    6
                ) as Response;
                const { href: sessionUri } = halson(
                    acceptInviteResponse.body
                ).getLink('related', { href: '' });

                const sessionUuid = sessionUri.match(sessionUuidRegex)[0];

                const response = await request(app)
                    .get(sessionUri)
                    .set('Authorization', loginResponse.headers.authorization);

                expect(response.statusCode).toBe(200);
                expect(response.body).toEqual({
                    sessionUuid,
                    inviter: 'inviter@gmail.com',
                    invitee: 'invitee@gmail.com',
                    status: 'IN_PROGRESS',
                    _links: {
                        self: {
                            href: sessionUri
                        },
                        startGame: {
                            href: `/session/${sessionUuid}/game`,
                            method: 'POST'
                        },
                        leave: {
                            href: `/session/${sessionUuid}/leave`,
                            method: 'GET'
                        }
                    }
                });
            });
        });
    });
});
