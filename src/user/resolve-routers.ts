import { Router } from 'express';
import InMemoryUserRepositoryFactory from '@/user/in-memory-user-repository';
import userRouterFactory from '@/user/user-router';
import UserService from '@/user/user-service';
import { Stage, KeySet } from '@/global';
import InviteService from '@/invite/invite-service';
import inviteRouterFactory from '@/invite/invite-router';
import InMemoryInviteRepository from '@/invite/in-memory-invite-repository';
import createInviteEventPublishers from '@/invite/create-invite-event-publishers';
import { InternalEventPublisher } from '@/app.d';
import SessionService from '@/session/session-service';
import InMemorySessionRepository from '@/session/in-memory-session-repository';
import GameService from '@/game/game-service';
import InMemoryGameRepository from '@/game/in-memory-game-repository';
import Game from '@/game/game';
import sessionRouterFactory from '@/session/session-router';

export enum RouterTypes {
    'userRouter',
    'inviteRouter',
    'sessionRouter'
}

export type RouterParameters = {
    stage: Stage;
    keySet: KeySet;
    authority: string;
    internalEventPublisher: InternalEventPublisher<unknown, unknown>;
};

export const resolveRouters = ({
    stage,
    keySet,
    authority,
    internalEventPublisher = () => Promise.resolve()
}: RouterParameters): Record<RouterTypes, Router> => {
    const userRepository =
        stage === 'production'
            ? new InMemoryUserRepositoryFactory()
            : new InMemoryUserRepositoryFactory();
    const inviteRepository =
        stage === 'production'
            ? new InMemoryInviteRepository()
            : new InMemoryInviteRepository();
    const gameRepository =
        stage === 'production'
            ? new InMemoryGameRepository()
            : new InMemoryGameRepository();
    const sessionRepository =
        stage === 'production'
            ? new InMemorySessionRepository()
            : new InMemorySessionRepository();

    const userService = new UserService(userRepository);
    const gameService = new GameService(
        gameRepository,
        (...args) => new Game(...args)
    );
    const sessionService = new SessionService(sessionRepository, gameService);
    const inviteService = new InviteService(
        userService,
        sessionService,
        inviteRepository,
        createInviteEventPublishers(internalEventPublisher)
    );

    return {
        [RouterTypes.userRouter]: userRouterFactory(
            userService,
            keySet,
            authority
        ),
        [RouterTypes.inviteRouter]: inviteRouterFactory(inviteService),
        [RouterTypes.sessionRouter]: sessionRouterFactory(sessionService)
    };
};
