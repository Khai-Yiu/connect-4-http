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
    private users: Map<Uuid, CreateUserParams>;

    constructor() {
        this.users = new Map();
    }

    async create(userDetails: CreateUserParams) {
        const { firstName, lastName, email } = userDetails;
        const uuid = crypto.randomUUID();
        await this.users.set(uuid, { firstName, lastName, email });

        return {
            firstName,
            lastName,
            email,
            uuid
        };
    }
}
