import request, { Response } from 'supertest';
import appFactory from '@/app';
import { generateKeyPair, jwtDecrypt } from 'jose';
import { last, path, pipe, split } from 'ramda';

describe('user-integration', () => {
    describe('signup', () => {
        describe('given the user does not exist', () => {
            it('creates a user', async () => {
                const app = appFactory({
                    routerParameters: {
                        stage: 'test'
                    }
                });
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
                const app = appFactory({
                    routerParameters: {
                        stage: 'test'
                    }
                });
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
                const app = appFactory({
                    routerParameters: {
                        stage: 'test'
                    }
                });
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
                    const {
                        publicKey: jwtPublicKey,
                        privateKey: jwtPrivateKey
                    } = await generateKeyPair('PS256');
                    const app = appFactory({
                        routerParameters: {
                            stage: 'test',
                            keySet: {
                                jwtPublicKey
                            }
                        }
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
                    const jwt = pipe<[Response], string, Array<string>, string>(
                        path(['headers', 'authorization']),
                        split(' '),
                        last
                    )(loginResponse);
                    const { payload, protectedHeader } = await jwtDecrypt(
                        jwt,
                        jwtPrivateKey
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
                    const {
                        publicKey: jwtPublicKey,
                        privateKey: jwtPrivateKey
                    } = await generateKeyPair('PS256');
                    const app = appFactory({
                        routerParameters: {
                            stage: 'test',
                            keySet: {
                                jwtPublicKey
                            }
                        }
                    });
                    const userDetails = {
                        firstName: 'Dung',
                        lastName: 'Eater',
                        email: 'dung.eater@gmail.com',
                        password: 'Hello123'
                    };
                    await request(app).post('/user/signup').send(userDetails);
                    const userCredentials = {
                        username: 'dung.eater@gmail.com',
                        password: 'Hello124'
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
                const { publicKey: jwtPublicKey, privateKey: jwtPrivateKey } =
                    await generateKeyPair('PS256');
                const app = appFactory({
                    routerParameters: {
                        stage: 'test',
                        keySet: {
                            jwtPublicKey
                        }
                    }
                });
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
                    const app = appFactory({
                        routerParameters: {
                            stage: 'test'
                        }
                    });
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
                    const app = appFactory({
                        routerParameters: {
                            stage: 'test'
                        }
                    });
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
        });
    });
    describe('logout', () => {
        describe('given a user is logged in', () => {
            it.skip('their session token is invalidated upon logout', async () => {
                jest.useFakeTimers({
                    doNotFake: ['setImmediate']
                });
                const dateInMilliseconds = Date.now();
                jest.setSystemTime(dateInMilliseconds);
                const { publicKey: jwtPublicKey, privateKey: jwtPrivateKey } =
                    await generateKeyPair('PS256');
                const app = appFactory({
                    routerParameters: {
                        stage: 'test',
                        keySet: {
                            jwtPublicKey
                        }
                    }
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
                const jwt = pipe<[Response], string, Array<string>, string>(
                    path(['headers', 'authorization']),
                    split(' '),
                    last
                )(loginResponse);

                await request(app)
                    .post('/user/logout')
                    .set('Authorization', `Bearer ${jwt}`)
                    .send();

                const protectedResponse = await request(app)
                    .get('/protected-endpoint')
                    .set('Authorization', `Bearer ${jwt}`);

                expect(protectedResponse.status).toBe(401);
                expect(protectedResponse.body).toEqual({
                    error: 'Unauthorized'
                });

                jest.useRealTimers();
            });
        });
    });
});
