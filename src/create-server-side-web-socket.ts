import { Express } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { AddressInfo } from 'net';
import { jwtDecrypt, KeyLike } from 'jose';

export type ExpressWithPortAndSocket = Express & {
    port: number;
    serverSocket: Server;
};

const createServerSideWebSocket = (
    app: ExpressWithPortAndSocket,
    path: string,
    privateKey: KeyLike
) => {
    const httpServer = http.createServer(app).unref();
    const io = new Server(httpServer);

    httpServer.listen();
    app.port = (httpServer.address() as AddressInfo).port;
    app.serverSocket = io;

    io.of(path).on('connection', async (socket) => {
        const {
            payload: { username }
        } = await jwtDecrypt(socket.handshake.auth.token, privateKey);

        socket.join(username as string);
    });
};

export default createServerSideWebSocket;
