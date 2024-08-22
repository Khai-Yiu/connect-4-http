import { Express } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { AddressInfo } from 'net';

export type ExpressWithPort = Express & { port: number };

const createServerSideWebSocket = (app: ExpressWithPort, path: string) => {
    const httpServer = http.createServer(app).unref();

    httpServer.listen();
    app.port = (httpServer.address() as AddressInfo).port;

    const io = new Server(httpServer);

    io.of(path).on('connection', (socket) => {});
};

export default createServerSideWebSocket;
