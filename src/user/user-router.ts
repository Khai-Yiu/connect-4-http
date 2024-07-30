import express, { RequestHandler } from 'express';
import UserService, { UserServiceInterface } from '@/user/user-service';
import validateUserSignupRequestBody from '@/validate-user-signup-request-body';
import { JwtPrivateKey, JwtPublicKey, KeySet } from '@/global';
import { EncryptJWT } from 'jose';

type User = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
};

const userDetailsRequestHandlerFactory =
    (userService: UserService, privateKey: JwtPrivateKey): RequestHandler =>
    async (req, res, next) => {
        if (!res.locals.claims.email) {
            res.status(401).send({
                errors: ['You must be logged in to view your user details.']
            });
        } else {
            const { email } = req.body;
            const userDetails = await userService.getUserDetails(email);
            res.status(200).send(userDetails);
        }

        next();
    };

const loginRequestHandlerFactory = (
    userService: UserServiceInterface,
    publicKey?: JwtPublicKey
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
                    .encrypt(publicKey);
                res.setHeader('Authorization', `Bearer ${jwt}`).send();
            })
            .catch(() =>
                res.status(403).send({ errors: ['Login attempt failed.'] })
            );

        next();
    };
};

const registerRequestHandlerFactory =
    (userService: UserService): RequestHandler =>
    async (req, res, next) => {
        const { isValid, errors } = validateUserSignupRequestBody(req.body);

        if (!isValid) {
            res.status(403).send({ errors });
        }

        const { firstName, lastName, email, password } = req.body;
        await userService
            .create({ firstName, lastName, email, password })
            .then((user: User) => res.status(201).send(user))
            .catch((error) => res.status(403).send({ errors: [error.message] }))
            .catch(next);
    };

const userRouterFactory = (userService: UserService, keySet: KeySet) => {
    const userRouter = express.Router();
    userRouter.get(
        '/',
        userDetailsRequestHandlerFactory(userService, keySet.privateKey)
    );
    userRouter.post('/signup', registerRequestHandlerFactory(userService));
    userRouter.post(
        '/login',
        loginRequestHandlerFactory(userService, keySet.publicKey)
    );

    return userRouter;
};
export default userRouterFactory;
