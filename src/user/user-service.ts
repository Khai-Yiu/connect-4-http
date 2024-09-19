import { isEmpty } from 'ramda';
import {
    PersistedUser,
    UserRepository
} from '@/user/in-memory-user-repository.d';
import {
    CreateUserDetails,
    UserCredentials,
    UserDetails,
    AuthenticationDetails
} from '@/user/user-service.d';
import argon2 from 'argon2';
import { Uuid } from '@/global';

export class UserAlreadyExistsError extends Error {}
export class AuthenticationFailedError extends Error {}
export class UserNotFoundError extends Error {}

export interface UserServiceInterface {
    create: (userDetails: CreateUserDetails) => Promise<PersistedUser>;
    authenticate: (
        userCredentials: UserCredentials
    ) => Promise<AuthenticationDetails>;
    getUserDetails: (email: String) => Promise<UserDetails>;
    getUserDetailsByUuid: (uuid: Uuid) => Promise<UserDetails>;
    getDoesUserExist: (email: String) => Promise<Boolean>;
}

export default class UserService implements UserServiceInterface {
    private repository: UserRepository;

    constructor(repository: UserRepository) {
        this.repository = repository;
    }

    async create(userDetails: CreateUserDetails) {
        if (isEmpty(await this.repository.findByEmail(userDetails.email))) {
            return this.repository.create({
                ...userDetails,
                password: await argon2.hash(userDetails.password)
            });
        }

        throw new UserAlreadyExistsError(
            'A user with that email already exists'
        );
    }

    async authenticate({ email, password }: UserCredentials) {
        const userDetails = (await this.repository.findByEmail(email))[0];

        if (userDetails !== undefined) {
            const isValidPassword = await argon2.verify(
                userDetails.password,
                password
            );

            if (isValidPassword) {
                return {
                    isAuthenticated: true
                };
            }
        }

        throw new AuthenticationFailedError('Authentication failed');
    }

    async getUserDetails(email: string) {
        const persistedUsersWithProvidedEmail =
            await this.repository.findByEmail(email);
        const persistedUser = persistedUsersWithProvidedEmail[0];

        if (persistedUser === undefined) {
            throw new UserNotFoundError('User does not exist.');
        }

        return {
            uuid: persistedUser.uuid,
            firstName: persistedUser.firstName,
            lastName: persistedUser.lastName,
            email: persistedUser.email
        };
    }

    async getUserDetailsByUuid(uuid: Uuid) {
        const persistedUser = await this.repository.findByUuid(uuid);

        return persistedUser;
    }

    async getDoesUserExist(email: string) {
        const persistedUsers = await this.repository.findByEmail(email);

        return persistedUsers.length !== 0;
    }
}
