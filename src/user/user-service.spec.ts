import argon2 from 'argon2';
import UserService, { UserAlreadyExistsError } from '@/user/user-service';
import InMemoryUserRepositoryFactory from '@/user/in-memory-user-repository';

describe('user-service', () => {
    describe('given the details of a user that does not exist', () => {
        it('creates the user', async () => {
            const userRepository = new InMemoryUserRepositoryFactory();
            const userService = new UserService(userRepository);
            const user = await userService.create({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@gmail.com',
                password: 'Hello123'
            });
            expect(user).toEqual(
                expect.objectContaining({
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@gmail.com',
                    uuid: expect.toBeUuid()
                })
            );
            expect(await argon2.verify(user.password, 'Hello123')).toBeTruthy();
        });
    });
    describe('given an email is already associated with an existing user', () => {
        it('throws a "user already exists" error when attempting to create users with the same email', async () => {
            const userRepository = new InMemoryUserRepositoryFactory();
            const userService = new UserService(userRepository);
            await userService.create({
                firstName: 'Dung',
                lastName: 'Eater',
                email: 'dung.eater@gmail.com',
                password: 'Hello123'
            });
            expect(
                userService.create({
                    firstName: 'Kenny',
                    lastName: 'Pho',
                    email: 'dung.eater@gmail.com',
                    password: 'Hello123'
                })
            ).rejects.toThrow(
                new UserAlreadyExistsError(
                    'A user with that email already exists'
                )
            );
        });
    });
    describe('given a user with a plain-text password', () => {
        it('creates the user with a hashed password', async () => {
            const userRepository = new InMemoryUserRepositoryFactory();
            const userService = new UserService(userRepository);
            const user = await userService.create({
                firstName: 'James',
                lastName: 'Grad',
                email: 'james.grad@gmail.com',
                password: 'Hello123'
            });

            expect(await argon2.verify(user.password, 'Hello123')).toBeTruthy();
        });
    });
});
