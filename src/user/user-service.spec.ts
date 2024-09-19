import argon2 from 'argon2';
import UserService, {
    AuthenticationFailedError,
    UserAlreadyExistsError,
    UserNotFoundError
} from '@/user/user-service';
import InMemoryUserRepositoryFactory from '@/user/in-memory-user-repository';

describe('user-service', () => {
    describe('user creation', () => {
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
                expect(
                    await argon2.verify(user.password, 'Hello123')
                ).toBeTruthy();
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

                expect(
                    await argon2.verify(user.password, 'Hello123')
                ).toBeTruthy();
            });
        });
    });
    describe('user authentication', () => {
        describe('given a registered user', () => {
            describe('and provided correct credentials', () => {
                it('authenticates the user', async () => {
                    const repository = new InMemoryUserRepositoryFactory();
                    const userService = new UserService(repository);
                    await userService.create({
                        firstName: 'John',
                        lastName: 'Doe',
                        email: 'john.doe@gmail.com',
                        password: 'Hello123'
                    });
                    const userCredentials = {
                        email: 'john.doe@gmail.com',
                        password: 'Hello123'
                    };

                    expect(
                        await userService.authenticate(userCredentials)
                    ).toEqual(
                        expect.objectContaining({ isAuthenticated: true })
                    );
                });
            });
            describe('and provided incorrect credentials', () => {
                it('does not authenticate the user', async () => {
                    const repository = new InMemoryUserRepositoryFactory();
                    const userService = new UserService(repository);
                    await userService.create({
                        firstName: 'John',
                        lastName: 'Doe',
                        email: 'john.doe@gmail.com',
                        password: 'Hello123'
                    });
                    const userCredentials = {
                        email: 'john.doe@gmail.com',
                        password: 'Hello1234'
                    };

                    expect(
                        userService.authenticate(userCredentials)
                    ).rejects.toThrow(
                        new AuthenticationFailedError('Authentication failed')
                    );
                });
            });
        });
        describe('given an unregistered user', () => {
            describe('when an authentication attempt is made', () => {
                it('throws an authentication failed error', async () => {
                    const repository = new InMemoryUserRepositoryFactory();
                    const userService = new UserService(repository);
                    const userCredentials = {
                        email: 'dung.eater@gmail.com',
                        password: 'DungEater123'
                    };
                    expect(
                        userService.authenticate(userCredentials)
                    ).rejects.toThrow(
                        new AuthenticationFailedError('Authentication failed')
                    );
                });
            });
        });
    });
    describe('get user details', () => {
        describe('given the email for a user that does not exist', () => {
            it('throws an UserNotFound error', async () => {
                const repository = new InMemoryUserRepositoryFactory();
                const userService = new UserService(repository);
                const userEmail = 'thomas.ho@gmail.com';
                expect(userService.getUserDetails(userEmail)).rejects.toThrow(
                    new UserNotFoundError('User does not exist.')
                );
            });
        });
        describe('given the email for a user that exists', () => {
            it('returns the user details', async () => {
                const repository = new InMemoryUserRepositoryFactory();
                const userService = new UserService(repository);
                const userDetails = {
                    firstName: 'Thomas',
                    lastName: 'Ho',
                    email: 'thomas.ho@gmail.com',
                    password: '1231232121321'
                };
                await userService.create(userDetails);
                expect(
                    await userService.getUserDetails(userDetails.email)
                ).toEqual({
                    firstName: 'Thomas',
                    lastName: 'Ho',
                    email: 'thomas.ho@gmail.com',
                    uuid: expect.toBeUuid()
                });
            });
        });
        describe('given a user uuid for an existing user', () => {
            it('returns the user details', async () => {
                const repository = new InMemoryUserRepositoryFactory();
                const userService = new UserService(repository);
                const userDetails = {
                    firstName: 'Thomas',
                    lastName: 'Ho',
                    email: 'thomas.ho@gmail.com',
                    password: '1231232121321'
                };
                const { uuid } = await userService.create(userDetails);
                expect(await userService.getUserDetailsByUuid(uuid)).toEqual({
                    firstName: 'Thomas',
                    lastName: 'Ho',
                    email: 'thomas.ho@gmail.com',
                    uuid,
                    password: expect.any(String)
                });
            });
        });
    });
    describe('check if user exists', () => {
        describe('given the email of an existing user', () => {
            it('returns true', async () => {
                const userRepository = new InMemoryUserRepositoryFactory();
                const userService = new UserService(userRepository);
                await userService.create({
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@gmail.com',
                    password: 'Hello123'
                });
                expect(
                    await userService.getDoesUserExist('john.doe@gmail.com')
                ).toBe(true);
            });
        });
    });
});
