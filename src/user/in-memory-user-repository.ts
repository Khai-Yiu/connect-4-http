type CreateUserParams = {
    firstName: string;
    lastName: string;
    email: string;
};

type GameUuid = `${string}-${string}-${string}-${string}-${string}`;

type PersistedUser = {
    firstName: string;
    lastName: string;
    email: string;
    uuid: GameUuid;
};

interface InMemoryUserRepository {
    create: (user: CreateUserParams) => PersistedUser;
}

export default class InMemoryUserRepositoryFactory
    implements InMemoryUserRepository
{
    private users: Map<GameUuid, CreateUserParams>;

    constructor() {
        this.users = new Map();
    }

    create(user: CreateUserParams) {
        const { firstName, lastName, email } = user;
        const uuid = crypto.randomUUID();
        this.users.set(uuid, { firstName, lastName, email });

        return {
            firstName,
            lastName,
            email,
            uuid
        };
    }
}
