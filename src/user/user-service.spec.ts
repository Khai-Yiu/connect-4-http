import userService from '@/user/user-service';

describe('user-service', () => {
    describe('given the details of a user that does not exist', () => {
        it.skip('creates the user', async () => {
            const mockRepository = jest.fn();
            const userService = new UserService(mockRepository);
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