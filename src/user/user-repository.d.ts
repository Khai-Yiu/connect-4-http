import { PersistedUser } from '@/user/in-memory-user-repository';
import { CreateUserDetails } from '@/user/user-service';

export interface UserRepository {
    create: (userDetails: CreateUserDetails) => Promise<PersistedUser>;
    findByEmail: (email: string) => Promise<Array<PersistedUser>>;
}
