import InMemoryUserRepositoryFactory from '@/user/in-memory-user-repository';

describe('in-memory-user-repository', () => {
    describe('given the details for a user who does not exist', () => {
        it('creates the user', async () => {
            const inMemoryUserRepository = new InMemoryUserRepositoryFactory();
            const createdUser = await inMemoryUserRepository.create({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@gmail.com',
                password:
                    '$argon2id$v=19$m=65536,t=3,p=4$69uuSYaO9KQmE/83AXUpOA$0E+BlpapwGDhLuToVg1+chQrWOmPrYe+My6CCStF+GM'
            });
            expect(createdUser).toEqual(
                expect.objectContaining({
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@gmail.com',
                    password:
                        '$argon2id$v=19$m=65536,t=3,p=4$69uuSYaO9KQmE/83AXUpOA$0E+BlpapwGDhLuToVg1+chQrWOmPrYe+My6CCStF+GM',
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
                email: 'john.doe@gmail.com',
                password:
                    '$argon2id$v=19$m=65536,t=3,p=4$69uuSYaO9KQmE/83AXUpOA$0E+BlpapwGDhLuToVg1+chQrWOmPrYe+My6CCStF+GM'
            });
            await inMemoryUserRepository.create({
                firstName: 'Jonathan',
                lastName: 'Doe',
                email: 'john.doe2@gmail.com',
                password:
                    '$argon2id$v=19$m=65536,t=3,p=4$69uuSYaO9KQmE/83AXUpOA$0E+BlpapwGDhLuToVg1+chQrWOmPrYe+My6CCStF+GM'
            });
            const users = await inMemoryUserRepository.findByEmail(
                'john.doe@gmail.com'
            );
            expect(users).toEqual([
                {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@gmail.com',
                    password:
                        '$argon2id$v=19$m=65536,t=3,p=4$69uuSYaO9KQmE/83AXUpOA$0E+BlpapwGDhLuToVg1+chQrWOmPrYe+My6CCStF+GM',
                    uuid: expect.toBeUuid()
                }
            ]);
        });
    });
    describe('given a uuid', () => {
        it('returns the user details', async () => {
            const inMemoryUserRepository = new InMemoryUserRepositoryFactory();

            const { uuid } = await inMemoryUserRepository.create({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@gmail.com',
                password:
                    '$argon2id$v=19$m=65536,t=3,p=4$69uuSYaO9KQmE/83AXUpOA$0E+BlpapwGDhLuToVg1+chQrWOmPrYe+My6CCStF+GM'
            });
            const users = await inMemoryUserRepository.findByUuid(uuid);
            expect(users).toEqual({
                uuid,
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@gmail.com',
                password:
                    '$argon2id$v=19$m=65536,t=3,p=4$69uuSYaO9KQmE/83AXUpOA$0E+BlpapwGDhLuToVg1+chQrWOmPrYe+My6CCStF+GM'
            });
        });
    });
});
