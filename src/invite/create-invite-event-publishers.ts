import {
    InviteServiceEventHandlers,
    InviteEvents,
    InviteDetails
} from '@/invite/invite-service.d';
import { InviteCreatedEvent } from './create-invite-event-listener';

const createInviteEventPublishers = (
    eventPublisher: (eventDetails: InviteCreatedEvent) => Promise<unknown>
): InviteServiceEventHandlers => {
    return {
        [InviteEvents.INVITATION_CREATED]: (inviteDetails: InviteDetails) =>
            eventPublisher({
                type: InviteEvents.INVITATION_CREATED,
                payload: inviteDetails
            })
    };
};

export default createInviteEventPublishers;
