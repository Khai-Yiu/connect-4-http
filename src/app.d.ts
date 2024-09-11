import {
    InviteEvents,
    InviteServiceEventHandler
} from '@/invite/invite-service.d';

export type ServiceEvent = InviteEvents;
export type ServiceEventHandler = InviteServiceEventHandler;
export type ServiceEventHandlers = Record<ServiceEvent, ServiceEventHandler>;
export type InternalEventPublisher<P, R> = (
    queue: string,
    payload: P
) => Promise<R>;
