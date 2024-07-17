import express from 'express';
import UserService from '@/user/user-service';
import validateUserSignupRequestBody from '@/validate-user-signup-request-body';

type User = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
};

const userRouterFactory = (userService: UserService) => {
    const userRouter = express.Router();
    userRouter.post('/signup', (req, res, next) => {
        const { isValid, errors } = validateUserSignupRequestBody(req.body);

        if (!isValid) {
            res.status(403).send({ errors });
        }

        next();
    });

    userRouter.post('/signup', (req, res, next) => {
        const { firstName, lastName, email, password } = req.body;
        userService
            .create({ firstName, lastName, email, password })
            .then((user: User) => res.status(201).send(user))
            .catch((error) => res.status(403).send({ errors: [error.message] }))
            .catch(next);
    });

    return userRouter;
};
export default userRouterFactory;
