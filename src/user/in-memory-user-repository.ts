import { CreateUserDetails } from '@/user/user-service.d';
import { UserRepository } from '@/user/in-memory-user-repository.d';
import { Uuid } from '@/global';

export type PersistedUser = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    uuid: Uuid;
};

export default class InMemoryUserRepositoryFactory implements UserRepository {
    private users: Map<Uuid, PersistedUser>;

    constructor() {
        this.users = new Map();
    }

    async create(userDetails: CreateUserDetails) {
        const { firstName, lastName, email, password } = userDetails;
        const uuid = crypto.randomUUID();
        this.users.set(uuid, { firstName, lastName, email, password, uuid });

        return {
            firstName,
            lastName,
            email,
            password,
            uuid
        };
    }

    async findByEmail(email: string) {
        return Array.from(this.users.values()).filter(
            (user) => user.email === email
        );
    }
}
