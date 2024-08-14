import createInviteEventHandlers from '@/invite/create-invite-event-handlers';
import { InviteEvents } from '@/invite/invite-service.d';

describe('create-invite-event-handlers', () => {
    describe('given an event publisher', () => {
        it('creates an event handler', () => {
            const mockEventPublisher = jest.fn();
            const eventHandlers = createInviteEventHandlers(mockEventPublisher);
            expect(eventHandlers).toEqual({
                [InviteEvents.INVITATION_CREATED]: expect.any(Function)
            });
        });
    });
});
