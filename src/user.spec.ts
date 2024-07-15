import request from 'supertest';
import app from '@/app';

describe('user-integration', () => {
    describe('signup', () => {
        describe('given the user does not exist', () => {
            it.skip('creates a user', async () => {
                const response = await request(app).post('/user/signup').send({
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@gmail.com'
                });
                expect(response.statusCode).toBe(201);
                expect(response.body).toBe(
                    expect.objectContaining({
                        firstName: 'John',
                        lastName: 'Doe',
                        email: 'john.doe@gmail.com',
                        // @ts-ignore
                        uuid: expect.toBeUuid()
                    })
                );
                expect(response.headers['Content-Type']).toMatch(/json/);
            });
        });
    });
});
