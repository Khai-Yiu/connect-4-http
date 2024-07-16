import { PersistedUser } from '@/user/in-memory-user-repository';
import { CreateUserParams } from '@/user/user-service';

export interface UserRepository {
    create: (userDetails: CreateUserParams) => Promise<PersistedUser>;
    findByEmail: (email: string) => Promise<Array<PersistedUser>>;
}
