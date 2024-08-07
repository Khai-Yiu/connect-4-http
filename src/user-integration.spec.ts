import { Response } from 'supertest';
import appFactory from '@/app';
import { generateKeyPair, jwtDecrypt } from 'jose';
import { last, path, pipe, split } from 'ramda';
import { App } from 'supertest/types';
import TestFixture from './test-fixture';
import { KeySet } from './global';

describe('user-integration', () => {
    let app: App;
    let jwtKeyPair: KeySet;
    let testFixture: TestFixture;

    beforeAll(async () => {
        jwtKeyPair = await generateKeyPair('RS256');
    });

    beforeEach(() => {
        app = appFactory({
            routerParameters: {
                stage: 'test',
                keySet: jwtKeyPair
            }
        });
        testFixture = new TestFixture(app);
    });

    describe('signup', () => {
        describe('given the user does not exist', () => {
            it('creates a user', async () => {
                await testFixture.createUser(
                    'John',
                    'Doe',
                    'john.doe@gmail.com',
                    'Hello123'
                );
                const response = testFixture.getResponse();
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
                await testFixture.createUser(
                    'Kenny',
                    'Pho',
                    'pho.devourer@gmail.com',
                    'Hello123'
                );
                await testFixture.createUser(
                    'Lenny',
                    'Pho',
                    'pho.devourer@gmail.com',
                    'Hello123'
                );
                const response = testFixture.getResponse();
                expect(response.statusCode).toBe(403);
                expect(response.body.errors).toEqual([
                    'A user with that email already exists'
                ]);
                expect(response.headers['content-type']).toMatch(/json/);
            });
        });
        describe('given invalid user details', () => {
            it('forbids creation of user', async () => {
                await testFixture.createUser(
                    'Dempsey',
                    undefined,
                    'dempsey.lamington@gmail.com',
                    undefined
                );
                const response = testFixture.getResponse();
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
                    jest.useFakeTimers({
                        doNotFake: ['setImmediate']
                    });
                    const dateInMilliseconds = Date.now();
                    jest.setSystemTime(dateInMilliseconds);

                    await testFixture.createUser(
                        'Dung',
                        'Eater',
                        'dung.eater@gmail.com',
                        'IAmTheDungEater'
                    );
                    await testFixture.login(
                        'dung.eater@gmail.com',
                        'IAmTheDungEater'
                    );
                    const loginResponse = testFixture.getResponse();
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
                    const dateInSeconds = Math.trunc(dateInMilliseconds / 1000);
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
                    jest.useRealTimers();
                });
            });
            describe('and they provide incorrect credentials', () => {
                it('responds with http status code 403', async () => {
                    await testFixture.createUser(
                        'Dung',
                        'Eater',
                        'dung.eater@gmail.com',
                        'IAmTheDungEater'
                    );
                    await testFixture.login(
                        'dung.eater@gmail.com',
                        'IAmTheDungEater1'
                    );
                    const response = testFixture.getResponse();
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
                await testFixture.login('dung.eater@gmail.com', 'Hello123');
                const response = testFixture.getResponse();
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
                    await testFixture.createUser(
                        'Dung',
                        'Eater',
                        'dung.eater@gmail.com',
                        'IAmTheDungEater'
                    );
                    await testFixture.getUserDetails('dung.eater@gmail.com');
                    const response = testFixture.getResponse();
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
                    await testFixture.createUser(
                        'Dung',
                        'Eater',
                        'dung.eater@gmail.com',
                        'IAmTheDungEater'
                    );
                    await testFixture.getUserDetails('dung.eater@gmail.com', {
                        customAuthField: 'InvalidToken'
                    });
                    const response = testFixture.getResponse();
                    expect(response.statusCode).toBe(401);
                    expect(response.body.errors).toEqual([
                        'You must be logged in to view your user details.'
                    ]);
                });
            });
            describe('and their token is expired', () => {
                it('responds with http status code 401', async () => {
                    jest.useFakeTimers({
                        doNotFake: ['setImmediate']
                    });

                    await testFixture.createUser(
                        'Dung',
                        'Eater',
                        'dung.eater@gmail.com',
                        'IAmTheDungEater'
                    );
                    await testFixture.login(
                        'dung.eater@gmail.com',
                        'IAmTheDungEater'
                    );
                    const loginResponse = testFixture.getResponse();
                    const dateOfFollowingDayInMilliseconds =
                        Date.now() + 60 * 60 * 24 * 1000;
                    jest.setSystemTime(dateOfFollowingDayInMilliseconds);
                    await testFixture.getUserDetails('dung.eater@gmail.com', {
                        customAuthField: loginResponse.headers.authorization
                    });
                    const response = testFixture.getResponse();

                    expect(response.statusCode).toBe(401);
                    expect(response.body.errors).toEqual([
                        'You must be logged in to view your user details.'
                    ]);
                    jest.useRealTimers();
                });
            });
            describe('and their token is valid', () => {
                it('responds with the user details', async () => {
                    await testFixture.createUser(
                        'Dung',
                        'Eater',
                        'dung.eater@gmail.com',
                        'IAmTheDungEater'
                    );
                    await testFixture.login(
                        'dung.eater@gmail.com',
                        'IAmTheDungEater'
                    );
                    const loginResponse = testFixture.getResponse();
                    await testFixture.getUserDetails('dung.eater@gmail.com');
                    const response = testFixture.getResponse();
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
