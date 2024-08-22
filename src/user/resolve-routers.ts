import { Router } from 'express';
import InMemoryUserRepositoryFactory from '@/user/in-memory-user-repository';
import userRouterFactory from '@/user/user-router';
import UserService from '@/user/user-service';
import { Stage, KeySet } from '@/global';
import InviteService from '@/invite/invite-service';
import inviteRouterFactory from '@/invite/invite-router';
import InMemoryInviteRepository from '@/invite/in-memory-invite-repository';
import createInviteEventHandlers from '@/invite/create-invite-event-handlers';
import { EventPublisher } from '@/app.d';

export enum RouterTypes {
    'userRouter',
    'inviteRouter'
}

export type RouterParameters = {
    stage: Stage;
    keySet: KeySet;
    publishEvent?: EventPublisher<unknown, unknown>;
};

export const resolveRouters = (
    { stage, keySet, publishEvent = () => Promise.resolve() }: RouterParameters,
    authority: string
): Record<RouterTypes, Router> => {
    const userRepository =
        stage === 'production'
            ? new InMemoryUserRepositoryFactory()
            : new InMemoryUserRepositoryFactory();
    const inviteRepository =
        stage === 'production'
            ? new InMemoryInviteRepository()
            : new InMemoryInviteRepository();
    const userService = new UserService(userRepository);
    const inviteService = new InviteService(
        userService,
        inviteRepository,
        createInviteEventHandlers(publishEvent)
    );

    return {
        [RouterTypes.userRouter]: userRouterFactory(
            userService,
            keySet,
            authority
        ),
        [RouterTypes.inviteRouter]: inviteRouterFactory(inviteService)
    };
};
