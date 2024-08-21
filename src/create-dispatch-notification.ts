import { Socket } from 'socket.io';

const createDispatchNotification = (socket: Socket) => {
    return (notification: {
        recipient: string;
        type: string;
        payload: object;
    }) => {
        socket.emit(notification.type, notification.payload);
    };
};
export default createDispatchNotification;
