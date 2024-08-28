import { Server } from 'socket.io';

export type NotificationDetails = {
    recipient: string;
    type: string;
    payload: object;
};

const createDispatchNotification = (server: Server) => {
    return (notification: NotificationDetails) => {
        server
            .of('/notification')
            .to(notification.recipient)
            .emit(notification.type, notification.payload);
    };
};
export default createDispatchNotification;
