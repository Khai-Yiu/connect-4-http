import request, { Response } from 'supertest';
import appFactory from '@/app';
import { generateKeyPair, jwtDecrypt } from 'jose';
import { last, path, pipe, split } from 'ramda';
import { App } from 'supertest/types';

describe('user-integration', () => {
    let app: App;
    let jwtKeyPair;

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
    });

    describe('signup', () => {
        describe('given the user does not exist', () => {
            it('creates a user', async () => {
                const response = await request(app).post('/user/signup').send({
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@gmail.com',
                    password: 'Hello123'
                });
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
                await request(app).post('/user/signup').send({
                    firstName: 'Kenny',
                    lastName: 'Pho',
                    email: 'pho.devourer@gmail.com',
                    password: 'Hello213'
                });
                const response = await request(app).post('/user/signup').send({
                    firstName: 'Lenny',
                    lastName: 'Pho',
                    email: 'pho.devourer@gmail.com',
                    password: 'Hello123'
                });
                expect(response.statusCode).toBe(403);
                expect(response.body.errors).toEqual([
                    'A user with that email already exists'
                ]);
                expect(response.headers['content-type']).toMatch(/json/);
            });
        });
        describe('given invalid user details', () => {
            it('forbids creation of user', async () => {
                const response = await request(app).post('/user/signup').send({
                    firstName: 'Dempsey',
                    email: 'dempsey.lamnington@gmail.com'
                });

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

                    const userDetails = {
                        firstName: 'Dung',
                        lastName: 'Eater',
                        email: 'dung.eater@gmail.com',
                        password: 'IAmTheDungEater'
                    };
                    await request(app).post('/user/signup').send(userDetails);
                    const userCredentials = {
                        username: 'dung.eater@gmail.com',
                        password: 'IAmTheDungEater'
                    };
                    const loginResponse = await request(app)
                        .post('/user/login')
                        .send(userCredentials);
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
                    const userDetails = {
                        firstName: 'Dung',
                        lastName: 'Eater',
                        email: 'dung.eater@gmail.com',
                        password: 'Hello123'
                    };
                    await request(app).post('/user/signup').send(userDetails);
                    const userCredentials = {
                        username: 'dung.eater@gmail.com',
                        password: 'Hello121'
                    };
                    const response = await request(app)
                        .post('/user/login')
                        .send(userCredentials);
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
                const userCredentials = {
                    username: 'dung.eater@gmail.com',
                    password: 'Hello123'
                };
                const response = await request(app)
                    .post('/user/login')
                    .send(userCredentials);
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
                    const response = await request(app).get('/user').send();
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
                    const response = await request(app)
                        .get('/user')
                        .set('Authorization', 'token')
                        .send();
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

                    const userDetails = {
                        firstName: 'Dung',
                        lastName: 'Eater',
                        email: 'dung.eater@gmail.com',
                        password: 'IAmTheDungEater'
                    };
                    await request(app).post('/user/signup').send(userDetails);
                    const userCredentials = {
                        username: 'dung.eater@gmail.com',
                        password: 'IAmTheDungEater'
                    };
                    const loginResponse = await request(app)
                        .post('/user/login')
                        .send(userCredentials);
                    const authorizationHeaderField =
                        loginResponse.header.authorization;
                    const dateOfFollowingDayInMilliseconds =
                        Date.now() + 60 * 60 * 24 * 1000;
                    jest.setSystemTime(dateOfFollowingDayInMilliseconds);
                    const response = await request(app)
                        .get('/user')
                        .set('Authorization', authorizationHeaderField)
                        .send({ email: 'dung.eater@gmail.com' });

                    expect(response.statusCode).toBe(401);
                    expect(response.body.errors).toEqual([
                        'You must be logged in to view your user details.'
                    ]);
                    jest.useRealTimers();
                });
            });
            describe('and their token is valid', () => {
                it('responds with the user details', async () => {
                    const userDetails = {
                        firstName: 'Dung',
                        lastName: 'Eater',
                        email: 'dung.eater@gmail.com',
                        password: 'IAmTheDungEater'
                    };
                    await request(app).post('/user/signup').send(userDetails);
                    const userCredentials = {
                        username: 'dung.eater@gmail.com',
                        password: 'IAmTheDungEater'
                    };
                    const loginResponse = await request(app)
                        .post('/user/login')
                        .send(userCredentials);
                    const authorizationHeaderField =
                        loginResponse.header.authorization;

                    const response = await request(app)
                        .get('/user')
                        .set('Authorization', authorizationHeaderField)
                        .send({ email: 'dung.eater@gmail.com' });

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
