import createInviteEventPublishers from '@/invite/create-invite-event-publishers';
import { InviteEvents } from '@/invite/invite-service.d';

describe('create-invite-event-publishers', () => {
    describe('given an event publisher', () => {
        it('creates an event handler', () => {
            const mockEventPublisher = jest.fn();
            const eventHandlers =
                createInviteEventPublishers(mockEventPublisher);
            expect(eventHandlers).toEqual({
                [InviteEvents.INVITATION_CREATED]: expect.any(Function)
            });
        });
    });
});
