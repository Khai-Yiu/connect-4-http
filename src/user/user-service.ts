import { isEmpty } from 'ramda';
import { PersistedUser } from '@/user/in-memory-user-repository';
import { UserRepository } from '@/user/user-repository';
import {
    CreateUserDetails,
    UserCredentials,
    UserDetails,
    AuthenticationDetails
} from '@/user/user-service.d';
import argon2 from 'argon2';

export class UserAlreadyExistsError extends Error {}
export class AuthenticationFailedError extends Error {}
export class UserNotFoundError extends Error {}

export interface UserServiceInterface {
    create: (userDetails: CreateUserDetails) => Promise<PersistedUser>;
    authenticate: (
        userCredentials: UserCredentials
    ) => Promise<AuthenticationDetails>;
    getUserDetails: (email: String) => Promise<UserDetails>;
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
    }
}
