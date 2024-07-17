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

export class UserAlreadyExistsError extends Error {}

interface UserServiceInterface {
    create: (userDetails: CreateUserParams) => Promise<PersistedUser>;
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
}
