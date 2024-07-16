import { CreateUserParams } from '@/user/user-service';
import { UserRepository } from '@/user/user-repository';
import { Uuid } from '@/global';

export type PersistedUser = {
    firstName: string;
    lastName: string;
    email: string;
    uuid: Uuid;
};

export default class InMemoryUserRepositoryFactory implements UserRepository {
    private users: Map<Uuid, PersistedUser>;

    constructor() {
        this.users = new Map();
    }

    async create(userDetails: CreateUserParams) {
        const { firstName, lastName, email } = userDetails;
        const uuid = crypto.randomUUID();
        this.users.set(uuid, { firstName, lastName, email, uuid });

        return {
            firstName,
            lastName,
            email,
            uuid
        };
    }

    async findByEmail(email: string) {
        return Array.from(this.users.values()).filter(
            (user) => user.email === email
        );
    }
}
