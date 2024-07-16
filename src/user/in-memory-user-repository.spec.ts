import InMemoryUserRepositoryFactory from '@/user/in-memory-user-repository';

describe('in-memory-user-repository', () => {
    const user1Details = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@gmail.com'
    };
    const user2Details = {
        firstName: 'John',
        lastName: 'Doe 2',
        email: 'john.doe2@gmail.com'
    };

    describe('given the details for a user who does not exist', () => {
        it('creates the user', async () => {
            const inMemoryUserRepository = new InMemoryUserRepositoryFactory();
            const createdUser =
                await inMemoryUserRepository.create(user1Details);
            expect(createdUser).toEqual(
                expect.objectContaining({
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@gmail.com',
                    uuid: expect.toBeUuid()
                })
            );
        });
    });
    describe('given an email address', () => {
        it('returns a list of users associated with the email', async () => {
            const inMemoryUserRepository = new InMemoryUserRepositoryFactory();
            await inMemoryUserRepository.create(user1Details);
            await inMemoryUserRepository.create(user2Details);
            const users =
                await inMemoryUserRepository.findByEmail('john.doe@gmail.com');
            expect(users).toEqual([
                {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@gmail.com',
                    uuid: expect.toBeUuid()
                }
            ]);
        });
    });
});
