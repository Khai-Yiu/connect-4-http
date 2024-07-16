import Joi from 'joi';
import { UserSignupRequestBody } from '@/user/user-router.d';
import { ValidationResult } from '@/validation.d';

const schema = Joi.object({
    firstName: Joi.string().min(1).required(),
    lastName: Joi.string().min(1).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required()
});

function validateUserSignupRequestBody(
    userSignupRequestBody: UserSignupRequestBody
): ValidationResult {
    const isValid = schema.validate(userSignupRequestBody).error === undefined;
    return {
        isValid
    };
}

export default validateUserSignupRequestBody;
