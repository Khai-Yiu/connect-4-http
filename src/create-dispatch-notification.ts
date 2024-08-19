import { Socket } from 'socket.io-client';

const createDispatchNotification = (socket: Socket) => {
    return function dispatchNotification(eventDetails) {
        socket.emit('event_received', eventDetails);
    };
};

export default createDispatchNotification;
