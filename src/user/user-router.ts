import express from 'express';
import UserService from '@/user/user-service';
import InMemoryUserRepositoryFactory from '@/user/in-memory-user-repository';

type User = {
    firstName: string;
    lastName: string;
    email: string;
};

const userRouterFactory = (userService: UserService) => {
    const userRouter = express.Router();

    userRouter.post('/signup', async (req, res, next) => {
        const { firstName, lastName, email } = req.body;
        const user = userService
            .create({ firstName, lastName, email })
            .then((user: User) => res.status(201).send(user))
            .catch(next);
    });

    return userRouter;
};
export default userRouterFactory;
