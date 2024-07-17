import validateUserSignupRequestBody from '@/validate-user-signup-request-body';
import { UserSignupRequestBody } from '@/user/user-router.d';

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
                userSignupRequestBody as UserSignupRequestBody
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
    describe('given a user signup request body missing multiple fields', () => {
        it('fails validation', () => {
            const userSignupRequestBody = {
                firstName: 'Dempsey',
                password: 'NotSecure'
            };
            const validationResult = validateUserSignupRequestBody(
                userSignupRequestBody as UserSignupRequestBody
            );
            expect(validationResult).toEqual({
                isValid: false,
                errors: [
                    {
                        message: '"lastName" is required',
                        path: 'lastName'
                    },
                    {
                        message: '"email" is required',
                        path: 'email'
                    }
                ]
            });
        });
    });
});
