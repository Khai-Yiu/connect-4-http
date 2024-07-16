import InMemoryUserRepositoryFactory from '@/user/in-memory-user-repository';

describe('in-memory-user-repository', () => {
    describe('given the details for a user who does not exist', () => {
        it('creates the user', async () => {
            const inMemoryUserRepository = new InMemoryUserRepositoryFactory();
            const createdUser = await inMemoryUserRepository.create({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@gmail.com'
            });
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
            await inMemoryUserRepository.create({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@gmail.com'
            });
            await inMemoryUserRepository.create({
                firstName: 'Jonathan',
                lastName: 'Doe',
                email: 'john.doe2@gmail.com'
            });
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
