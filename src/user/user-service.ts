import { PersistedUser } from '@/user/in-memory-user-repository';
import { UserRepository } from '@/user/user-repository';

export type CreateUserParams = {
    firstName: string;
    lastName: string;
    email: string;
};

interface UserServiceInterface {
    create: (userDetails: CreateUserParams) => Promise<PersistedUser>;
}

export default class UserService implements UserServiceInterface {
    private repository: UserRepository;

    constructor(repository: UserRepository) {
        this.repository = repository;
    }

    async create(userDetails) {
        return this.repository.create(userDetails);
    }
}
