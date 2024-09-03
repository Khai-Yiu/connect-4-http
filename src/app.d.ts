import {
    InviteEvents,
    InviteServiceEventPublisher
} from '@/invite/invite-service.d';

export type ServiceEvent = InviteEvents;
export type ServiceEventHandler = InviteServiceEventPublisher;
export type ServiceEventHandlers = Record<ServiceEvent, ServiceEventHandler>;
export type InternalEventPublisher<P, R> = (
    queue: string,
    payload: P
) => Promise<R>;
