import {
    InviteServiceEventHandlers,
    InviteEvents,
    InviteDetails
} from '@/invite/invite-service.d';

const createInviteEventHandlers = (
    eventPublisher: (queue: string, payload: any) => Promise<void>
): InviteServiceEventHandlers => {
    return {
        [InviteEvents.INVITATION_CREATED]: (payload: InviteDetails) =>
            eventPublisher('invite_created', payload)
    };
};

export default createInviteEventHandlers;
