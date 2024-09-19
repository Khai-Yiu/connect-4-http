import request, { Response } from 'supertest';
import { App } from 'supertest/types';
import appFactory from '@/app';
import { generateKeyPair } from 'jose';

const createDefaultApp = async () => {
    return appFactory({
        stage: 'test',
        keySet: await generateKeyPair('RS256')
    });
};

interface Fixture {
    getResponses: (index?: number) => Response[] | Response;
    createUser: (
        email: string,
        password: string,
        options?: {
            firstName?: string;
            lastName?: string;
        }
    ) => void;
    login: (username: string, password: string) => void;
    getUserDetails: (
        email: string,
        option?: { customAuthField?: string; authenticatedUser?: string }
    ) => void;
    createInvite: (
        inviter: string,
        invitee: string,
        option?: { customAuthField?: string; authenticatedUser?: string }
    ) => void;
    getReceivedInvites: (
        email: string,
        option?: { customAuthField?: string; authenticatedUser?: string }
    ) => void;
}

class TestFixture implements Fixture {
    private app: App;
    private authorizationFields: { [key: string]: string };
    private invites: { [key: string]: [] };
    private responses: Response[];
    private queue: (() => Promise<void>)[] = [];

    constructor(app?: App) {
        this.app = app ?? (async () => await createDefaultApp());
        this.authorizationFields = {};
        this.invites = {};
        this.responses = [];
        this.queue = [];
    }

    getResponses(index?: number) {
        return index !== undefined ? this.responses[index] : this.responses;
    }

    async run() {
        while (this.queue.length > 0) {
            const task = this.queue.shift();
            await task();
        }

        this.queue = [];
    }

    private addToQueue(task: () => Promise<void>) {
        this.queue.push(task);
    }

    createUser(
        email: string,
        password: string,
        options?: { firstName?: string; lastName?: string }
    ) {
        const callbackFn = async function () {
            this.responses.push(
                await request(this.app)
                    .post('/user/signup')
                    .send({
                        ...(options === undefined
                            ? {
                                  firstName: 'firstName',
                                  lastName: 'lastName'
                              }
                            : options),
                        ...(email === undefined ? {} : { email }),
                        ...(password === undefined ? {} : { password })
                    })
            );
        };

        this.addToQueue(callbackFn.bind(this));
        return this;
    }

    login(username: string, password: string) {
        const callbackFn = async function () {
            this.responses.push(
                await request(this.app)
                    .post('/user/login')
                    .send({ username, password })
            );
            this.authorizationFields[username] =
                this.responses[this.responses.length - 1].headers.authorization;
        };

        this.addToQueue(callbackFn.bind(this));
        return this;
    }

    getUserDetails(
        email: string,
        options?: {
            customAuthField?: string;
            authenticatedUser?: string;
        }
    ) {
        const callbackFn = async function () {
            this.responses.push(
                await request(this.app)
                    .get('/user')
                    .set(
                        'Authorization',
                        options?.customAuthField ??
                            this.authorizationFields[
                                options?.authenticatedUser ?? email
                            ] ??
                            'UserNotLoggedIn'
                    )
                    .send({ email })
            );
        };

        this.addToQueue(callbackFn.bind(this));
        return this;
    }

    createInvite(
        inviter: string,
        invitee: string,
        options?: { customAuthField?: string; authenticatedUser?: string }
    ) {
        const callbackFn = async function () {
            this.responses.push(
                await request(this.app)
                    .post('/invite')
                    .set(
                        'Authorization',
                        options?.customAuthField ??
                            this.authorizationFields[
                                options?.authenticatedUser ?? inviter
                            ] ??
                            'UserNotLoggedIn'
                    )
                    .send({ inviter, invitee })
            );
        };

        this.addToQueue(callbackFn.bind(this));
        return this;
    }

    getReceivedInvites(
        email: string,
        options?: { customAuthField?: string; authenticatedUser?: string }
    ) {
        const callbackFn = async function () {
            this.responses.push(
                await request(this.app)
                    .get('/invite/inbox')
                    .set(
                        'Authorization',
                        options?.customAuthField ??
                            this.authorizationFields[
                                options?.authenticatedUser ?? email
                            ] ??
                            'UserNotLoggedIn'
                    )
                    .send()
            );

            const newInvites =
                this.responses[this.responses.length - 1].body.invites;

            this.invites[email] =
                this.invites[email] === undefined
                    ? newInvites
                    : [...this.invites[email], ...newInvites];
        };

        this.addToQueue(callbackFn.bind(this));
        return this;
    }

    acceptInvite(
        email: string,
        inviteIndex: number = 0,
        options?: { customAuthField?: string; authenticatedUser?: string }
    ) {
        const callbackFn = async function () {
            const { uuid } = this.invites[email][inviteIndex];
            this.responses.push(
                await request(this.app)
                    .post(`/invite/${uuid}/accept`)
                    .set(
                        'Authorization',
                        options?.customAuthField ??
                            this.authorizationFields[
                                options?.authenticatedUser ?? email
                            ] ??
                            'UserNotLoggedIn'
                    )
                    .send()
            );
        };

        this.addToQueue(callbackFn.bind(this));
        return this;
    }
}

export default TestFixture;
