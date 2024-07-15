import InMemoryUserRepositoryFactory from '@/user/in-memory-user-repository';

describe('in-memory-user-repository', () => {
    describe('given the details for a user who does not exist', () => {
        it('creates the user', () => {
            const inMemoryUserRepository = new InMemoryUserRepositoryFactory();
            const createdUser = inMemoryUserRepository.create({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@gmail.com'
            });
            expect(createdUser).toEqual(
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
