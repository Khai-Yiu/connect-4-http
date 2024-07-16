import { Router } from 'express';
import InMemoryUserRepositoryFactory from '@/user/in-memory-user-repository';
import userRouterFactory from '@/user/user-router';
import UserService from '@/user/user-service';
import { Env } from '@/global';

export enum RouterTypes {
    'userRouter'
}

export const resolveRouters = (
    environment: Env
): Record<RouterTypes, Router> => {
    const userRepository =
        environment === 'production'
            ? new InMemoryUserRepositoryFactory()
            : new InMemoryUserRepositoryFactory();
    const userService = new UserService(userRepository);

    return { [RouterTypes.userRouter]: userRouterFactory(userService) };
};
