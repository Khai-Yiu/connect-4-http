import express from 'express';

type User = {
    firstName: string;
    lastName: string;
    email: string;
};

const userRouter = express.Router();

userRouter.post('/signup', async (req, res, next) => {
    const { firstName, lastName, email } = req.body;
    const user = userService
        .create({ firstName, lastName, email })
        .then((user: User) => res.send(user))
        .catch(next);
});

export default userRouter;
