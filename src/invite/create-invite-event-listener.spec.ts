import { InviteEvents, InviteStatus } from '@/invite/invite-service.d';
import { Subject } from 'rxjs';
import createInviteEventListener, {
    InviteCreatedEvent
} from '@/invite/create-invite-event-listener';

describe('create-invite-event-consumer', () => {
    describe('given an event subscription', () => {
        describe('and an invitee notification function', () => {
            describe('and an invite is sent', () => {});
            const subscriptionFn = new Subject<InviteCreatedEvent>();
            const notificationFn = jest.fn();
            createInviteEventListener(subscriptionFn, notificationFn);

            describe('when an "invite_created" event is received', () => {
                it('notifies the invitee', () => {
                    subscriptionFn.next({
                        type: InviteEvents.INVITATION_CREATED,
                        payload: {
                            inviter: 'inviter@gmail.com',
                            invitee: 'some@gmail.com',
                            exp: Date.now(),
                            uuid: crypto.randomUUID(),
                            status: InviteStatus.PENDING
                        }
                    });
                    expect(notificationFn).toHaveBeenCalledWith({
                        recipient: 'some@gmail.com',
                        type: 'invite_received',
                        payload: {
                            inviter: 'inviter@gmail.com',
                            invitee: 'some@gmail.com',
                            exp: expect.any(Number),
                            uuid: expect.toBeUuid(),
                            status: InviteStatus.PENDING
                        }
                    });
                });
            });
        });
    });
});
