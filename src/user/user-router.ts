import express, { RequestHandler } from 'express';
import UserService, { UserServiceInterface } from '@/user/user-service';
import validateUserSignupRequestBody from '@/validate-user-signup-request-body';
import { JwtPublicKey, KeySet } from '@/global';
import { EncryptJWT } from 'jose';

type User = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
};

const loginRequestHandlerFactory = (
    userService: UserServiceInterface,
    jwtPublicKey?: JwtPublicKey
): RequestHandler => {
    return async (req, res, next) => {
        const timeIssued = Date.now();
        const durationOfDaysInMilliseconds = 1 * 24 * 60 * 60 * 1000;
        const username = req.body.username;
        const jwt = await new EncryptJWT({
            username,
            roles: []
        })
            .setProtectedHeader({
                alg: 'RSA-OAEP-256',
                typ: 'JWT',
                enc: 'A256GCM'
            })
            .setIssuer('connect4-http-server')
            .setIssuedAt()
            .setExpirationTime('1 day from now')
            .setNotBefore('0 sec from now')
            .setSubject(username)
            .encrypt(jwtPublicKey);

        res.appendHeader('authorization', jwt).send();
        next();
    };
};

const registerRequestHandlerFactory =
    (userService: UserService): RequestHandler =>
    (req, res, next) => {
        const { isValid, errors } = validateUserSignupRequestBody(req.body);

        if (!isValid) {
            res.status(403).send({ errors });
        }

        const { firstName, lastName, email, password } = req.body;
        userService
            .create({ firstName, lastName, email, password })
            .then((user: User) => res.status(201).send(user))
            .catch((error) => res.status(403).send({ errors: [error.message] }))
            .catch(next);
    };

const userRouterFactory = (userService: UserService, keySet: KeySet) => {
    const userRouter = express.Router();
    userRouter.post('/signup', registerRequestHandlerFactory(userService));
    userRouter.post(
        '/login',
        loginRequestHandlerFactory(userService, keySet?.jwtPublicKey)
    );

    return userRouter;
};
export default userRouterFactory;
