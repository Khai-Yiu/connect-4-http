import { Uuid } from '@/global';
import { CreateUserDetails } from '@/user/user-service.d';

export type PersistedUser = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    uuid: Uuid;
};

export interface UserRepository {
    create: (userDetails: CreateUserDetails) => Promise<PersistedUser>;
    findByEmail: (email: string) => Promise<Array<PersistedUser>>;
    findByUuid: (uuid: Uuid) => Promise<PersistedUser>;
}
