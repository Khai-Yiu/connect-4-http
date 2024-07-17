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
    describe('given a user signup request body missing a field', () => {
        it('fails validation', () => {
            const userSignupRequestBody = {
                firstName: 'Dung',
                lastName: 'Eater',
                email: 'dung.eater@gmail.com'
            };
            const validationResult = validateUserSignupRequestBody(
                userSignupRequestBody
            );
            expect(validationResult).toEqual({
                isValid: false,
                errors: [
                    {
                        message: '"password" is required',
                        path: 'password'
                    }
                ]
            });
        });
    });
});
