import request, { Response } from 'supertest';
import { App } from 'supertest/types';
import appFactory from '@/app';
import { generateKeyPair } from 'jose';

const createDefaultApp = async () => {
    return appFactory({
        routerParameters: {
            stage: 'test',
            keySet: await generateKeyPair('RS256')
        }
    });
};

interface Fixture {
    getResponse: () => Response;
    createUser: (
        firstName: string,
        lastName: string,
        email: string,
        password: string
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
    getInvites: (
        email: string,
        option?: { customAuthField?: string; authenticatedUser?: string }
    ) => void;
}

class TestFixture implements Fixture {
    private app: App;
    private authorizationFields: { [key: string]: string };
    private response: Response;

    constructor(app?: App) {
        this.app = app ?? (async () => await createDefaultApp());
        this.authorizationFields = {};
        this.response = undefined;
    }

    getResponse() {
        return this.response;
    }

    async createUser(
        firstName: string,
        lastName: string,
        email: string,
        password: string
    ) {
        this.response = await request(this.app)
            .post('/user/signup')
            .send({ firstName, lastName, email, password });
    }

    async login(username: string, password: string) {
        this.response = await request(this.app)
            .post('/user/login')
            .send({ username, password });
        this.authorizationFields[username] =
            this.response.headers.authorization;
    }

    async getUserDetails(
        email: string,
        options?: {
            customAuthField?: string;
            authenticatedUser?: string;
        }
    ) {
        this.response = await request(this.app)
            .get('/user')
            .set(
                'Authorization',
                options?.customAuthField ??
                    this.authorizationFields[
                        options?.authenticatedUser ?? email
                    ] ??
                    'UserNotLoggedIn'
            )
            .send({ email });
    }

    async createInvite(
        inviter: string,
        invitee: string,
        options?: { customAuthField?: string; authenticatedUser?: string }
    ) {
        this.response = await request(this.app)
            .post('/invite')
            .set(
                'Authorization',
                options?.customAuthField ??
                    this.authorizationFields[
                        options?.authenticatedUser ?? inviter
                    ] ??
                    'UserNotLoggedIn'
            )
            .send({ inviter, invitee });
    }

    async getInvites(
        email: string,
        options?: { customAuthField?: string; authenticatedUser?: string }
    ) {
        this.response = await request(this.app)
            .post('/invite/inbox')
            .set(
                'Authorization',
                options?.customAuthField ??
                    this.authorizationFields[
                        options?.authenticatedUser ?? email
                    ] ??
                    'UserNotLoggedIn'
            )
            .send();
    }
}

export default TestFixture;
