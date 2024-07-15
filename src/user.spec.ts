import request from 'supertest';
import app from '@/index';

describe('user-integration', () => {
    describe('signup', () => {
        describe('given the user does not exist', () => {
            it('creates a user', async () => {
                const response = await request(app).post('/user/signup').send({
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@foo.com'
                });
                expect(response.statusCode).toBe(201);
                expect(response.body).toBe(
                    expect.objectContaining({
                        firstName: 'John',
                        lastName: 'Doe',
                        email: 'john.doe@foo.com',
                        uuid: expect.toBeUuid()
                    })
                );
                expect(response.headers['Content-Type']).toMatch(/json/);
            });
        });
    });
});
