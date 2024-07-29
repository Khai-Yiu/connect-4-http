import appFactory from '@/app';
import { generateKeyPair } from 'jose';
import request from 'supertest';
import { App } from 'supertest/types';

describe('invite-integration', () => {
    let app: App;

    beforeEach(async () => {
        app = appFactory({
            routerParameters: {
                stage: 'test',
                keySet: await generateKeyPair('RS256')
            }
        });
    });

    describe('given an inviter that is an existing user', () => {
        describe('and an invitee that is an existing user', () => {
            describe('when the inviter sends an invitation to the invitee', () => {
                it('creates an invitation', async () => {
                    jest.useFakeTimers({ doNotFake: ['setImmediate'] });
                    const currentTime = Date.now();
                    jest.setSystemTime(currentTime);

                    const inviterDetails = {
                        firstName: 'Player',
                        lastName: 'Two',
                        email: 'player1@gmail.com',
                        password: 'Hello123'
                    };
                    const inviteeDetails = {
                        firstName: 'Player',
                        lastName: 'Two',
                        email: 'player2@gmail.com',
                        password: 'Hello123'
                    };
                    const inviterCredentials = {
                        email: 'player1@gmail.com',
                        password: 'Hello123'
                    };
                    await request(app).post('/signup').send(inviterDetails);
                    await request(app).post('/signup').send(inviteeDetails);
                    await request(app).post('/login').send(inviterCredentials);
                    const response = await request(app).post('/invite').send({
                        inviter: 'player1@gmail.com',
                        invitee: 'player2@gmail.com'
                    });
                    const lengthOfDayInMilliseconds = 60 * 60 * 24 * 1000;
                    expect(response.statusCode).toBe(201);
                    expect(response.body.invite).toEqual({
                        uuid: expect.toBeUuid(),
                        inviter: 'player1@gmail.com',
                        invitee: 'player2@gmail.com',
                        exp: currentTime + lengthOfDayInMilliseconds,
                        status: 'PENDING'
                    });
                    jest.useRealTimers();
                });
            });
        });
    });
});
