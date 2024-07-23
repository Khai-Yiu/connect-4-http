import { Router } from 'express';
import InMemoryUserRepositoryFactory from '@/user/in-memory-user-repository';
import userRouterFactory from '@/user/user-router';
import UserService from '@/user/user-service';
import { Stage, JwtPublicKey, KeySet } from '@/global';

export enum RouterTypes {
    'userRouter'
}

export type RouterParameters = {
    stage: Stage;
    keySet?: KeySet;
};

export const resolveRouters = ({
    stage,
    keySet
}: RouterParameters): Record<RouterTypes, Router> => {
    const userRepository =
        stage === 'production'
            ? new InMemoryUserRepositoryFactory()
            : new InMemoryUserRepositoryFactory();
    const userService = new UserService(userRepository);

    return {
        [RouterTypes.userRouter]: userRouterFactory(userService, keySet)
    };
};
