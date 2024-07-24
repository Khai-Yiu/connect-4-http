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

const userDetailsRequestHandlerFactory =
    (userService: UserService): RequestHandler =>
    (req, res, next) => {
        res.status(401).send({
            errors: ['You must be logged in to view your user details.']
        });
        next();
    };

const loginRequestHandlerFactory = (
    userService: UserServiceInterface,
    jwtPublicKey?: JwtPublicKey
): RequestHandler => {
    return async (req, res, next) => {
        await userService
            .authenticate({
                email: req.body.username,
                password: req.body.password
            })
            .then(async () => {
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
                res.setHeader('Authorization', `Basic ${jwt}`).send();
            })
            .catch(() =>
                res.status(403).send({ errors: ['Login attempt failed.'] })
            );

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
    userRouter.get('/', userDetailsRequestHandlerFactory(userService));
    userRouter.post('/signup', registerRequestHandlerFactory(userService));
    userRouter.post(
        '/login',
        loginRequestHandlerFactory(userService, keySet?.jwtPublicKey)
    );

    return userRouter;
};
export default userRouterFactory;
