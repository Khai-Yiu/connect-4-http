import { InviteDetails, InviteEvents } from '@/invite/invite-service.d';
import { Subject } from 'rxjs';

export type InviteCreatedEvent = {
    type: InviteEvents.INVITATION_CREATED;
    payload: InviteDetails;
};

const createInviteEventListener = <T extends InviteCreatedEvent>(
    subscription: Subject<T>,
    notificationFn: (notification: {
        recipient: string;
        payload: object;
    }) => Promise<void>
) => {
    subscription.subscribe({
        next: (inviteEvent: InviteCreatedEvent) => {
            const { type, payload } = inviteEvent;

            if (type === InviteEvents.INVITATION_CREATED) {
                notificationFn({ recipient: payload.invitee, payload });
            }
        }
    });
};

export default createInviteEventListener;
