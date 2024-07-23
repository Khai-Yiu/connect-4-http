import { isEmpty } from 'ramda';
import { PersistedUser } from '@/user/in-memory-user-repository';
import { UserRepository } from '@/user/user-repository';
import argon2 from 'argon2';

export type CreateUserParams = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
};

export type UserCredentials = {
    email: string;
    password: string;
};

export type AuthenticationDetails = {
    isAuthenticated: boolean;
    error?: string;
};

export class UserAlreadyExistsError extends Error {}
export class AuthenticationFailedError extends Error {}

export interface UserServiceInterface {
    create: (userDetails: CreateUserParams) => Promise<PersistedUser>;
    authenticate: (
        userCredentials: UserCredentials
    ) => Promise<AuthenticationDetails>;
}

export default class UserService implements UserServiceInterface {
    private repository: UserRepository;

    constructor(repository: UserRepository) {
        this.repository = repository;
    }

    async create(userDetails: CreateUserParams) {
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

            return isValidPassword
                ? {
                      isAuthenticated: true
                  }
                : {
                      isAuthenticated: false,
                      error: 'The provided email or password is incorrect.'
                  };
        }

        throw new AuthenticationFailedError('Authentication failed');
    }
}
