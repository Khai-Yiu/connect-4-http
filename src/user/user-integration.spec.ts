import { Response } from 'supertest';
import appFactory from '@/app';
import { generateKeyPair, jwtDecrypt } from 'jose';
import { last, path, pipe, split } from 'ramda';
import TestFixture from '@/test-fixture/test-fixture';
import { KeySet } from '@/global';
import { ExpressWithPortAndSocket } from '@/create-server-side-web-socket';

describe('user-integration', () => {
    let app: ExpressWithPortAndSocket;
    let port: number;
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
        port = app.port;
        testFixture = new TestFixture(app);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('signup', () => {
        describe('given the user does not exist', () => {
            it('creates a user', async () => {
                await testFixture
                    .createUser('john.doe@gmail.com', 'Hello123', {
                        firstName: 'John',
                        lastName: 'Doe'
                    })
                    .run();
                const response = testFixture.getResponses(0) as Response;
                expect(response.statusCode).toBe(201);
                expect(response.body).toEqual(
                    expect.objectContaining({
                        firstName: 'John',
                        lastName: 'Doe',
                        email: 'john.doe@gmail.com',
                        uuid: expect.toBeUuid()
                    })
                );
                expect(response.headers['content-type']).toMatch(/json/);
            });
        });
        describe('given a user already exists with a given email', () => {
            it('forbids creation of another user with that email', async () => {
                await testFixture
                    .createUser('pho.devourer@gmail.com', 'Hello123')
                    .createUser('pho.devourer@gmail.com', 'Hello123')
                    .run();
                const response = testFixture.getResponses(1) as Response;
                expect(response.statusCode).toBe(403);
                expect(response.body.errors).toEqual([
                    'A user with that email already exists'
                ]);
                expect(response.headers['content-type']).toMatch(/json/);
            });
        });
        describe('given invalid user details', () => {
            it('forbids creation of user', async () => {
                await testFixture
                    .createUser('dempsey.lamington@gmail.com', undefined, {
                        firstName: 'Dempsey',
                        lastName: undefined
                    })
                    .run();
                const response = testFixture.getResponses(0) as Response;
                expect(response.statusCode).toBe(403);
                expect(response.body.errors).toEqual([
                    {
                        message: '"lastName" is required',
                        path: 'lastName'
                    },
                    {
                        message: '"password" is required',
                        path: 'password'
                    }
                ]);
                expect(response.headers['content-type']).toMatch(/json/);
            });
        });
    });
    describe('login', () => {
        describe('given a user already exists', () => {
            describe('and they provide the correct credentials', () => {
                it('they are provided with a session token', async () => {
                    await testFixture
                        .createUser('dung.eater@gmail.com', 'IAmTheDungEater')
                        .login('dung.eater@gmail.com', 'IAmTheDungEater')
                        .run();

                    const loginResponse = testFixture.getResponses(
                        1
                    ) as Response;
                    const jwt = pipe<[Response], string, Array<string>, string>(
                        path(['headers', 'authorization']),
                        split(' '),
                        last
                    )(loginResponse);
                    const { payload, protectedHeader } = await jwtDecrypt(
                        jwt,
                        jwtKeyPair.privateKey
                    );
                    const durationOfADayInSeconds = 1 * 24 * 60 * 60;
                    const dateInSeconds = Math.trunc(
                        currentDateInMilliseconds / 1000
                    );
                    expect(protectedHeader).toEqual({
                        alg: 'RSA-OAEP-256',
                        typ: 'JWT',
                        enc: 'A256GCM'
                    });
                    expect(payload).toEqual({
                        iss: 'connect4-http-server',
                        iat: dateInSeconds,
                        exp: dateInSeconds + durationOfADayInSeconds,
                        sub: 'dung.eater@gmail.com',
                        nbf: dateInSeconds,
                        username: 'dung.eater@gmail.com',
                        roles: []
                    });
                });
                it('receives the relative path to the notifications endpoint', async () => {
                    await testFixture
                        .createUser('player1@gmail.com', 'Hello123')
                        .login('player1@gmail.com', 'Hello123')
                        .run();

                    const response = testFixture.getResponses(1) as Response;

                    expect(response.body.links).toEqual({
                        notifications: `ws://localhost:${port}/notification`
                    });
                });
            });
            describe('and they provide incorrect credentials', () => {
                it('responds with http status code 403', async () => {
                    await testFixture
                        .createUser('dung.eater@gmail.com', 'IAmTheDungEater')
                        .login('dung.eater@gmail.com', 'IAmTheDungEater1')
                        .run();
                    const response = testFixture.getResponses(1) as Response;
                    expect(response.statusCode).toBe(403);
                    expect(response.body.errors).toEqual([
                        'Login attempt failed.'
                    ]);
                    expect(response.headers['content-type']).toMatch(/json/);
                });
            });
        });
        describe('given credentials for a user that does not exist', () => {
            it('responds with a http status code 403', async () => {
                await testFixture
                    .login('dung.eater@gmail.com', 'Hello123')
                    .run();
                const response = testFixture.getResponses(0) as Response;
                expect(response.statusCode).toBe(403);
                expect(response.body.errors).toEqual(['Login attempt failed.']);
                expect(response.headers['content-type']).toMatch(/json/);
            });
        });
    });
    describe('user', () => {
        describe('given the user does not provide an authorization token', () => {
            describe('when they attempt to view their user details', () => {
                it('responds with http status code 401', async () => {
                    await testFixture
                        .createUser('dung.eater@gmail.com', 'IAmTheDungEater')
                        .getUserDetails('dung.eater@gmail.com')
                        .run();
                    const response = testFixture.getResponses(1) as Response;
                    expect(response.statusCode).toBe(401);
                    expect(response.body.errors).toEqual([
                        'You must be logged in to view your user details.'
                    ]);
                });
            });
        });
        describe('given a user provides an authorization token', () => {
            describe('and their token is invalid', () => {
                it('responds with http status code 401', async () => {
                    await testFixture
                        .createUser('dung.eater@gmail.com', 'IAmTheDungEater')
                        .getUserDetails('dung.eater@gmail.com', {
                            customAuthField: 'InvalidToken'
                        })
                        .run();
                    const response = testFixture.getResponses(1) as Response;
                    expect(response.statusCode).toBe(401);
                    expect(response.body.errors).toEqual([
                        'You must be logged in to view your user details.'
                    ]);
                });
            });
            describe('and their token is expired', () => {
                it('responds with http status code 401', async () => {
                    await testFixture
                        .createUser('dung.eater@gmail.com', 'IAmTheDungEater')
                        .login('dung.eater@gmail.com', 'IAmTheDungEater')
                        .run();
                    const loginResponse = testFixture.getResponses(
                        1
                    ) as Response;
                    const dateOfFollowingDayInMilliseconds =
                        Date.now() + 60 * 60 * 24 * 1000;
                    jest.setSystemTime(dateOfFollowingDayInMilliseconds);

                    await testFixture
                        .getUserDetails('dung.eater@gmail.com', {
                            customAuthField: loginResponse.headers.authorization
                        })
                        .run();
                    const response = testFixture.getResponses(2) as Response;

                    expect(response.statusCode).toBe(401);
                    expect(response.body.errors).toEqual([
                        'You must be logged in to view your user details.'
                    ]);
                    jest.useRealTimers();
                });
            });
            describe('and their token is valid', () => {
                it('responds with the user details', async () => {
                    await testFixture
                        .createUser('dung.eater@gmail.com', 'IAmTheDungEater', {
                            firstName: 'Dung',
                            lastName: 'Eater'
                        })
                        .login('dung.eater@gmail.com', 'IAmTheDungEater')
                        .getUserDetails('dung.eater@gmail.com')
                        .run();
                    const response = testFixture.getResponses(2) as Response;
                    const userAccountDetails = {
                        firstName: 'Dung',
                        lastName: 'Eater',
                        email: 'dung.eater@gmail.com'
                    };
                    expect(response.statusCode).toBe(200);
                    expect(response.body).toEqual(userAccountDetails);
                });
            });
        });
    });
});
