import { InviteDetails, InviteEvents } from '@/invite/invite-service.d';
import { NotificationDetails } from '@/notification/create-dispatch-notification';
import { Subject } from 'rxjs';

export type InviteCreatedEvent = {
    type: InviteEvents.INVITATION_CREATED;
    payload: InviteDetails;
};

const createInviteEventListener = <T extends InviteCreatedEvent>(
    subscription: Subject<T>,
    notificationFn: (notification: NotificationDetails) => Promise<void>
) => {
    subscription.subscribe({
        next: (inviteEvent: InviteCreatedEvent) => {
            const { type, payload } = inviteEvent;

            if (type === InviteEvents.INVITATION_CREATED) {
                notificationFn({
                    recipient: payload.invitee,
                    type: 'invite_received',
                    payload
                });
            }
        }
    });
};

export default createInviteEventListener;
