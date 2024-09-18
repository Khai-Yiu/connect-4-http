import {
    InviteEvents,
    InviteServiceEventHandler
} from '@/invite/invite-service.d';

export type ServiceEvent = InviteEvents;
export type ServiceEventHandler = InviteServiceEventHandler;
export type ServiceEventHandlers = Record<ServiceEvent, ServiceEventHandler>;
export type InternalEventPublisher<P, R> = (content: P) => Promise<R>;
