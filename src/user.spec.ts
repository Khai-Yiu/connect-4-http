import request from 'supertest';
import app from '@/app';

describe('user-integration', () => {
    describe('signup', () => {
        const user1Details = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@gmail.com'
        };

        describe('given the user does not exist', () => {
            it('creates a user', async () => {
                const response = await request(app)
                    .post('/user/signup')
                    .send(user1Details);
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
                await request(app).post('/user/signup').send(user1Details);
                const response = await request(app)
                    .post('/user/signup')
                    .send(user1Details);
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
                    lastName: 'Lamington',
                    email: 'dempsey.lamnington@gmail.com'
                });

                expect(response.statusCode).toBe(403);
                expect(response.body.errors).toEqual([
                    'Invalid user details provided. Expected a first name, last name, email address and password.'
                ]);
                expect(response.headers['content-type']).toMatch(/json/);
            });
        });
    });
});
