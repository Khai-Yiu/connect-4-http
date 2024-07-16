import UserService, { UserAlreadyExistsError } from '@/user/user-service';
import InMemoryUserRepositoryFactory from '@/user/in-memory-user-repository';

describe('user-service', () => {
    const user1Details = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@gmail.com'
    };

    describe('given the details of a user that does not exist', () => {
        it('creates the user', async () => {
            const userRepository = new InMemoryUserRepositoryFactory();
            const userService = new UserService(userRepository);
            const user = await userService.create(user1Details);
            expect(user).toEqual(
                expect.objectContaining({
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@gmail.com',
                    uuid: expect.toBeUuid()
                })
            );
        });
    });
    describe('given an email is already associated with an existing user', () => {
        it('throws a "user already exists" error when attempting to create users with the same email', async () => {
            const userRepository = new InMemoryUserRepositoryFactory();
            const userService = new UserService(userRepository);
            await userService.create(user1Details);
            expect(async () => await userService.create(user1Details)).toThrow(
                new UserAlreadyExistsError(
                    'A user with that email already exists'
                )
            );
        });
    });
});
