import validateUserSignupRequestBody from '@/validate-user-signup-request-body';

describe('validate-user-signup-request-body', () => {
    describe('given a well-formatted user signup request body', () => {
        it('passes validation', () => {
            const userSignupRequestBody = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@gmail.com',
                password: 'Hello123'
            };
            const validationResult = validateUserSignupRequestBody(
                userSignupRequestBody
            );
            expect(validationResult).toEqual({ isValid: true });
        });
    });
});
