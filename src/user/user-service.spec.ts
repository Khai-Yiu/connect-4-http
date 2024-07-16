import UserService from '@/user/user-service';
import InMemoryUserRepositoryFactory from './in-memory-user-repository';

describe('user-service', () => {
    describe('given the details of a user that does not exist', () => {
        it('creates the user', async () => {
            const userRepository = new InMemoryUserRepositoryFactory();
            const userService = new UserService(userRepository);
            const user = await userService.create({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@gmail.com'
            });
            expect(user).toEqual(
                expect.objectContaining({
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@gmail.com',
                    // @ts-ignore
                    uuid: expect.toBeUuid()
                })
            );
        });
    });
});
