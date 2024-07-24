export type CreateUserDetails = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
};

export type UserDetails = {
    firstName: string;
    lastName: string;
    email: string;
};

export type UserCredentials = {
    email: string;
    password: string;
};

export type AuthenticationDetails = {
    isAuthenticated: boolean;
};
