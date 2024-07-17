import { pipe, path, map, applySpec, join, prop } from 'ramda';
import Joi, { ValidationErrorItem } from 'joi';
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
    const validationResult = schema.validate(userSignupRequestBody, {
        abortEarly: false
    });
    const isValid = validationResult.error === undefined;
    if (!isValid) {
        return {
            isValid,
            errors: pipe<
                [Joi.ValidationResult],
                ValidationErrorItem[],
                { message: string; path: string }[]
            >(
                path(['error', 'details']),
                map(
                    applySpec({
                        message: prop('message'),
                        path: pipe(prop('path'), join('.'))
                    })
                )
            )(validationResult)
        };
    }

    return {
        isValid
    };
}

export default validateUserSignupRequestBody;
